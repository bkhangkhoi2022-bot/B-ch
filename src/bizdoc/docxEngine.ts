import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';
import {
  BizDocFormData,
  BizDocTemplateVersion,
  PlaceholderOccurrenceInfo,
  PlaceholderZone,
  ResidualDataFinding,
  TemplateCode,
  TemplateFieldMapping,
} from './types';
import { BIZDOC_FIELDS } from './constants';

export interface DocxInspectionResult {
  valid: boolean;
  error?: string;
  detectedPlaceholders: string[];
  placeholderDetails: PlaceholderOccurrenceInfo[];
  suggestedMappings: TemplateFieldMapping[];
  residualFindings: ResidualDataFinding[];
  suggestedSimplifiedM02: boolean;
  previewHtml: string;
  hasTables: boolean;
  hasImages: boolean;
  hasHeaders: boolean;
  hasFooters: boolean;
}

const KNOWN_FIELD_KEYS = new Set<string>(BIZDOC_FIELDS.map((f) => f.key));

const toMammothInput = (ab: ArrayBuffer): { arrayBuffer: ArrayBuffer; buffer?: unknown } => {
  const clone = ab.slice(0);
  const maybeGlobal = globalThis as unknown as { Buffer?: { from: (data: ArrayBuffer) => unknown } };
  if (maybeGlobal && typeof maybeGlobal.Buffer?.from === 'function') {
    return { arrayBuffer: clone, buffer: maybeGlobal.Buffer.from(clone) };
  }
  return { arrayBuffer: clone };
};

const decodeXmlEntities = (str: string): string =>
  str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Extract readable paragraph texts from a Word XML fragment by reconstructing <w:t> runs inside each <w:p>.
 * This cleanly handles Word splitting {{placeholder}} across multiple XML runs (e.g. proofErr/rPr).
 */
const extractParagraphTextsFromXml = (xml: string): string[] => {
  const paragraphs: string[] = [];
  const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const pContent = pMatch[1];
    let text = '';
    const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      if (tMatch[0].startsWith('<w:tab')) {
        text += '\t';
      } else if (tMatch[0].startsWith('<w:br')) {
        text += '\n';
      } else if (tMatch[1] !== undefined) {
        text += decodeXmlEntities(tMatch[1]);
      }
    }
    if (text.length > 0) {
      paragraphs.push(text);
    }
  }
  return paragraphs;
};

/**
 * Scan all relevant XML parts inside a DOCX PizZip:
 * - word/document.xml (body paragraphs + table cells)
 * - word/header*.xml (headers)
 * - word/footer*.xml (footers)
 */
export const scanDocxXmlPlaceholders = (zip: PizZip): {
  details: PlaceholderOccurrenceInfo[];
  allPlainText: string;
  headerTexts: string[];
  footerTexts: string[];
  hasTables: boolean;
  hasHeaders: boolean;
  hasFooters: boolean;
} => {
  const counts = new Map<string, { count: number; zones: Set<PlaceholderZone> }>();
  const allTexts: string[] = [];
  const headerTexts: string[] = [];
  const footerTexts: string[] = [];

  const recordText = (text: string, zone: PlaceholderZone) => {
    allTexts.push(text);
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const token = m[1].trim();
      if (!token) continue;
      const entry = counts.get(token) || { count: 0, zones: new Set<PlaceholderZone>() };
      entry.count += 1;
      entry.zones.add(zone);
      counts.set(token, entry);
    }
  };

  const docXml = zip.file('word/document.xml')?.asText() || '';
  const hasTables = docXml.includes('<w:tbl');

  // Split document.xml into table blocks vs outside-table blocks so we accurately report table vs paragraph zones
  const tblRegex = /<w:tbl\b[\s\S]*?<\/w:tbl>/g;
  let lastIndex = 0;
  let tblMatch: RegExpExecArray | null;
  while ((tblMatch = tblRegex.exec(docXml)) !== null) {
    const beforeTbl = docXml.slice(lastIndex, tblMatch.index);
    for (const p of extractParagraphTextsFromXml(beforeTbl)) {
      recordText(p, 'paragraph');
    }
    for (const p of extractParagraphTextsFromXml(tblMatch[0])) {
      recordText(p, 'table');
    }
    lastIndex = tblMatch.index + tblMatch[0].length;
  }
  const afterLastTbl = docXml.slice(lastIndex);
  for (const p of extractParagraphTextsFromXml(afterLastTbl)) {
    recordText(p, 'paragraph');
  }

  // Scan headers (word/header*.xml) and footers (word/footer*.xml)
  const fileNames = Object.keys(zip.files);
  const headerFiles = fileNames.filter((k) => /^word\/header\d*\.xml$/i.test(k));
  const footerFiles = fileNames.filter((k) => /^word\/footer\d*\.xml$/i.test(k));

  for (const hf of headerFiles) {
    const xml = zip.file(hf)?.asText() || '';
    for (const p of extractParagraphTextsFromXml(xml)) {
      headerTexts.push(p);
      recordText(p, 'header');
    }
  }

  for (const ff of footerFiles) {
    const xml = zip.file(ff)?.asText() || '';
    for (const p of extractParagraphTextsFromXml(xml)) {
      footerTexts.push(p);
      recordText(p, 'footer');
    }
  }

  const details: PlaceholderOccurrenceInfo[] = Array.from(counts.entries()).map(
    ([token, info]) => ({
      token,
      count: info.count,
      zones: Array.from(info.zones),
    })
  );

  return {
    details,
    allPlainText: allTexts.join('\n'),
    headerTexts,
    footerTexts,
    hasTables,
    hasHeaders: headerTexts.length > 0,
    hasFooters: footerTexts.length > 0,
  };
};

