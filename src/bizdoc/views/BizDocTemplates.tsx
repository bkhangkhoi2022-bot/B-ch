import React, { useState, useRef, useMemo } from 'react';
import {
  FileUp,
  Eye,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Ban,
  Trash2,
  AlertTriangle,
  AlertCircle,
  X,
  Plus,
  FileText,
  ShieldAlert,
  Download,
  SearchCheck,
  CheckCheck,
  Copy,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  History,
  ClipboardList,
} from 'lucide-react';
import { useBizDoc } from '../BizDocContext';
import {
  BizDocTemplateVersion,
  PlaceholderZone,
  ResidualDataFinding,
  TemplateCode,
  TemplateFieldMapping,
  TemplateStatus,
} from '../types';
import {
  BIZDOC_FIELDS,
  REQUIRED_PLACEHOLDERS_BY_TEMPLATE,
  createEmptyFormData,
} from '../constants';
import { getFieldLabel, getMissingRequiredPlaceholders } from '../validation';
import {
  generateFilledDocx,
  OfficialContentPreservationReport,
  verifyOfficialContentPreserved,
} from '../docxEngine';

const ZONE_LABELS: Record<PlaceholderZone, string> = {
  paragraph: 'Đoạn văn',
  table: 'Bảng',
  header: 'Đầu trang',
  footer: 'Chân trang',
};

interface TestPreviewState {
  loading: boolean;
  error: string | null;
  html: string;
  replacedTokensCount: number;
  unreplacedPlaceholders: string[];
  preservation: OfficialContentPreservationReport | null;
}

