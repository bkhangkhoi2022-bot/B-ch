import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  BizDocConfig,
  BizDocRecord,
  BizDocTemplateVersion,
  CustomFieldDefinition,
  ResidualDataFinding,
  TemplateCode,
  TemplateFieldMapping,
} from './types';
import { BIZDOC_FIELDS, createInitialConfig, normalizeFormData } from './constants';
import {
  clearAllLocalBizDocData,
  deleteRecordFromDb,
  deleteTemplateVersionFromDb,
  loadAllConfigs,
  loadAllRecords,
  loadAllTemplateVersions,
  loadTemplateBinary,
  saveConfig,
  saveRecordToDb,
  saveTemplateVersion,
} from './storage';
import { inspectDocxFile, triggerBrowserDownload } from './docxEngine';

interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

interface BizDocContextType {
  isLoading: boolean;
  storageError: string | null;
  configs: BizDocConfig[];
  currentConfig: BizDocConfig;
  templateVersions: BizDocTemplateVersion[];
  records: BizDocRecord[];

  refreshAll: () => Promise<void>;

  // Template management (F03)
  uploadTemplateDocx: (params: {
    templateId: TemplateCode;
    file: File;
    sourceLabel: string;
    effectiveDate: string;
    documentCategory?: string;
    isSimplifiedDraft?: boolean;
    isOfficialStandard?: boolean;
    notes?: string;
  }) => Promise<ActionResult<BizDocTemplateVersion>>;

  updateTemplateMappingAndAudit: (params: {
    versionKey: string;
    fieldMappings: TemplateFieldMapping[];
    residualFindings: ResidualDataFinding[];
    cleanDataConfirmed: boolean;
    isSimplifiedDraft?: boolean;
    isOfficialStandard?: boolean;
    documentCategory?: string;
    sourceLabel?: string;
    effectiveDate?: string;
    notes?: string;
  }) => Promise<ActionResult>;

  addCustomFieldDefinition: (params: {
    key: string;
    label: string;
    defaultValue?: string;
    templateId?: TemplateCode;
  }) => Promise<ActionResult<CustomFieldDefinition>>;

  approveTemplateVersion: (versionKey: string) => Promise<ActionResult>;
  deactivateTemplateVersion: (versionKey: string) => Promise<ActionResult>;
  restoreTemplateVersion: (versionKey: string) => Promise<ActionResult>;
  deleteTemplateVersion: (versionKey: string) => Promise<ActionResult>;
  downloadOriginalTemplate: (versionKey: string) => Promise<ActionResult>;
  getRecordsUsingTemplateVersion: (versionKey: string) => BizDocRecord[];
  getTemplateBinary: (versionKey: string) => Promise<ArrayBuffer | null>;

  // Record management (F01, F05)
  saveRecord: (record: BizDocRecord) => Promise<ActionResult<BizDocRecord>>;
  deleteRecord: (recordId: string) => Promise<ActionResult>;
  clearAllLocalData: () => Promise<ActionResult>;
}

const BizDocContext = createContext<BizDocContextType | null>(null);

