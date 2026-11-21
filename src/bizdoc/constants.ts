import {
  BizDocConfig,
  BizDocFieldDefinition,
  BizDocFormData,
  BizDocTemplateSlotConfig,
} from './types';

export const BIZDOC_CONTRACT_VERSION = 'NF_MINIAPP_V2' as const;
export const BIZDOC_APP_ID = 'BIZDOC-MINI-01' as const;
export const BIZDOC_MODE = 'LOCAL' as const;

export const LOCAL_STORAGE_RISK_NOTICE =
  'Dữ liệu cục bộ trong IndexedDB sẽ bị mất nếu xóa dữ liệu trình duyệt và không tự bảo vệ trước người dùng khác sử dụng chung thiết bị này.';

export const INITIAL_TEMPLATE_SLOTS: BizDocTemplateSlotConfig[] = [
  {
    templateId: 'M01',
    name: 'Quyết định của chủ sở hữu về thay đổi địa chỉ trụ sở',
    documentCategory: 'Quyết định nội bộ (Bắt buộc)',
    isMandatory: true,
    isConditional: false,
    activeVersionKey: null,
    latestVersionNumber: 0,
    status: 'MISSING',
  },
  {
    templateId: 'M02',
    name: 'Giấy đề nghị thay đổi đăng ký doanh nghiệp – Mẫu số 12',
    documentCategory: 'Tờ khai đăng ký DN (Bắt buộc)',
    isMandatory: true,
    isConditional: false,
    activeVersionKey: null,
    latestVersionNumber: 0,
    status: 'MISSING',
  },
  {
    templateId: 'M03',
    name: 'Danh sách chủ sở hữu hưởng lợi',
    documentCategory: 'Phụ lục bổ sung (Tùy điều kiện)',
    isMandatory: false,
    isConditional: true,
    conditionNote: 'Chỉ dùng khi doanh nghiệp có yêu cầu kê khai/cập nhật chủ sở hữu hưởng lợi.',
    activeVersionKey: null,
    latestVersionNumber: 0,
    status: 'MISSING',
  },
  {
    templateId: 'M04',
    name: 'Giấy ủy quyền nộp hồ sơ',
    documentCategory: 'Văn bản ủy quyền (Tùy điều kiện)',
    isMandatory: false,
    isConditional: true,
    conditionNote: 'Chỉ dùng khi người nộp hồ sơ không phải người đại diện theo pháp luật.',
    activeVersionKey: null,
    latestVersionNumber: 0,
    status: 'MISSING',
  },
];

export const createInitialConfig = (): BizDocConfig => ({
  contractVersion: BIZDOC_CONTRACT_VERSION,
  appId: BIZDOC_APP_ID,
  mode: BIZDOC_MODE,
  configVersion: 1,
  updatedAt: new Date().toISOString(),
  updatedReason: 'Khởi tạo cấu hình BizDoc Mini V1 (chưa có mẫu Word)',
  scopeLabel: 'Thay đổi địa chỉ trụ sở chính – Công ty TNHH một thành viên',
  templateSlots: INITIAL_TEMPLATE_SLOTS.map((slot) => ({ ...slot })),
  customFieldDefinitions: [],
});

/**
 * Single unified schema for all 21 Section-5 placeholders + V1 compatibility fields.
 * Shared across Template Mapping, Variable Checker, Dossier Form, Validation Engine, and DOCX/PDF Export.
 */