const composePreviewHtmlWithHeadersFooters = (
  bodyHtml: string,
  headerTexts: string[],
  footerTexts: string[]
): string => {
  const parts: string[] = [];
  if (headerTexts.length > 0) {
    parts.push(
      `<div style="border-bottom:1px dashed #cbd5e1;padding-bottom:8px;margin-bottom:12px;font-size:12px;color:#475569;"><strong>[Đầu trang]</strong> ${headerTexts
        .map((t) => escapeXml(t))
        .join(' · ')}</div>`
    );
  }
  parts.push(bodyHtml || '<p><em>Mẫu Word không có nội dung văn bản hiển thị.</em></p>');
  if (footerTexts.length > 0) {
    parts.push(
      `<div style="border-top:1px dashed #cbd5e1;padding-top:8px;margin-top:14px;font-size:12px;color:#475569;"><strong>[Chân trang]</strong> ${footerTexts
        .map((t) => escapeXml(t))
        .join(' · ')}</div>`
    );
  }
  return parts.join('');
};

/**
 * Validate and inspect an uploaded .docx ArrayBuffer using PizZip + XML scanner + Mammoth.
 * Reads placeholders in paragraphs, tables, headers, and footers.
 */
export const inspectDocxFile = async (
  fileName: string,
  mimeType: string,
  buffer: ArrayBuffer,
  templateId?: TemplateCode,
  customFieldKeys?: string[]
): Promise<DocxInspectionResult> => {
  const lowerName = fileName.toLowerCase();
  const isDocxExt = lowerName.endsWith('.docx');
  const isDocxMime =
    !mimeType ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/octet-stream';

  if (!isDocxExt || !isDocxMime) {
    return {
      valid: false,
      error:
        'Tệp không đúng định dạng Word .docx được hỗ trợ (R10). Vui lòng chọn tệp .docx hợp lệ; bản đã lưu trước đó vẫn được giữ nguyên.',
      detectedPlaceholders: [],
      placeholderDetails: [],
      suggestedMappings: [],
      residualFindings: [],
      suggestedSimplifiedM02: false,
      previewHtml: '',
      hasTables: false,
      hasImages: false,
      hasHeaders: false,
      hasFooters: false,
    };
  }

  let zip: PizZip;
  try {
    zip = new PizZip(buffer);
  } catch {
    return {
      valid: false,
      error:
        'Không thể đọc hoặc giải nén cấu trúc tệp DOCX (R10). Tệp có thể bị hỏng — hệ thống giữ nguyên mẫu đã lưu trước đó.',
      detectedPlaceholders: [],
      placeholderDetails: [],
      suggestedMappings: [],
      residualFindings: [],
      suggestedSimplifiedM02: false,
      previewHtml: '',
      hasTables: false,
      hasImages: false,
      hasHeaders: false,
      hasFooters: false,
    };
  }

  const documentXmlFile = zip.file('word/document.xml');
  if (!documentXmlFile) {
    return {
      valid: false,
      error:
        'Thiếu thành phần word/document.xml trong tệp DOCX (R10). Tệp không hợp lệ — giữ nguyên mẫu trước đó.',
      detectedPlaceholders: [],
      placeholderDetails: [],
      suggestedMappings: [],
      residualFindings: [],
      suggestedSimplifiedM02: false,
      previewHtml: '',
      hasTables: false,
      hasImages: false,
      hasHeaders: false,
      hasFooters: false,
    };
  }

  const documentXml = documentXmlFile.asText();
  const hasImages =
    documentXml.includes('<w:drawing') ||
    documentXml.includes('<w:pict') ||
    Object.keys(zip.files).some((k) => k.startsWith('word/media/'));

  // Scan XML across body paragraphs, tables, headers, and footers
  const xmlScan = scanDocxXmlPlaceholders(zip);

  // Build HTML preview via mammoth
  let bodyHtml = '';
  try {
    const htmlRes = await mammoth.convertToHtml(
      toMammothInput(buffer) as { arrayBuffer: ArrayBuffer }
    );
    bodyHtml = htmlRes.value || '';
  } catch {
    return {
      valid: false,
      error:
        'Không thể đọc nội dung văn bản của tệp DOCX (R10). Hệ thống giữ nguyên mẫu đã lưu trước đó.',
      detectedPlaceholders: [],
      placeholderDetails: [],
      suggestedMappings: [],
      residualFindings: [],
      suggestedSimplifiedM02: false,
      previewHtml: '',
      hasTables: xmlScan.hasTables,
      hasImages,
      hasHeaders: xmlScan.hasHeaders,
      hasFooters: xmlScan.hasFooters,
    };
  }

  const previewHtml = composePreviewHtmlWithHeadersFooters(
    bodyHtml,
    xmlScan.headerTexts,
    xmlScan.footerTexts
  );

  const detectedPlaceholders = xmlScan.details.map((d) => d.token);

  // Build initial mapping suggestions (auto-matched to 21+ standard fields AND existing custom fields)
  const customKeySet = new Set(customFieldKeys || []);
  const suggestedMappings: TemplateFieldMapping[] = xmlScan.details.map((detail) => {
    const matchedKey = KNOWN_FIELD_KEYS.has(detail.token)
      ? (detail.token as keyof BizDocFormData | 'documentNumber')
      : customKeySet.has(detail.token)
      ? detail.token
      : null;
    return {
      token: detail.token,
      targetField: matchedKey,
      matchType: 'PLACEHOLDER',
      occurrences: detail.count,
      zones: detail.zones,
      confirmed: false,
    };
  });

  // Scan full text (document + tables + headers + footers) for leftover personal/old company data (R05)
  const residualFindings = detectResidualOldData(xmlScan.allPlainText, hasImages);

  // Heuristic suggestion for R16 (M02 simplified draft)
  const lowerAll = `${lowerName} ${xmlScan.allPlainText.toLowerCase()}`;
  const suggestedSimplifiedM02 =
    templateId === 'M02' &&
    /(rút gọn|rut gon|bản nháp thực hành|ban nhap thuc hanh|thực hành|simplified|draft)/.test(
      lowerAll
    );

  return {
    valid: true,
    detectedPlaceholders,
    placeholderDetails: xmlScan.details,
    suggestedMappings,
    residualFindings,
    suggestedSimplifiedM02,
    previewHtml,
    hasTables: xmlScan.hasTables,
    hasImages,
    hasHeaders: xmlScan.hasHeaders,
    hasFooters: xmlScan.hasFooters,
  };
};

