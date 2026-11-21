import {
  BizDocConfig,
  BizDocFormData,
  BizDocTemplateVersion,
  ConflictNotice,
  CustomFieldDefinition,
  TemplateReadinessItem,
  ValidationIssue,
  ValidationSummary,
} from './types';
import { BIZDOC_FIELDS, REQUIRED_PLACEHOLDERS_BY_TEMPLATE } from './constants';

/**
 * R14: 0 and false are valid values, distinct from null, undefined, or empty/unselected string.
 */
export const isValueMissing = (val: unknown): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === 'number') return Number.isNaN(val);
  if (typeof val === 'boolean') return false;
  if (typeof val === 'string') return val.trim().length === 0;
  return false;
};

/**
 * Check missing required placeholders for a specific template version (R03).
 */
export const getMissingRequiredPlaceholders = (
  template: BizDocTemplateVersion
): string[] => {
  const expected = REQUIRED_PLACEHOLDERS_BY_TEMPLATE[template.templateId] || [];
  if (expected.length === 0) return [];

  const mappedTargets = new Set(
    template.fieldMappings
      .filter((m) => m.targetField !== null)
      .map((m) => m.targetField as string)
  );

  return expected.filter((fieldKey) => !mappedTargets.has(fieldKey));
};

/**
 * Detect factual/procedural conflicts so the app NEVER silently picks one over another (Ràng buộc tài liệu).
 */
export const detectFormConflicts = (
  data: BizDocFormData,
  templateVersions: BizDocTemplateVersion[],
  boundKeys: Record<string, string>
): ConflictNotice[] => {
  const conflicts: ConflictNotice[] = [];

  // 1. Same document number accidentally assigned to both M01 and M02 (Section 5 rule)
  const m01Num = (data.documentNumbers?.M01 || '').trim();
  const m02Num = (data.documentNumbers?.M02 || '').trim();
  if (m01Num && m02Num && m01Num.toLowerCase() === m02Num.toLowerCase()) {
    conflicts.push({
      id: 'conflict-doc-number',
      title: 'Trùng số văn bản giữa M01 và M02',
      description: `Số văn bản M01 ("${m01Num}") đang trùng với M02 ("${m02Num}"). Quy định yêu cầu để riêng số văn bản cho từng tài liệu — hãy điều chỉnh hoặc xác nhận rõ.`,
    });
  }

  // 2. ADMIN_ADDRESS_UPDATE (chỉ cập nhật địa giới hành chính) vs taxNoticeAddressChange === 'YES'
  if (
    data.procedureMode === 'ADMIN_ADDRESS_UPDATE' &&
    (data.taxNoticeAddressChange === 'YES' || data.taxAuthorityChanged === 'YES')
  ) {
    conflicts.push({
      id: 'conflict-procedure-tax',
      title: 'Mâu thuẫn giữa loại thủ tục địa giới và thay đổi cơ quan thuế',
      description:
        'Bạn chọn "Cập nhật địa chỉ do thay đổi địa giới hành chính" (ADMIN_ADDRESS_UPDATE) nhưng đồng thời chọn "Có thay đổi cơ quan thuế quản lý" (YES). Hãy xác minh lại loại thủ tục thực tế.',
    });
  }

  // 3. New address full text vs newProvince mismatch when both entered
  const fullNewAddr = (data.newAddress || '').trim().toLowerCase();
  const prov = (data.newProvince || '').trim().toLowerCase();
  if (
    fullNewAddr.length > 0 &&
    prov.length >= 3 &&
    !fullNewAddr.includes(prov)
  ) {
    conflicts.push({
      id: 'conflict-address-province',
      title: 'Địa chỉ trụ sở mới đầy đủ chưa khớp Tỉnh/Thành phố mới',
      description: `Địa chỉ mới ("${data.newAddress}") chưa thấy chứa tên Tỉnh/Thành phố mới ("${data.newProvince}"). Hãy kiểm tra lại để tránh mâu thuẫn giữa {{newAddress}} và {{newProvince}}.`,
    });
  }

  // 4. Template M02 simplified draft vs procedureMode ready
  const m02Key = boundKeys.M02;
  const m02Ver = m02Key ? templateVersions.find((v) => v.versionKey === m02Key) : null;
  if (m02Ver?.isSimplifiedDraft) {
    conflicts.push({
      id: 'conflict-m02-simplified',
      title: 'Mẫu M02 đang là bản rút gọn (BẢN NHÁP THỰC HÀNH – R16)',
      description:
        'Mẫu M02 hiện tại được đánh dấu là bản rút gọn. Không được coi đây là mẫu chính thức đủ điều kiện nộp cơ quan đăng ký kinh doanh.',
    });
  }

  return conflicts;
};

