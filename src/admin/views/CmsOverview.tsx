import React from 'react';
import { 
  PanelsTopLeft, 
  Briefcase, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  FileCheck2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Link } from '../../router';
import { CmsToolbar } from '../components/CmsToolbar';
import { useCms } from '../../context/CmsContext';

export const CmsOverview: React.FC = () => {
  const { draftData, publishedData, hasUnsavedChanges } = useCms();

  const cards = [
    {
      id: 'homepage',
      title: 'Quản trị trang chủ (Section Builder)',
      path: '/admin/cms/homepage',
      icon: <PanelsTopLeft className="w-6 h-6 text-emerald-600" />,
      description: 'Mô hình Section Builder: quản lý độc lập 11 khối nội dung (Header, Hero, Nỗi đau, Dịch vụ, Quy trình, Bảng phí, Khảo sát, Năng lực, FAQ, Liên hệ, Footer) với thao tác Ẩn/Hiện và Đổi thứ tự.',
      countLabel: `${draftData.sections?.length || 11} Section độc lập`,
      bgColor: 'hover:border-emerald-300',
    },
    {
      id: 'services',
      title: 'Quản lý dịch vụ',
      path: '/admin/cms/services',
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      description: 'Quản lý danh mục 8 giá trị cốt lõi (V1 – V8) trong gói Kế toán trọn gói, thêm/sửa dịch vụ bổ trợ, ẩn/hiện và sắp xếp thứ tự.',
      countLabel: `${draftData.services.length} dịch vụ hiện có`,
      bgColor: 'hover:border-blue-300',
    },
    {
      id: 'faq',
      title: 'Quản lý câu hỏi thường gặp (FAQ)',
      path: '/admin/cms/faq',
      icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
      description: 'Biên tập danh mục câu hỏi và câu trả lời về hóa đơn, chứng từ, phí và bảo mật. Thêm mới, thay đổi thứ tự và phân loại danh mục.',
      countLabel: `${draftData.faqs.length} câu hỏi thường gặp`,
      bgColor: 'hover:border-amber-300',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Universal CMS Action Toolbar */}
      <CmsToolbar />

      {/* 3 Main Functional Sub-module Cards */}
      <div>
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Các phân hệ quản trị nội dung
          </h2>
          <p className="text-xs text-slate-500">
            Chọn một phân hệ để bắt đầu chỉnh sửa bản nháp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs transition-all ${c.bgColor}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    {c.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {c.countLabel}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  to={c.path}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2 border border-slate-200/80"
                >
                  <span>Quản lý phân hệ này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draft vs Published Guidelines */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
          <FileCheck2 className="w-5 h-5 text-emerald-700" />
          <span>Nguyên tắc kiểm soát phiên bản (Draft & Publish)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 block mb-1">1. Đang xuất bản (Published):</strong>
            Phiên bản nội dung đang thực sự phục vụ khách truy cập ngoài trang chủ quybich.vn.
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <strong className="text-blue-900 block mb-1">2. Bản nháp đang sửa (Draft):</strong>
            Lưu lại toàn bộ thao tác thêm sửa xóa mà không làm gián đoạn hay ảnh hưởng website công khai.
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <strong className="text-emerald-900 block mb-1">3. Xem trước (Preview):</strong>
            Mô phỏng trải nghiệm người dùng thực tế trên cả máy tính lẫn di động trước khi bấm Xuất bản.
          </div>
        </div>
      </div>

    </div>
  );
};