/**
 * Scan template or rendered output text for hardcoded old company names, 10/12-digit IDs/tax codes,
 * phone numbers, emails, or embedded images so the user is alerted and handles them (R05).
 */
export const detectResidualOldData = (
  plainText: string,
  hasImages: boolean,
  allowedValues?: string[]
): ResidualDataFinding[] => {
  const findings: ResidualDataFinding[] = [];
  const seen = new Set<string>();
  const allowedNormalized = new Set(
    (allowedValues || [])
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0)
  );

  const isAllowed = (val: string) => {
    const norm = val.trim().toLowerCase();
    if (allowedNormalized.has(norm)) return true;
    for (const allowed of allowedNormalized) {
      if (allowed.length >= 4 && (norm.includes(allowed) || allowed.includes(norm))) {
        return true;
      }
    }
    return false;
  };

  // Remove placeholders before scanning so placeholders don't trigger false positives
  const cleanedText = plainText.replace(/\{\{[^}]+\}\}/g, ' ');

  // 1. 12-digit CCCD / 10-digit Tax Code / Phone
  const numberRegex = /\b(0[0-9]{9,11}|[1-9][0-9]{9,11})\b/g;
  let numMatch: RegExpExecArray | null;
  while ((numMatch = numberRegex.exec(cleanedText)) !== null) {
    const val = numMatch[1];
    if (seen.has(val) || isAllowed(val)) continue;
    seen.add(val);
    const isCccd = val.length === 12;
    findings.push({
      id: `res-num-${findings.length + 1}`,
      category: isCccd ? 'CCCD_ID' : 'TAX_CODE',
      matchedSample: maskSensitiveValue(val),
      description: isCccd
        ? 'Phát hiện chuỗi 12 chữ số nghi là số CCCD/định danh cá nhân cố định trong văn bản (R05).'
        : 'Phát hiện chuỗi 10–11 chữ số nghi là Mã số doanh nghiệp hoặc số điện thoại cũ trong văn bản (R05).',
      resolved: false,
    });
    if (findings.length >= 8) break;
  }

  // 2. Hardcoded email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let emailMatch: RegExpExecArray | null;
  while ((emailMatch = emailRegex.exec(cleanedText)) !== null) {
    const val = emailMatch[0];
    if (seen.has(val) || isAllowed(val)) continue;
    seen.add(val);
    findings.push({
      id: `res-mail-${findings.length + 1}`,
      category: 'EMAIL',
      matchedSample: maskSensitiveValue(val),
      description: 'Phát hiện địa chỉ Email cố định nghi của hồ sơ cũ trong văn bản (R05).',
      resolved: false,
    });
  }

  // 3. Hardcoded concrete company name not replaced by {{companyName}}
  const companyRegex = /CÔNG TY\s+(?:TNHH|CỔ PHẦN|CP)\s+[A-ZÀ-Ỹ0-9\s&.-]{4,50}/gi;
  let compMatch: RegExpExecArray | null;
  while ((compMatch = companyRegex.exec(cleanedText)) !== null) {
    const val = compMatch[0].trim();
    if (/^CÔNG TY\s+TNHH\s+MỘT\s+THÀNH\s+VIÊN$/i.test(val)) continue;
    if (seen.has(val.toLowerCase()) || isAllowed(val)) continue;
    seen.add(val.toLowerCase());
    findings.push({
      id: `res-comp-${findings.length + 1}`,
      category: 'COMPANY_NAME',
      matchedSample: val.slice(0, 44),
      description:
        'Phát hiện tên doanh nghiệp cụ thể nghi là dữ liệu doanh nghiệp cũ chưa thay bằng {{companyName}} (R05).',
      resolved: false,
    });
  }

  // 4. Embedded image (possible scanned signature/stamp)
  if (hasImages) {
    findings.push({
      id: `res-img-${findings.length + 1}`,
      category: 'SIGNATURE_HINT',
      matchedSample: 'Hình ảnh nhúng trong word/media',
      description:
        'Mẫu có chứa hình ảnh nhúng (có thể là chữ ký hoặc con dấu cũ). Hãy kiểm tra để không dùng nhầm cho doanh nghiệp khác (R05).',
      resolved: false,
    });
  }

  return findings;
};

const maskSensitiveValue = (val: string): string => {
  if (val.length <= 4) return '****';
  return `${val.slice(0, 2)}***${val.slice(-2)}`;
};

export const formatVietnameseDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Resolve all 21 Section-5 placeholders + extended compatibility fields for a specific templateId.
 * Uses separate documentNumber per templateId (M01 vs M02) — never defaults M01 and M02 to the same number.
 */