export const BIZDOC_FIELDS: BizDocFieldDefinition[] = [
  {
    key: 'companyName',
    placeholder: '{{companyName}}',
    label: 'Tên doanh nghiệp',
    dataType: 'Text',
    description: 'Tên đầy đủ bằng tiếng Việt trên GCN đăng ký doanh nghiệp',
    requiredInV1: true,
    group: 'company',
  },
  {
    key: 'companyCode',
    placeholder: '{{companyCode}}',
    label: 'Mã số doanh nghiệp',
    dataType: 'Text',
    description: 'Mã số doanh nghiệp / Mã số thuế 10 hoặc 13 chữ số',
    requiredInV1: true,
    group: 'company',
  },
  {
    key: 'companyPhone',
    placeholder: '{{companyPhone}}',
    label: 'Điện thoại doanh nghiệp',
    dataType: 'Text',
    description: 'Số điện thoại liên hệ của doanh nghiệp (không bắt buộc)',
    requiredInV1: false,
    group: 'company',
  },
  {
    key: 'companyEmail',
    placeholder: '{{companyEmail}}',
    label: 'Email doanh nghiệp',
    dataType: 'Text',
    description: 'Địa chỉ thư điện tử của doanh nghiệp (không bắt buộc)',
    requiredInV1: false,
    group: 'company',
  },
  {
    key: 'procedureMode',
    placeholder: '{{procedureMode}}',
    label: 'Loại thủ tục địa chỉ',
    dataType: 'Enum',
    description: 'CHANGE_ADDRESS (chuyển địa chỉ thực tế) hoặc ADMIN_ADDRESS_UPDATE (cập nhật do địa giới hành chính)',
    requiredInV1: true,
    group: 'company',
  },
  {
    key: 'oldAddress',
    placeholder: '{{oldAddress}}',
    label: 'Địa chỉ trụ sở cũ',
    dataType: 'Text',
    description: 'Địa chỉ trụ sở chính hiện đang ghi trên GCN ĐKDN',
    requiredInV1: true,
    group: 'address',
  },
  {
    key: 'newAddress',
    placeholder: '{{newAddress}}',
    label: 'Địa chỉ trụ sở mới (đầy đủ)',
    dataType: 'Text',
    description: 'Địa chỉ trụ sở chính mới đầy đủ đã xác nhận',
    requiredInV1: true,
    group: 'address',
  },
  {
    key: 'newAddressDetail',
    placeholder: '{{newAddressDetail}}',
    label: 'Số nhà, đường phố mới',
    dataType: 'Text',
    description: 'Phần địa chỉ chi tiết: số nhà, ngõ, đường/phố của trụ sở mới',
    requiredInV1: true,
    group: 'address',
  },
  {
    key: 'newWard',
    placeholder: '{{newWard}}',
    label: 'Phường / Xã mới',
    dataType: 'Text',
    description: 'Tên phường, xã hoặc thị trấn của trụ sở mới',
    requiredInV1: true,
    group: 'address',
  },
  {
    key: 'newProvince',
    placeholder: '{{newProvince}}',
    label: 'Tỉnh / Thành phố mới',
    dataType: 'Text',
    description: 'Tỉnh hoặc thành phố trực thuộc trung ương của trụ sở mới',
    requiredInV1: true,
    group: 'address',
  },
  {
    key: 'receivingAuthority',
    placeholder: '{{receivingAuthority}}',
    label: 'Cơ quan tiếp nhận hồ sơ',
    dataType: 'Text',
    description: 'Tên cơ quan tiếp nhận ghi tại dòng Kính gửi (R08: không tự tạo tên nếu để trống)',
    requiredInV1: true,
    group: 'authority',
  },
  {
    key: 'ownerDecisionSigner',
    placeholder: '{{ownerDecisionSigner}}',
    label: 'Người ký Quyết định chủ sở hữu',
    dataType: 'Text',
    description: 'Chủ sở hữu hoặc người đại diện có thẩm quyền ký Quyết định (M01)',
    requiredInV1: true,
    group: 'owner_signer',
  },
  {
    key: 'applicationSigner',
    placeholder: '{{applicationSigner}}',
    label: 'Người ký Giấy đề nghị thay đổi',
    dataType: 'Text',
    description: 'Người có thẩm quyền ký Giấy đề nghị đăng ký thay đổi (M02)',
    requiredInV1: true,
    group: 'owner_signer',
  },
  {
    key: 'applicationSignerTitle',
    placeholder: '{{applicationSignerTitle}}',
    label: 'Chức danh người ký đề nghị',
    dataType: 'Text',
    description: 'Chức danh của người ký Giấy đề nghị (ví dụ: Giám đốc, Chủ tịch công ty)',
    requiredInV1: true,
    group: 'owner_signer',
  },
  {
    key: 'documentNumber',
    placeholder: '{{documentNumber}}',
    label: 'Số văn bản (riêng từng mẫu M01/M02)',
    dataType: 'Text',
    description: 'Số văn bản được thiết lập riêng cho từng tài liệu M01, M02, M03, M04',
    requiredInV1: true,
    group: 'date_number',
  },
  {
    key: 'signingPlace',
    placeholder: '{{signingPlace}}',
    label: 'Địa danh ký văn bản',
    dataType: 'Text',
    description: 'Tỉnh/Thành phố nơi lập và ký văn bản',
    requiredInV1: true,
    group: 'date_number',
  },
  {
    key: 'documentDay',
    placeholder: '{{documentDay}}',
    label: 'Ngày văn bản',
    dataType: 'Text',
    description: 'Ngày (01–31) lập văn bản',
    requiredInV1: true,
    group: 'date_number',
  },
  {
    key: 'documentMonth',
    placeholder: '{{documentMonth}}',
    label: 'Tháng văn bản',
    dataType: 'Text',
    description: 'Tháng (01–12) lập văn bản',
    requiredInV1: true,
    group: 'date_number',
  },
  {
    key: 'documentYear',
    placeholder: '{{documentYear}}',
    label: 'Năm văn bản',
    dataType: 'Text',
    description: 'Năm (4 chữ số) lập văn bản',
    requiredInV1: true,
    group: 'date_number',
  },
  {
    key: 'taxNoticeAddressChange',
    placeholder: '{{taxNoticeAddressChange}}',
    label: 'Thay đổi cơ quan thuế quản lý',
    dataType: 'Enum',
    description: 'YES / NO / UNKNOWN – R09: nếu chưa làm rõ sẽ cảnh báo cần kiểm tra',
    requiredInV1: true,
    group: 'tax',
  },
  {
    key: 'taxProcedureStatus',
    placeholder: '{{taxProcedureStatus}}',
    label: 'Trạng thái thủ tục thuế (nội bộ)',
    dataType: 'Enum',
    description: 'NOT_STARTED / COMPLETED / NEEDS_CHECK – có điều kiện khi thay đổi cơ quan thuế',
    requiredInV1: false,
    conditional: true,
    group: 'tax',
  },
  // Extended optional compatibility fields
  {
    key: 'ownerName',
    placeholder: '{{ownerName}}',
    label: 'Tên chủ sở hữu (bổ sung)',
    dataType: 'Text',
    description: 'Họ tên cá nhân hoặc tên tổ chức là chủ sở hữu công ty',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
  {
    key: 'ownerIdentifier',
    placeholder: '{{ownerIdentifier}}',
    label: 'Số giấy tờ pháp lý chủ sở hữu',
    dataType: 'Text',
    description: 'Số định danh cá nhân/CCCD hoặc Mã số DN của tổ chức chủ sở hữu',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
  {
    key: 'ownerOrganizationAuthorizedPerson',
    placeholder: '{{ownerOrganizationAuthorizedPerson}}',
    label: 'Người đại diện tổ chức CSH',
    dataType: 'Text',
    description: 'Áp dụng khi chủ sở hữu là tổ chức (ORGANIZATION)',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
  {
    key: 'legalRepresentativeName',
    placeholder: '{{legalRepresentativeName}}',
    label: 'Người đại diện theo pháp luật',
    dataType: 'Text',
    description: 'Họ và tên người đại diện pháp luật của công ty',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
  {
    key: 'legalRepresentativeTitle',
    placeholder: '{{legalRepresentativeTitle}}',
    label: 'Chức danh người ĐDPL',
    dataType: 'Text',
    description: 'Chức danh người đại diện theo pháp luật',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
  {
    key: 'documentDate',
    placeholder: '{{documentDate}}',
    label: 'Ngày lập hồ sơ (dd/mm/yyyy)',
    dataType: 'Text',
    description: 'Ngày lập hồ sơ định dạng đầy đủ dd/mm/yyyy',
    requiredInV1: false,
    conditional: true,
    group: 'date_number',
  },
  {
    key: 'authorizedPersonName',
    placeholder: '{{authorizedPersonName}}',
    label: 'Người được ủy quyền nộp hồ sơ (M04)',
    dataType: 'Text',
    description: 'Chỉ bắt buộc khi hồ sơ sử dụng mẫu M04 – Giấy ủy quyền',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
  {
    key: 'authorizedPersonIdentifier',
    placeholder: '{{authorizedPersonIdentifier}}',
    label: 'Số giấy tờ người được ủy quyền (M04)',
    dataType: 'Text',
    description: 'Chỉ bắt buộc khi hồ sơ sử dụng mẫu M04 – Giấy ủy quyền',
    requiredInV1: false,
    conditional: true,
    group: 'owner_signer',
  },
];

/**
 * Required placeholders expected inside each mandatory template for Variable Checker (R03).
 * Checked against mapped & confirmed targetFields in the template.
 */
export const REQUIRED_PLACEHOLDERS_BY_TEMPLATE: Record<string, string[]> = {
  M01: ['companyName', 'companyCode', 'oldAddress', 'newAddress', 'ownerDecisionSigner'],
  M02: ['receivingAuthority', 'companyName', 'companyCode', 'newAddress', 'applicationSigner'],
  M03: ['companyName', 'companyCode'],
  M04: ['companyName', 'companyCode', 'authorizedPersonName'],
};

export const createEmptyFormData = (): BizDocFormData => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const iso = `${year}-${month}-${day}`;

  return {
    taskName: '',
    companyType: 'TNHH_MOT_THANH_VIEN',
    companyName: '',
    companyCode: '',
    oldAddress: '',
    newAddress: '',
    newAddressDetail: '',
    newWard: '',
    newProvince: '',
    receivingAuthority: '',
    ownerDecisionSigner: '',
    applicationSigner: '',
    applicationSignerTitle: '',
    documentNumber: '',
    documentNumbers: {
      M01: '',
      M02: '',
      M03: '',
      M04: '',
    },
    signingPlace: '',
    documentDay: day,
    documentMonth: month,
    documentYear: year,
    companyPhone: '',
    companyEmail: '',
    procedureMode: '',
    taxNoticeAddressChange: 'UNKNOWN',
    taxProcedureStatus: 'NEEDS_CHECK',
    ownerType: 'INDIVIDUAL',
    ownerName: '',
    ownerIdentifier: '',
    ownerOrganizationAuthorizedPerson: '',
    legalRepresentativeName: '',
    legalRepresentativeTitle: '',
    documentDate: iso,
    taxAuthorityChanged: 'UNKNOWN',
    includeM03BeneficialOwner: false,
    includeM04Authorization: false,
    authorizedPersonName: '',
    authorizedPersonIdentifier: '',
    customFields: {},
  };
};

/**
 * Backward-compatibility normalizer so any record saved before this upgrade loads without missing keys.
 */
export const normalizeFormData = (raw: Partial<BizDocFormData> | undefined): BizDocFormData => {
  const base = createEmptyFormData();
  if (!raw) return base;

  const isoDate = raw.documentDate || base.documentDate;
  const dateParts = isoDate.split('-');
  const parsedYear = raw.documentYear ?? (dateParts.length === 3 ? dateParts[0] : base.documentYear);
  const parsedMonth = raw.documentMonth ?? (dateParts.length === 3 ? dateParts[1] : base.documentMonth);
  const parsedDay = raw.documentDay ?? (dateParts.length === 3 ? dateParts[2] : base.documentDay);

  const taxNotice = raw.taxNoticeAddressChange ?? raw.taxAuthorityChanged ?? 'UNKNOWN';
  const signerTitle = raw.applicationSignerTitle ?? raw.legalRepresentativeTitle ?? '';

  const mergedDocNumbers: Record<string, string> = {
    M01: raw.documentNumbers?.M01 ?? raw.documentNumber ?? '',
    M02: raw.documentNumbers?.M02 ?? '',
    M03: raw.documentNumbers?.M03 ?? '',
    M04: raw.documentNumbers?.M04 ?? '',
    ...(raw.documentNumbers || {}),
  };

  return {
    ...base,
    ...raw,
    newAddressDetail: raw.newAddressDetail ?? '',
    newWard: raw.newWard ?? '',
    applicationSignerTitle: signerTitle,
    legalRepresentativeTitle: raw.legalRepresentativeTitle ?? signerTitle,
    documentNumber: raw.documentNumber ?? mergedDocNumbers.M01 ?? '',
    documentNumbers: mergedDocNumbers,
    signingPlace: raw.signingPlace ?? '',
    documentDay: parsedDay,
    documentMonth: parsedMonth,
    documentYear: parsedYear,
    documentDate: isoDate,
    companyPhone: raw.companyPhone ?? '',
    companyEmail: raw.companyEmail ?? '',
    procedureMode: raw.procedureMode ?? '',
    taxNoticeAddressChange: taxNotice,
    taxAuthorityChanged: taxNotice,
    taxProcedureStatus: raw.taxProcedureStatus ?? 'NEEDS_CHECK',
    customFields: { ...(raw.customFields || {}) },
  };
};

export const generateAttemptId = (): string => {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `ATT-${stamp}-${rand}`;
};

export const generateRecordId = (): string => {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `REC-${stamp}-${rand}`;
};
