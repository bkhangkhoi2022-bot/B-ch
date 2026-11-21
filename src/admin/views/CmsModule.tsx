import React from 'react';
import { FileText, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from '../../router';

export const CmsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/admin" className="hover:text-slate-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tổng quan</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Quản trị nội dung</span>
      </div>

      {/* Module Title & Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Mô-đun Quản trị nội dung (CMS)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Khu vực chuyên trách chỉnh sửa văn bản, bảng giá, danh mục câu hỏi thường gặp FAQ, nội dung quy trình và các khối truyền thông trên website quybich.vn.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Trạng thái: Chưa tích hợp</span>
            </span>
          </div>
        </div>

        {/* Informative placeholder container */}
        <div className="p-6 sm:p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            Khung mô-đun đã sẵn sàng kết nối
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Theo đúng nguyên tắc, hệ thống không tạo nội dung bài viết hay số liệu giả lập khi chưa kết nối cơ sở dữ liệu thật. Khi bạn yêu cầu tích hợp CMS, các tính năng chỉnh sửa nội dung sẽ được gắn trực tiếp vào giao diện này.
          </p>
        </div>

        {/* Expected capabilities when integrated */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Các tính năng dự kiến khi tích hợp:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <strong>1. Bảng biểu phí & Dịch vụ:</strong> Cập nhật mức giá, phạm vi công việc trong gói kế toán trọn gói.
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <strong>2. Ngân hàng câu hỏi FAQ:</strong> Thêm, sửa, ẩn/hiện các câu hỏi giải đáp nghiệp vụ kế toán & thuế.
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <strong>3. Checklist & Tài liệu:</strong> Quản lý danh mục 5 nhóm hồ sơ khởi đầu cho doanh nghiệp mới.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