export const buildFieldValueMap = (
  data: BizDocFormData,
  templateId: TemplateCode
): Record<string, string> => {
  const perTemplateDocNumber =
    data.documentNumbers?.[templateId] !== undefined
      ? data.documentNumbers[templateId]
      : templateId === 'M01'
      ? data.documentNumber
      : '';

  const formattedDate =
    data.documentDay && data.documentMonth && data.documentYear
      ? `${data.documentDay.padStart(2, '0')}/${data.documentMonth.padStart(2, '0')}/${data.documentYear}`
      : formatVietnameseDate(data.documentDate);

  const taxNotice = data.taxNoticeAddressChange || data.taxAuthorityChanged || 'UNKNOWN';
  const taxLabel =
    taxNotice === 'YES'
      ? 'Có thay đổi cơ quan thuế quản lý'
      : taxNotice === 'NO'
      ? 'Không thay đổi cơ quan thuế quản lý'
      : 'Chưa xác định';

  const procedureLabel =
    data.procedureMode === 'CHANGE_ADDRESS'
      ? 'Chuyển địa chỉ trụ sở thực tế'
      : data.procedureMode === 'ADMIN_ADDRESS_UPDATE'
      ? 'Cập nhật địa chỉ do thay đổi địa giới hành chính'
      : '';

  const signerTitle = data.applicationSignerTitle || data.legalRepresentativeTitle || '';

  const baseValues: Record<string, string> = {
    taskName: data.taskName ?? '',
    companyType: 'Công ty TNHH một thành viên',
    companyName: data.companyName ?? '',
    companyCode: data.companyCode ?? '',
    oldAddress: data.oldAddress ?? '',
    newAddress: data.newAddress ?? '',
    newAddressDetail: data.newAddressDetail ?? '',
    newWard: data.newWard ?? '',
    newProvince: data.newProvince ?? '',
    receivingAuthority: data.receivingAuthority ?? '',
    ownerDecisionSigner: data.ownerDecisionSigner ?? '',
    applicationSigner: data.applicationSigner ?? '',
    applicationSignerTitle: signerTitle,
    documentNumber: perTemplateDocNumber ?? '',
    signingPlace: data.signingPlace ?? '',
    documentDay: data.documentDay ?? '',
    documentMonth: data.documentMonth ?? '',
    documentYear: data.documentYear ?? '',
    companyPhone: data.companyPhone ?? '',
    companyEmail: data.companyEmail ?? '',
    procedureMode: procedureLabel,
    taxNoticeAddressChange: taxLabel,
    taxAuthorityChanged: taxLabel,
    taxProcedureStatus:
      data.taxProcedureStatus === 'COMPLETED'
        ? 'Đã hoàn thành'
        : data.taxProcedureStatus === 'NOT_STARTED'
        ? 'Chưa thực hiện'
        : 'Cần kiểm tra',
    ownerType: data.ownerType === 'ORGANIZATION' ? 'Tổ chức' : 'Cá nhân',
    ownerName: data.ownerName || data.ownerDecisionSigner || '',
    ownerIdentifier: data.ownerIdentifier ?? '',
    ownerOrganizationAuthorizedPerson: data.ownerOrganizationAuthorizedPerson ?? '',
    legalRepresentativeName: data.legalRepresentativeName || data.applicationSigner || '',
    legalRepresentativeTitle: signerTitle,
    documentDate: formattedDate,
    includeM03BeneficialOwner: data.includeM03BeneficialOwner ? 'Có' : 'Không',
    includeM04Authorization: data.includeM04Authorization ? 'Có' : 'Không',
    authorizedPersonName: data.authorizedPersonName ?? '',
    authorizedPersonIdentifier: data.authorizedPersonIdentifier ?? '',
  };

  // Merge user-added custom fields (Requirement 3: cho phép ánh xạ thêm trường mới)
  if (data.customFields) {
    for (const [k, v] of Object.entries(data.customFields)) {
      if (!Object.prototype.hasOwnProperty.call(baseValues, k)) {
        baseValues[k] = v ?? '';
      }
    }
  }

  return baseValues;
};

/**
 * Build rendering payload map for Docxtemplater from confirmed form data + explicit template mappings.
 * R06: Only mapped tokens are put in the render payload — unmapped legal text is untouched.
 * If allowUnconfirmedForDraftCheck is true (R02 draft check on PENDING_REVIEW template),
 * mapped fields with targetField are previewed without modifying saved approval state.
 */
export const buildTemplateRenderData = (
  data: BizDocFormData,
  mappings: TemplateFieldMapping[],
  templateId: TemplateCode,
  allowUnconfirmedForDraftCheck = false
): Record<string, string> => {
  const fieldValues = buildFieldValueMap(data, templateId);
  const payload: Record<string, string> = {};

  for (const mapping of mappings) {
    const eligible = allowUnconfirmedForDraftCheck
      ? Boolean(mapping.targetField)
      : Boolean(mapping.confirmed && mapping.targetField);
    if (eligible && mapping.targetField && mapping.matchType === 'PLACEHOLDER') {
      payload[mapping.token.trim()] = fieldValues[mapping.targetField] ?? '';
    }
  }

  return payload;
};

/**
 * Replace explicitly confirmed literal text tokens across document.xml, header*.xml, and footer*.xml.
 * R06: Never guesses unmapped text.
 */
