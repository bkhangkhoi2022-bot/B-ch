import React, { useState } from 'react';
import { X, CheckSquare, Square, Printer, Copy, Check, FileSpreadsheet, Download } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({ isOpen, onClose }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyChecklist = () => {
    const text = websiteContext.starterChecklist.map((group) => {
      const itemsText = group.items.map((it) => `- ${it}`).join('\n');
      return `### ${group.group}\n${itemsText}`;
    }).join('\n\n');

    navigator.clipboard.writeText(`CHECKLIST HỒ SƠ & CHỨNG TỪ BAN ĐẦU CHO DOANH NGHIỆP MỚI (Mã Thị Bích - quybich.vn)\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checklist-title"
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/90 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="checklist-title" className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                Checklist 5 Nhóm Hồ Sơ & Chứng Từ Khởi Đầu
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Dành cho chủ hộ kinh doanh vừa chuyển lên công ty (Tài liệu miễn phí)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm">
          
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 flex items-start gap-3">
            <span className="font-bold text-xs uppercase bg-emerald-200/80 px-2 py-0.5 rounded shrink-0">
              Mục đích
            </span>
            <p className="text-xs leading-relaxed">
              Bạn có thể tự tích chọn vào các mục bên dưới để kiểm tra những hồ sơ mình đã chuẩn bị đủ và những phần cần trao đổi với kế toán để hoàn thiện sớm, tránh bị động khi cơ quan thuế yêu cầu.
            </p>
          </div>

          <div className="space-y-6">
            {websiteContext.starterChecklist.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>{group.group}</span>
                </h3>

                <ul className="space-y-2">
                  {group.items.map((item, itemIdx) => {
                    const key = `${groupIdx}-${itemIdx}`;
                    const isChecked = !!checkedItems[key];
                    return (
                      <li
                        key={itemIdx}
                        onClick={() => toggleItem(key)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-emerald-50/60 border-emerald-200 text-slate-900' 
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 text-emerald-700 shrink-0">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </div>
                        <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                          {item}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyChecklist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Checklist</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#lien-he"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              Tư vấn những phần chưa có
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