export const BizDocTemplates: React.FC = () => {
  const {
    currentConfig,
    templateVersions,
    records,
    uploadTemplateDocx,
    updateTemplateMappingAndAudit,
    addCustomFieldDefinition,
    approveTemplateVersion,
    deactivateTemplateVersion,
    restoreTemplateVersion,
    deleteTemplateVersion,
    downloadOriginalTemplate,
    getRecordsUsingTemplateVersion,
    getTemplateBinary,
  } = useBizDoc();

  const customFieldDefs = currentConfig.customFieldDefinitions || [];

  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(
    null
  );
  const [showPlaceholderGuide, setShowPlaceholderGuide] = useState(false);

  // Inline 2-step confirmation (iframe-safe, no window.confirm)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'delete' | 'restore';
    versionKey: string;
  } | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTemplateId, setUploadTemplateId] = useState<TemplateCode>('M01');
  const [uploadSourceLabel, setUploadSourceLabel] = useState('Biểu mẫu chuẩn chính thức từ máy tính');
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadIsSimplified, setUploadIsSimplified] = useState(false);
  const [uploadIsOfficial, setUploadIsOfficial] = useState(true);
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview & Pre-Approval Test Render modal state
  const [previewVersion, setPreviewVersion] = useState<BizDocTemplateVersion | null>(null);
  const [previewMode, setPreviewMode] = useState<'raw' | 'test_render'>('raw');
  const [testPreview, setTestPreview] = useState<TestPreviewState>({
    loading: false,
    error: null,
    html: '',
    replacedTokensCount: 0,
    unreplacedPlaceholders: [],
    preservation: null,
  });

  // Variable check modal state (Kiểm tra biến)
  const [checkVarsVersionKey, setCheckVarsVersionKey] = useState<string | null>(null);

  // Mapping & Audit modal state
  const [mappingVersionKey, setMappingVersionKey] = useState<string | null>(null);
  const [draftMappings, setDraftMappings] = useState<TemplateFieldMapping[]>([]);
  const [draftFindings, setDraftFindings] = useState<ResidualDataFinding[]>([]);
  const [draftCleanConfirmed, setDraftCleanConfirmed] = useState(false);
  const [draftIsSimplified, setDraftIsSimplified] = useState(false);
  const [draftIsOfficial, setDraftIsOfficial] = useState(true);
  const [draftCategory, setDraftCategory] = useState('');
  const [draftSource, setDraftSource] = useState('');
  const [draftEffectiveDate, setDraftEffectiveDate] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [newLiteralText, setNewLiteralText] = useState('');
  const [newLiteralField, setNewLiteralField] = useState<string>('companyName');

  // Add custom field inline form inside Mapping modal (Requirement 3)
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomDefault, setNewCustomDefault] = useState('');
  const [customFieldFeedback, setCustomFieldFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Expanded version history
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);

  const knownFieldKeySet = useMemo(() => {
    const set = new Set<string>(BIZDOC_FIELDS.map((f) => f.key));
    customFieldDefs.forEach((c) => set.add(c.key));
    return set;
  }, [customFieldDefs]);

  // Requirement 10: Comprehensive status summary (Uploaded vs Approved vs Active)
  const statusReport = useMemo(() => {
    const totalUploaded = templateVersions.length;
    const totalApproved = templateVersions.filter((v) => v.status === 'APPROVED').length;
    const totalPending = templateVersions.filter((v) => v.status === 'PENDING_REVIEW').length;
    const totalInactive = templateVersions.filter((v) => v.status === 'INACTIVE').length;
    const activeSlotsCount = currentConfig.templateSlots.filter(
      (s) => Boolean(s.activeVersionKey) && s.status === 'APPROVED'
    ).length;

    const perSlot = currentConfig.templateSlots.map((slot) => {
      const versions = templateVersions
        .filter((v) => v.templateId === slot.templateId)
        .sort((a, b) => b.version - a.version);
      const activeVer = slot.activeVersionKey
        ? versions.find((v) => v.versionKey === slot.activeVersionKey) || null
        : null;
      const pendingVersions = versions.filter((v) => v.status === 'PENDING_REVIEW');
      const inactiveVersions = versions.filter((v) => v.status === 'INACTIVE');
      const approvedVersions = versions.filter((v) => v.status === 'APPROVED');
      return {
        slot,
        versions,
        activeVer,
        pendingVersions,
        inactiveVersions,
        approvedVersions,
      };
    });

    return {
      totalUploaded,
      totalApproved,
      totalPending,
      totalInactive,
      activeSlotsCount,
      perSlot,
    };
  }, [currentConfig.templateSlots, templateVersions]);

  const openUploadModal = (templateId: TemplateCode, isReplacingSimplified = false) => {
    const slot = currentConfig.templateSlots.find((s) => s.templateId === templateId);
    setUploadTemplateId(templateId);
    setUploadCategory(slot?.documentCategory || '');
    setUploadSourceLabel(
      isReplacingSimplified
        ? 'Biểu mẫu chuẩn chính thức (thay thế mẫu rút gọn)'
        : 'Mẫu Word tải từ máy tính người dùng'
    );
    setUploadEffectiveDate(new Date().toISOString().slice(0, 10));
    setUploadIsSimplified(false);
    setUploadIsOfficial(true);
    setUploadNotes(
      isReplacingSimplified
        ? 'Nâng cấp từ bản rút gọn lên biểu mẫu chuẩn chính thức; giữ nguyên bản cũ cho hồ sơ trước đó.'
        : ''
    );
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadModalOpen(true);
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setAlert({ type: 'error', text: 'Vui lòng chọn tệp Word (.docx) từ thiết bị.' });
      return;
    }

    setBusyMessage(
      'Đang đọc cấu trúc DOCX (đoạn văn, bảng, đầu trang, chân trang), tự nhận diện Placeholder và lưu phiên bản mới...'
    );
    setAlert(null);

    const res = await uploadTemplateDocx({
      templateId: uploadTemplateId,
      file: selectedFile,
      sourceLabel: uploadSourceLabel,
      effectiveDate: uploadEffectiveDate,
      documentCategory: uploadCategory,
      isSimplifiedDraft: uploadTemplateId === 'M02' ? uploadIsSimplified : false,
      isOfficialStandard: !(uploadTemplateId === 'M02' && uploadIsSimplified) && uploadIsOfficial,
      notes: uploadNotes,
    });

    setBusyMessage(null);

    if (!res.success || !res.data) {
      setAlert({
        type: 'error',
        text: res.error || 'Tải mẫu Word thất bại (R10). Mẫu đã lưu trước đó vẫn được giữ nguyên.',
      });
      return;
    }

    setUploadModalOpen(false);
    setExpandedSlotId(res.data.templateId);
    setAlert({
      type: 'warning',
      text: `Đã tạo phiên bản mới ${res.data.templateId} v${res.data.version} (${res.data.fileName}) ở trạng thái CHỜ DUYỆT. Phiên bản cũ vẫn được giữ nguyên. Hãy xem trước, ánh xạ trường (nếu có biến mới) và phê duyệt để áp dụng cho các hồ sơ mới.`,
    });
    openMappingModal(res.data);
  };

  const openPreviewModal = (ver: BizDocTemplateVersion, startWithTestRender = false) => {
    setPreviewVersion(ver);
    setPreviewMode(startWithTestRender ? 'test_render' : 'raw');
    setTestPreview({
      loading: false,
      error: null,
      html: '',
      replacedTokensCount: 0,
      unreplacedPlaceholders: [],
      preservation: null,
    });
    if (startWithTestRender) {
      void runPreApprovalTestRender(ver);
    }
  };

  const runPreApprovalTestRender = async (ver: BizDocTemplateVersion) => {
    setPreviewMode('test_render');
    setTestPreview({
      loading: true,
      error: null,
      html: '',
      replacedTokensCount: 0,
      unreplacedPlaceholders: [],
      preservation: null,
    });

    try {
      const origBuf = await getTemplateBinary(ver.versionKey);
      if (!origBuf) {
        setTestPreview((prev) => ({
          ...prev,
          loading: false,
          error: 'Không tìm thấy tệp DOCX gốc trong IndexedDB để chạy kiểm tra.',
        }));
        return;
      }

      const latestSaved = records[0]?.data;
      const previewData = latestSaved
        ? {
            ...latestSaved,
            documentNumbers: { ...(latestSaved.documentNumbers || {}) },
            customFields: { ...(latestSaved.customFields || {}) },
          }
        : (() => {
            const empty = createEmptyFormData();
            return {
              ...empty,
              companyName: '[Tên doanh nghiệp]',
              companyCode: '[Mã số doanh nghiệp]',
              oldAddress: '[Địa chỉ trụ sở cũ]',
              newAddress: '[Địa chỉ trụ sở mới]',
              newAddressDetail: '[Số nhà, đường phố mới]',
              newWard: '[Phường / Xã mới]',
              newProvince: '[Tỉnh / Thành phố mới]',
              receivingAuthority: '[Cơ quan tiếp nhận hồ sơ]',
              ownerDecisionSigner: '[Người ký Quyết định]',
              applicationSigner: '[Người ký Giấy đề nghị]',
              applicationSignerTitle: '[Chức danh người ký]',
              documentNumber: '[Số văn bản]',
              documentNumbers: {
                M01: '[Số văn bản M01]',
                M02: '[Số văn bản M02]',
                M03: '[Số văn bản M03]',
                M04: '[Số văn bản M04]',
              },
              signingPlace: '[Địa danh ký]',
              companyPhone: '[Điện thoại DN]',
              companyEmail: '[Email DN]',
              procedureMode: 'CHANGE_ADDRESS' as const,
              taxNoticeAddressChange: 'NO' as const,
              taxProcedureStatus: 'NOT_STARTED' as const,
              ownerName: '[Tên chủ sở hữu]',
              ownerIdentifier: '[Số giấy tờ pháp lý CSH]',
              legalRepresentativeName: '[Người đại diện theo pháp luật]',
              legalRepresentativeTitle: '[Chức danh người ĐDPL]',
              authorizedPersonName: '[Người được ủy quyền]',
              authorizedPersonIdentifier: '[Số giấy tờ người được ủy quyền]',
            };
          })();

      const customValues: Record<string, string> = { ...(previewData.customFields || {}) };
      for (const c of customFieldDefs) {
        if (!customValues[c.key]) {
          customValues[c.key] = c.defaultValue || `[${c.label}]`;
        }
      }
      previewData.customFields = customValues;

      const gen = await generateFilledDocx({
        template: ver,
        templateBuffer: origBuf,
        data: previewData,
        isDraftCheckMode: true,
      });

      if (!gen.success || !gen.arrayBuffer) {
        setTestPreview((prev) => ({
          ...prev,
          loading: false,
          error: gen.error || 'Không thể chạy thử điền dữ liệu vào mẫu Word này.',
        }));
        return;
      }

      const preservation = verifyOfficialContentPreserved(origBuf, gen.arrayBuffer);
      setTestPreview({
        loading: false,
        error: null,
        html: gen.previewHtml || '',
        replacedTokensCount: gen.replacedTokensCount,
        unreplacedPlaceholders: gen.unreplacedPlaceholders,
        preservation,
      });
    } catch (err) {
      setTestPreview((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Lỗi không xác định khi chạy kiểm tra mẫu.',
      }));
    }
  };

  const openMappingModal = (ver: BizDocTemplateVersion) => {
    setMappingVersionKey(ver.versionKey);
    setDraftMappings(ver.fieldMappings.map((m) => ({ ...m })));
    setDraftFindings(ver.residualFindings.map((f) => ({ ...f })));
    setDraftCleanConfirmed(ver.cleanDataConfirmed);
    setDraftIsSimplified(Boolean(ver.isSimplifiedDraft));
    setDraftIsOfficial(
      ver.isOfficialStandard !== undefined
        ? Boolean(ver.isOfficialStandard)
        : !ver.isSimplifiedDraft
    );
    setDraftCategory(ver.documentCategory);
    setDraftSource(ver.sourceLabel);
    setDraftEffectiveDate(ver.effectiveDate);
    setDraftNotes(ver.notes);
    setNewLiteralText('');
    setNewLiteralField('companyName');
    setNewCustomKey('');
    setNewCustomLabel('');
    setNewCustomDefault('');
    setCustomFieldFeedback(null);
  };

  const handleConfirmAllMatchedMappings = () => {
    setDraftMappings((prev) =>
      prev.map((item) => (item.targetField ? { ...item, confirmed: true } : item))
    );
  };

  const handleQuickCreateCustomFieldFromToken = async (token: string, rowIdx: number) => {
    setCustomFieldFeedback(null);
    const prettyLabel = token
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim();
    const res = await addCustomFieldDefinition({
      key: token,
      label: `Trường bổ sung: ${prettyLabel}`,
      templateId: mappingVersionObj?.templateId,
    });
    if (!res.success || !res.data) {
      setCustomFieldFeedback({
        type: 'error',
        text: res.error || 'Không thể tạo trường mới.',
      });
      return;
    }

    setDraftMappings((prev) =>
      prev.map((item, idx) =>
        idx === rowIdx ? { ...item, targetField: res.data!.key, confirmed: true } : item
      )
    );
    setCustomFieldFeedback({
      type: 'success',
      text: `Đã thêm trường mới {{${res.data.key}}} vào cấu hình và tự động ánh xạ. Trường này sẽ tự hiển thị trong biểu mẫu nhập hồ sơ.`,
    });
  };

  const handleAddCustomFieldInline = async () => {
    setCustomFieldFeedback(null);
    const res = await addCustomFieldDefinition({
      key: newCustomKey,
      label: newCustomLabel,
      defaultValue: newCustomDefault,
      templateId: mappingVersionObj?.templateId,
    });
    if (!res.success || !res.data) {
      setCustomFieldFeedback({
        type: 'error',
        text: res.error || 'Không thể thêm trường mới.',
      });
      return;
    }

    const created = res.data;
    // If a placeholder in draftMappings has the exact same token, auto-bind it!
    setDraftMappings((prev) =>
      prev.map((item) =>
        item.token === created.key && !item.targetField
          ? { ...item, targetField: created.key, confirmed: true }
          : item
      )
    );
    setNewCustomKey('');
    setNewCustomLabel('');
    setNewCustomDefault('');
    setCustomFieldFeedback({
      type: 'success',
      text: `Đã thêm trường mới ${created.placeholder} (${created.label}). Bạn có thể chọn trường này trong cột "Tên trường dữ liệu".`,
    });
  };

  const handleAddLiteralMapping = () => {
    const trimmed = newLiteralText.trim();
    if (!trimmed) return;
    setDraftMappings((prev) => [
      ...prev,
      {
        token: trimmed,
        targetField: newLiteralField,
        matchType: 'LITERAL_TEXT',
        occurrences: 1,
        zones: ['paragraph'],
        confirmed: true,
      },
    ]);
    setNewLiteralText('');
  };

  const handleSaveMapping = async () => {
    if (!mappingVersionKey) return;
    setBusyMessage('Đang lưu cấu hình ánh xạ trường và cập nhật phiên bản cấu hình...');
    const res = await updateTemplateMappingAndAudit({
      versionKey: mappingVersionKey,
      fieldMappings: draftMappings,
      residualFindings: draftFindings,
      cleanDataConfirmed: draftCleanConfirmed,
      isSimplifiedDraft: draftIsSimplified,
      isOfficialStandard: !draftIsSimplified && draftIsOfficial,
      documentCategory: draftCategory,
      sourceLabel: draftSource,
      effectiveDate: draftEffectiveDate,
      notes: draftNotes,
    });
    setBusyMessage(null);

    if (res.success) {
      setMappingVersionKey(null);
      setAlert({
        type: 'success',
        text: 'Đã lưu ánh xạ trường và kết quả kiểm tra. Bạn có thể bấm "Xem trước" (chạy thử) rồi bấm "Phê duyệt" để kích hoạt cho các hồ sơ mới.',
      });
    } else {
      setAlert({
        type: 'error',
        text: res.error || 'Không thể lưu cấu hình ánh xạ.',
      });
    }
  };

  const handleApprove = async (ver: BizDocTemplateVersion) => {
    setBusyMessage(`Đang phê duyệt mẫu ${ver.templateId} v${ver.version}...`);
    setAlert(null);
    const res = await approveTemplateVersion(ver.versionKey);
    setBusyMessage(null);

    if (res.success) {
      setAlert({
        type: 'success',
        text: `Đã phê duyệt mẫu ${ver.templateId} phiên bản v${ver.version} (${
          ver.isSimplifiedDraft ? 'Bản rút gọn' : 'Mẫu chuẩn chính thức'
        }). Chỉ hồ sơ tạo sau thời điểm này mới dùng v${ver.version}; toàn bộ hồ sơ cũ vẫn giữ đúng phiên bản mẫu và configSnapshot ban đầu.`,
      });
    } else {
      setAlert({
        type: 'error',
        text: res.error || 'Không thể phê duyệt mẫu.',
      });
    }
  };

  const handleDownloadOriginal = async (ver: BizDocTemplateVersion) => {
    setBusyMessage(`Đang tải tệp mẫu gốc ${ver.fileName}...`);
    const res = await downloadOriginalTemplate(ver.versionKey);
    setBusyMessage(null);
    if (!res.success) {
      setAlert({ type: 'error', text: res.error || 'Không thể tải mẫu gốc.' });
    }
  };

  const handleDeactivateConfirmed = async (ver: BizDocTemplateVersion) => {
    setConfirmAction(null);
    setBusyMessage(`Đang ngừng sử dụng mẫu ${ver.templateId} v${ver.version}...`);
    const res = await deactivateTemplateVersion(ver.versionKey);
    setBusyMessage(null);

    if (res.success) {
      setAlert({
        type: 'success',
        text: `Đã ngừng sử dụng mẫu ${ver.templateId} v${ver.version} cho hồ sơ mới. Các hồ sơ cũ vẫn giữ nguyên bản mẫu v${ver.version} và bạn có thể khôi phục bất cứ lúc nào.`,
      });
    } else {
      setAlert({ type: 'error', text: res.error || 'Lỗi khi ngừng sử dụng mẫu.' });
    }
  };

  const handleRestoreConfirmed = async (ver: BizDocTemplateVersion) => {
    setConfirmAction(null);
    setBusyMessage(`Đang khôi phục mẫu ${ver.templateId} về phiên bản v${ver.version}...`);
    const res = await restoreTemplateVersion(ver.versionKey);
    setBusyMessage(null);

    if (res.success) {
      setAlert({
        type: 'success',
        text: `Đã khôi phục mẫu ${ver.templateId} về phiên bản v${ver.version} làm mẫu đang sử dụng cho các hồ sơ mới (hồ sơ cũ vẫn giữ đúng bản chụp cũ).`,
      });
    } else {
      setAlert({ type: 'error', text: res.error || 'Không thể khôi phục phiên bản mẫu.' });
    }
  };

  const handleDeleteConfirmed = async (ver: BizDocTemplateVersion) => {
    setConfirmAction(null);
    setBusyMessage('Đang xóa phiên bản mẫu khỏi IndexedDB...');
    const res = await deleteTemplateVersion(ver.versionKey);
    setBusyMessage(null);

    if (res.success) {
      setAlert({
        type: 'success',
        text: `Đã xóa mẫu ${ver.templateId} v${ver.version} (chưa có hồ sơ nào sử dụng).`,
      });
    } else {
      setAlert({ type: 'error', text: res.error || 'Lỗi khi xóa mẫu.' });
    }
  };

  const copyPlaceholder = (placeholder: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(placeholder).catch(() => {});
    }
  };

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    } catch {
      return iso;
    }
  };

  const renderVersionTypeLabel = (ver: BizDocTemplateVersion) => {
    if (ver.isSimplifiedDraft) {
      return (
        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
          MẪU RÚT GỌN · BẢN NHÁP THỰC HÀNH (R16)
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
        MẪU CHUẨN CHÍNH THỨC
      </span>
    );
  };

  const renderStatusBadge = (ver: BizDocTemplateVersion | null, isActiveForNew = false) => {
    const status: TemplateStatus = ver ? ver.status : 'MISSING';
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
          {status === 'APPROVED' && isActiveForNew ? (
            <span className="font-semibold text-teal-700">Đã phê duyệt · Đang sử dụng</span>
          ) : status === 'APPROVED' ? (
            <span className="font-semibold text-teal-700">Đã phê duyệt</span>
          ) : status === 'PENDING_REVIEW' ? (
            <span className="font-semibold text-amber-700">Chờ kiểm tra & Phê duyệt (R02)</span>
          ) : status === 'INACTIVE' ? (
            <span className="font-semibold text-slate-500">Ngừng sử dụng (giữ cho hồ sơ cũ)</span>
          ) : (
            <span className="font-semibold text-slate-500">Chưa tải mẫu (R01)</span>
          )}
        </div>
        {ver && <div className="flex flex-wrap gap-1 xl:justify-end">{renderVersionTypeLabel(ver)}</div>}
        {ver && ver.residualFindings.some((f) => !f.resolved) && (
          <div className="text-[11px] text-rose-700 font-medium">
            Cảnh báo dữ liệu cũ (R05)
          </div>
        )}
      </div>
    );
  };

  const mappingVersionObj = mappingVersionKey
    ? templateVersions.find((v) => v.versionKey === mappingVersionKey) || null
    : null;

  const checkVarsVersionObj = checkVarsVersionKey
    ? templateVersions.find((v) => v.versionKey === checkVarsVersionKey) || null
    : null;

  const standardFields21 = BIZDOC_FIELDS.slice(0, 21);
  const extendedFields = BIZDOC_FIELDS.slice(21);

  return (
    <div className="space-y-5 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">
            Quản lý phiên bản mẫu Word (.docx)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ thay thế mẫu rút gọn bằng mẫu chuẩn chính thức theo phiên bản (v1, v2...), bảo
            toàn mẫu cũ và configSnapshot của hồ sơ cũ, cho phép thêm trường ánh xạ mới và khôi phục
            khi cần.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowPlaceholderGuide((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>
              {showPlaceholderGuide
                ? 'Ẩn bảng Placeholder'
                : `Xem ${21 + customFieldDefs.length} Placeholder`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => openUploadModal('M02', false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tải mẫu mới</span>
          </button>
        </div>
      </div>

      {/* Requirement 10: Clear Status Report (Uploaded / Approved / Currently Active) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
            <ClipboardList className="w-4 h-4 text-teal-700" />
            <span>Báo cáo trạng thái mẫu Word (Đã tải · Đã phê duyệt · Đang sử dụng)</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
            <span>
              Đã tải: <strong className="text-slate-900">{statusReport.totalUploaded}</strong> bản
            </span>
            <span>·</span>
            <span>
              Đang dùng: <strong className="text-teal-700">{statusReport.activeSlotsCount}/{currentConfig.templateSlots.length}</strong> loại
            </span>
            <span>·</span>
            <span>
              Chờ duyệt: <strong className="text-amber-700">{statusReport.totalPending}</strong>
            </span>
            <span>·</span>
            <span>
              Ngừng dùng: <strong className="text-slate-600">{statusReport.totalInactive}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2 px-4">Danh mục mẫu</th>
                <th className="py-2 px-4">Các phiên bản đã tải</th>
                <th className="py-2 px-4">Đã phê duyệt / Chờ duyệt / Ngừng dùng</th>
                <th className="py-2 px-4">Đang sử dụng cho hồ sơ mới</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statusReport.perSlot.map(({ slot, versions, activeVer, pendingVersions, inactiveVersions }) => (
                <tr key={slot.templateId} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <span className="font-mono text-teal-800 mr-1.5">{slot.templateId}</span>
                    <span className="text-slate-700 font-normal">
                      {slot.isMandatory ? '(Bắt buộc)' : '(Tùy chọn)'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {versions.length === 0 ? (
                      <span className="text-slate-400">Chưa tải phiên bản nào</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {versions.map((v) => (
                          <span
                            key={v.versionKey}
                            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800"
                          >
                            v{v.version}
                            {v.isSimplifiedDraft ? ' (Rút gọn)' : ' (Chuẩn)'}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                    {versions.length === 0 ? (
                      '—'
                    ) : (
                      <span>
                        Duyệt: <strong className="text-teal-700">{activeVer ? `v${activeVer.version}` : '0'}</strong>
                        {' · '}
                        Chờ: <strong className="text-amber-700">{pendingVersions.length}</strong>
                        {' · '}
                        Ngừng: <strong className="text-slate-600">{inactiveVersions.length}</strong>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {activeVer ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono font-bold text-teal-800">
                          v{activeVer.version}
                        </span>
                        <span className="text-slate-700 truncate max-w-[200px]" title={activeVer.fileName}>
                          {activeVer.fileName}
                        </span>
                        {activeVer.isSimplifiedDraft ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            Rút gọn
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            Chuẩn chính thức
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">Chưa kích hoạt mẫu cho hồ sơ mới</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible Placeholder Reference Guide (21 standard + custom fields) */}
      {showPlaceholderGuide && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bảng Placeholder chuẩn ({standardFields21.length}) & Trường bổ sung ({customFieldDefs.length})
              </h3>
              <p className="text-xs text-slate-500">
                Chèn cú pháp <code className="font-mono text-teal-700">{'{{fieldName}}'}</code> vào
                đoạn văn, bảng, đầu trang hoặc chân trang. Bấm vào mã để sao chép nhanh.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlaceholderGuide(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {standardFields21.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => copyPlaceholder(field.placeholder)}
                title="Bấm để sao chép placeholder"
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-mono font-bold text-teal-800 truncate">
                    {field.placeholder}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">
                    {field.label} {field.requiredInV1 ? '· Bắt buộc' : '· Tùy chọn'}
                  </div>
                </div>
                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
            {customFieldDefs.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => copyPlaceholder(field.placeholder)}
                title="Bấm để sao chép trường bổ sung"
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 text-left transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-mono font-bold text-indigo-800 truncate">
                    {field.placeholder}
                  </div>
                  <div className="text-[11px] text-slate-700 truncate">
                    {field.label} · Trường bổ sung
                  </div>
                </div>
                <Copy className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status / Busy / Alert Messages */}
      {busyMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span>{busyMessage}</span>
        </div>
      )}

      {alert && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : alert.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : alert.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{alert.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-slate-500 hover:text-slate-800 shrink-0"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Template Cards by Slot */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-200">
          {currentConfig.templateSlots.map((slot) => {
            const slotVersions = templateVersions
              .filter((v) => v.templateId === slot.templateId)
              .sort((a, b) => b.version - a.version);
            const latestVer = slotVersions[0] || null;
            const activeApprovedVer = slot.activeVersionKey
              ? slotVersions.find((v) => v.versionKey === slot.activeVersionKey) || null
              : null;
            const primaryVer = activeApprovedVer || latestVer;
            const pendingReplacementVersions = slotVersions.filter(
              (v) => v.status === 'PENDING_REVIEW' && v.versionKey !== primaryVer?.versionKey
            );
            const restorableVersions = slotVersions.filter(
              (v) => v.status === 'INACTIVE'
            );
            const isExpanded = expandedSlotId === slot.templateId;
            const missingVars = primaryVer ? getMissingRequiredPlaceholders(primaryVer) : [];
            const primaryUsedByCount = primaryVer
              ? getRecordsUsingTemplateVersion(primaryVer.versionKey).length
              : 0;

            return (
              <div key={slot.templateId} className="p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                  {/* Left metadata */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                        {slot.templateId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{slot.name}</h3>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span>{primaryVer?.documentCategory || slot.documentCategory}</span>
                      <span>·</span>
                      <span>{slot.isMandatory ? 'Bắt buộc V1' : 'Tùy điều kiện'}</span>
                      {primaryVer && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-slate-800 font-semibold">
                            v{primaryVer.version} ({primaryVer.fileName})
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            {(primaryVer.fileSize / 1024).toFixed(1)} KB
                          </span>
                          <span>·</span>
                          <span>Tải lúc {formatDateTime(primaryVer.uploadedAt)}</span>
                        </>
                      )}
                    </div>

                    {primaryVer ? (
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                        <span>
                          Placeholder đọc được:{' '}
                          <strong className="font-mono text-slate-900">
                            {primaryVer.detectedPlaceholders.length}
                          </strong>
                        </span>
                        <span>
                          Đã xác nhận ánh xạ:{' '}
                          <strong className="font-mono text-teal-700">
                            {primaryVer.fieldMappings.filter((m) => m.confirmed && m.targetField).length}/
                            {primaryVer.fieldMappings.length}
                          </strong>
                        </span>
                        <span>
                          Hồ sơ đang gắn:{' '}
                          <strong className="font-mono text-slate-900">{primaryUsedByCount}</strong>
                        </span>
                        {missingVars.length > 0 && (
                          <span className="text-amber-700 font-medium">
                            Thiếu {missingVars.length} biến khuyến nghị (R03)
                          </span>
                        )}
                        {primaryVer.hasTables && <span className="text-slate-500">Có bảng</span>}
                        {primaryVer.hasHeaders && <span className="text-slate-500">Có đầu trang</span>}
                        {primaryVer.hasFooters && <span className="text-slate-500">Có chân trang</span>}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        {slot.isMandatory
                          ? 'Chưa tải mẫu Word. Hãy bấm "Tải mẫu" để chọn tệp .docx từ máy tính.'
                          : slot.conditionNote}
                      </div>
                    )}

                    {/* History toggle & quick restore hint */}
                    {slotVersions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedSlotId(isExpanded ? null : slot.templateId)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>
                            {isExpanded
                              ? 'Ẩn lịch sử phiên bản'
                              : `Quản lý lịch sử ${slotVersions.length} phiên bản (giữ nguyên mẫu cũ & khôi phục)`}
                          </span>
                        </button>
                        {!activeApprovedVer && restorableVersions.length > 0 && (
                          <span className="text-[11px] text-amber-800 font-medium">
                            Có {restorableVersions.length} phiên bản cũ có thể khôi phục
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Status + All Required Action Buttons */}
                  <div className="flex flex-col xl:items-end gap-2.5 shrink-0">
                    <div className="text-xs">
                      {renderStatusBadge(primaryVer, Boolean(activeApprovedVer && primaryVer?.versionKey === activeApprovedVer.versionKey))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {!primaryVer ? (
                        <button
                          type="button"
                          onClick={() => openUploadModal(slot.templateId, false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap"
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>Tải mẫu</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openPreviewModal(primaryVer, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem trước</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openMappingModal(primaryVer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold whitespace-nowrap"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Ánh xạ trường</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCheckVarsVersionKey(primaryVer.versionKey)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold whitespace-nowrap"
                          >
                            <SearchCheck className="w-3.5 h-3.5" />
                            <span>Kiểm tra biến</span>
                          </button>

                          {primaryVer.status === 'PENDING_REVIEW' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(primaryVer)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Phê duyệt</span>
                            </button>
                          )}

                          {primaryVer.status === 'INACTIVE' && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  type: 'restore',
                                  versionKey: primaryVer.versionKey,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold whitespace-nowrap"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Khôi phục bản này</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openUploadModal(slot.templateId, Boolean(primaryVer.isSimplifiedDraft))
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                              primaryVer.isSimplifiedDraft
                                ? 'bg-teal-700 hover:bg-teal-800 text-white'
                                : 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            <span>
                              {primaryVer.isSimplifiedDraft
                                ? 'Thay bằng mẫu chuẩn mới'
                                : 'Thay thế mẫu'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadOriginal(primaryVer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold whitespace-nowrap"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải mẫu gốc</span>
                          </button>

                          {primaryVer.status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  type: 'deactivate',
                                  versionKey: primaryVer.versionKey,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold whitespace-nowrap"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ngừng dùng</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Inline confirmation strip for primary version */}
                    {primaryVer &&
                      confirmAction &&
                      confirmAction.versionKey === primaryVer.versionKey && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-wrap items-center gap-2">
                          <span>
                            {confirmAction.type === 'deactivate'
                              ? `Ngừng sử dụng ${primaryVer.templateId} v${primaryVer.version} cho hồ sơ mới? Hồ sơ cũ vẫn giữ nguyên bản này.`
                              : `Khôi phục ${primaryVer.templateId} v${primaryVer.version} làm mẫu đang sử dụng cho hồ sơ mới?`}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              confirmAction.type === 'deactivate'
                                ? handleDeactivateConfirmed(primaryVer)
                                : handleRestoreConfirmed(primaryVer)
                            }
                            className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                          >
                            Xác nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmAction(null)}
                            className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                  </div>
                </div>

                {/* Highlighted Pending New Version Callout (Requirement 1, 4, 5) */}
                {pendingReplacementVersions.length > 0 && (
                  <div className="space-y-2">
                    {pendingReplacementVersions.map((pendingVer) => (
                      <div
                        key={pendingVer.versionKey}
                        className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-700 text-white font-mono text-[11px] font-bold">
                              BẢN MỚI CHỜ DUYỆT · v{pendingVer.version}
                            </span>
                            <span className="font-bold text-amber-950 truncate">
                              {pendingVer.fileName}
                            </span>
                            {renderVersionTypeLabel(pendingVer)}
                          </div>
                          <div className="text-amber-900">
                            Phát hiện <strong>{pendingVer.detectedPlaceholders.length}</strong>{' '}
                            Placeholder · Đã xác nhận ánh xạ{' '}
                            <strong>
                              {pendingVer.fieldMappings.filter((m) => m.confirmed && m.targetField).length}/
                              {pendingVer.fieldMappings.length}
                            </strong>
                            . Bản đang dùng hiện tại (
                            <strong>
                              {activeApprovedVer ? `v${activeApprovedVer.version}` : 'chưa có'}
                            </strong>
                            ) vẫn giữ nguyên cho đến khi bạn bấm <strong>Phê duyệt</strong>.
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openPreviewModal(pendingVer, true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-400 bg-white hover:bg-amber-100 text-amber-950 font-semibold whitespace-nowrap"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                            <span>Xem trước & Chạy thử</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openMappingModal(pendingVer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold whitespace-nowrap"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Ánh xạ trường</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCheckVarsVersionKey(pendingVer.versionKey)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold whitespace-nowrap"
                          >
                            <SearchCheck className="w-3.5 h-3.5" />
                            <span>Kiểm tra biến</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(pendingVer)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Phê duyệt & Áp dụng</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded version history (Requirements 2, 6, 7) */}
                {isExpanded && (
                  <div className="mt-2 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] font-bold text-slate-600 uppercase">
                        Lịch sử toàn bộ phiên bản mẫu {slot.templateId} (Giữ nguyên bản cũ, không
                        ghi đè – có thể ngừng dùng hoặc khôi phục)
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Hồ sơ cũ luôn giữ đúng phiên bản mẫu & configSnapshot ban đầu
                      </span>
                    </div>

                    <div className="space-y-2">
                      {slotVersions.map((ver) => {
                        const isCurrentlyActive = slot.activeVersionKey === ver.versionKey && ver.status === 'APPROVED';
                        const boundRecords = getRecordsUsingTemplateVersion(ver.versionKey);
                        const isConfirmingThis =
                          confirmAction && confirmAction.versionKey === ver.versionKey;

                        return (
                          <div
                            key={ver.versionKey}
                            className={`p-3 rounded-xl border text-xs space-y-2 ${
                              isCurrentlyActive
                                ? 'bg-teal-50/40 border-teal-200'
                                : ver.status === 'PENDING_REVIEW'
                                ? 'bg-amber-50/50 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">
                                    v{ver.version}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate">
                                    {ver.fileName}
                                  </span>
                                  {isCurrentlyActive && (
                                    <span className="px-2 py-0.5 rounded bg-teal-700 text-white text-[10px] font-bold">
                                      ĐANG SỬ DỤNG CHO HỒ SƠ MỚI
                                    </span>
                                  )}
                                  {ver.status === 'PENDING_REVIEW' && (
                                    <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold">
                                      CHỜ PHÊ DUYỆT
                                    </span>
                                  )}
                                  {ver.status === 'INACTIVE' && (
                                    <span className="px-2 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold">
                                      NGỪNG SỬ DỤNG
                                    </span>
                                  )}
                                  {renderVersionTypeLabel(ver)}
                                </div>

                                <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-2 gap-y-0.5">
                                  <span className="font-mono">{ver.versionKey}</span>
                                  <span>·</span>
                                  <span>Tải: {formatDateTime(ver.uploadedAt)}</span>
                                  {ver.approvedAt && (
                                    <>
                                      <span>·</span>
                                      <span>Duyệt: {formatDateTime(ver.approvedAt)}</span>
                                    </>
                                  )}
                                  {ver.restoredAt && (
                                    <>
                                      <span>·</span>
                                      <span className="text-teal-700 font-medium">
                                        Khôi phục: {formatDateTime(ver.restoredAt)}
                                      </span>
                                    </>
                                  )}
                                  {ver.deactivatedAt && ver.status === 'INACTIVE' && (
                                    <>
                                      <span>·</span>
                                      <span>Ngừng: {formatDateTime(ver.deactivatedAt)}</span>
                                    </>
                                  )}
                                  <span>·</span>
                                  <span>
                                    Đang gắn cho <strong>{boundRecords.length}</strong> hồ sơ
                                  </span>
                                </div>

                                {ver.notes && (
                                  <div className="text-[11px] text-slate-500 italic">
                                    Ghi chú: {ver.notes}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openPreviewModal(ver, false)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-medium"
                                >
                                  Xem trước
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openPreviewModal(ver, true)}
                                  className="px-2.5 py-1 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 font-medium"
                                >
                                  Chạy thử
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openMappingModal(ver)}
                                  className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 font-medium"
                                >
                                  Ánh xạ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCheckVarsVersionKey(ver.versionKey)}
                                  className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-medium"
                                >
                                  Kiểm tra biến
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadOriginal(ver)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-medium"
                                >
                                  Tải gốc
                                </button>

                                {ver.status === 'PENDING_REVIEW' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(ver)}
                                    className="px-2.5 py-1 rounded-lg bg-teal-700 text-white hover:bg-teal-800 font-semibold"
                                  >
                                    Phê duyệt
                                  </button>
                                )}

                                {ver.status === 'INACTIVE' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: 'restore',
                                        versionKey: ver.versionKey,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-700 text-white hover:bg-teal-800 font-semibold"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Khôi phục</span>
                                  </button>
                                )}

                                {ver.status === 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: 'deactivate',
                                        versionKey: ver.versionKey,
                                      })
                                    }
                                    className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold"
                                  >
                                    Ngừng dùng
                                  </button>
                                )}

                                {boundRecords.length === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: 'delete',
                                        versionKey: ver.versionKey,
                                      })
                                    }
                                    className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                                    title="Xóa phiên bản chưa có hồ sơ tham chiếu"
                                  >
                                    Xóa
                                  </button>
                                ) : (
                                  <span
                                    className="px-2 py-1 rounded-lg bg-slate-200/70 text-slate-600 text-[11px]"
                                    title="Được bảo vệ vì đang gắn với hồ sơ cũ — hãy dùng Ngừng dùng thay vì Xóa"
                                  >
                                    Đang khóa ({boundRecords.length} HS)
                                  </span>
                                )}
                              </div>
                            </div>

                            {isConfirmingThis && (
                              <div className="p-2.5 rounded-lg bg-white border border-amber-300 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-2">
                                <span>
                                  {confirmAction.type === 'deactivate'
                                    ? `Xác nhận ngừng sử dụng ${ver.templateId} v${ver.version} cho hồ sơ mới? Hồ sơ cũ vẫn dùng được bản này.`
                                    : confirmAction.type === 'restore'
                                    ? `Xác nhận khôi phục ${ver.templateId} v${ver.version} làm mẫu đang sử dụng cho hồ sơ mới?`
                                    : `Xác nhận xóa vĩnh viễn phiên bản ${ver.templateId} v${ver.version} khỏi IndexedDB?`}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirmAction.type === 'deactivate') {
                                        void handleDeactivateConfirmed(ver);
                                      } else if (confirmAction.type === 'restore') {
                                        void handleRestoreConfirmed(ver);
                                      } else {
                                        void handleDeleteConfirmed(ver);
                                      }
                                    }}
                                    className={`px-3 py-1 rounded font-semibold text-white ${
                                      confirmAction.type === 'delete'
                                        ? 'bg-rose-700 hover:bg-rose-800'
                                        : 'bg-teal-700 hover:bg-teal-800'
                                    }`}
                                  >
                                    Xác nhận
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmAction(null)}
                                    className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Bảo toàn nội dung bắt buộc của biểu mẫu chuẩn (R06), chỉ thay các Placeholder đã ánh xạ
            trong đoạn văn, bảng, đầu trang và chân trang (R04).
          </span>
          <span className="font-mono tabular-nums font-semibold text-slate-700">
            configVersion: v{currentConfig.configVersion}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: UPLOAD NEW VERSION / REPLACE SIMPLIFIED TEMPLATE */}
      {/* ========================================================= */}
      {uploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setUploadModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <FileUp className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tải mẫu Word (.docx) tạo phiên bản mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmUpload} className="p-5 space-y-4 text-xs sm:text-sm">
              {(() => {
                const slot = currentConfig.templateSlots.find(
                  (s) => s.templateId === uploadTemplateId
                );
                const existingCount = templateVersions.filter(
                  (v) => v.templateId === uploadTemplateId
                ).length;
                const nextVer =
                  existingCount > 0
                    ? Math.max(
                        ...templateVersions
                          .filter((v) => v.templateId === uploadTemplateId)
                          .map((v) => v.version)
                      ) + 1
                    : 1;
                return (
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-1">
                    <div className="font-bold">
                      Tạo phiên bản mới: {uploadTemplateId} v{nextVer}
                    </div>
                    <p>
                      Phiên bản cũ ({slot?.activeVersionKey || 'nếu có'}) sẽ{' '}
                      <strong>được giữ nguyên 100%, không bị ghi đè</strong>. Phiên bản mới chỉ áp
                      dụng cho các hồ sơ tạo sau khi bạn xem trước, ánh xạ trường và bấm{' '}
                      <strong>Phê duyệt</strong>.
                    </p>
                  </div>
                );
              })()}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn danh mục mẫu văn bản
                </label>
                <select
                  value={uploadTemplateId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setUploadTemplateId(id);
                    const slot = currentConfig.templateSlots.find((s) => s.templateId === id);
                    if (slot) setUploadCategory(slot.documentCategory);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {currentConfig.templateSlots.map((slot) => (
                    <option key={slot.templateId} value={slot.templateId}>
                      {slot.templateId} – {slot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn tệp Word (.docx) từ máy tính *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-800 hover:file:bg-slate-100"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Hệ thống tự quét Placeholder và giữ nguyên toàn bộ nội dung bắt buộc của biểu mẫu
                  chuẩn (R06). Tệp hỏng sẽ bị từ chối mà không ảnh hưởng mẫu cũ (R10).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nguồn biểu mẫu</label>
                  <input
                    type="text"
                    value={uploadSourceLabel}
                    onChange={(e) => setUploadSourceLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày áp dụng</label>
                  <input
                    type="date"
                    value={uploadEffectiveDate}
                    onChange={(e) => setUploadEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Classification: Official Standard vs Simplified Draft */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">Phân loại phiên bản mẫu</div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 cursor-pointer">
                  <input
                    type="radio"
                    name="templateClass"
                    checked={!uploadIsSimplified}
                    onChange={() => {
                      setUploadIsOfficial(true);
                      setUploadIsSimplified(false);
                    }}
                    className="mt-0.5 text-teal-700"
                  />
                  <span>
                    <strong>Mẫu chuẩn chính thức (Khuyến nghị):</strong> Biểu mẫu đầy đủ nội dung
                    theo quy định để thay thế mẫu rút gọn và áp dụng cho hồ sơ mới sau khi phê duyệt.
                  </span>
                </label>

                {uploadTemplateId === 'M02' && (
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 cursor-pointer">
                    <input
                      type="radio"
                      name="templateClass"
                      checked={uploadIsSimplified}
                      onChange={() => {
                        setUploadIsSimplified(true);
                        setUploadIsOfficial(false);
                      }}
                      className="mt-0.5 text-amber-600"
                    />
                    <span>
                      <strong>Mẫu M02 bản rút gọn (R16):</strong> Luôn hiển thị{' '}
                      <strong>BẢN NHÁP THỰC HÀNH</strong> và không coi là mẫu chính thức đủ điều
                      kiện nộp.
                    </span>
                  </label>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú phiên bản</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Ví dụ: Thay mẫu M02 rút gọn bằng biểu mẫu chuẩn theo Thông tư mới..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs"
                >
                  Đọc tệp & Tạo phiên bản mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PREVIEW & PRE-APPROVAL TEST RENDER (Req 4 & 8)   */}
      {/* ========================================================= */}
      {previewVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs"
          onClick={() => setPreviewVersion(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  Xem trước & Kiểm tra mẫu {previewVersion.templateId} v{previewVersion.version} –{' '}
                  {previewVersion.fileName}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                  <span>Nguồn: {previewVersion.sourceLabel}</span>
                  <span>·</span>
                  <span>Placeholder: {previewVersion.detectedPlaceholders.length}</span>
                  <span>·</span>
                  <span>Bảng: {previewVersion.hasTables ? 'Có' : 'Không'}</span>
                  <span>·</span>
                  <span>
                    Đầu/Chân trang:{' '}
                    {previewVersion.hasHeaders || previewVersion.hasFooters ? 'Có' : 'Không'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVersion(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Raw DOCX vs Pre-Approval Test Render */}
            <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
              <div className="inline-flex p-1 rounded-lg bg-slate-100 gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('raw')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    previewMode === 'raw'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. Nội dung gốc mẫu Word
                </button>
                <button
                  type="button"
                  onClick={() => void runPreApprovalTestRender(previewVersion)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    previewMode === 'test_render'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>2. Kiểm tra điền thử trước khi phê duyệt</span>
                </button>
              </div>
              <div>{renderVersionTypeLabel(previewVersion)}</div>
            </div>

            {previewVersion.isSimplifiedDraft && (
              <div className="px-5 py-2 bg-amber-100 border-b border-amber-300 text-amber-950 text-xs font-bold shrink-0">
                BẢN NHÁP THỰC HÀNH (R16): Mẫu M02 bản rút gọn – không coi là mẫu chính thức đủ điều
                kiện nộp hồ sơ.
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 space-y-4">
              {previewMode === 'raw' ? (
                <div
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-10 max-w-3xl mx-auto text-sm leading-relaxed text-slate-900 space-y-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50"
                  dangerouslySetInnerHTML={{ __html: previewVersion.previewHtml }}
                />
              ) : testPreview.loading ? (
                <div className="p-10 text-center text-xs text-slate-600 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-700" />
                  <span>
                    Đang chạy kiểm tra ghép biến vào tệp DOCX và kiểm tra bảo toàn nội dung bắt
                    buộc...
                  </span>
                </div>
              ) : testPreview.error ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                  {testPreview.error}
                </div>
              ) : (
                <>
                  {/* Requirement 8 Preservation Verification Strip */}
                  {testPreview.preservation && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 max-w-3xl mx-auto ${
                        testPreview.preservation.preserved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          {testPreview.preservation.preserved
                            ? 'ĐẠT kiểm tra bảo toàn nội dung bắt buộc biểu mẫu chuẩn (R06)'
                            : 'Cần rà soát lại cấu trúc sau khi điền thử'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                        <span>
                          Đoạn văn:{' '}
                          <strong className="font-mono">
                            {testPreview.preservation.renderedParagraphCount}/
                            {testPreview.preservation.originalParagraphCount}
                          </strong>
                        </span>
                        <span>
                          Bảng biểu:{' '}
                          <strong className="font-mono">
                            {testPreview.preservation.renderedTableCount}/
                            {testPreview.preservation.originalTableCount}
                          </strong>
                        </span>
                        <span>
                          Đầu/Chân trang:{' '}
                          <strong>
                            {testPreview.preservation.headersPreserved &&
                            testPreview.preservation.footersPreserved
                              ? 'Bảo toàn nguyên vẹn'
                              : 'Có thay đổi'}
                          </strong>
                        </span>
                        <span>
                          Biến đã điền thử:{' '}
                          <strong className="font-mono">{testPreview.replacedTokensCount}</strong>
                        </span>
                      </div>
                      {testPreview.unreplacedPlaceholders.length > 0 && (
                        <div className="text-amber-900 pt-1">
                          Placeholder chưa được ánh xạ (vẫn giữ nguyên trong mẫu):{' '}
                          <span className="font-mono font-semibold">
                            {testPreview.unreplacedPlaceholders.map((t) => `{{${t}}}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="bg-white border border-slate-200 rounded-xl p-5 sm:p-10 max-w-3xl mx-auto text-sm leading-relaxed text-slate-900 space-y-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50"
                    dangerouslySetInnerHTML={{ __html: testPreview.html }}
                  />
                </>
              )}
            </div>

            <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
              <span>Không tự xóa nội dung bắt buộc của biểu mẫu chuẩn (R06)</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadOriginal(previewVersion)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Tải mẫu gốc
                </button>
                {previewVersion.status === 'PENDING_REVIEW' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = previewVersion;
                      setPreviewVersion(null);
                      void handleApprove(target);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800"
                  >
                    Phê duyệt mẫu này
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewVersion(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CHECK VARIABLES (KIỂM TRA BIẾN - R03/R04/R05)    */}
      {/* ========================================================= */}
      {checkVarsVersionObj && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs"
          onClick={() => setCheckVarsVersionKey(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Kiểm tra biến (Placeholder) – {checkVarsVersionObj.templateId} v
                  {checkVarsVersionObj.version}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{checkVarsVersionObj.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckVarsVersionKey(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {(() => {
                const missingReq = getMissingRequiredPlaceholders(checkVarsVersionObj);
                const expectedList =
                  REQUIRED_PLACEHOLDERS_BY_TEMPLATE[checkVarsVersionObj.templateId] || [];
                const unconfirmedCount = checkVarsVersionObj.fieldMappings.filter(
                  (m) => !m.targetField || !m.confirmed
                ).length;
                const unresolvedOldData = checkVarsVersionObj.residualFindings.filter(
                  (r) => !r.resolved
                );

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Biến phát hiện</div>
                        <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                          {checkVarsVersionObj.detectedPlaceholders.length}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Chưa xác nhận</div>
                        <div
                          className={`text-lg font-bold font-mono mt-0.5 ${
                            unconfirmedCount > 0 ? 'text-amber-700' : 'text-teal-700'
                          }`}
                        >
                          {unconfirmedCount}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Biến khuyến nghị thiếu</div>
                        <div
                          className={`text-lg font-bold font-mono mt-0.5 ${
                            missingReq.length > 0 ? 'text-amber-700' : 'text-teal-700'
                          }`}
                        >
                          {missingReq.length}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Cảnh báo dữ liệu cũ</div>
                        <div
                          className={`text-lg font-bold font-mono mt-0.5 ${
                            unresolvedOldData.length > 0 ? 'text-rose-700' : 'text-teal-700'
                          }`}
                        >
                          {unresolvedOldData.length}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        1. Kiểm tra biến bắt buộc của mẫu {checkVarsVersionObj.templateId} (R03)
                      </h4>
                      {missingReq.length === 0 ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Mẫu đã có đủ các trường cốt lõi (
                            {expectedList.map((k) => `{{${k}}}`).join(', ')}).
                          </span>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                          <div className="font-bold">
                            Phát hiện {missingReq.length} Placeholder chưa có hoặc chưa ánh xạ trong
                            mẫu:
                          </div>
                          <ul className="list-disc pl-5 space-y-0.5">
                            {missingReq.map((k) => (
                              <li key={k}>
                                <code className="font-mono font-bold">{`{{${k}}}`}</code> –{' '}
                                {getFieldLabel(k, customFieldDefs)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        2. Danh sách Placeholder đọc được (Đoạn văn / Bảng / Đầu trang / Chân trang)
                      </h4>
                      {checkVarsVersionObj.fieldMappings.length === 0 ? (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                          Không phát hiện biến {'{{...}}'} nào trong tệp Word này.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                                <th className="py-2 px-3">Placeholder</th>
                                <th className="py-2 px-3">Tên trường</th>
                                <th className="py-2 px-3">Vị trí & Số lần (R04)</th>
                                <th className="py-2 px-3">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {checkVarsVersionObj.fieldMappings.map((m, i) => (
                                <tr key={`${m.token}-${i}`}>
                                  <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                                    {m.matchType === 'PLACEHOLDER'
                                      ? `{{${m.token}}}`
                                      : `"${m.token}"`}
                                  </td>
                                  <td className="py-2 px-3 text-slate-700">
                                    {m.targetField
                                      ? getFieldLabel(m.targetField, customFieldDefs)
                                      : 'Chưa ánh xạ (có thể tạo trường mới)'}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">
                                    <span className="font-mono font-semibold">
                                      {m.occurrences ?? 1} lần
                                    </span>{' '}
                                    {m.zones && m.zones.length > 0 && (
                                      <span className="text-slate-500">
                                        ({m.zones.map((z) => ZONE_LABELS[z]).join(', ')})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    {m.targetField && m.confirmed ? (
                                      <span className="text-teal-700 font-semibold">Đã xác nhận</span>
                                    ) : m.targetField ? (
                                      <span className="text-amber-700 font-semibold">
                                        Đã khớp – chờ xác nhận
                                      </span>
                                    ) : (
                                      <span className="text-rose-700 font-semibold">Chưa ánh xạ</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {unresolvedOldData.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                        <div className="font-bold">
                          Cảnh báo dữ liệu doanh nghiệp / cá nhân cũ chưa xử lý (R05):
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {unresolvedOldData.map((r) => (
                            <li key={r.id}>
                              [{r.category}] <code className="font-mono">{r.matchedSample}</code> —{' '}
                              {r.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = checkVarsVersionObj;
                    setCheckVarsVersionKey(null);
                    openMappingModal(target);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold"
                >
                  Mở Ánh xạ & Thêm trường mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = checkVarsVersionObj;
                    setCheckVarsVersionKey(null);
                    openPreviewModal(target, true);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold"
                >
                  Chạy thử trước khi duyệt
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCheckVarsVersionKey(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: FIELD MAPPING + ADD NEW CUSTOM FIELDS (Req 3)    */}
      {/* ========================================================= */}
      {mappingVersionObj && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs"
          onClick={() => setMappingVersionKey(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Ánh xạ trường & Rà soát biểu mẫu – {mappingVersionObj.templateId} v
                  {mappingVersionObj.version}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {mappingVersionObj.fileName} · Không tự xóa nội dung bắt buộc của biểu mẫu chuẩn (R06)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMappingVersionKey(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm">
              {/* Metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phân loại văn bản
                  </label>
                  <input
                    type="text"
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nguồn biểu mẫu
                  </label>
                  <input
                    type="text"
                    value={draftSource}
                    onChange={(e) => setDraftSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngày áp dụng
                  </label>
                  <input
                    type="date"
                    value={draftEffectiveDate}
                    onChange={(e) => setDraftEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Section A: Field Mappings */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      1. Bảng ánh xạ Placeholder – Tên trường – Trạng thái
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tự động nhận diện{' '}
                      <strong className="font-mono">
                        {mappingVersionObj.detectedPlaceholders.length}
                      </strong>{' '}
                      Placeholder. Nếu biểu mẫu chuẩn có biến mới ngoài 21 trường chuẩn, bấm{' '}
                      <strong>Tạo & ánh xạ trường mới</strong> ngay trên dòng đó.
                    </p>
                  </div>

                  {draftMappings.some((m) => m.targetField && !m.confirmed) && (
                    <button
                      type="button"
                      onClick={handleConfirmAllMatchedMappings}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-300 hover:bg-teal-100 text-teal-900 text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Xác nhận tất cả biến đã khớp</span>
                    </button>
                  )}
                </div>

                {customFieldFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      customFieldFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {customFieldFeedback.text}
                  </div>
                )}

                {draftMappings.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Không tìm thấy Placeholder {'{{...}}'} trong mẫu Word này (R03)</span>
                    </div>
                    <p>
                      Hãy chèn các Placeholder chuẩn như{' '}
                      <code className="font-mono bg-white px-1 rounded">{'{{companyName}}'}</code>,{' '}
                      <code className="font-mono bg-white px-1 rounded">
                        {'{{receivingAuthority}}'}
                      </code>
                      , <code className="font-mono bg-white px-1 rounded">{'{{newAddress}}'}</code>{' '}
                      vào tệp Word hoặc khai báo chuỗi văn bản cụ thể bên dưới.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-3">Placeholder</th>
                          <th className="py-2.5 px-3">Vị trí / Số lần</th>
                          <th className="py-2.5 px-3">Tên trường dữ liệu</th>
                          <th className="py-2.5 px-3 text-center">Trạng thái</th>
                          <th className="py-2.5 px-3 text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {draftMappings.map((m, idx) => {
                          const isUnregisteredNewToken =
                            m.matchType === 'PLACEHOLDER' &&
                            !m.targetField &&
                            !knownFieldKeySet.has(m.token);

                          return (
                            <tr key={`${m.token}-${idx}`}>
                              <td className="py-2.5 px-3">
                                <div className="font-mono font-semibold text-slate-900">
                                  {m.matchType === 'PLACEHOLDER' ? `{{${m.token}}}` : `"${m.token}"`}
                                </div>
                                {isUnregisteredNewToken && (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-semibold">
                                    Biến mới phát hiện
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                <span className="font-mono">{m.occurrences ?? 1}×</span>{' '}
                                {m.zones && m.zones.length > 0 && (
                                  <span className="text-[11px] text-slate-500">
                                    ({m.zones.map((z) => ZONE_LABELS[z]).join(', ')})
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 space-y-1.5">
                                <select
                                  value={m.targetField || ''}
                                  onChange={(e) => {
                                    const val = e.target.value || null;
                                    setDraftMappings((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, targetField: val } : item
                                      )
                                    );
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                                >
                                  <option value="">-- Chưa ánh xạ --</option>
                                  <optgroup label="21 Trường chuẩn V1">
                                    {standardFields21.map((f) => (
                                      <option key={f.key} value={f.key}>
                                        {f.label} ({f.placeholder})
                                      </option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="Trường mở rộng V1">
                                    {extendedFields.map((f) => (
                                      <option key={f.key} value={f.key}>
                                        {f.label} ({f.placeholder})
                                      </option>
                                    ))}
                                  </optgroup>
                                  {customFieldDefs.length > 0 && (
                                    <optgroup label="Trường bổ sung theo mẫu chuẩn">
                                      {customFieldDefs.map((c) => (
                                        <option key={c.key} value={c.key}>
                                          {c.label} ({c.placeholder})
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                                {isUnregisteredNewToken && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleQuickCreateCustomFieldFromToken(m.token, idx)
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Tạo & ánh xạ trường mới "{m.token}"</span>
                                  </button>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={m.confirmed}
                                    disabled={!m.targetField}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setDraftMappings((prev) =>
                                        prev.map((item, i) =>
                                          i === idx ? { ...item, confirmed: checked } : item
                                        )
                                      );
                                    }}
                                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                                  />
                                  <span
                                    className={
                                      m.confirmed && m.targetField
                                        ? 'text-teal-700 font-semibold'
                                        : 'text-slate-500'
                                    }
                                  >
                                    {m.confirmed && m.targetField ? 'Đạt' : 'Chờ'}
                                  </span>
                                </label>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraftMappings((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                  title="Bỏ ánh xạ này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Requirement 3: Add new custom field definition */}
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <div className="text-xs font-bold text-indigo-950">
                    Thêm trường dữ liệu mới cho biểu mẫu chuẩn (tự động hiển thị trong màn hình Tạo
                    hồ sơ)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newCustomKey}
                      onChange={(e) => setNewCustomKey(e.target.value)}
                      placeholder="Mã biến (vd: ownerBirthDate)"
                      className="sm:col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                    />
                    <input
                      type="text"
                      value={newCustomLabel}
                      onChange={(e) => setNewCustomLabel(e.target.value)}
                      placeholder="Tên hiển thị (vd: Ngày sinh chủ sở hữu)"
                      className="sm:col-span-4 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                    <input
                      type="text"
                      value={newCustomDefault}
                      onChange={(e) => setNewCustomDefault(e.target.value)}
                      placeholder="Giá trị gợi ý (tùy chọn)"
                      className="sm:col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAddCustomFieldInline()}
                      className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold whitespace-nowrap"
                    >
                      + Tạo trường
                    </button>
                  </div>
                </div>

                {/* Add explicit literal-text mapping */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Bổ sung ánh xạ chuỗi văn bản cụ thể (khi mẫu có chữ cố định cần thay)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newLiteralText}
                      onChange={(e) => setNewLiteralText(e.target.value)}
                      placeholder="Nhập chính xác chuỗi cần thay trong Word..."
                      className="sm:col-span-5 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                    <select
                      value={newLiteralField}
                      onChange={(e) => setNewLiteralField(e.target.value)}
                      className="sm:col-span-5 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      {BIZDOC_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label} ({f.placeholder})
                        </option>
                      ))}
                      {customFieldDefs.map((c) => (
                        <option key={c.key} value={c.key}>
                          [Bổ sung] {c.label} ({c.placeholder})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLiteralMapping}
                      className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold whitespace-nowrap"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* Section B: Residual old company/personal data check (R05) + Official/R16 flags */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    2. Rà soát thông tin công ty/cá nhân cũ (R05) & Phân loại mẫu (R16)
                  </h4>
                </div>

                {draftFindings.length === 0 ? (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    Bộ quét tự động không phát hiện tên công ty cũ, CCCD/MSDN hay email cố định còn
                    sót trong mẫu. Vẫn cần kiểm tra bản xem trước và tick xác nhận bên dưới.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {draftFindings.map((finding, idx) => (
                      <div
                        key={finding.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 ${
                          finding.resolved
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold">
                            [{finding.category}] Phát hiện:{' '}
                            <span className="font-mono">{finding.matchedSample}</span>
                          </div>
                          <div>{finding.description}</div>
                        </div>
                        <label className="inline-flex items-center gap-1.5 font-semibold shrink-0 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={finding.resolved}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setDraftFindings((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, resolved: checked } : f))
                              );
                            }}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>Đã xử lý / Không phải PII cũ</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs text-slate-800">
                  <input
                    type="checkbox"
                    checked={draftCleanConfirmed}
                    onChange={(e) => setDraftCleanConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    <strong>Tôi xác nhận (R05):</strong> Đã kiểm tra mẫu Word, không còn tên công
                    ty, số CCCD, chữ ký hoặc thông tin doanh nghiệp cũ nằm ngoài vùng ánh xạ.
                  </span>
                </label>

                {mappingVersionObj.templateId === 'M02' && (
                  <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer text-xs text-amber-950">
                    <input
                      type="checkbox"
                      checked={draftIsSimplified}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDraftIsSimplified(checked);
                        if (checked) setDraftIsOfficial(false);
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600"
                    />
                    <span>
                      <strong>Mẫu M02 bản rút gọn (R16):</strong> Luôn hiển thị nhãn{' '}
                      <strong>BẢN NHÁP THỰC HÀNH</strong> và không đánh dấu hồ sơ sẵn sàng nộp chính
                      thức. Bỏ chọn nếu đây là <strong>mẫu chuẩn chính thức</strong>.
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>
                  Đã xác nhận {draftMappings.filter((m) => m.confirmed && m.targetField).length}/
                  {draftMappings.length} ánh xạ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMappingVersionKey(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveMapping}
                  className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs"
                >
                  Lưu ánh xạ & Kết quả kiểm tra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