const applyExplicitLiteralReplacements = (
  zip: PizZip,
  data: BizDocFormData,
  mappings: TemplateFieldMapping[],
  templateId: TemplateCode,
  allowUnconfirmedForDraftCheck = false
) => {
  const literalMappings = mappings.filter(
    (m) =>
      m.matchType === 'LITERAL_TEXT' &&
      (allowUnconfirmedForDraftCheck || m.confirmed) &&
      m.targetField &&
      m.token.trim().length > 0
  );
  if (literalMappings.length === 0) return;

  const fieldValues = buildFieldValueMap(data, templateId);
  const xmlPaths = Object.keys(zip.files).filter(
    (k) =>
      k === 'word/document.xml' ||
      /^word\/header\d*\.xml$/i.test(k) ||
      /^word\/footer\d*\.xml$/i.test(k)
  );

  for (const xmlPath of xmlPaths) {
    const fileObj = zip.file(xmlPath);
    if (!fileObj) continue;
    let xml = fileObj.asText();
    let changed = false;

    for (const mapping of literalMappings) {
      if (!mapping.targetField) continue;
      const replacement = escapeXml(fieldValues[mapping.targetField] ?? '');
      const escapedToken = escapeXml(mapping.token);
      if (xml.includes(escapedToken)) {
        xml = xml.split(escapedToken).join(replacement);
        changed = true;
      }
    }

    if (changed) {
      zip.file(xmlPath, xml);
    }
  }
};

export interface GeneratedDocxOutput {
  success: boolean;
  error?: string;
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  previewHtml?: string;
  fileName: string;
  isDraftOnly: boolean;
  isSimplifiedPracticeDraft: boolean;
  replacedTokensCount: number;
  unreplacedPlaceholders: string[];
  residualFindingsInOutput: ResidualDataFinding[];
}

/**
 * Generate a real editable .docx Blob from the template binary stored in IndexedDB.
 * Replaces every mapped {{placeholder}} across paragraphs, tables, headers, and footers (R04),
 * preserves formatting/styles/tables, and verifies the actual generated XML & Mammoth parse (R11).
 */
export const generateFilledDocx = async (params: {
  template: BizDocTemplateVersion;
  templateBuffer: ArrayBuffer;
  data: BizDocFormData;
  isDraftCheckMode?: boolean;
}): Promise<GeneratedDocxOutput> => {
  const { template, templateBuffer, data, isDraftCheckMode = false } = params;
  const safeCompanySlug = (data.companyCode || 'DN')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 15);
  const suffix = template.isSimplifiedDraft
    ? '_BAN_NHAP_THUC_HANH'
    : isDraftCheckMode
    ? '_NHAP_KIEM_TRA'
    : '';
  const fileName = `${template.templateId}_${safeCompanySlug}_v${template.version}${suffix}.docx`;

  try {
    const zip = new PizZip(templateBuffer.slice(0));

    // Step 1: Apply explicit user-confirmed literal text mappings across document/header/footer
    applyExplicitLiteralReplacements(
      zip,
      data,
      template.fieldMappings,
      template.templateId,
      isDraftCheckMode
    );

    // Step 2: Render {{placeholder}} tags via Docxtemplater across body, tables, headers, footers
    const renderData = buildTemplateRenderData(
      data,
      template.fieldMappings,
      template.templateId,
      isDraftCheckMode
    );

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
      parser: (tag: string) => {
        const cleanTag = tag.trim();
        return {
          get: (scope: Record<string, unknown>) => {
            if (scope && Object.prototype.hasOwnProperty.call(scope, cleanTag)) {
              const val = scope[cleanTag];
              // R14: 0 and false are valid values, distinct from null/undefined
              if (val === null || val === undefined) return undefined;
              return val;
            }
            return undefined;
          },
        };
      },
      // R06: Never wipe or alter unmapped tags
      nullGetter: (part: { value?: string }) => `{{${part.value || ''}}}`,
    });

    doc.render(renderData);

    const outArrayBuffer = doc.getZip().generate({
      type: 'arraybuffer',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }) as ArrayBuffer;

    // Step 3: Verify the real generated DOCX XML & check remaining placeholders / old data (R05, R11)
    let verifyZip: PizZip;
    try {
      verifyZip = new PizZip(outArrayBuffer.slice(0));
    } catch {
      return {
        success: false,
        error: 'Tệp DOCX sau khi sinh bị lỗi cấu trúc ZIP (R11). Không báo xuất thành công.',
        fileName,
        isDraftOnly: isDraftCheckMode,
        isSimplifiedPracticeDraft: Boolean(template.isSimplifiedDraft),
        replacedTokensCount: 0,
        unreplacedPlaceholders: [],
        residualFindingsInOutput: [],
      };
    }

    const postScan = scanDocxXmlPlaceholders(verifyZip);
    const unreplacedPlaceholders = postScan.details.map((d) => d.token);

    // Check residual old company / personal data still lingering in the generated output (R05)
    const allowedValues = [
      data.companyName,
      data.companyCode,
      data.companyPhone,
      data.companyEmail,
      data.ownerIdentifier,
      data.authorizedPersonIdentifier,
    ];
    const residualFindingsInOutput = detectResidualOldData(
      postScan.allPlainText,
      false,
      allowedValues
    );

    // Verify Mammoth can open & convert the generated DOCX cleanly (R11)
    let bodyHtml = '';
    try {
      const checkRes = await mammoth.convertToHtml(
        toMammothInput(outArrayBuffer) as { arrayBuffer: ArrayBuffer }
      );
      bodyHtml = checkRes.value;
    } catch {
      return {
        success: false,
        error:
          'Tệp DOCX sau khi sinh bị lỗi cấu trúc khi kiểm tra đọc lại (R11). Không báo xuất thành công.',
        fileName,
        isDraftOnly: isDraftCheckMode,
        isSimplifiedPracticeDraft: Boolean(template.isSimplifiedDraft),
        replacedTokensCount: 0,
        unreplacedPlaceholders,
        residualFindingsInOutput,
      };
    }

    const previewHtml = composePreviewHtmlWithHeadersFooters(
      bodyHtml,
      postScan.headerTexts,
      postScan.footerTexts
    );

    const blob = new Blob([outArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const replacedTokensCount = Object.keys(renderData).length;

    return {
      success: true,
      blob,
      arrayBuffer: outArrayBuffer,
      previewHtml,
      fileName,
      isDraftOnly: isDraftCheckMode,
      isSimplifiedPracticeDraft: Boolean(template.isSimplifiedDraft),
      replacedTokensCount,
      unreplacedPlaceholders,
      residualFindingsInOutput,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi trộn dữ liệu DOCX.';
    return {
      success: false,
      error: `Không thể tạo tệp Word (.docx) từ mẫu ${template.templateId} (R11): ${msg}`,
      fileName,
      isDraftOnly: isDraftCheckMode,
      isSimplifiedPracticeDraft: Boolean(template.isSimplifiedDraft),
      replacedTokensCount: 0,
      unreplacedPlaceholders: [],
      residualFindingsInOutput: [],
    };
  }
};

// =========================================================================
// REAL VIETNAMESE-UNICODE PDF GENERATOR FROM GENERATED DOCX XML (TC10 / R11)
// =========================================================================

interface PdfTextRun {
  text: string;
  bold?: boolean;
  italics?: boolean;
  decoration?: 'underline';
}

interface PdfParagraphBlock {
  text: PdfTextRun[] | string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  margin?: [number, number, number, number];
  fontSize?: number;
}

const parseParagraphNode = (pXml: string): PdfParagraphBlock | null => {
  const jcMatch = /<w:jc\b[^>]*w:val="([^"]+)"/.exec(pXml);
  let alignment: PdfParagraphBlock['alignment'] = 'left';
  if (jcMatch) {
    const val = jcMatch[1];
    if (val === 'center') alignment = 'center';
    else if (val === 'right') alignment = 'right';
    else if (val === 'both' || val === 'distribute') alignment = 'justify';
  }

  const runs: PdfTextRun[] = [];
  const rRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
  let rMatch: RegExpExecArray | null;

  while ((rMatch = rRegex.exec(pXml)) !== null) {
    const rContent = rMatch[1];
    const rPrMatch = /<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/.exec(rContent);
    const rPr = rPrMatch ? rPrMatch[1] : '';
    const isBold =
      /<w:b\b(?![^>]*w:val="(?:false|0)")/.test(rPr);
    const isItalic =
      /<w:i\b(?![^>]*w:val="(?:false|0)")/.test(rPr);
    const isUnderline =
      /<w:u\b(?![^>]*w:val="none")/.test(rPr);

    let runText = '';
    const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tRegex.exec(rContent)) !== null) {
      if (tMatch[0].startsWith('<w:tab')) runText += '    ';
      else if (tMatch[0].startsWith('<w:br')) runText += '\n';
      else if (tMatch[1] !== undefined) runText += decodeXmlEntities(tMatch[1]);
    }

    if (runText.length > 0) {
      runs.push({
        text: runText,
        ...(isBold ? { bold: true } : {}),
        ...(isItalic ? { italics: true } : {}),
        ...(isUnderline ? { decoration: 'underline' as const } : {}),
      });
    }
  }

  if (runs.length === 0) return null;

  return {
    text: runs,
    alignment,
    margin: [0, 0, 0, 5],
  };
};