export const BizDocProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<BizDocConfig[]>([createInitialConfig()]);
  const [templateVersions, setTemplateVersions] = useState<BizDocTemplateVersion[]>([]);
  const [records, setRecords] = useState<BizDocRecord[]>([]);

  const currentConfig = configs[configs.length - 1] || createInitialConfig();

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setStorageError(null);
    try {
      const [loadedConfigs, loadedTemplates, loadedRecords] = await Promise.all([
        loadAllConfigs(),
        loadAllTemplateVersions(),
        loadAllRecords(),
      ]);
      setConfigs(loadedConfigs);
      setTemplateVersions(loadedTemplates);
      // Backward-compatible normalization without mutating stored snapshot
      setRecords(
        loadedRecords.map((rec) => ({
          ...rec,
          data: normalizeFormData(rec.data),
        }))
      );
    } catch (err) {
      setStorageError(
        err instanceof Error ? err.message : 'Không thể đọc dữ liệu cục bộ từ IndexedDB.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /**
   * NF_MINIAPP_V2: increment integer configVersion cleanly whenever template configuration is saved.
   * Existing records keep their own configSnapshot and boundTemplateVersionKeys (R13).
   */
  const commitNewConfigVersion = async (
    updater: (prev: BizDocConfig) => BizDocConfig,
    reason: string
  ): Promise<BizDocConfig> => {
    const nextBase = updater(currentConfig);
    const nextConfig: BizDocConfig = {
      ...nextBase,
      configVersion: currentConfig.configVersion + 1,
      updatedAt: new Date().toISOString(),
      updatedReason: reason,
    };
    await saveConfig(nextConfig);
    setConfigs((prev) => [...prev, nextConfig]);
    return nextConfig;
  };

  const uploadTemplateDocx: BizDocContextType['uploadTemplateDocx'] = async ({
    templateId,
    file,
    sourceLabel,
    effectiveDate,
    documentCategory,
    isSimplifiedDraft,
    isOfficialStandard,
    notes,
  }) => {
    try {
      const buffer = await file.arrayBuffer();
      const existingCustomKeys = (currentConfig.customFieldDefinitions || []).map((c) => c.key);
      const inspection = await inspectDocxFile(
        file.name,
        file.type,
        buffer,
        templateId,
        existingCustomKeys
      );
      if (!inspection.valid) {
        // R10 / TC06: Reject invalid DOCX cleanly and keep previous saved templates untouched
        return { success: false, error: inspection.error };
      }

      const slot = currentConfig.templateSlots.find((s) => s.templateId === templateId);
      if (!slot) {
        return { success: false, error: `Không tìm thấy danh mục mẫu mã ${templateId}.` };
      }

      const existingVersions = templateVersions.filter((v) => v.templateId === templateId);
      const nextVersionNum =
        existingVersions.length > 0
          ? Math.max(...existingVersions.map((v) => v.version)) + 1
          : 1;

      const resolvedIsSimplified =
        isSimplifiedDraft !== undefined ? isSimplifiedDraft : inspection.suggestedSimplifiedM02;
      const resolvedIsOfficial =
        isOfficialStandard !== undefined
          ? isOfficialStandard && !resolvedIsSimplified
          : !resolvedIsSimplified;

      const versionKey = `${templateId}__v${nextVersionNum}`;
      const newMeta: BizDocTemplateVersion = {
        versionKey,
        templateId,
        templateName: slot.name,
        documentCategory: documentCategory || slot.documentCategory,
        version: nextVersionNum,
        // NEVER auto-approve on upload (R02 / Requirement 5)
        status: 'PENDING_REVIEW',
        isMandatoryByDefault: slot.isMandatory,
        isConditional: slot.isConditional,
        isSimplifiedDraft: resolvedIsSimplified,
        isOfficialStandard: resolvedIsOfficial,
        replacesVersionKey: slot.activeVersionKey || null,
        sourceLabel: sourceLabel.trim() || 'Người dùng tải lên cục bộ',
        effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
        uploadedAt: new Date().toISOString(),
        approvedAt: null,
        deactivatedAt: null,
        restoredAt: null,
        fileName: file.name,
        mimeType:
          file.type ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: file.size,
        detectedPlaceholders: inspection.detectedPlaceholders,
        placeholderDetails: inspection.placeholderDetails,
        fieldMappings: inspection.suggestedMappings,
        residualFindings: inspection.residualFindings,
        cleanDataConfirmed: false,
        previewHtml: inspection.previewHtml,
        hasTables: inspection.hasTables,
        hasImages: inspection.hasImages,
        hasHeaders: inspection.hasHeaders,
        hasFooters: inspection.hasFooters,
        notes: notes?.trim() || '',
      };

      await saveTemplateVersion(newMeta, buffer);

      // Requirement 2 & 5: Keep existing activeVersionKey untouched until this new version is approved!
      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          templateSlots: prev.templateSlots.map((s) => {
            if (s.templateId !== templateId) return s;
            return {
              ...s,
              latestVersionNumber: nextVersionNum,
              status: s.activeVersionKey ? s.status : 'PENDING_REVIEW',
            };
          }),
        }),
        `Tải lên mẫu ${templateId} phiên bản v${nextVersionNum} (${
          resolvedIsOfficial ? 'Mẫu chuẩn chính thức' : resolvedIsSimplified ? 'Mẫu rút gọn' : 'Mẫu mới'
        } – chờ kiểm tra & phê duyệt)`
      );

      setTemplateVersions((prev) => [newMeta, ...prev]);
      return { success: true, data: newMeta };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Lỗi khi lưu tệp mẫu Word vào bộ nhớ cục bộ IndexedDB (R12).',
      };
    }
  };

  const updateTemplateMappingAndAudit: BizDocContextType['updateTemplateMappingAndAudit'] = async ({
    versionKey,
    fieldMappings,
    residualFindings,
    cleanDataConfirmed,
    isSimplifiedDraft,
    isOfficialStandard,
    documentCategory,
    sourceLabel,
    effectiveDate,
    notes,
  }) => {
    const existing = templateVersions.find((v) => v.versionKey === versionKey);
    if (!existing) {
      return { success: false, error: 'Không tìm thấy phiên bản mẫu cần cập nhật.' };
    }

    try {
      const nextIsSimplified =
        isSimplifiedDraft !== undefined ? isSimplifiedDraft : Boolean(existing.isSimplifiedDraft);
      const nextIsOfficial =
        isOfficialStandard !== undefined
          ? isOfficialStandard && !nextIsSimplified
          : !nextIsSimplified;

      const mustRevertApproval =
        existing.status === 'APPROVED' &&
        (!cleanDataConfirmed ||
          residualFindings.some((r) => !r.resolved) ||
          fieldMappings.length === 0 ||
          fieldMappings.some((m) => !m.targetField || !m.confirmed));

      const updated: BizDocTemplateVersion = {
        ...existing,
        fieldMappings,
        residualFindings,
        cleanDataConfirmed,
        isSimplifiedDraft: nextIsSimplified,
        isOfficialStandard: nextIsOfficial,
        documentCategory: documentCategory ?? existing.documentCategory,
        sourceLabel: sourceLabel !== undefined ? sourceLabel : existing.sourceLabel,
        effectiveDate: effectiveDate !== undefined ? effectiveDate : existing.effectiveDate,
        notes: notes !== undefined ? notes : existing.notes,
        status: mustRevertApproval ? 'PENDING_REVIEW' : existing.status,
      };

      await saveTemplateVersion(updated);
      setTemplateVersions((prev) =>
        prev.map((v) => (v.versionKey === versionKey ? updated : v))
      );

      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          templateSlots: prev.templateSlots.map((s) =>
            s.activeVersionKey === versionKey && mustRevertApproval
              ? { ...s, activeVersionKey: null, status: 'PENDING_REVIEW' }
              : s
          ),
        }),
        `Lưu ánh xạ & kiểm tra biến cho mẫu ${existing.templateId} v${existing.version}`
      );

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Không thể lưu cấu hình ánh xạ mẫu.',
      };
    }
  };

  /**
   * Requirement 3: Allow adding new custom field definitions for official standard Word templates.
   */
  const addCustomFieldDefinition: BizDocContextType['addCustomFieldDefinition'] = async ({
    key,
    label,
    defaultValue,
    templateId,
  }) => {
    const cleanKey = key.trim().replace(/^\{\{\s*|\s*\}\}$/g, '');
    const cleanLabel = label.trim();

    if (!/^[a-zA-Z][a-zA-Z0-9_]{1,49}$/.test(cleanKey)) {
      return {
        success: false,
        error:
          'Mã trường mới chỉ được gồm chữ cái không dấu, số và dấu gạch dưới (bắt đầu bằng chữ cái, 2–50 ký tự).',
      };
    }
    if (!cleanLabel) {
      return { success: false, error: 'Vui lòng nhập tên hiển thị tiếng Việt cho trường mới.' };
    }

    const existsInStandard = BIZDOC_FIELDS.some((f) => f.key === cleanKey);
    const existingCustoms = currentConfig.customFieldDefinitions || [];
    const existsInCustom = existingCustoms.some((c) => c.key === cleanKey);

    if (existsInStandard || existsInCustom) {
      return {
        success: false,
        error: `Trường "{{${cleanKey}}}" đã tồn tại trong danh mục trường. Bạn có thể chọn trực tiếp từ danh sách.`,
      };
    }

    try {
      const newDef: CustomFieldDefinition = {
        key: cleanKey,
        placeholder: `{{${cleanKey}}}`,
        label: cleanLabel,
        defaultValue: defaultValue?.trim() || '',
        templateId,
        createdAt: new Date().toISOString(),
      };

      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          customFieldDefinitions: [...(prev.customFieldDefinitions || []), newDef],
        }),
        `Bổ sung trường ánh xạ mới {{${cleanKey}}} (${cleanLabel})`
      );

      return { success: true, data: newDef };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Không thể lưu trường mới vào cấu hình.',
      };
    }
  };

  const approveTemplateVersion: BizDocContextType['approveTemplateVersion'] = async (
    versionKey
  ) => {
    const target = templateVersions.find((v) => v.versionKey === versionKey);
    if (!target) {
      return { success: false, error: 'Không tìm thấy phiên bản mẫu để phê duyệt.' };
    }

    if (target.fieldMappings.length === 0) {
      return {
        success: false,
        error:
          'Không thể phê duyệt (R03): Mẫu chưa có trường dữ liệu nào được ánh xạ và xác nhận. Hãy mở bước Ánh xạ trường trước.',
      };
    }

    const unmapped = target.fieldMappings.filter((m) => !m.targetField || !m.confirmed);
    if (unmapped.length > 0) {
      return {
        success: false,
        error: `Không thể phê duyệt (R03): Còn ${unmapped.length} Placeholder chưa ánh xạ hoặc chưa xác nhận.`,
      };
    }

    const unresolvedResiduals = target.residualFindings.filter((r) => !r.resolved);
    if (unresolvedResiduals.length > 0 || !target.cleanDataConfirmed) {
      return {
        success: false,
        error:
          'Không thể phê duyệt (R05): Cần xử lý cảnh báo dữ liệu công ty/cá nhân cũ và tick xác nhận sạch dữ liệu trước khi phê duyệt.',
      };
    }

    try {
      const nowIso = new Date().toISOString();
      const updatedList: BizDocTemplateVersion[] = [];

      // Mark target APPROVED, mark older APPROVED version of same templateId as INACTIVE
      // (while preserving older binary & metadata in IndexedDB for existing records — R13 / TC09!)
      for (const item of templateVersions) {
        if (item.versionKey === versionKey) {
          const approvedItem: BizDocTemplateVersion = {
            ...item,
            status: 'APPROVED',
            approvedAt: nowIso,
          };
          await saveTemplateVersion(approvedItem);
          updatedList.push(approvedItem);
        } else if (item.templateId === target.templateId && item.status === 'APPROVED') {
          const inactiveItem: BizDocTemplateVersion = {
            ...item,
            status: 'INACTIVE',
          };
          await saveTemplateVersion(inactiveItem);
          updatedList.push(inactiveItem);
        } else {
          updatedList.push(item);
        }
      }

      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          templateSlots: prev.templateSlots.map((s) =>
            s.templateId === target.templateId
              ? {
                  ...s,
                  activeVersionKey: versionKey,
                  status: 'APPROVED',
                }
              : s
          ),
        }),
        `Phê duyệt mẫu ${target.templateId} phiên bản v${target.version}`
      );

      setTemplateVersions(updatedList);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi khi phê duyệt phiên bản mẫu.',
      };
    }
  };

  const deactivateTemplateVersion: BizDocContextType['deactivateTemplateVersion'] = async (
    versionKey
  ) => {
    const target = templateVersions.find((v) => v.versionKey === versionKey);
    if (!target) {
      return { success: false, error: 'Không tìm thấy phiên bản mẫu.' };
    }

    try {
      const nowIso = new Date().toISOString();
      const updated: BizDocTemplateVersion = {
        ...target,
        status: 'INACTIVE',
        deactivatedAt: nowIso,
      };
      await saveTemplateVersion(updated);

      const remainingForSlot = templateVersions.filter(
        (v) => v.templateId === target.templateId && v.versionKey !== versionKey
      );
      const remainingApproved = remainingForSlot.find((v) => v.status === 'APPROVED');
      const hasPending = remainingForSlot.some((v) => v.status === 'PENDING_REVIEW');

      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          templateSlots: prev.templateSlots.map((s) => {
            if (s.templateId !== target.templateId) return s;
            if (s.activeVersionKey === versionKey) {
              return {
                ...s,
                activeVersionKey: remainingApproved ? remainingApproved.versionKey : null,
                status: remainingApproved
                  ? 'APPROVED'
                  : hasPending
                  ? 'PENDING_REVIEW'
                  : 'INACTIVE',
              };
            }
            return s;
          }),
        }),
        `Ngừng sử dụng mẫu ${target.templateId} phiên bản v${target.version} (hồ sơ cũ vẫn giữ nguyên bản đã gắn)`
      );

      setTemplateVersions((prev) =>
        prev.map((v) => (v.versionKey === versionKey ? updated : v))
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi khi ngừng sử dụng mẫu.',
      };
    }
  };

  /**
   * Requirement 7: Restore a previous template version as the active APPROVED version for new dossiers.
   * Preserves the superseded version in IndexedDB so dossiers created under it remain intact (Requirement 6).
   */
  const restoreTemplateVersion: BizDocContextType['restoreTemplateVersion'] = async (
    versionKey
  ) => {
    const target = templateVersions.find((v) => v.versionKey === versionKey);
    if (!target) {
      return { success: false, error: 'Không tìm thấy phiên bản mẫu cần khôi phục.' };
    }

    const unmapped = target.fieldMappings.filter((m) => !m.targetField || !m.confirmed);
    const unresolvedResiduals = target.residualFindings.filter((r) => !r.resolved);
    if (
      target.fieldMappings.length === 0 ||
      unmapped.length > 0 ||
      unresolvedResiduals.length > 0 ||
      !target.cleanDataConfirmed
    ) {
      return {
        success: false,
        error:
          'Phiên bản này chưa hoàn tất ánh xạ trường hoặc xác nhận sạch dữ liệu (R03/R05). Hãy kiểm tra trước khi khôi phục.',
      };
    }

    try {
      const nowIso = new Date().toISOString();
      const updatedList: BizDocTemplateVersion[] = [];

      for (const item of templateVersions) {
        if (item.versionKey === versionKey) {
          const restoredItem: BizDocTemplateVersion = {
            ...item,
            status: 'APPROVED',
            approvedAt: item.approvedAt || nowIso,
            restoredAt: nowIso,
            deactivatedAt: null,
          };
          await saveTemplateVersion(restoredItem);
          updatedList.push(restoredItem);
        } else if (item.templateId === target.templateId && item.status === 'APPROVED') {
          const inactiveItem: BizDocTemplateVersion = {
            ...item,
            status: 'INACTIVE',
            deactivatedAt: nowIso,
          };
          await saveTemplateVersion(inactiveItem);
          updatedList.push(inactiveItem);
        } else {
          updatedList.push(item);
        }
      }

      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          templateSlots: prev.templateSlots.map((s) =>
            s.templateId === target.templateId
              ? {
                  ...s,
                  activeVersionKey: versionKey,
                  status: 'APPROVED',
                }
              : s
          ),
        }),
        `Khôi phục mẫu ${target.templateId} về phiên bản v${target.version}`
      );

      setTemplateVersions(updatedList);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi khi khôi phục phiên bản mẫu.',
      };
    }
  };

  const getRecordsUsingTemplateVersion = useCallback(
    (versionKey: string): BizDocRecord[] => {
      return records.filter((rec) =>
        Object.values(rec.boundTemplateVersionKeys || {}).includes(versionKey)
      );
    },
    [records]
  );

  const deleteTemplateVersion: BizDocContextType['deleteTemplateVersion'] = async (versionKey) => {
    const target = templateVersions.find((v) => v.versionKey === versionKey);
    if (!target) {
      return { success: false, error: 'Không tìm thấy phiên bản mẫu cần xóa.' };
    }

    // Requirement 2 & 6: Never delete a template version that is referenced by existing saved dossiers!
    const usedBy = getRecordsUsingTemplateVersion(versionKey);
    if (usedBy.length > 0) {
      return {
        success: false,
        error: `Không thể xóa mẫu ${target.templateId} v${target.version} vì đang được ${usedBy.length} hồ sơ cũ sử dụng (${usedBy
          .slice(0, 3)
          .map((r) => r.recordId)
          .join(', ')}). Hãy dùng chức năng "Ngừng sử dụng" để giữ nguyên dữ liệu hồ sơ cũ.`,
      };
    }

    try {
      await deleteTemplateVersionFromDb(versionKey);

      const remainingForSlot = templateVersions.filter(
        (v) => v.templateId === target.templateId && v.versionKey !== versionKey
      );
      const nextActive = remainingForSlot.find((v) => v.status === 'APPROVED') || null;
      const nextStatus = nextActive
        ? 'APPROVED'
        : remainingForSlot.some((v) => v.status === 'PENDING_REVIEW')
        ? 'PENDING_REVIEW'
        : remainingForSlot.length > 0
        ? 'INACTIVE'
        : 'MISSING';

      await commitNewConfigVersion(
        (prev) => ({
          ...prev,
          templateSlots: prev.templateSlots.map((s) =>
            s.templateId === target.templateId
              ? {
                  ...s,
                  activeVersionKey: nextActive ? nextActive.versionKey : null,
                  status: nextStatus,
                }
              : s
          ),
        }),
        `Xóa mẫu ${target.templateId} phiên bản v${target.version}`
      );

      setTemplateVersions((prev) => prev.filter((v) => v.versionKey !== versionKey));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi khi xóa phiên bản mẫu khỏi IndexedDB.',
      };
    }
  };

  const downloadOriginalTemplate: BizDocContextType['downloadOriginalTemplate'] = async (
    versionKey
  ) => {
    const target = templateVersions.find((v) => v.versionKey === versionKey);
    if (!target) {
      return { success: false, error: 'Không tìm thấy metadata của mẫu gốc.' };
    }
    try {
      const buffer = await loadTemplateBinary(versionKey);
      if (!buffer) {
        return {
          success: false,
          error: 'Không tìm thấy tệp nhị phân gốc của mẫu trong IndexedDB.',
        };
      }
      const blob = new Blob([buffer], {
        type:
          target.mimeType ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      triggerBrowserDownload(blob, target.fileName);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Không thể tải tệp mẫu gốc.',
      };
    }
  };

  const getTemplateBinary = useCallback(async (versionKey: string) => {
    return loadTemplateBinary(versionKey);
  }, []);

  const saveRecord: BizDocContextType['saveRecord'] = async (record) => {
    try {
      const updatedRecord: BizDocRecord = {
        ...record,
        updatedAt: new Date().toISOString(),
      };
      await saveRecordToDb(updatedRecord);
      setRecords((prev) => {
        const exists = prev.some((r) => r.recordId === updatedRecord.recordId);
        if (exists) {
          return prev
            .map((r) => (r.recordId === updatedRecord.recordId ? updatedRecord : r))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        }
        return [updatedRecord, ...prev];
      });
      return { success: true, data: updatedRecord };
    } catch (err) {
      // R12: Keep entered data intact and never report saved
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Lưu bản nháp vào IndexedDB thất bại (R12). Dữ liệu đang nhập vẫn được giữ nguyên để thử lại.',
      };
    }
  };

  const deleteRecord: BizDocContextType['deleteRecord'] = async (recordId) => {
    try {
      await deleteRecordFromDb(recordId);
      setRecords((prev) => prev.filter((r) => r.recordId !== recordId));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Không thể xóa bản nháp.',
      };
    }
  };

  const clearAllLocalData: BizDocContextType['clearAllLocalData'] = async () => {
    try {
      await clearAllLocalBizDocData();
      const freshConfig = createInitialConfig();
      await saveConfig(freshConfig);
      setConfigs([freshConfig]);
      setTemplateVersions([]);
      setRecords([]);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Không thể xóa dữ liệu cục bộ.',
      };
    }
  };

  return (
    <BizDocContext.Provider
      value={{
        isLoading,
        storageError,
        configs,
        currentConfig,
        templateVersions,
        records,
        refreshAll,
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
        saveRecord,
        deleteRecord,
        clearAllLocalData,
      }}
    >
      {children}
    </BizDocContext.Provider>
  );
};

export const useBizDoc = () => {
  const ctx = useContext(BizDocContext);
  if (!ctx) {
    throw new Error('useBizDoc must be used within a BizDocProvider');
  }
  return ctx;
};
