import React, { useState } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';
import { useCms } from '../context/CmsContext';

interface HeaderProps {
  onOpenChecklist: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenChecklist }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { publishedData } = useCms();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Single element brand wordmark */}
          <a href="#" className="flex items-center gap-3 whitespace-nowrap shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-semibold text-sm shadow-xs transition-transform group-hover:scale-105">
              MB
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                {publishedData?.brand?.brandName || websiteContext.business.brandName}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">
                {publishedData?.brand?.title || "Kế toán & Thuế Doanh nghiệp"}
              </span>
            </div>
          </a>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a 
              href="#dich-vu" 
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Dịch vụ trọn gói
            </a>
            <a 
              href="#quy-trinh" 
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Quy trình 6 bước
            </a>
            <a 
              href="#bang-phi" 
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Bảng phí minh bạch
            </a>
            <a 
              href="#khao-sat" 
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Khảo sát nhu cầu
            </a>
            <a 
              href="#faq" 
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Hỏi đáp FAQ
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenChecklist}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Checklist khởi đầu
            </button>
            <a
              href="#lien-he"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Nhận tư vấn ngay</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-hidden"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-base font-medium text-slate-700">
            <a
              href="#dich-vu"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Dịch vụ trọn gói
            </a>
            <a
              href="#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Quy trình 6 bước
            </a>
            <a
              href="#bang-phi"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Bảng phí minh bạch
            </a>
            <a
              href="#khao-sat"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Khảo sát nhu cầu
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-emerald-700"
            >
              Hỏi đáp FAQ
            </a>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChecklist();
              }}
              className="w-full text-center py-2.5 px-4 text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Xem Checklist hồ sơ ban đầu (Miễn phí)
            </button>
            <a
              href="#lien-he"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Nhận tư vấn ngay
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