const parseTableNode = (tblXml: string): Record<string, unknown> | null => {
  const rows: unknown[][] = [];
  const trRegex = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g;
  let trMatch: RegExpExecArray | null;
  let maxCols = 0;

  while ((trMatch = trRegex.exec(tblXml)) !== null) {
    const cells: unknown[] = [];
    const tcRegex = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g;
    let tcMatch: RegExpExecArray | null;
    while ((tcMatch = tcRegex.exec(trMatch[1])) !== null) {
      const cellParagraphs: PdfParagraphBlock[] = [];
      const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
      let pMatch: RegExpExecArray | null;
      while ((pMatch = pRegex.exec(tcMatch[1])) !== null) {
        const parsed = parseParagraphNode(pMatch[0]);
        if (parsed) cellParagraphs.push(parsed);
      }
      if (cellParagraphs.length === 0) {
        cells.push({ text: '' });
      } else if (cellParagraphs.length === 1) {
        cells.push({ ...cellParagraphs[0], margin: [2, 2, 2, 2] });
      } else {
        cells.push({
          stack: cellParagraphs.map((cp) => ({ ...cp, margin: [0, 0, 0, 2] })),
          margin: [2, 2, 2, 2],
        });
      }
    }
    if (cells.length > 0) {
      if (cells.length > maxCols) maxCols = cells.length;
      rows.push(cells);
    }
  }

  if (rows.length === 0 || maxCols === 0) return null;

  // Normalize column counts per row so pdfmake never throws on ragged tables
  const normalizedRows = rows.map((r) => {
    const padded = [...r];
    while (padded.length < maxCols) {
      padded.push({ text: '' });
    }
    return padded;
  });

  return {
    table: {
      widths: Array(maxCols).fill('*'),
      body: normalizedRows,
    },
    layout: {
      hLineWidth: () => 0.6,
      vLineWidth: () => 0.6,
      hLineColor: () => '#94a3b8',
      vLineColor: () => '#94a3b8',
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
    margin: [0, 4, 0, 8],
  };
};

const buildPdfBlocksFromDocxBuffer = (
  docxArrayBuffer: ArrayBuffer
): { content: unknown[]; headerText: string; footerText: string } => {
  const zip = new PizZip(docxArrayBuffer.slice(0));
  const docXml = zip.file('word/document.xml')?.asText() || '';
  const bodyMatch = /<w:body\b[^>]*>([\s\S]*?)<\/w:body>/.exec(docXml);
  const bodyXml = bodyMatch ? bodyMatch[1] : docXml;

  const content: unknown[] = [];

  // Walk top-level <w:tbl> and <w:p> blocks in document order
  const tblRegex = /<w:tbl\b[\s\S]*?<\/w:tbl>/g;
  let lastIdx = 0;
  let tblMatch: RegExpExecArray | null;

  const pushParagraphsFromSlice = (slice: string) => {
    const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
    let pMatch: RegExpExecArray | null;
    while ((pMatch = pRegex.exec(slice)) !== null) {
      const parsed = parseParagraphNode(pMatch[0]);
      if (parsed) {
        content.push(parsed);
      } else {
        content.push({ text: ' ', margin: [0, 0, 0, 3] });
      }
    }
  };

  while ((tblMatch = tblRegex.exec(bodyXml)) !== null) {
    pushParagraphsFromSlice(bodyXml.slice(lastIdx, tblMatch.index));
    const tableBlock = parseTableNode(tblMatch[0]);
    if (tableBlock) content.push(tableBlock);
    lastIdx = tblMatch.index + tblMatch[0].length;
  }
  pushParagraphsFromSlice(bodyXml.slice(lastIdx));

  const scan = scanDocxXmlPlaceholders(zip);

  return {
    content: content.length > 0 ? content : [{ text: '(Tài liệu trống)' }],
    headerText: scan.headerTexts.join(' · '),
    footerText: scan.footerTexts.join(' · '),
  };
};

export interface GeneratedPdfOutput {
  success: boolean;
  error?: string;
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  fileName: string;
}

/**
 * Generate a real Vietnamese-Unicode PDF (.pdf) directly from the filled DOCX ArrayBuffer
 * using pdfmake + embedded Roboto TTF fonts, preserving paragraphs, bold/italic, alignment,
 * tables, headers, footers, and R16 practice-draft watermark when applicable.
 * Verifies the resulting binary begins with "%PDF-" before returning success (R11).
 */
export const generateFilledPdf = async (params: {
  docxArrayBuffer: ArrayBuffer;
  docxFileName: string;
  isSimplifiedPracticeDraft?: boolean;
  isDraftOnly?: boolean;
}): Promise<GeneratedPdfOutput> => {
  const {
    docxArrayBuffer,
    docxFileName,
    isSimplifiedPracticeDraft = false,
    isDraftOnly = false,
  } = params;
  const fileName = docxFileName.replace(/\.docx$/i, '.pdf');

  try {
    const { content, headerText, footerText } = buildPdfBlocksFromDocxBuffer(docxArrayBuffer);

    const headerBanner = isSimplifiedPracticeDraft
      ? 'BẢN NHÁP THỰC HÀNH (R16 – KHÔNG PHẢI MẪU CHÍNH THỨC ĐỦ ĐIỀU KIỆN NỘP)'
      : isDraftOnly
      ? 'BẢN NHÁP KIỂM TRA (MẪU CHƯA PHÊ DUYỆT – R02)'
      : '';

    const docDefinition: Record<string, unknown> = {
      pageSize: 'A4',
      pageMargins: [50, 56, 50, 54],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        lineHeight: 1.35,
        color: '#0f172a',
      },
      ...(headerBanner
        ? {
            watermark: {
              text: isSimplifiedPracticeDraft ? 'BẢN NHÁP THỰC HÀNH' : 'BẢN NHÁP KIỂM TRA',
              color: '#dc2626',
              opacity: 0.14,
              bold: true,
              italics: false,
            },
          }
        : {}),
      header: () => {
        const items: unknown[] = [];
        if (headerBanner) {
          items.push({
            text: headerBanner,
            fontSize: 8.5,
            bold: true,
            color: '#b91c1c',
            alignment: 'center',
            margin: [40, 14, 40, 2],
          });
        }
        if (headerText) {
          items.push({
            text: headerText,
            fontSize: 9,
            color: '#475569',
            alignment: 'center',
            margin: [40, headerBanner ? 2 : 18, 40, 0],
          });
        }
        return items.length > 0 ? { stack: items } : { text: '' };
      },
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            text: footerText || 'BizDoc Mini',
            fontSize: 8.5,
            color: '#64748b',
            alignment: 'left',
          },
          {
            text: `Trang ${currentPage}/${pageCount}`,
            fontSize: 8.5,
            color: '#64748b',
            alignment: 'right',
          },
        ],
        margin: [50, 12, 50, 0],
      }),
      content,
    };

    const pdfMakeMod = await import('pdfmake/build/pdfmake');
    const pdfFontsMod = await import('pdfmake/build/vfs_fonts');

    const pdfMakeInstance =
      (pdfMakeMod as unknown as { default?: Record<string, unknown> }).default ||
      (pdfMakeMod as unknown as Record<string, unknown>);
    const rawFonts =
      (pdfFontsMod as unknown as { default?: Record<string, unknown> }).default ||
      (pdfFontsMod as unknown as Record<string, unknown>);
    const vfsPayload =
      (rawFonts as { pdfMake?: { vfs?: Record<string, string> }; vfs?: Record<string, string> })
        .pdfMake?.vfs ||
      (rawFonts as { vfs?: Record<string, string> }).vfs ||
      (rawFonts as Record<string, string>);

    if (typeof pdfMakeInstance.addVirtualFileSystem === 'function') {
      (pdfMakeInstance.addVirtualFileSystem as (vfs: Record<string, string>) => void)(vfsPayload);
    } else {
      pdfMakeInstance.vfs = vfsPayload;
    }

    const createPdfFn = pdfMakeInstance.createPdf as (
      def: Record<string, unknown>
    ) => {
      getBuffer?: () => Promise<Uint8Array>;
      getBlob?: () => Promise<Blob>;
    };

    const pdfDoc = createPdfFn.call(pdfMakeInstance, docDefinition);

    let outArrayBuffer: ArrayBuffer;
    let blob: Blob;

    if (typeof pdfDoc.getBuffer === 'function') {
      const buf = await pdfDoc.getBuffer();
      const uint8 = new Uint8Array(buf);
      outArrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
      blob = new Blob([outArrayBuffer], { type: 'application/pdf' });
    } else if (typeof pdfDoc.getBlob === 'function') {
      blob = await pdfDoc.getBlob();
      outArrayBuffer = await blob.arrayBuffer();
    } else {
      throw new Error('Không tìm thấy phương thức xuất PDF hợp lệ.');
    }

    // R11 integrity check: verify output actually begins with "%PDF-" header
    const headerBytes = new Uint8Array(outArrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode(...Array.from(headerBytes));
    if (outArrayBuffer.byteLength < 100 || headerStr !== '%PDF-') {
      return {
        success: false,
        error: 'Tệp PDF sinh ra không hợp lệ (thiếu chữ ký %PDF- – R11). Không báo xuất thành công.',
        fileName,
      };
    }

    return {
      success: true,
      blob,
      arrayBuffer: outArrayBuffer,
      fileName,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi tạo tệp PDF.';
    return {
      success: false,
      error: `Không thể tạo tệp PDF (R11): ${msg}`,
      fileName,
    };
  }
};

