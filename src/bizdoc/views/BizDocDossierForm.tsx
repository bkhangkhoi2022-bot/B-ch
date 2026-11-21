import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Save,
  Eye,
  Download,
  FileArchive,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Trash2,
  X,
  RefreshCw,
  Building2,
  MapPin,
  UserCheck,
  Landmark,
  CalendarClock,
  FileCheck2,
  Wand2,
  FileDown,
} from 'lucide-react';
import { useBizDoc } from '../BizDocContext';
import {
  BizDocAttachmentMeta,
  BizDocConfig,
  BizDocExportLogItem,
  BizDocFormData,
  BizDocRecord,
  CompanyType,
  DocumentType,
  OwnerType,
  ProcedureMode,
  TaxNoticeAddressChange,
  TaxProcedureStatus,
} from '../types';
import {
  BIZDOC_APP_ID,
  BIZDOC_CONTRACT_VERSION,
  createEmptyFormData,
  generateAttemptId,
  generateRecordId,
  normalizeFormData,
} from '../constants';
import { evaluateBizDocRules } from '../validation';
import {
  createDocxBundleZip,
  generateFilledDocx,
  generateFilledPdf,
  GeneratedDocxOutput,
  triggerBrowserDownload,
} from '../docxEngine';

interface BizDocDossierFormProps {
  initialRecordId: string | null;
  onGoToTemplates: () => void;
  onGoToRecords: () => void;
}

type FormGroupId =
  | 'company'
  | 'address'
  | 'owner_signer'
  | 'authority'
  | 'date_number'
  | 'review_export';

const FORM_GROUPS: Array<{
  id: FormGroupId;
  shortLabel: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'company', shortLabel: '1. Công ty', label: '1. Thông tin công ty', icon: Building2 },
  { id: 'address', shortLabel: '2. Địa chỉ', label: '2. Địa chỉ cũ và mới', icon: MapPin },
  {
    id: 'owner_signer',
    shortLabel: '3. Chủ sở hữu',
    label: '3. Chủ sở hữu và người ký',
    icon: UserCheck,
  },
  {
    id: 'authority',
    shortLabel: '4. Cơ quan nhận',
    label: '4. Cơ quan tiếp nhận',
    icon: Landmark,
  },
  {
    id: 'date_number',
    shortLabel: '5. Ngày & Số VB',
    label: '5. Ngày tháng và số văn bản',
    icon: CalendarClock,
  },
  {
    id: 'review_export',
    shortLabel: '6. Kiểm tra & Xuất',
    label: '6. Kiểm tra và xuất hồ sơ',
    icon: FileCheck2,
  },
];

