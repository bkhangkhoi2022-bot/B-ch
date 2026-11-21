import React from 'react';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';
import { useCms } from '../context/CmsContext';

export const Footer: React.FC = () => {
  const { publishedData } = useCms();
  const brand = publishedData?.brand || websiteContext.business;

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                MB
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {brand.brandName}
              </span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Dịch vụ kế toán trọn gói và thuế doanh nghiệp. Đồng hành cùng chủ hộ kinh doanh vừa chuyển lên công ty và doanh nghiệp nhỏ tại Cao Bằng và trực tuyến toàn quốc.
            </p>

            <div className="text-slate-500 text-[11px] leading-relaxed">
              Website chính thức: <span className="text-slate-300 font-mono">{brand.website}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              Liên kết nhanh
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#dich-vu" className="hover:text-emerald-400 transition-colors">
                  Dịch vụ kế toán trọn gói (V1 – V8)
                </a>
              </li>
              <li>
                <a href="#quy-trinh" className="hover:text-emerald-400 transition-colors">
                  Quy trình phối hợp 6 bước
                </a>
              </li>
              <li>
                <a href="#bang-phi" className="hover:text-emerald-400 transition-colors">
                  Bảng phí dịch vụ minh bạch
                </a>
              </li>
              <li>
                <a href="#khao-sat" className="hover:text-emerald-400 transition-colors">
                  Khảo sát nhu cầu tương tác
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Hỏi đáp thường gặp (FAQ)
                </a>
              </li>
              <li className="pt-1.5 border-t border-slate-800">
                <a href="/admin" className="text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cổng quản trị (/admin)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              Thông tin liên hệ
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Thành phố Cao Bằng, Tỉnh Cao Bằng (Hỗ trợ trực tuyến toàn quốc)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Hotline / Zalo: {websiteContext.business.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Email: {websiteContext.business.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <p className="leading-relaxed">
            * <strong>Ghi chú chuyên môn:</strong> Dịch vụ kế toán và kê khai thuế được thực hiện trên cơ sở hóa đơn, chứng từ hợp pháp và thông tin trung thực do doanh nghiệp cung cấp theo phạm vi hợp đồng thỏa thuận. Kế toán không cam kết tránh mọi rủi ro thuế nếu doanh nghiệp cung cấp thông tin không đầy đủ hoặc không đúng thực tế.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              © 2026 {brand.brandName}. Bản quyền thuộc về thương hiệu dịch vụ kế toán {brand.website}.
            </div>
            <div className="text-slate-600">
              Thiết kế chuẩn hóa giao diện chuyển đổi Smart Website BCM 1.0
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