/**
 * Bundle multiple generated DOCX/PDF blobs into a single downloadable .zip archive using PizZip.
 */
export const createDocxBundleZip = async (
  files: Array<{ fileName: string; blob: Blob }>
): Promise<Blob> => {
  const zip = new PizZip();
  for (const file of files) {
    const ab = await file.blob.arrayBuffer();
    zip.file(file.fileName, ab);
  }
  const zipBuffer = zip.generate({ type: 'arraybuffer' }) as ArrayBuffer;
  return new Blob([zipBuffer], { type: 'application/zip' });
};

export interface OfficialContentPreservationReport {
  preserved: boolean;
  originalParagraphCount: number;
  renderedParagraphCount: number;
  originalTableCount: number;
  renderedTableCount: number;
  headersPreserved: boolean;
  footersPreserved: boolean;
  missingStaticPhrases: string[];
}

/**
 * Requirement 8 / R06: Verify that rendering a filled DOCX from an official standard template
 * does NOT delete any mandatory static paragraphs, tables, headers, footers, or legal headings.
 */
export const verifyOfficialContentPreserved = (
  originalBuffer: ArrayBuffer,
  renderedBuffer: ArrayBuffer
): OfficialContentPreservationReport => {
  const origZip = new PizZip(originalBuffer.slice(0));
  const rendZip = new PizZip(renderedBuffer.slice(0));

  const origDocXml = origZip.file('word/document.xml')?.asText() || '';
  const rendDocXml = rendZip.file('word/document.xml')?.asText() || '';

  const origParagraphs = extractParagraphTextsFromXml(origDocXml);
  const rendParagraphs = extractParagraphTextsFromXml(rendDocXml);
  const origTableCount = (origDocXml.match(/<w:tbl\b/g) || []).length;
  const rendTableCount = (rendDocXml.match(/<w:tbl\b/g) || []).length;

  const origHeaders = Object.keys(origZip.files).filter((k) => /^word\/header\d*\.xml$/i.test(k));
  const rendHeaders = Object.keys(rendZip.files).filter((k) => /^word\/header\d*\.xml$/i.test(k));
  const origFooters = Object.keys(origZip.files).filter((k) => /^word\/footer\d*\.xml$/i.test(k));
  const rendFooters = Object.keys(rendZip.files).filter((k) => /^word\/footer\d*\.xml$/i.test(k));

  const headersPreserved = origHeaders.every((h) => rendHeaders.includes(h));
  const footersPreserved = origFooters.every((f) => rendFooters.includes(f));

  // Verify static paragraphs (paragraphs containing NO {{placeholder}}) remain intact in rendered text
  const rendNormalized = rendParagraphs.join('\n').replace(/\s+/g, ' ');
  const missingStaticPhrases: string[] = [];

  for (const p of origParagraphs) {
    const trimmed = p.trim();
    if (trimmed.length < 6) continue;
    if (/\{\{[^}]+\}\}/.test(trimmed)) continue;
    const normalizedPhrase = trimmed.replace(/\s+/g, ' ');
    if (!rendNormalized.includes(normalizedPhrase)) {
      missingStaticPhrases.push(trimmed.slice(0, 80));
    }
  }

  const preserved =
    rendParagraphs.length >= origParagraphs.length &&
    rendTableCount >= origTableCount &&
    headersPreserved &&
    footersPreserved &&
    missingStaticPhrases.length === 0;

  return {
    preserved,
    originalParagraphCount: origParagraphs.length,
    renderedParagraphCount: rendParagraphs.length,
    originalTableCount: origTableCount,
    renderedTableCount: rendTableCount,
    headersPreserved,
    footersPreserved,
    missingStaticPhrases,
  };
};

export const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
