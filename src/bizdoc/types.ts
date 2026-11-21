export type ContractVersion = 'NF_MINIAPP_V2';
export type RuntimeMode = 'LOCAL' | 'LOCAL_DEMO';

export type TaskStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'READY' | 'EXPORTED';
export type CompanyType =
  | 'TNHH_MOT_THANH_VIEN'
  | 'TNHH_HAI_THANH_VIEN'
  | 'CO_PHAN'
  | 'DOANH_NGHIEP_TU_NHAN'
  | 'KHAC';
export type OwnerType = 'INDIVIDUAL' | 'ORGANIZATION';
export type ProcedureMode = '' | 'CHANGE_ADDRESS' | 'ADMIN_ADDRESS_UPDATE';
export type TaxNoticeAddressChange = 'YES' | 'NO' | 'UNKNOWN';
export type TaxAuthorityChanged = TaxNoticeAddressChange;
export type TaxProcedureStatus = 'NOT_STARTED' | 'COMPLETED' | 'NEEDS_CHECK';
export type TemplateStatus = 'MISSING' | 'PENDING_REVIEW' | 'APPROVED' | 'INACTIVE';
export type DocumentType = 'CERTIFICATE' | 'IDENTITY' | 'OTHER';
export type ExtractionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'MANUAL';

export type TemplateCode = 'M01' | 'M02' | 'M03' | 'M04' | string;

export type PlaceholderZone = 'paragraph' | 'table' | 'header' | 'footer';

export interface PlaceholderOccurrenceInfo {
  token: string;
  count: number;
  zones: PlaceholderZone[];
}

export interface BizDocFieldDefinition {
  key: keyof BizDocFormData | 'documentNumber';
  placeholder: string;
  label: string;
  dataType: 'Text' | 'Enum';
  description: string;
  requiredInV1: boolean;
  conditional?: boolean;
  group:
    | 'company'
    | 'address'
    | 'owner_signer'
    | 'authority'
    | 'date_number'
    | 'tax';
}

export interface CustomFieldDefinition {
  key: string;
  placeholder: string;
  label: string;
  defaultValue?: string;
  templateId?: TemplateCode;
  createdAt: string;
}

export interface TemplateFieldMapping {
  /** Placeholder tag inside the DOCX (e.g. "companyName") or custom literal text token */
  token: string;
  /** Mapped BizDocFormData field key, 'documentNumber', or custom field key, or null if unmapped */
  targetField: keyof BizDocFormData | 'documentNumber' | string | null;
  /** Whether the token was found as {{placeholder}} or mapped from literal text */
  matchType: 'PLACEHOLDER' | 'LITERAL_TEXT';
  /** Number of occurrences found in the DOCX (R04) */
  occurrences?: number;
  /** XML zones where this token appears (paragraph, table, header, footer) */
  zones?: PlaceholderZone[];
  /** Confirmed by user before approval */
  confirmed: boolean;
}

export interface ResidualDataFinding {
  id: string;
  category: 'CCCD_ID' | 'TAX_CODE' | 'PHONE' | 'EMAIL' | 'COMPANY_NAME' | 'SIGNATURE_HINT';
  matchedSample: string;
  description: string;
  resolved: boolean;
}

export interface BizDocTemplateVersion {
  /** Composite key: `${templateId}__v${version}` */
  versionKey: string;
  templateId: TemplateCode;
  templateName: string;
  documentCategory: string;
  version: number;
  status: TemplateStatus;
  isMandatoryByDefault: boolean;
  isConditional: boolean;
  /** R16: If M02 is a simplified/abbreviated template, always label BẢN NHÁP THỰC HÀNH and block official submission readiness */
  isSimplifiedDraft?: boolean;
  /** True when explicitly marked as an official standard template replacing simplified draft */
  isOfficialStandard?: boolean;
  /** VersionKey of the earlier version this upload is intended to replace (history preserved) */
  replacesVersionKey?: string | null;
  sourceLabel: string;
  effectiveDate: string;
  uploadedAt: string;
  approvedAt: string | null;
  deactivatedAt?: string | null;
  restoredAt?: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  /** Extracted placeholder tags found across paragraphs, tables, headers, footers */
  detectedPlaceholders: string[];
  /** Detailed occurrence counts & XML zones for each detected placeholder */
  placeholderDetails?: PlaceholderOccurrenceInfo[];
  /** Explicit user-confirmed mappings */
  fieldMappings: TemplateFieldMapping[];
  /** Detected suspicious personal/old company data inside template (R05) */
  residualFindings: ResidualDataFinding[];
  /** Whether user explicitly confirmed template has no leftover third-party personal/company data */
  cleanDataConfirmed: boolean;
  /** Cached HTML preview generated via mammoth */
  previewHtml: string;
  hasTables: boolean;
  hasImages: boolean;
  hasHeaders?: boolean;
  hasFooters?: boolean;
  notes: string;
}

export interface BizDocTemplateSlotConfig {
  templateId: TemplateCode;
  name: string;
  documentCategory: string;
  isMandatory: boolean;
  isConditional: boolean;
  conditionNote?: string;
  activeVersionKey: string | null;
  latestVersionNumber: number;
  status: TemplateStatus;
}

