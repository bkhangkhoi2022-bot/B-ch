import React, { useState } from 'react';
import {
  FileCheck2,
  FilePlus2,
  FolderOpen,
  FileUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Database,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useBizDoc } from '../BizDocContext';
import { BizDocViewTab } from '../types';
import { LOCAL_STORAGE_RISK_NOTICE } from '../constants';

interface BizDocOverviewProps {
  onNavigateTab: (tab: BizDocViewTab, recordId?: string) => void;
}

export const BizDocOverview: React.FC<BizDocOverviewProps> = ({ onNavigateTab }) => {
  const { currentConfig, templateVersions, records, clearAllLocalData, refreshAll } = useBizDoc();
  const [clearing, setClearing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mandatorySlots = currentConfig.templateSlots.filter((s) => s.isMandatory);
  const approvedMandatoryCount = mandatorySlots.filter((s) => s.status === 'APPROVED').length;
  const approvedTotalCount = currentConfig.templateSlots.filter(
    (s) => s.status === 'APPROVED'
  ).length;
  const readyRecordsCount = records.filter(
    (r) => r.taskStatus === 'READY' || r.taskStatus === 'EXPORTED'
  ).length;

  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearLocal = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setClearing(true);
    setConfirmClear(false);
    setFeedback(null);
    const res = await clearAllLocalData();
    setClearing(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        text: 'Đã xóa sạch dữ liệu cục bộ BizDoc Mini và đưa configVersion về 1.',
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Không thể xóa dữ liệu cục bộ.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-xs font-medium text-slate-500">Phiên bản cấu hình</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            v{currentConfig.configVersion}
          </div>
          <div className="text-xs text-slate-500">
            {currentConfig.appId} · {currentConfig.contractVersion}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-xs font-medium text-slate-500">Mẫu bắt buộc (M01 / M02)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {approvedMandatoryCount} / {mandatorySlots.length}
          </div>
          <div className="text-xs text-slate-600">
            {approvedMandatoryCount === mandatorySlots.length
              ? 'Đã đủ mẫu bắt buộc được phê duyệt'
              : 'Chưa đủ mẫu phê duyệt để xuất hoàn chỉnh'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-xs font-medium text-slate-500">Tổng phiên bản mẫu Word</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {templateVersions.length}
          </div>
          <div className="text-xs text-slate-500">
            Đang áp dụng: {approvedTotalCount} / {currentConfig.templateSlots.length} loại mẫu
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-xs font-medium text-slate-500">Hồ sơ đã lưu cục bộ</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {records.length}
          </div>
          <div className="text-xs text-slate-500">
            Sẵn sàng / Đã xuất: <span className="font-mono tabular-nums">{readyRecordsCount}</span>
          </div>
        </div>
      </div>

      {/* Main 2-column horizontal workspace on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scope & Workflow Steps */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phạm vi V1: Thay đổi địa chỉ trụ sở Công ty TNHH một thành viên
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Mã Thị Bích – Dịch vụ kế toán và thuế doanh nghiệp · Lưu trữ cục bộ trên trình duyệt
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('create')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Tạo hồ sơ mới</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('templates')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <FileUp className="w-4 h-4 text-emerald-700" />
                <span>Quản lý mẫu Word</span>
              </button>
            </div>
          </div>

          {/* 4-step workflow summary */}
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  01. Tải mẫu Word (.docx) trực tiếp trong ứng dụng
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tải tệp Word từ máy tính vào danh mục M01–M04. Ứng dụng kiểm tra cấu trúc DOCX,
                  phát hiện placeholder và rà soát dữ liệu doanh nghiệp cũ trước khi cho phép dùng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('templates')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <span>Mở kho mẫu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  02. Ánh xạ trường dữ liệu & Phê duyệt phiên bản
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mẫu tải lên mặc định ở trạng thái Chờ duyệt. Chỉ mẫu đã ánh xạ đầy đủ, xác nhận
                  sạch dữ liệu cũ và được phê duyệt mới được phép xuất bộ hồ sơ hoàn chỉnh.
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  03. Nhập hồ sơ thay đổi địa chỉ & Kiểm tra quy tắc (R01–R17)
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Khai báo 21 trường dữ liệu chuẩn, địa chỉ cũ/mới, số văn bản riêng cho M01/M02,
                  chế độ thực hiện và tình trạng thuế. Có thể lưu bản nháp ngay cả khi chưa tải mẫu Word.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('create')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <span>Soạn hồ sơ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  04. Xem trước & Xuất Word (.docx) / PDF (.pdf) theo đúng configSnapshot
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Thay thật Placeholder trong đoạn văn, bảng, header và footer của tệp Word; xuất PDF
                  hỗ trợ tiếng Việt. Mỗi hồ sơ khóa đúng phiên bản mẫu tại thời điểm tạo (R13).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('records')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <span>Xem hồ sơ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Template Readiness Summary & Local Data Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Trạng thái 4 danh mục mẫu V1</h3>
              <button
                type="button"
                onClick={() => onNavigateTab('templates')}
                className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap"
              >
                Cấu hình mẫu
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {currentConfig.templateSlots.map((slot) => {
                const slotVersions = templateVersions.filter((v) => v.templateId === slot.templateId);
                const activeVer = slot.activeVersionKey
                  ? slotVersions.find((v) => v.versionKey === slot.activeVersionKey) || null
                  : null;
                const pendingCount = slotVersions.filter((v) => v.status === 'PENDING_REVIEW').length;

                return (
                  <div key={slot.templateId} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">
                        <span className="font-mono text-slate-600 mr-1.5">{slot.templateId}</span>
                        {slot.name}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {slot.isMandatory ? 'Bắt buộc' : 'Tùy điều kiện'} · Đã tải{' '}
                        <span className="font-mono">{slotVersions.length}</span> bản
                        {activeVer
                          ? ` · Đang dùng: v${activeVer.version} (${
                              activeVer.isSimplifiedDraft ? 'Rút gọn' : 'Chuẩn chính thức'
                            })`
                          : ''}
                        {pendingCount > 0 ? ` · ${pendingCount} bản chờ duyệt` : ''}
                      </div>
                    </div>
                    <span
                      className={`font-semibold shrink-0 whitespace-nowrap ${
                        slot.status === 'APPROVED'
                          ? 'text-emerald-700'
                          : slot.status === 'PENDING_REVIEW'
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {slot.status === 'APPROVED'
                        ? 'Đang sử dụng'
                        : slot.status === 'PENDING_REVIEW'
                        ? 'Chờ duyệt'
                        : slot.status === 'INACTIVE'
                        ? 'Ngừng dùng'
                        : 'Chưa tải'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local IndexedDB Safety & Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Database className="w-4 h-4 text-slate-600" />
              <span>Quản trị dữ liệu cục bộ (IndexedDB)</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{LOCAL_STORAGE_RISK_NOTICE}</p>

            <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
              <div>
                Cơ sở dữ liệu: <span className="font-mono text-slate-700">bizdoc_mini_v2_db</span>
              </div>
              <div>
                Ghi chú quản trị: Giao diện quản lý mẫu chỉ là quản trị cục bộ trong trình duyệt,
                không có xác thực hay phân quyền Admin đa người dùng và không đồng bộ sang thiết bị khác.
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={refreshAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải lại từ IndexedDB</span>
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={handleClearLocal}
                  disabled={clearing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{clearing ? 'Đang xóa...' : 'Xóa toàn bộ dữ liệu BizDoc'}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-300 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-medium text-rose-900">Xác nhận xóa sạch?</span>
                  <button
                    type="button"
                    onClick={handleClearLocal}
                    disabled={clearing}
                    className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-semibold"
                  >
                    Xóa ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 text-[11px] font-medium"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Dossiers Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Hồ sơ gần đây</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('records')}
            className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap"
          >
            Xem tất cả ({records.length})
          </button>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center space-y-2.5">
            <FileCheck2 className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">Chưa có hồ sơ nào được lưu</p>
            <p className="text-xs text-slate-500">
              Bạn có thể tạo và lưu bản nháp ngay cả khi chưa tải mẫu Word.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('create')}
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>Tạo hồ sơ đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Mã hồ sơ</th>
                  <th className="py-2.5 px-4">Tên công việc & Doanh nghiệp</th>
                  <th className="py-2.5 px-4">Cấu hình chụp</th>
                  <th className="py-2.5 px-4">Trạng thái</th>
                  <th className="py-2.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.slice(0, 5).map((rec) => (
                  <tr key={rec.recordId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      <div>{rec.recordId}</div>
                      <div className="text-[11px] text-slate-400">{rec.attemptId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {rec.data.taskName || 'Chưa đặt tên công việc'}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {rec.data.companyName || 'Chưa nhập tên DN'} ·{' '}
                        <span className="font-mono">{rec.data.companyCode || 'Chưa có MSDN'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      v{rec.configVersion}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={
                          rec.taskStatus === 'EXPORTED'
                            ? 'text-emerald-700'
                            : rec.taskStatus === 'READY'
                            ? 'text-blue-700'
                            : rec.taskStatus === 'NEEDS_REVIEW'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }
                      >
                        {rec.taskStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('create', rec.recordId)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold whitespace-nowrap"
                      >
                        Mở tiếp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
