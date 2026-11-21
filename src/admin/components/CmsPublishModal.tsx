import React from 'react';
import { X, Send, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

interface CmsPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
}

export const CmsPublishModal: React.FC<CmsPublishModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
}) => {
  const { draftData } = useCms();

  if (!isOpen) return null;

  const visibleServicesCount = draftData.services.filter(s => s.isVisible).length;
  const visibleFaqsCount = draftData.faqs.filter(f => f.isVisible).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Xác nhận Xuất bản Website
              </h2>
              <p className="text-xs text-slate-500">
                Chuyển dữ liệu bản nháp thành dữ liệu công khai chính thức
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm text-slate-700">
          
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Kiểm tra tính hợp lệ dữ liệu:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-900 pl-6 list-disc">
              <li>Tiêu đề chính (Hero Headline): Hợp lệ ({draftData.hero.headline.slice(0, 35)}...)</li>
              <li>Tên thương hiệu: {draftData.brand.brandName}</li>
              <li>Dịch vụ hiển thị công khai: {visibleServicesCount} dịch vụ</li>
              <li>Câu hỏi FAQ hiển thị: {visibleFaqsCount} câu hỏi</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Lưu ý quan trọng:</strong> Sau khi xác nhận, toàn bộ khách truy cập trang chủ <code>quybich.vn</code> sẽ ngay lập tức nhìn thấy phiên bản nội dung mới này.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {isPublishing ? (
              <span>Đang xuất bản...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Xác nhận xuất bản ngay</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
