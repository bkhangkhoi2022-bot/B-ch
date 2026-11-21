import React, { useState } from 'react';
import { 
  Eye, 
  Save, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { CmsPreviewModal } from './CmsPreviewModal';
import { CmsPublishModal } from './CmsPublishModal';

export const CmsToolbar: React.FC = () => {
  const { 
    hasUnsavedChanges, 
    lastSavedAt, 
    lastPublishedAt, 
    saveDraft, 
    publishDraft,
    discardDraft 
  } = useCms();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveDraft = () => {
    const result = saveDraft();
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleConfirmPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      const result = publishDraft();
      setIsPublishing(false);
      setPublishModalOpen(false);
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    }, 400);
  };

  const handleDiscard = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy bỏ các thay đổi nháp và khôi phục về bản đang xuất bản không?")) {
      discardDraft();
      showToast("Đã khôi phục về nội dung bản xuất bản gần nhất", 'info');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        
        {/* Top line: Title & 3 Essential Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                CMS - Quản trị website
              </h1>
              {hasUnsavedChanges ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Có bản nháp chưa xuất bản
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Đã xuất bản
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý nội dung website, bản nháp và xuất bản trực tiếp lên trang chủ.
            </p>
          </div>

          {/* 3 Prominent Toolbar Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* 1. XEM TRƯỚC */}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
              title="Xem trước website với bản nháp mới nhất"
            >
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Xem trước</span>
            </button>

            {/* 2. LƯU NHÁP */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              title="Lưu dữ liệu chỉnh sửa vào bộ nhớ nháp"
            >
              <Save className="w-4 h-4" />
              <span>Lưu nháp</span>
            </button>

            {/* 3. XUẤT BẢN */}
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors"
              title="Xuất bản nội dung lên website công khai"
            >
              <Send className="w-4 h-4" />
              <span>Xuất bản</span>
            </button>

          </div>

        </div>

        {/* Bottom meta strip: Timestamps and discard options */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Lưu nháp gần nhất: <strong>{lastSavedAt || 'Chưa lưu nháp mới'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Xuất bản gần nhất: <strong>{lastPublishedAt || 'Mặc định BCM 1.0'}</strong>
              </span>
            </div>
          </div>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hủy thay đổi nháp</span>
            </button>
          )}
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div 
            className={`p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all ${
              toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
              toastMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border border-rose-200' :
              'bg-blue-50 text-blue-900 border border-blue-200'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

      </div>

      {/* Preview Modal */}
      <CmsPreviewModal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
      />

      {/* Publish Confirmation Modal */}
      <CmsPublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        isPublishing={isPublishing}
      />
    </>
  );
};