export interface BizDocConfig {
  contractVersion: ContractVersion;
  appId: 'BIZDOC-MINI-01';
  mode: RuntimeMode;
  configVersion: number;
  updatedAt: string;
  updatedReason: string;
  scopeLabel: string;
  templateSlots: BizDocTemplateSlotConfig[];
  /** Custom fields added when mapping official standard templates */
  customFieldDefinitions?: CustomFieldDefinition[];
}

export interface BizDocAttachmentMeta {
  id: string;
  documentType: DocumentType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  extractionStatus: ExtractionStatus;
  uploadedAt: string;
  storedLocally: boolean;
  note?: string;
}

export interface BizDocFormData {
  taskName: string;
  companyType: CompanyType;
  /** Section 5 Standard Placeholders */
  companyName: string;
  companyCode: string;
  oldAddress: string;
  newAddress: string;
  newAddressDetail: string;
  newWard: string;
  newProvince: string;
  receivingAuthority: string;
  ownerDecisionSigner: string;
  applicationSigner: string;
  applicationSignerTitle: string;
  /** Default/fallback documentNumber (legacy compatibility) */
  documentNumber: string;
  /** Separate document numbers per template (M01 != M02 by default) */
  documentNumbers: Record<string, string>;
  signingPlace: string;
  documentDay: string;
  documentMonth: string;
  documentYear: string;
  companyPhone: string;
  companyEmail: string;
  procedureMode: ProcedureMode;
  taxNoticeAddressChange: TaxNoticeAddressChange;
  taxProcedureStatus: TaxProcedureStatus;

  /** Extended V1 compatibility fields (kept so existing saved records stay 100% intact) */
  ownerType: OwnerType;
  ownerName: string;
  ownerIdentifier: string;
  ownerOrganizationAuthorizedPerson: string;
  legalRepresentativeName: string;
  legalRepresentativeTitle: string;
  documentDate: string;
  taxAuthorityChanged: TaxAuthorityChanged;
  includeM03BeneficialOwner: boolean;
  includeM04Authorization: boolean;
  authorizedPersonName: string;
  authorizedPersonIdentifier: string;
  /** Values for custom fields added from official Word templates */
  customFields?: Record<string, string>;
}

export interface BizDocExportLogItem {
  templateId: TemplateCode;
  templateVersionKey: string;
  templateVersion: number;
  format: 'DOCX' | 'PDF';
  exportedAt: string;
  fileName: string;
}

export interface BizDocRecord {
  appId: 'BIZDOC-MINI-01';
  contractVersion: ContractVersion;
  recordId: string;
  attemptId: string;
  configVersion: number;
  configSnapshot: BizDocConfig;
  /** Snapshot of template version keys bound to this attempt so updating template v2 won't mutate v1 (R13) */
  boundTemplateVersionKeys: Record<string, string>;
  taskStatus: TaskStatus;
  data: BizDocFormData;
  attachments: BizDocAttachmentMeta[];
  confirmedByUser: boolean;
  /** User confirmed any detected data conflict manually */
  conflictsConfirmedByUser?: boolean;
  createdAt: string;
  updatedAt: string;
  exportHistory: BizDocExportLogItem[];
}

export interface ValidationIssue {
  ruleId: string;
  severity: 'ERROR' | 'WARNING';
  field?: string;
  templateId?: string;
  message: string;
  actionHint?: string;
}

export interface ConflictNotice {
  id: string;
  title: string;
  description: string;
}

export interface TemplateReadinessItem {
  templateId: TemplateCode;
  templateName: string;
  requiredForThisRecord: boolean;
  status: TemplateStatus;
  versionNumber: number | null;
  versionKey: string | null;
  isSimplifiedDraft: boolean;
  /** True when an old saved dossier continues using its previously-approved historical version after replacement/deactivation */
  isHistoricalBoundVersion?: boolean;
  /** Can generate a draft check preview (allowed for PENDING_REVIEW per R02) */
  canPreviewDraft: boolean;
  /** Ready for official complete export */
  readyToExport: boolean;
  missingRequiredPlaceholders: string[];
  blockingReasons: string[];
}

export interface ValidationSummary {
  canSaveDraft: boolean;
  /** Can generate a draft preview / test Word file even if template is PENDING_REVIEW (R02) */
  canGenerateDraftCheck: boolean;
  /** Can export complete dossier (all R01-R17 errors resolved) */
  canExportComplete: boolean;
  /** Can be marked officially ready for submission (blocked by R16 simplified M02, R09 tax, R17 procedureMode) */
  canMarkOfficialReady: boolean;
  /** R16 flag: true when M02 is marked as simplified draft */
  hasSimplifiedM02PracticeDraft: boolean;
  computedStatus: TaskStatus;
  missingRequiredFields: string[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  conflicts: ConflictNotice[];
  templateReadiness: TemplateReadinessItem[];
}

export type BizDocViewTab = 'overview' | 'create' | 'records' | 'templates';