const SUPPORTED_ATTACHMENT_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const BizDocDossierForm: React.FC<BizDocDossierFormProps> = ({
  initialRecordId,
  onGoToTemplates,
  onGoToRecords,
}) => {
  const { currentConfig, templateVersions, records, saveRecord, getTemplateBinary } = useBizDoc();

  const [activeGroup, setActiveGroup] = useState<FormGroupId>('company');

  // Core NF_MINIAPP_V2 record identity & snapshot
  const [recordId, setRecordId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string>(() => generateAttemptId());
  const [configSnapshot, setConfigSnapshot] = useState<BizDocConfig>(() => currentConfig);
  const [boundTemplateVersionKeys, setBoundTemplateVersionKeys] = useState<Record<string, string>>(
    {}
  );
  const [createdAt, setCreatedAt] = useState<string>(() => new Date().toISOString());
  const [exportHistory, setExportHistory] = useState<BizDocExportLogItem[]>([]);

  // Form data & attachments
  const [formData, setFormData] = useState<BizDocFormData>(() => createEmptyFormData());
  const [attachments, setAttachments] = useState<BizDocAttachmentMeta[]>([]);
  const [confirmedByUser, setConfirmedByUser] = useState<boolean>(false);
  const [conflictsConfirmedByUser, setConflictsConfirmedByUser] = useState<boolean>(false);

  // Attachment uploader state
  const [uploadDocType, setUploadDocType] = useState<DocumentType>('CERTIFICATE');
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  // UI states (empty, processing, error, needs review, success)
  const [saving, setSaving] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [generatedOutputs, setGeneratedOutputs] = useState<Record<string, GeneratedDocxOutput>>({});
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    html: string;
    isSimplifiedPracticeDraft: boolean;
    isDraftOnly: boolean;
    unreplacedPlaceholders: string[];
  } | null>(null);

  const buildCurrentBoundKeys = (cfg: BizDocConfig): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const slot of cfg.templateSlots) {
      if (slot.activeVersionKey) {
        map[slot.templateId] = slot.activeVersionKey;
      }
    }
    return map;
  };

  // Load existing record OR start fresh attempt
  useEffect(() => {
    if (initialRecordId) {
      const existing = records.find((r) => r.recordId === initialRecordId);
      if (existing) {
        setRecordId(existing.recordId);
        setAttemptId(existing.attemptId);
        setConfigSnapshot(existing.configSnapshot);
        setBoundTemplateVersionKeys(existing.boundTemplateVersionKeys || {});
        setFormData(normalizeFormData(existing.data));
        setAttachments(existing.attachments || []);
        setConfirmedByUser(existing.confirmedByUser);
        setConflictsConfirmedByUser(Boolean(existing.conflictsConfirmedByUser));
        setCreatedAt(existing.createdAt);
        setExportHistory(existing.exportHistory || []);
        setGeneratedOutputs({});
        setBanner(null);
        return;
      }
    }

    setRecordId(null);
    setAttemptId(generateAttemptId());
    setConfigSnapshot(currentConfig);
    setBoundTemplateVersionKeys(buildCurrentBoundKeys(currentConfig));
    setFormData(createEmptyFormData());
    setAttachments([]);
    setConfirmedByUser(false);
    setConflictsConfirmedByUser(false);
    setCreatedAt(new Date().toISOString());
    setExportHistory([]);
    setGeneratedOutputs({});
    setActiveGroup('company');
    setBanner(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecordId]);

  // Notice when newer configVersion exists in template store (R13: old saved records NEVER auto-overwrite!)
  const hasNewerConfigAvailable = currentConfig.configVersion > configSnapshot.configVersion;

  const handleSyncToLatestConfig = () => {
    setConfigSnapshot(currentConfig);
    setBoundTemplateVersionKeys(buildCurrentBoundKeys(currentConfig));
    setGeneratedOutputs({});
    setBanner({
      type: 'success',
      text: `Đã cập nhật bộ mẫu sang cấu hình mới nhất v${currentConfig.configVersion} cho lượt đang soạn mới.`,
    });
  };

  // Evaluate unified rules R01-R17
  const validation = useMemo(
    () =>
      evaluateBizDocRules({
        data: formData,
        confirmedByUser,
        conflictsConfirmedByUser,
        configSnapshot,
        boundTemplateVersionKeys,
        allTemplateVersions: templateVersions,
      }),
    [
      formData,
      confirmedByUser,
      conflictsConfirmedByUser,
      configSnapshot,
      boundTemplateVersionKeys,
      templateVersions,
    ]
  );

  // R07: Any field edit invalidates stale generated outputs so DOCX/PDF always use latest confirmed values
  const updateField = <K extends keyof BizDocFormData>(key: K, value: BizDocFormData[K]) => {
    setFormData((prev) => {
      const next: BizDocFormData = { ...prev, [key]: value };
      if (key === 'taxNoticeAddressChange') {
        next.taxAuthorityChanged = value as TaxNoticeAddressChange;
      }
      if (key === 'applicationSignerTitle') {
        next.legalRepresentativeTitle = String(value);
      }
      if (key === 'documentDay' || key === 'documentMonth' || key === 'documentYear') {
        const d = (key === 'documentDay' ? String(value) : prev.documentDay).padStart(2, '0');
        const m = (key === 'documentMonth' ? String(value) : prev.documentMonth).padStart(2, '0');
        const y = key === 'documentYear' ? String(value) : prev.documentYear;
        if (y.length === 4 && m.length === 2 && d.length === 2) {
          next.documentDate = `${y}-${m}-${d}`;
        }
      }
      return next;
    });
    setGeneratedOutputs({});
  };

  const updateDocumentNumberForTemplate = (templateId: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      documentNumber: templateId === 'M01' ? val : prev.documentNumber,
      documentNumbers: {
        ...prev.documentNumbers,
        [templateId]: val,
      },
    }));
    setGeneratedOutputs({});
  };

  const updateCustomField = (fieldKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [fieldKey]: value,
      },
    }));
    setGeneratedOutputs({});
  };

  const handleComposeNewAddressFromParts = () => {
    const parts = [formData.newAddressDetail, formData.newWard, formData.newProvince]
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      updateField('newAddress', parts.join(', '));
    }
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase();
    const validExt =
      ext.endsWith('.pdf') ||
      ext.endsWith('.jpg') ||
      ext.endsWith('.jpeg') ||
      ext.endsWith('.png') ||
      ext.endsWith('.webp');

    if (!validExt || (file.type && !SUPPORTED_ATTACHMENT_MIMES.has(file.type))) {
      setBanner({
        type: 'error',
        text: 'Tệp giấy tờ không thuộc định dạng hỗ trợ (.pdf, .jpg, .png, .webp).',
      });
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      return;
    }

    const newMeta: BizDocAttachmentMeta = {
      id: `att-${Date.now().toString(36)}`,
      documentType: uploadDocType,
      fileName: file.name,
      mimeType: file.type || (ext.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      fileSize: file.size,
      extractionStatus: 'MANUAL',
      uploadedAt: new Date().toISOString(),
      storedLocally: false,
      note: 'Chế độ nhập thủ công (không gửi giấy tờ khách hàng lên dịch vụ AI bên ngoài).',
    };

    setAttachments((prev) => [newMeta, ...prev]);
    setBanner({
      type: 'warning',
      text: `Đã ghi nhận metadata tệp "${file.name}" ở chế độ nhập thủ công. Vui lòng nhập và xác nhận thông tin trong biểu mẫu.`,
    });
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  // Save draft / record to IndexedDB (R12 / TC07 / TC08)
  const handleSaveRecord = async (
    overrideStatus?: BizDocRecord['taskStatus'],
    extraExports?: BizDocExportLogItem[]
  ) => {
    setSaving(true);
    setBanner(null);

    const targetRecordId = recordId || generateRecordId();
    const nextHistory = extraExports ? [...extraExports, ...exportHistory] : exportHistory;
    // R16: If M02 is simplified practice draft, never promote taskStatus to READY/EXPORTED official
    const rawStatus = overrideStatus || validation.computedStatus;
    const finalStatus =
      validation.hasSimplifiedM02PracticeDraft && rawStatus === 'READY'
        ? 'NEEDS_REVIEW'
        : rawStatus;

    const payload: BizDocRecord = {
      appId: BIZDOC_APP_ID,
      contractVersion: BIZDOC_CONTRACT_VERSION,
      recordId: targetRecordId,
      attemptId,
      configVersion: configSnapshot.configVersion,
      configSnapshot,
      boundTemplateVersionKeys,
      taskStatus: finalStatus,
      data: formData,
      attachments,
      confirmedByUser,
      conflictsConfirmedByUser,
      createdAt,
      updatedAt: new Date().toISOString(),
      exportHistory: nextHistory,
    };

    const res = await saveRecord(payload);
    setSaving(false);

    if (!res.success) {
      // R12 / TC08: Keep all entered data intact, do not report saved, allow retry
      setBanner({
        type: 'error',
        text:
          res.error ||
          'Lưu hồ sơ thất bại (R12). Toàn bộ thông tin đang nhập được giữ nguyên để bạn thử lại.',
      });
      return false;
    }

    setRecordId(targetRecordId);
    if (extraExports) setExportHistory(nextHistory);
    setBanner({
      type: 'success',
      text: `Đã lưu hồ sơ ${targetRecordId} (attemptId: ${attemptId}, config v${configSnapshot.configVersion}) vào IndexedDB trình duyệt.`,
    });
    return true;
  };

  /**
   * Step 9 ("Tạo bản nháp"): Actually fills {{placeholders}} inside real DOCX binary for required templates.
   * Supports R02 draft check mode for PENDING_REVIEW templates while keeping complete export locked until APPROVED.
   */
  const handleGenerateDraftDocuments = async (
    targetTemplateId?: string
  ): Promise<Record<string, GeneratedDocxOutput> | null> => {
    const candidates = validation.templateReadiness.filter(
      (item) =>
        item.requiredForThisRecord &&
        item.canPreviewDraft &&
        (!targetTemplateId || item.templateId === targetTemplateId)
    );

    if (candidates.length === 0) {
      setBanner({
        type: 'error',
        text: 'Chưa có mẫu Word (.docx) nào được tải lên cho hồ sơ này (R01). Vào Quản lý mẫu Word để tải mẫu M01/M02.',
      });
      return null;
    }

    setProcessingLabel('Đang trộn dữ liệu vào tệp Word (.docx) và kiểm tra kết quả...');
    setBanner(null);

    const nextOutputs: Record<string, GeneratedDocxOutput> = { ...generatedOutputs };
    let totalReplaced = 0;
    const warningsFound: string[] = [];

    for (const item of candidates) {
      if (!item.versionKey) continue;
      const templateObj = templateVersions.find((v) => v.versionKey === item.versionKey);
      const buffer = await getTemplateBinary(item.versionKey);

      if (!templateObj || !buffer) {
        setProcessingLabel(null);
        setBanner({
          type: 'error',
          text: `Không tìm thấy tệp gốc trong IndexedDB cho mẫu ${item.templateId} (${item.versionKey}).`,
        });
        return null;
      }

      const isDraftCheckMode = templateObj.status !== 'APPROVED';
      const generated = await generateFilledDocx({
        template: templateObj,
        templateBuffer: buffer,
        data: formData,
        isDraftCheckMode,
      });

      if (!generated.success) {
        setProcessingLabel(null);
        setBanner({
          type: 'error',
          text: generated.error || `Tạo tệp Word thất bại cho mẫu ${item.templateId} (R11).`,
        });
        return null;
      }

      nextOutputs[item.templateId] = generated;
      totalReplaced += generated.replacedTokensCount;

      if (generated.unreplacedPlaceholders.length > 0) {
        warningsFound.push(
          `${item.templateId} còn ${generated.unreplacedPlaceholders.length} biến chưa thay: ${generated.unreplacedPlaceholders
            .map((p) => `{{${p}}}`)
            .join(', ')}`
        );
      }
      if (generated.residualFindingsInOutput.length > 0) {
        warningsFound.push(
          `${item.templateId} có ${generated.residualFindingsInOutput.length} cảnh báo thông tin công ty/cá nhân cũ (R05)`
        );
      }
    }

    setGeneratedOutputs(nextOutputs);
    setProcessingLabel(null);

    if (warningsFound.length > 0) {
      setBanner({
        type: 'warning',
        text: `Đã tạo bản nháp DOCX (${candidates.length} tài liệu, thay ${totalReplaced} trường ánh xạ), nhưng có điểm cần rà soát: ${warningsFound.join(' · ')}.`,
      });
    } else {
      setBanner({
        type: 'success',
        text: `Đã tạo bản nháp DOCX thành công cho ${candidates.length} tài liệu (thay thật ${totalReplaced} trường ánh xạ trong XML). Bạn có thể Xem trước hoặc tải tệp khi đủ điều kiện.`,
      });
    }

    return nextOutputs;
  };

  const handlePreviewSingle = async (templateId: string, templateName: string) => {
    let out = generatedOutputs[templateId];
    if (!out?.success || !out.previewHtml) {
      const outputs = await handleGenerateDraftDocuments(templateId);
      if (!outputs) return;
      out = outputs[templateId];
    }
    if (out?.success && out.previewHtml) {
      setPreviewDoc({
        title: `${templateId} – ${templateName}`,
        html: out.previewHtml,
        isSimplifiedPracticeDraft: out.isSimplifiedPracticeDraft,
        isDraftOnly: out.isDraftOnly,
        unreplacedPlaceholders: out.unreplacedPlaceholders,
      });
    }
  };

  const handleDownloadSingleDocx = async (templateId: string, allowDraftOnly = false) => {
    if (!allowDraftOnly && !validation.canExportComplete) {
      setBanner({
        type: 'error',
        text: 'Hồ sơ chưa đủ điều kiện xuất hoàn chỉnh (kiểm tra R01–R17). Hãy hoàn tất các trường bắt buộc và phê duyệt mẫu trước.',
      });
      return;
    }

    let out = generatedOutputs[templateId];
    if (!out?.success || !out.blob) {
      const outputs = await handleGenerateDraftDocuments(templateId);
      if (!outputs) return;
      out = outputs[templateId];
    }
    if (!out?.success || !out.blob) {
      setBanner({
        type: 'error',
        text: `Tạo tệp Word thất bại cho mẫu ${templateId} (R11). Không báo xuất thành công.`,
      });
      return;
    }

    triggerBrowserDownload(out.blob, out.fileName);

    const item = validation.templateReadiness.find((t) => t.templateId === templateId);
    const logItem: BizDocExportLogItem = {
      templateId,
      templateVersionKey: item?.versionKey || '',
      templateVersion: item?.versionNumber || 1,
      format: 'DOCX',
      exportedAt: new Date().toISOString(),
      fileName: out.fileName,
    };

    const nextStatus =
      allowDraftOnly || validation.hasSimplifiedM02PracticeDraft ? validation.computedStatus : 'EXPORTED';
    await handleSaveRecord(nextStatus, [logItem]);
  };

  const handleDownloadSinglePdf = async (templateId: string, allowDraftOnly = false) => {
    if (!allowDraftOnly && !validation.canExportComplete) {
      setBanner({
        type: 'error',
        text: 'Hồ sơ chưa đủ điều kiện xuất PDF hoàn chỉnh (kiểm tra R01–R17).',
      });
      return;
    }

    let out = generatedOutputs[templateId];
    if (!out?.success || !out.arrayBuffer) {
      const outputs = await handleGenerateDraftDocuments(templateId);
      if (!outputs) return;
      out = outputs[templateId];
    }
    if (!out?.success || !out.arrayBuffer) {
      setBanner({
        type: 'error',
        text: `Không có dữ liệu DOCX hợp lệ để chuyển sang PDF cho mẫu ${templateId} (R11).`,
      });
      return;
    }

    setProcessingLabel(`Đang xuất tệp PDF (font tiếng Việt Roboto, giữ bảng & bố cục) cho ${templateId}...`);
    const pdfRes = await generateFilledPdf({
      docxArrayBuffer: out.arrayBuffer,
      docxFileName: out.fileName,
      isSimplifiedPracticeDraft: out.isSimplifiedPracticeDraft,
      isDraftOnly: out.isDraftOnly || allowDraftOnly,
    });
    setProcessingLabel(null);

    if (!pdfRes.success || !pdfRes.blob) {
      setBanner({
        type: 'error',
        text: pdfRes.error || `Xuất PDF thất bại cho mẫu ${templateId} (R11). Không báo xuất thành công.`,
      });
      return;
    }

    triggerBrowserDownload(pdfRes.blob, pdfRes.fileName);

    const item = validation.templateReadiness.find((t) => t.templateId === templateId);
    const logItem: BizDocExportLogItem = {
      templateId,
      templateVersionKey: item?.versionKey || '',
      templateVersion: item?.versionNumber || 1,
      format: 'PDF',
      exportedAt: new Date().toISOString(),
      fileName: pdfRes.fileName,
    };

    const nextStatus =
      allowDraftOnly || validation.hasSimplifiedM02PracticeDraft ? validation.computedStatus : 'EXPORTED';
    await handleSaveRecord(nextStatus, [logItem]);
  };

  const handleDownloadBundleZip = async () => {
    if (!validation.canExportComplete) {
      setBanner({
        type: 'error',
        text: 'Hồ sơ chưa đủ điều kiện xuất bộ hồ sơ hoàn chỉnh (kiểm tra R01–R17).',
      });
      return;
    }

    const outputs = await handleGenerateDraftDocuments();
    if (!outputs) return;

    setProcessingLabel('Đang tạo trọn bộ Word (.docx) + PDF (.pdf) và nén tệp .zip...');
    const requiredIds = validation.templateReadiness
      .filter((t) => t.requiredForThisRecord)
      .map((t) => t.templateId);

    const filesToZip: Array<{ fileName: string; blob: Blob }> = [];
    const logs: BizDocExportLogItem[] = [];

    for (const id of requiredIds) {
      const out = outputs[id];
      const item = validation.templateReadiness.find((t) => t.templateId === id);
      if (!out?.success || !out.blob || !out.arrayBuffer) {
        setProcessingLabel(null);
        setBanner({
          type: 'error',
          text: `Không thể đóng gói vì mẫu ${id} tạo Word thất bại (R11).`,
        });
        return;
      }

      filesToZip.push({ fileName: out.fileName, blob: out.blob });
      logs.push({
        templateId: id,
        templateVersionKey: item?.versionKey || '',
        templateVersion: item?.versionNumber || 1,
        format: 'DOCX',
        exportedAt: new Date().toISOString(),
        fileName: out.fileName,
      });

      const pdfRes = await generateFilledPdf({
        docxArrayBuffer: out.arrayBuffer,
        docxFileName: out.fileName,
        isSimplifiedPracticeDraft: out.isSimplifiedPracticeDraft,
        isDraftOnly: out.isDraftOnly,
      });

      if (!pdfRes.success || !pdfRes.blob) {
        setProcessingLabel(null);
        setBanner({
          type: 'error',
          text: pdfRes.error || `Không thể tạo PDF cho mẫu ${id} khi đóng gói (R11).`,
        });
        return;
      }

      filesToZip.push({ fileName: pdfRes.fileName, blob: pdfRes.blob });
      logs.push({
        templateId: id,
        templateVersionKey: item?.versionKey || '',
        templateVersion: item?.versionNumber || 1,
        format: 'PDF',
        exportedAt: new Date().toISOString(),
        fileName: pdfRes.fileName,
      });
    }

    const zipBlob = await createDocxBundleZip(filesToZip);
    setProcessingLabel(null);

    const safeCode = (formData.companyCode || 'HoSo').replace(/[^a-zA-Z0-9_-]/g, '');
    triggerBrowserDownload(zipBlob, `BizDoc_${safeCode}_Word_PDF.zip`);
    const nextStatus = validation.hasSimplifiedM02PracticeDraft ? validation.computedStatus : 'EXPORTED';
    await handleSaveRecord(nextStatus, logs);
  };

  const activeGroupIndex = FORM_GROUPS.findIndex((g) => g.id === activeGroup);

  return (
    <div className="space-y-4 min-w-0">
      {/* Top Identity Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-mono tabular-nums">
            <span className="font-bold text-slate-900 font-sans text-sm">
              {recordId ? `Hồ sơ ${recordId}` : 'Lượt soạn hồ sơ mới'}
            </span>
            <span>·</span>
            <span>attemptId: {attemptId}</span>
            <span>·</span>
            <span>configSnapshot: v{configSnapshot.configVersion}</span>
            <span>·</span>
            <span
              className={`font-sans font-bold ${
                validation.hasSimplifiedM02PracticeDraft
                  ? 'text-amber-800'
                  : validation.computedStatus === 'READY'
                  ? 'text-teal-700'
                  : validation.computedStatus === 'NEEDS_REVIEW'
                  ? 'text-amber-700'
                  : 'text-slate-600'
              }`}
            >
              {validation.hasSimplifiedM02PracticeDraft
                ? 'BẢN NHÁP THỰC HÀNH (R16)'
                : `Trạng thái: ${validation.computedStatus}`}
            </span>
          </div>

          {hasNewerConfigAvailable && (
            <div className="text-xs text-amber-800 flex flex-wrap items-center gap-2">
              <span>
                Kho mẫu đã cập nhật lên config v{currentConfig.configVersion} (hồ sơ này giữ bản
                chụp v{configSnapshot.configVersion} theo R13 / NF_MINIAPP_V2).
              </span>
              {!recordId && (
                <button
                  type="button"
                  onClick={handleSyncToLatestConfig}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  Cập nhật lượt mới sang v{currentConfig.configVersion}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveRecord()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
          </button>
        </div>
      </div>

      {/* Processing / Feedback Banners */}
      {processingLabel && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span>{processingLabel}</span>
        </div>
      )}

      {banner && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : banner.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : banner.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-slate-500 hover:text-slate-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6-Group Horizontal Selector (Section 8) */}
      <div
        role="tablist"
        aria-label="6 nhóm thông tin hồ sơ"
        className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full"
      >
        {FORM_GROUPS.map((grp) => {
          const Icon = grp.icon;
          const isActive = activeGroup === grp.id;
          return (
            <button
              key={grp.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveGroup(grp.id)}
              className={`flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">{grp.label}</span>
              <span className="xl:hidden">{grp.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Main Horizontal Split on Desktop (1366px), Vertical Stack on Mobile (390px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (8/12 on desktop): Active Group Form */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          {/* ========================================================= */}
          {/* GROUP 1: THÔNG TIN CÔNG TY                                */}
          {/* ========================================================= */}
          {activeGroup === 'company' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    1. Thông tin công ty
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khai báo theo Giấy chứng nhận đăng ký doanh nghiệp (phạm vi V1: TNHH một thành
                    viên).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tên công việc / Hồ sơ nội bộ
                    </label>
                    <input
                      type="text"
                      value={formData.taskName}
                      onChange={(e) => updateField('taskName', e.target.value)}
                      placeholder="Ví dụ: Thay đổi địa chỉ trụ sở chính"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-teal-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tên doanh nghiệp <span className="font-mono text-teal-700">{'{{companyName}}'}</span> *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      placeholder="Nhập tên đầy đủ theo GCN đăng ký doanh nghiệp"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-teal-600 text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mã số doanh nghiệp <span className="font-mono text-teal-700">{'{{companyCode}}'}</span> *
                    </label>
                    <input
                      type="text"
                      value={formData.companyCode}
                      onChange={(e) => updateField('companyCode', e.target.value)}
                      placeholder="0123456789"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-teal-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Loại hình doanh nghiệp *
                    </label>
                    <select
                      value={formData.companyType}
                      onChange={(e) => updateField('companyType', e.target.value as CompanyType)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="TNHH_MOT_THANH_VIEN">
                        Công ty TNHH một thành viên (Phạm vi V1)
                      </option>
                      <option value="TNHH_HAI_THANH_VIEN">
                        Công ty TNHH hai thành viên trở lên (Ngoài V1)
                      </option>
                      <option value="CO_PHAN">Công ty Cổ phần (Ngoài V1)</option>
                      <option value="DOANH_NGHIEP_TU_NHAN">Doanh nghiệp tư nhân (Ngoài V1)</option>
                      <option value="KHAC">Loại hình khác (Ngoài V1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Điện thoại <span className="font-mono text-slate-500">{'{{companyPhone}}'}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyPhone}
                      onChange={(e) => updateField('companyPhone', e.target.value)}
                      placeholder="0900000000 (không bắt buộc)"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email <span className="font-mono text-slate-500">{'{{companyEmail}}'}</span>
                    </label>
                    <input
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => updateField('companyEmail', e.target.value)}
                      placeholder="Nhập email doanh nghiệp (không bắt buộc)"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Loại thủ tục địa chỉ (R17){' '}
                      <span className="font-mono text-teal-700">{'{{procedureMode}}'}</span> *
                    </label>
                    <select
                      value={formData.procedureMode}
                      onChange={(e) => updateField('procedureMode', e.target.value as ProcedureMode)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="">-- Chưa xác định (R17: chặn đánh dấu sẵn sàng nộp) --</option>
                      <option value="CHANGE_ADDRESS">
                        CHANGE_ADDRESS – Chuyển địa chỉ trụ sở thực tế
                      </option>
                      <option value="ADMIN_ADDRESS_UPDATE">
                        ADMIN_ADDRESS_UPDATE – Cập nhật địa chỉ do thay đổi địa giới hành chính
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Manual attachment metadata (Security section 9) */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Giấy tờ đối chiếu (Nhập thủ công – không gửi AI)
                    </h4>
                    <p className="text-slate-500 mt-0.5">
                      Ghi nhận metadata tệp (.pdf, .jpg, .png) cục bộ, không tải giấy tờ khách hàng
                      lên dịch vụ AI bên ngoài.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                  >
                    <option value="CERTIFICATE">GCN Đăng ký doanh nghiệp</option>
                    <option value="IDENTITY">Giấy tờ pháp lý cá nhân (không lưu ảnh gốc)</option>
                    <option value="OTHER">Tài liệu đối chiếu khác</option>
                  </select>

                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleAttachmentSelect}
                    className="w-full text-xs text-slate-700 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-800 hover:file:bg-slate-100"
                  />
                </div>

                {attachments.length === 0 ? (
                  <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-slate-400">
                    <Upload className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                    <span>Chưa đính kèm tệp đối chiếu</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {attachments.map((att) => (
                      <div key={att.id} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{att.fileName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {att.documentType} · {(att.fileSize / 1024).toFixed(1)} KB · MANUAL
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) => prev.filter((item) => item.id !== att.id))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* GROUP 2: ĐỊA CHỈ CŨ VÀ MỚI                                */}
          {/* ========================================================= */}
          {activeGroup === 'address' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  2. Địa chỉ cũ và mới & Cơ quan thuế
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập rõ địa chỉ cũ, địa chỉ mới đầy đủ và từng thành phần số nhà/phường/tỉnh để
                  ánh xạ chính xác các mẫu M01, M02.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa chỉ trụ sở cũ <span className="font-mono text-teal-700">{'{{oldAddress}}'}</span> *
                </label>
                <textarea
                  rows={2}
                  value={formData.oldAddress}
                  onChange={(e) => updateField('oldAddress', e.target.value)}
                  placeholder="Nhập địa chỉ trụ sở cũ trên GCN ĐKDN"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-teal-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số nhà, đường phố mới{' '}
                    <span className="font-mono text-teal-700 text-[11px]">{'{{newAddressDetail}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.newAddressDetail}
                    onChange={(e) => updateField('newAddressDetail', e.target.value)}
                    placeholder="Số nhà, ngõ, đường/phố"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phường / Xã mới{' '}
                    <span className="font-mono text-teal-700 text-[11px]">{'{{newWard}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.newWard}
                    onChange={(e) => updateField('newWard', e.target.value)}
                    placeholder="Nhập Phường / Xã mới"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tỉnh / Thành phố mới{' '}
                    <span className="font-mono text-teal-700 text-[11px]">{'{{newProvince}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.newProvince}
                    onChange={(e) => updateField('newProvince', e.target.value)}
                    placeholder="Nhập Tỉnh / Thành phố mới"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label className="font-semibold text-slate-700">
                    Địa chỉ trụ sở mới đầy đủ{' '}
                    <span className="font-mono text-teal-700">{'{{newAddress}}'}</span> *
                  </label>
                  <button
                    type="button"
                    onClick={handleComposeNewAddressFromParts}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Ghép từ 3 ô địa chỉ mới ở trên
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.newAddress}
                  onChange={(e) => updateField('newAddress', e.target.value)}
                  placeholder="Nhập địa chỉ trụ sở mới đầy đủ hoặc bấm nút ghép ở trên"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-teal-600 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thay đổi cơ quan thuế quản lý (R09){' '}
                    <span className="font-mono text-teal-700 text-[11px]">
                      {'{{taxNoticeAddressChange}}'}
                    </span>{' '}
                    *
                  </label>
                  <select
                    value={formData.taxNoticeAddressChange}
                    onChange={(e) =>
                      updateField(
                        'taxNoticeAddressChange',
                        e.target.value as TaxNoticeAddressChange
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="UNKNOWN">UNKNOWN – Chưa rõ (Cần kiểm tra – R09)</option>
                    <option value="NO">NO – Không thay đổi cơ quan thuế quản lý</option>
                    <option value="YES">YES – Có thay đổi cơ quan thuế quản lý</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trạng thái thủ tục thuế nội bộ{' '}
                    <span className="font-mono text-slate-500 text-[11px]">
                      {'{{taxProcedureStatus}}'}
                    </span>
                  </label>
                  <select
                    value={formData.taxProcedureStatus}
                    onChange={(e) =>
                      updateField('taxProcedureStatus', e.target.value as TaxProcedureStatus)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="NEEDS_CHECK">NEEDS_CHECK – Cần kiểm tra</option>
                    <option value="NOT_STARTED">NOT_STARTED – Chưa thực hiện</option>
                    <option value="COMPLETED">COMPLETED – Đã hoàn tất chốt thuế</option>
                  </select>
                </div>
              </div>

              {(formData.taxNoticeAddressChange === 'UNKNOWN' ||
                (formData.taxNoticeAddressChange === 'YES' &&
                  formData.taxProcedureStatus !== 'COMPLETED')) && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>Quy tắc R09:</strong> Thay đổi cơ quan thuế quản lý chưa được làm rõ hoặc
                  chưa hoàn tất thủ tục thuế — hồ sơ sẽ ở trạng thái <strong>Cần kiểm tra</strong>.
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* GROUP 3: CHỦ SỞ HỮU VÀ NGƯỜI KÝ                           */}
          {/* ========================================================= */}
          {activeGroup === 'owner_signer' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  3. Chủ sở hữu và người ký
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân biệt rõ người ký Quyết định chủ sở hữu (M01) và người ký Giấy đề nghị (M02).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại chủ sở hữu</label>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => updateField('ownerType', 'INDIVIDUAL' as OwnerType)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      formData.ownerType === 'INDIVIDUAL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Cá nhân (INDIVIDUAL)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('ownerType', 'ORGANIZATION' as OwnerType)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      formData.ownerType === 'ORGANIZATION'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Tổ chức (ORGANIZATION)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người ký Quyết định chủ sở hữu{' '}
                    <span className="font-mono text-teal-700 text-[11px]">
                      {'{{ownerDecisionSigner}}'}
                    </span>{' '}
                    *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerDecisionSigner}
                    onChange={(e) => updateField('ownerDecisionSigner', e.target.value)}
                    placeholder="Nhập họ tên người ký Quyết định"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên chủ sở hữu{' '}
                    <span className="font-mono text-slate-500 text-[11px]">{'{{ownerName}}'}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    placeholder="Để trống sẽ dùng tên người ký Quyết định"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người ký Giấy đề nghị (M02){' '}
                    <span className="font-mono text-teal-700 text-[11px]">
                      {'{{applicationSigner}}'}
                    </span>{' '}
                    *
                  </label>
                  <input
                    type="text"
                    value={formData.applicationSigner}
                    onChange={(e) => updateField('applicationSigner', e.target.value)}
                    placeholder="Nhập họ tên người ký Giấy đề nghị"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chức danh người ký đề nghị{' '}
                    <span className="font-mono text-teal-700 text-[11px]">
                      {'{{applicationSignerTitle}}'}
                    </span>{' '}
                    *
                  </label>
                  <input
                    type="text"
                    value={formData.applicationSignerTitle}
                    onChange={(e) => updateField('applicationSignerTitle', e.target.value)}
                    placeholder="Giám đốc"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người đại diện theo pháp luật (tùy mẫu)
                  </label>
                  <input
                    type="text"
                    value={formData.legalRepresentativeName}
                    onChange={(e) => updateField('legalRepresentativeName', e.target.value)}
                    placeholder="Để trống sẽ dùng người ký Giấy đề nghị"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formData.ownerType === 'ORGANIZATION'
                      ? 'Mã số DN / QĐ tổ chức CSH *'
                      : 'Số giấy tờ pháp lý CSH (tùy mẫu)'}
                  </label>
                  <input
                    type="text"
                    value={formData.ownerIdentifier}
                    onChange={(e) => updateField('ownerIdentifier', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {formData.ownerType === 'ORGANIZATION' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người đại diện có thẩm quyền của tổ chức chủ sở hữu *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerOrganizationAuthorizedPerson}
                    onChange={(e) =>
                      updateField('ownerOrganizationAuthorizedPerson', e.target.value)
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              )}

              {/* Optional M03 / M04 */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="font-semibold text-slate-700">
                  Thành phần bổ sung tùy điều kiện (không bắt buộc mặc định)
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.includeM03BeneficialOwner}
                    onChange={(e) => updateField('includeM03BeneficialOwner', e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Kèm M03 – Danh sách chủ sở hữu hưởng lợi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.includeM04Authorization}
                    onChange={(e) => updateField('includeM04Authorization', e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Kèm M04 – Giấy ủy quyền nộp hồ sơ</span>
                </label>

                {formData.includeM04Authorization && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <input
                      type="text"
                      value={formData.authorizedPersonName}
                      onChange={(e) => updateField('authorizedPersonName', e.target.value)}
                      placeholder="Họ tên người được ủy quyền *"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                    />
                    <input
                      type="text"
                      value={formData.authorizedPersonIdentifier}
                      onChange={(e) => updateField('authorizedPersonIdentifier', e.target.value)}
                      placeholder="Số giấy tờ người được ủy quyền"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* GROUP 4: CƠ QUAN TIẾP NHẬN                                */}
          {/* ========================================================= */}
          {activeGroup === 'authority' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  4. Cơ quan tiếp nhận
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điền vào dòng <strong className="text-slate-700">Kính gửi:</strong> trong mẫu
                  M02. Quy tắc R08: hệ thống không tự tạo tên cơ quan nếu người dùng chưa xác định.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên cơ quan tiếp nhận hồ sơ{' '}
                  <span className="font-mono text-teal-700">{'{{receivingAuthority}}'}</span> *
                </label>
                <input
                  type="text"
                  value={formData.receivingAuthority}
                  onChange={(e) => updateField('receivingAuthority', e.target.value)}
                  placeholder="Ví dụ: Phòng Đăng ký kinh doanh – Sở Tài chính tỉnh..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-slate-900 font-medium"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">Xem nhanh dòng Kính gửi:</div>
                <div>
                  Kính gửi:{' '}
                  <strong className="text-teal-800">
                    {formData.receivingAuthority.trim() || '(Chưa xác định – R08 chặn xuất hoàn chỉnh)'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* GROUP 5: NGÀY THÁNG VÀ SỐ VĂN BẢN                         */}
          {/* ========================================================= */}
          {activeGroup === 'date_number' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  5. Ngày tháng và số văn bản
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Số văn bản <code className="font-mono text-teal-700">{'{{documentNumber}}'}</code>{' '}
                  được lưu riêng cho từng tài liệu — không mặc định M01 và M02 có cùng số.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số văn bản Mẫu M01 (Quyết định CSH) *
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumbers?.M01 ?? ''}
                    onChange={(e) => updateDocumentNumberForTemplate('M01', e.target.value)}
                    placeholder="Ví dụ: 01/2026/QĐ-CSH"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số văn bản Mẫu M02 (Giấy đề nghị) *
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumbers?.M02 ?? ''}
                    onChange={(e) => updateDocumentNumberForTemplate('M02', e.target.value)}
                    placeholder="Ví dụ: 01/2026/ĐN-ĐKDN (để riêng khác M01)"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                {formData.includeM03BeneficialOwner && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số văn bản Mẫu M03 (nếu có)
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumbers?.M03 ?? ''}
                      onChange={(e) => updateDocumentNumberForTemplate('M03', e.target.value)}
                      placeholder="01/CSHHL"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                )}

                {formData.includeM04Authorization && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số văn bản Mẫu M04 (nếu có)
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumbers?.M04 ?? ''}
                      onChange={(e) => updateDocumentNumberForTemplate('M04', e.target.value)}
                      placeholder="01/GUQ"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Địa danh ký{' '}
                    <span className="font-mono text-teal-700 text-[11px]">{'{{signingPlace}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.signingPlace}
                    onChange={(e) => updateField('signingPlace', e.target.value)}
                    placeholder="Nhập tỉnh/thành phố nơi ký"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày <span className="font-mono text-teal-700 text-[11px]">{'{{documentDay}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.documentDay}
                    onChange={(e) => updateField('documentDay', e.target.value)}
                    placeholder="19"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tháng <span className="font-mono text-teal-700 text-[11px]">{'{{documentMonth}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.documentMonth}
                    onChange={(e) => updateField('documentMonth', e.target.value)}
                    placeholder="11"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Năm <span className="font-mono text-teal-700 text-[11px]">{'{{documentYear}}'}</span> *
                  </label>
                  <input
                    type="text"
                    value={formData.documentYear}
                    onChange={(e) => updateField('documentYear', e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                Xem nhanh dòng ngày tháng:{' '}
                <strong className="text-slate-900">
                  {formData.signingPlace || '......'}, ngày {formData.documentDay || '..'} tháng{' '}
                  {formData.documentMonth || '..'} năm {formData.documentYear || '....'}
                </strong>
              </div>

              {(configSnapshot.customFieldDefinitions || []).length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Trường bổ sung từ biểu mẫu chuẩn ({configSnapshot.customFieldDefinitions?.length})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Các trường dữ liệu mở rộng đã được thêm khi ánh xạ mẫu Word chuẩn chính thức.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(configSnapshot.customFieldDefinitions || []).map((cf) => (
                      <div key={cf.key}>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {cf.label}{' '}
                          <span className="font-mono text-indigo-700 text-[11px]">
                            {cf.placeholder}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.customFields?.[cf.key] ?? cf.defaultValue ?? ''}
                          onChange={(e) => updateCustomField(cf.key, e.target.value)}
                          placeholder={cf.defaultValue || `Nhập giá trị cho ${cf.label}...`}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* GROUP 6: KIỂM TRA VÀ XUẤT HỒ SƠ                           */}
          {/* ========================================================= */}
          {activeGroup === 'review_export' && (
            <div className="space-y-5">
              {/* R16 Warning Banner if M02 is Simplified */}
              {validation.hasSimplifiedM02PracticeDraft && (
                <div className="p-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-1">
                  <div className="font-extrabold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>BẢN NHÁP THỰC HÀNH (Quy tắc R16)</span>
                  </div>
                  <p>
                    Mẫu M02 gắn với hồ sơ này là bản rút gọn. Không coi bộ tài liệu này là mẫu
                    chính thức đủ điều kiện nộp cơ quan đăng ký kinh doanh.
                  </p>
                </div>
              )}

              {/* Conflict Warning Box */}
              {validation.conflicts.length > 0 && (
                <div className="bg-white rounded-xl border border-amber-300 p-4 space-y-3 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Phát hiện {validation.conflicts.length} điểm mâu thuẫn cần xác nhận</span>
                  </div>
                  <div className="space-y-2">
                    {validation.conflicts.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950"
                      >
                        <div className="font-bold">{c.title}</div>
                        <div className="mt-0.5">{c.description}</div>
                      </div>
                    ))}
                  </div>
                  {validation.conflicts.some((c) => c.id !== 'conflict-m02-simplified') && (
                    <label className="flex items-start gap-2 cursor-pointer text-slate-800 pt-1">
                      <input
                        type="checkbox"
                        checked={conflictsConfirmedByUser}
                        onChange={(e) => setConflictsConfirmedByUser(e.target.checked)}
                        className="mt-0.5 rounded text-amber-600"
                      />
                      <span>
                        Tôi đã rà soát các điểm mâu thuẫn trên và xác nhận vẫn dùng dữ liệu đã nhập.
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Step 8, 9, 10: Generate Draft & Export Word/PDF */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      6. Trộn Placeholder, Xem trước & Xuất Word / PDF
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bấm <strong>Tạo bản nháp</strong> để thay thật các Placeholder trong tệp .docx
                      (đoạn văn, bảng, đầu trang, chân trang).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateDraftDocuments()}
                      disabled={Boolean(processingLabel) || !validation.canGenerateDraftCheck}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Tạo bản nháp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadBundleZip}
                      disabled={Boolean(processingLabel) || !validation.canExportComplete}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
                    >
                      <FileArchive className="w-3.5 h-3.5" />
                      <span>Tải bộ Word + PDF (.zip)</span>
                    </button>
                  </div>
                </div>

                {/* Template list & actions */}
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {validation.templateReadiness
                    .filter((t) => t.requiredForThisRecord)
                    .map((item) => {
                      const out = generatedOutputs[item.templateId];
                      const isPendingDraftOnly = item.status === 'PENDING_REVIEW';

                      return (
                        <div key={item.templateId} className="p-4 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="min-w-0 space-y-0.5">
                              <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                                <span className="font-mono text-teal-800">{item.templateId}</span>
                                <span>{item.templateName}</span>
                                {item.isSimplifiedDraft && (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                                    BẢN NHÁP THỰC HÀNH
                                  </span>
                                )}
                                {item.isHistoricalBoundVersion && (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                                    Bản lịch sử gắn theo hồ sơ cũ
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono tabular-nums">
                                {item.versionNumber
                                  ? `Phiên bản: v${item.versionNumber} (${item.versionKey}) · Trạng thái: ${
                                      item.isHistoricalBoundVersion
                                        ? 'Đã khóa cho hồ sơ cũ (R13)'
                                        : item.status
                                    }`
                                  : 'Chưa tải mẫu Word (R01)'}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              {item.canPreviewDraft ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePreviewSingle(item.templateId, item.templateName)
                                    }
                                    disabled={Boolean(processingLabel)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>
                                      {isPendingDraftOnly ? 'Kiểm tra bản nháp' : 'Xem trước'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadSingleDocx(item.templateId, isPendingDraftOnly)
                                    }
                                    disabled={
                                      Boolean(processingLabel) ||
                                      (!isPendingDraftOnly && !validation.canExportComplete)
                                    }
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap disabled:opacity-40 ${
                                      isPendingDraftOnly
                                        ? 'border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                                    }`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>
                                      {isPendingDraftOnly ? 'Tải Word nháp (R02)' : 'Tải Word (.docx)'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadSinglePdf(item.templateId, isPendingDraftOnly)
                                    }
                                    disabled={
                                      Boolean(processingLabel) ||
                                      (!isPendingDraftOnly && !validation.canExportComplete)
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                    <span>Tải PDF (.pdf)</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={onGoToTemplates}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold"
                                >
                                  <span>Tải mẫu {item.templateId}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Generated check feedback */}
                          {out?.success && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span className="text-teal-700 font-semibold">
                                  Đã tạo bản trộn thực tế ({out.fileName})
                                </span>
                                <span>· Đã thay {out.replacedTokensCount} trường ánh xạ trong XML</span>
                              </div>
                              {out.unreplacedPlaceholders.length > 0 && (
                                <div className="text-amber-800 font-medium">
                                  Biến chưa thay trong file:{' '}
                                  <span className="font-mono">
                                    {out.unreplacedPlaceholders.map((p) => `{{${p}}}`).join(', ')}
                                  </span>
                                </div>
                              )}
                              {out.residualFindingsInOutput.length > 0 && (
                                <div className="text-rose-700 font-medium">
                                  Cảnh báo R05 sau trộn: còn {out.residualFindingsInOutput.length}{' '}
                                  chuỗi nghi là thông tin công ty/cá nhân cũ (
                                  {out.residualFindingsInOutput.map((f) => f.matchedSample).join(', ')}).
                                </div>
                              )}
                            </div>
                          )}

                          {item.blockingReasons.length > 0 && (
                            <ul className="list-disc pl-5 text-xs text-rose-700 space-y-0.5">
                              {item.blockingReasons.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* User confirmation checkbox (R07) */}
                <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs text-slate-800">
                  <input
                    type="checkbox"
                    checked={confirmedByUser}
                    onChange={(e) => setConfirmedByUser(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    <strong>Xác nhận thông tin (R07):</strong> Tôi đã kiểm tra toàn bộ dữ liệu công
                    ty, địa chỉ cũ/mới, cơ quan tiếp nhận, số văn bản riêng từng mẫu và người ký
                    trước khi xuất hồ sơ hoàn chỉnh.
                  </span>
                </label>
              </div>

              {/* Export History */}
              {exportHistory.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Lịch sử xuất Word / PDF</h4>
                  <div className="divide-y divide-slate-100 text-xs font-mono tabular-nums text-slate-600">
                    {exportHistory.map((log, i) => (
                      <div key={i} className="py-1.5 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          [{log.format}] {log.fileName} ({log.templateVersionKey})
                        </span>
                        <span className="text-slate-400">
                          {new Date(log.exportedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Prev / Next Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {activeGroupIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveGroup(FORM_GROUPS[activeGroupIndex - 1].id)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Nhóm trước</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGoToRecords}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  <span>Danh sách hồ sơ</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveRecord()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
              </button>

              {activeGroupIndex < FORM_GROUPS.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveGroup(FORM_GROUPS[activeGroupIndex + 1].id)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  <span>Nhóm tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4/12 on desktop, stacked below on 390px): Live Rule Engine Panel */}
        <aside className="lg:col-span-4 space-y-4 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="font-bold text-slate-900 text-sm">Kiểm tra quy tắc (R01–R17)</h4>
              <span
                className={`font-bold ${
                  validation.canMarkOfficialReady
                    ? 'text-teal-700'
                    : validation.canExportComplete
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {validation.canMarkOfficialReady
                  ? 'Sẵn sàng nộp'
                  : validation.hasSimplifiedM02PracticeDraft
                  ? 'BẢN NHÁP THỰC HÀNH'
                  : 'Chưa đủ điều kiện'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Lỗi chặn</div>
                <div className="text-base font-bold font-mono text-rose-700">
                  {validation.errors.length}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Cảnh báo</div>
                <div className="text-base font-bold font-mono text-amber-700">
                  {validation.warnings.length}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Trường thiếu</div>
                <div className="text-base font-bold font-mono text-slate-800">
                  {validation.missingRequiredFields.length}
                </div>
              </div>
            </div>

            {validation.missingRequiredFields.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="font-bold">Danh sách trường bắt buộc còn thiếu (R03):</div>
                <div className="leading-relaxed">
                  {validation.missingRequiredFields.join(', ')}
                </div>
              </div>
            )}

            {validation.errors.length === 0 && validation.warnings.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đạt đầy đủ quy tắc R01–R17. Sẵn sàng xuất Word & PDF.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                {validation.errors.slice(0, 6).map((err, i) => (
                  <div
                    key={`e-${i}`}
                    className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900"
                  >
                    <span className="font-mono font-bold mr-1">[{err.ruleId}]</span>
                    {err.message}
                  </div>
                ))}
                {validation.warnings.map((warn, i) => (
                  <div
                    key={`w-${i}`}
                    className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950"
                  >
                    <span className="font-mono font-bold mr-1">[{warn.ruleId}]</span>
                    {warn.message}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveGroup('review_export')}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
              >
                Đi tới Kiểm tra & Xuất hồ sơ
              </button>
              <button
                type="button"
                onClick={onGoToTemplates}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                Mở Quản lý mẫu Word
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Preview Modal for Filled DOCX */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  Xem trước tài liệu đã trộn: {previewDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(previewDoc.isSimplifiedPracticeDraft ||
              previewDoc.isDraftOnly ||
              previewDoc.unreplacedPlaceholders.length > 0) && (
              <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-950 text-xs space-y-0.5">
                {previewDoc.isSimplifiedPracticeDraft && (
                  <div className="font-bold">
                    BẢN NHÁP THỰC HÀNH (R16): Mẫu M02 bản rút gọn – không dùng nộp chính thức.
                  </div>
                )}
                {previewDoc.isDraftOnly && (
                  <div className="font-semibold">
                    Chế độ kiểm tra bản nháp (R02): Mẫu chưa được phê duyệt chính thức.
                  </div>
                )}
                {previewDoc.unreplacedPlaceholders.length > 0 && (
                  <div>
                    Placeholder chưa thay trong file:{' '}
                    <span className="font-mono font-bold">
                      {previewDoc.unreplacedPlaceholders.map((p) => `{{${p}}}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
              <div
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-10 max-w-3xl mx-auto text-sm leading-relaxed text-slate-900 space-y-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50"
                dangerouslySetInnerHTML={{ __html: previewDoc.html }}
              />
            </div>

            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Nội dung xem trước được đọc lại từ tệp DOCX thực tế sau khi thay Placeholder</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