/**
 * Evaluate unified BizDoc Mini V1 rules (R01–R17).
 * Single source of truth used by both Dossier Form and Admin/Template readiness panels.
 */
export const evaluateBizDocRules = (params: {
  data: BizDocFormData;
  confirmedByUser: boolean;
  conflictsConfirmedByUser?: boolean;
  configSnapshot: BizDocConfig;
  boundTemplateVersionKeys: Record<string, string>;
  allTemplateVersions: BizDocTemplateVersion[];
}): ValidationSummary => {
  const {
    data,
    confirmedByUser,
    conflictsConfirmedByUser = false,
    configSnapshot,
    boundTemplateVersionKeys,
    allTemplateVersions,
  } = params;

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const missingRequiredFields: string[] = [];

  const registerMissing = (fieldKey: string, label: string, ruleId: string, hint?: string) => {
    missingRequiredFields.push(`${label} (${fieldKey})`);
    errors.push({
      ruleId,
      severity: 'ERROR',
      field: fieldKey,
      message: `Thiếu trường bắt buộc: ${label} (${fieldKey}).`,
      actionHint: hint,
    });
  };

  // Scope V1 check
  if (data.companyType !== 'TNHH_MOT_THANH_VIEN') {
    errors.push({
      ruleId: 'R03',
      severity: 'ERROR',
      field: 'companyType',
      message:
        'Loại hình doanh nghiệp nằm ngoài phạm vi V1 (chỉ hỗ trợ Công ty TNHH một thành viên).',
      actionHint: 'Chọn đúng loại hình Công ty TNHH một thành viên.',
    });
  }

  // Required text fields from Section 5 table (R03, R08, R14)
  if (isValueMissing(data.companyName)) {
    registerMissing('companyName', 'Tên doanh nghiệp', 'R03', 'Nhập tên doanh nghiệp theo GCN ĐKDN.');
  }

  if (isValueMissing(data.companyCode)) {
    registerMissing('companyCode', 'Mã số doanh nghiệp', 'R03', 'Nhập mã số doanh nghiệp 10 hoặc 13 chữ số.');
  } else {
    const cleanCode = data.companyCode.replace(/\s+/g, '');
    if (!/^[0-9]{10}(-[0-9]{3})?$|^[0-9]{13}$/.test(cleanCode)) {
      errors.push({
        ruleId: 'R03',
        severity: 'ERROR',
        field: 'companyCode',
        message: 'Mã số doanh nghiệp chưa đúng định dạng 10 hoặc 13 chữ số.',
      });
    }
  }

  if (isValueMissing(data.oldAddress)) {
    registerMissing('oldAddress', 'Địa chỉ trụ sở cũ', 'R03', 'Nhập địa chỉ trụ sở cũ hiện hành.');
  }

  if (isValueMissing(data.newAddress)) {
    registerMissing(
      'newAddress',
      'Địa chỉ trụ sở mới',
      'R03',
      'Nhập đầy đủ địa chỉ trụ sở mới; chặn xuất hồ sơ hoàn chỉnh khi để trống (TC05).'
    );
  }

  if (isValueMissing(data.newAddressDetail)) {
    registerMissing('newAddressDetail', 'Số nhà, đường phố mới', 'R03');
  }

  if (isValueMissing(data.newWard)) {
    registerMissing('newWard', 'Phường / Xã mới', 'R03');
  }

  if (isValueMissing(data.newProvince)) {
    registerMissing('newProvince', 'Tỉnh / Thành phố mới', 'R03');
  }

  // R08: Receiving authority must NOT be invented if blank
  if (isValueMissing(data.receivingAuthority)) {
    missingRequiredFields.push('Cơ quan tiếp nhận (receivingAuthority)');
    errors.push({
      ruleId: 'R08',
      severity: 'ERROR',
      field: 'receivingAuthority',
      message:
        'Chưa xác định Cơ quan tiếp nhận hồ sơ (R08). Hệ thống không tự tạo tên cơ quan.',
      actionHint: 'Nhập chính xác tên cơ quan tiếp nhận ghi tại dòng Kính gửi.',
    });
  }

  if (isValueMissing(data.ownerDecisionSigner)) {
    registerMissing('ownerDecisionSigner', 'Người ký Quyết định chủ sở hữu', 'R03');
  }

  if (isValueMissing(data.applicationSigner)) {
    registerMissing('applicationSigner', 'Người ký Giấy đề nghị thay đổi', 'R03');
  }

  if (isValueMissing(data.applicationSignerTitle)) {
    registerMissing('applicationSignerTitle', 'Chức danh người ký đề nghị', 'R03');
  }

  // Separate document numbers for mandatory templates M01 and M02 (Section 5)
  if (isValueMissing(data.documentNumbers?.M01)) {
    registerMissing('documentNumbers.M01', 'Số văn bản Mẫu M01', 'R03', 'Nhập số Quyết định riêng cho M01.');
  }
  if (isValueMissing(data.documentNumbers?.M02)) {
    registerMissing('documentNumbers.M02', 'Số văn bản Mẫu M02', 'R03', 'Nhập số Giấy đề nghị riêng cho M02.');
  }

  if (isValueMissing(data.signingPlace)) {
    registerMissing('signingPlace', 'Địa danh ký văn bản', 'R03');
  }

  if (isValueMissing(data.documentDay) || isValueMissing(data.documentMonth) || isValueMissing(data.documentYear)) {
    registerMissing(
      'documentDay/Month/Year',
      'Ngày / Tháng / Năm văn bản',
      'R03',
      'Nhập đủ ngày, tháng, năm lập văn bản.'
    );
  }

  // Conditional owner organization check
  if (data.ownerType === 'ORGANIZATION') {
    if (isValueMissing(data.ownerIdentifier)) {
      registerMissing('ownerIdentifier', 'Mã số DN / QĐ tổ chức chủ sở hữu', 'R03');
    }
    if (isValueMissing(data.ownerOrganizationAuthorizedPerson)) {
      registerMissing('ownerOrganizationAuthorizedPerson', 'Người đại diện tổ chức chủ sở hữu', 'R03');
    }
  }

  // Conditional M04 check
  if (data.includeM04Authorization && isValueMissing(data.authorizedPersonName)) {
    registerMissing('authorizedPersonName', 'Người được ủy quyền nộp hồ sơ (M04)', 'R03');
  }

  // R17: Procedure mode must be explicitly determined (CHANGE_ADDRESS or ADMIN_ADDRESS_UPDATE)
  if (isValueMissing(data.procedureMode)) {
    missingRequiredFields.push('Loại thủ tục địa chỉ (procedureMode)');
    errors.push({
      ruleId: 'R17',
      severity: 'ERROR',
      field: 'procedureMode',
      message:
        'Chưa xác định loại thủ tục: chuyển địa chỉ thực tế (CHANGE_ADDRESS) hay cập nhật do thay đổi địa giới hành chính (ADMIN_ADDRESS_UPDATE) – R17.',
      actionHint: 'Chọn đúng loại thủ tục trong nhóm Thông tin công ty trước khi đánh dấu sẵn sàng nộp.',
    });
  }

  // R09: Tax notice address change check
  const taxNotice = data.taxNoticeAddressChange || data.taxAuthorityChanged || 'UNKNOWN';
  if (taxNotice === 'UNKNOWN') {
    warnings.push({
      ruleId: 'R09',
      severity: 'WARNING',
      field: 'taxNoticeAddressChange',
      message:
        'Chưa làm rõ có thay đổi cơ quan thuế quản lý hay không (UNKNOWN – R09). Trạng thái hồ sơ: Cần kiểm tra.',
      actionHint: 'Xác minh lại cơ quan thuế quản lý (YES hoặc NO) trước khi đánh dấu sẵn sàng nộp.',
    });
  } else if (taxNotice === 'YES' && data.taxProcedureStatus !== 'COMPLETED') {
    warnings.push({
      ruleId: 'R09',
      severity: 'WARNING',
      field: 'taxProcedureStatus',
      message:
        'Có thay đổi cơ quan thuế quản lý nhưng thủ tục thuế chưa hoàn tất (R09). Trạng thái hồ sơ: Cần kiểm tra.',
      actionHint: 'Hoàn tất thủ tục thuế chuyển địa chỉ trước khi nộp hồ sơ đăng ký doanh nghiệp.',
    });
  }

  // User confirmation check (R07)
  if (confirmedByUser === false) {
    warnings.push({
      ruleId: 'R07',
      severity: 'WARNING',
      field: 'confirmedByUser',
      message:
        'Chưa tick xác nhận thông tin đã kiểm tra (R07). Bạn vẫn có thể lưu bản nháp và xem trước.',
    });
  }

  // Conflicts check
  const conflicts = detectFormConflicts(data, allTemplateVersions, boundTemplateVersionKeys);
  const nonM02Conflicts = conflicts.filter((c) => c.id !== 'conflict-m02-simplified');
  if (nonM02Conflicts.length > 0 && !conflictsConfirmedByUser) {
    warnings.push({
      ruleId: 'CONFLICT',
      severity: 'WARNING',
      message: `Phát hiện ${nonM02Conflicts.length} điểm mâu thuẫn dữ liệu cần người dùng kiểm tra và xác nhận.`,
      actionHint: 'Xem khung Cảnh báo mâu thuẫn ở nhóm Kiểm tra và xuất hồ sơ.',
    });
  }

  // Templates readiness evaluation (R01, R02, R03, R05, R16)
  let hasSimplifiedM02PracticeDraft = false;

  const templateReadiness: TemplateReadinessItem[] = configSnapshot.templateSlots.map((slot) => {
    const requiredForThisRecord =
      slot.isMandatory ||
      (slot.templateId === 'M03' && data.includeM03BeneficialOwner) ||
      (slot.templateId === 'M04' && data.includeM04Authorization);

    const boundKey = boundTemplateVersionKeys[slot.templateId] || slot.activeVersionKey;
    // Also fallback to latest uploaded PENDING_REVIEW version ONLY for draft preview (R02), never for official export
    const latestPendingForSlot = allTemplateVersions.find(
      (v) => v.templateId === slot.templateId && v.status === 'PENDING_REVIEW'
    );

    const versionObj = boundKey
      ? allTemplateVersions.find((v) => v.versionKey === boundKey) || null
      : latestPendingForSlot || null;

    const blockingReasons: string[] = [];

    if (!versionObj) {
      if (requiredForThisRecord) {
        blockingReasons.push(`Chưa tải mẫu Word ${slot.templateId} (R01).`);
        errors.push({
          ruleId: 'R01',
          severity: 'ERROR',
          templateId: slot.templateId,
          message: `Chưa tải mẫu bắt buộc ${slot.templateId} – ${slot.name} (R01). Không cho xuất hồ sơ hoàn chỉnh.`,
          actionHint: 'Vào mục Quản lý mẫu Word để tải tệp .docx và phê duyệt.',
        });
      }
      return {
        templateId: slot.templateId,
        templateName: slot.name,
        requiredForThisRecord,
        status: 'MISSING',
        versionNumber: null,
        versionKey: null,
        isSimplifiedDraft: false,
        canPreviewDraft: false,
        readyToExport: false,
        missingRequiredPlaceholders: [],
        blockingReasons,
      };
    }

    const isSimplified = Boolean(versionObj.isSimplifiedDraft);
    if (slot.templateId === 'M02' && isSimplified && requiredForThisRecord) {
      hasSimplifiedM02PracticeDraft = true;
      warnings.push({
        ruleId: 'R16',
        severity: 'WARNING',
        templateId: 'M02',
        message:
          'Mẫu M02 là bản rút gọn – luôn hiển thị trạng thái BẢN NHÁP THỰC HÀNH (R16). Không coi là mẫu chính thức đủ điều kiện nộp.',
        actionHint: 'Tải và phê duyệt mẫu M02 đầy đủ theo quy định trước khi nộp hồ sơ thật.',
      });
    }

    // Requirement 6 / R13: If an older dossier ALREADY bound this version when it was APPROVED,
    // replacing or deactivating that version later for NEW dossiers must NOT break the old dossier.
    const isExplicitlyBoundToThisRecord =
      boundTemplateVersionKeys[slot.templateId] === versionObj.versionKey;
    const isHistoricalBoundVersion =
      isExplicitlyBoundToThisRecord &&
      versionObj.status === 'INACTIVE' &&
      (versionObj.approvedAt !== null ||
        (slot.activeVersionKey === versionObj.versionKey && slot.status === 'APPROVED'));

    // R02: Unapproved or newly-inactive template only allows draft check (or blocks complete export)
    if (versionObj.status !== 'APPROVED' && !isHistoricalBoundVersion) {
      if (requiredForThisRecord) {
        const statusReason =
          versionObj.status === 'INACTIVE'
            ? `Mẫu ${slot.templateId} v${versionObj.version} đã ngừng sử dụng cho hồ sơ mới.`
            : `Mẫu ${slot.templateId} v${versionObj.version} chưa được phê duyệt (R02) – chỉ cho kiểm tra bản nháp.`;
        blockingReasons.push(statusReason);
        errors.push({
          ruleId: 'R02',
          severity: 'ERROR',
          templateId: slot.templateId,
          message:
            versionObj.status === 'INACTIVE'
              ? `Mẫu ${slot.templateId} (v${versionObj.version}) đã ngừng sử dụng. Hãy khôi phục hoặc phê duyệt phiên bản mẫu mới.`
              : `Mẫu ${slot.templateId} (v${versionObj.version}) chưa được phê duyệt (R02). Chỉ cho phép kiểm tra bản nháp.`,
          actionHint: 'Vào Quản lý mẫu Word -> Ánh xạ trường -> Kiểm tra biến -> Phê duyệt.',
        });
      }
    }

    // R03: Missing required placeholders inside the template
    const missingRequiredPlaceholders = getMissingRequiredPlaceholders(versionObj);
    if (missingRequiredPlaceholders.length > 0 && requiredForThisRecord) {
      const labels = missingRequiredPlaceholders.map((k) => `{{${k}}}`).join(', ');
      warnings.push({
        ruleId: 'R03',
        severity: 'WARNING',
        templateId: slot.templateId,
        message: `Mẫu ${slot.templateId} chưa có ánh xạ các Placeholder khuyến nghị: ${labels} (R03).`,
        actionHint: 'Mở Kiểm tra biến trong Quản lý mẫu Word để rà soát các trường thiếu.',
      });
    }

    // Unmapped or unconfirmed mappings check
    const unmappedTokens = versionObj.fieldMappings.filter((m) => !m.targetField || !m.confirmed);
    if (versionObj.fieldMappings.length === 0) {
      if (requiredForThisRecord) {
        blockingReasons.push(`Mẫu ${slot.templateId} chưa có ánh xạ trường dữ liệu nào (R03).`);
        errors.push({
          ruleId: 'R03',
          severity: 'ERROR',
          templateId: slot.templateId,
          message: `Mẫu ${slot.templateId} chưa phát hiện hoặc chưa ánh xạ trường dữ liệu nào (R03).`,
        });
      }
    } else if (unmappedTokens.length > 0 && requiredForThisRecord) {
      blockingReasons.push(
        `Còn ${unmappedTokens.length} Placeholder trong mẫu ${slot.templateId} chưa ánh xạ hoặc chưa xác nhận (R03).`
      );
      errors.push({
        ruleId: 'R03',
        severity: 'ERROR',
        templateId: slot.templateId,
        message: `Mẫu ${slot.templateId} còn ${unmappedTokens.length} vị trí chưa ánh xạ hoặc chưa xác nhận.`,
      });
    }

    // R05: Residual personal / old company data check
    const unresolvedResiduals = versionObj.residualFindings.filter((r) => !r.resolved);
    if ((unresolvedResiduals.length > 0 || !versionObj.cleanDataConfirmed) && requiredForThisRecord) {
      blockingReasons.push(
        `Mẫu ${slot.templateId} còn cảnh báo thông tin doanh nghiệp/cá nhân cũ chưa xử lý (R05).`
      );
      errors.push({
        ruleId: 'R05',
        severity: 'ERROR',
        templateId: slot.templateId,
        message: `Mẫu ${slot.templateId} còn thông tin công ty hoặc cá nhân cũ chưa được xử lý/xác nhận (R05).`,
        actionHint: 'Mở Quản lý mẫu Word -> Kiểm tra biến / Ánh xạ trường để xử lý và xác nhận sạch.',
      });
    }

    return {
      templateId: slot.templateId,
      templateName: slot.name,
      requiredForThisRecord,
      status: versionObj.status,
      versionNumber: versionObj.version,
      versionKey: versionObj.versionKey,
      isSimplifiedDraft: isSimplified,
      isHistoricalBoundVersion,
      canPreviewDraft:
        versionObj.status === 'APPROVED' ||
        versionObj.status === 'PENDING_REVIEW' ||
        isHistoricalBoundVersion,
      readyToExport:
        requiredForThisRecord
          ? blockingReasons.length === 0
          : versionObj.status === 'APPROVED' || isHistoricalBoundVersion,
      missingRequiredPlaceholders,
      blockingReasons,
    };
  });

  const hasTaxWarning = warnings.some((w) => w.ruleId === 'R09');
  const hasUnconfirmedConflict = nonM02Conflicts.length > 0 && !conflictsConfirmedByUser;

  // Draft check (R02): allowed whenever at least one required template has an uploaded file
  const canGenerateDraftCheck = templateReadiness.some(
    (t) => t.requiredForThisRecord && t.canPreviewDraft
  );

  // Complete export: zero blocking errors (R01, R02, R03, R05, R08, R17), user confirmed (R07), no tax warning (R09), no unconfirmed conflicts
  const canExportComplete =
    errors.length === 0 &&
    confirmedByUser === true &&
    !hasTaxWarning &&
    !hasUnconfirmedConflict;

  // R16: If M02 is simplified draft, NEVER mark officially ready to submit
  const canMarkOfficialReady = canExportComplete && !hasSimplifiedM02PracticeDraft;

  let computedStatus: ValidationSummary['computedStatus'] = 'DRAFT';
  if (confirmedByUser === false) {
    computedStatus = 'DRAFT';
  } else if (errors.length > 0 || hasTaxWarning || hasUnconfirmedConflict || hasSimplifiedM02PracticeDraft) {
    computedStatus = 'NEEDS_REVIEW';
  } else {
    computedStatus = 'READY';
  }

  return {
    canSaveDraft: true,
    canGenerateDraftCheck,
    canExportComplete,
    canMarkOfficialReady,
    hasSimplifiedM02PracticeDraft,
    computedStatus,
    missingRequiredFields,
    errors,
    warnings,
    conflicts,
    templateReadiness,
  };
};

export const getFieldLabel = (
  key: string,
  customFieldDefinitions?: CustomFieldDefinition[]
): string => {
  const found = BIZDOC_FIELDS.find((f) => f.key === key);
  if (found) return found.label;
  const custom = customFieldDefinitions?.find((f) => f.key === key);
  if (custom) return custom.label;
  return key;
};
