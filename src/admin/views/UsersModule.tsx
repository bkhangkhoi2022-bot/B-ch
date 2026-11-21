import React from 'react';
import { ShieldCheck, Clock, AlertCircle, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { Link } from '../../router';

export const UsersModule: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/admin" className="hover:text-slate-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tổng quan</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Quản lý người dùng</span>
      </div>

      {/* Module Title & Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Mô-đun Quản lý người dùng (Users & RBAC)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Quản lý danh sách tài khoản được phép truy cập vào cổng quản trị, cấu hình phân quyền vai trò (Quản trị viên, Kế toán viên, Nhân sự hỗ trợ).
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
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            Chưa cấu hình xác thực (Authentication)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Theo nguyên tắc bảo mật, hệ thống không dùng tài khoản hay mật khẩu giả lưu tạm trong mã nguồn hoặc trình duyệt. Khung quản trị hiện đang mở ở chế độ xem thử nghiệm nội bộ.
          </p>
        </div>

        {/* Expected capabilities when integrated */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Các tính năng dự kiến khi tích hợp:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <strong>1. Đăng nhập an toàn:</strong> Tích hợp xác thực bảo mật (Google Workspace OAuth hoặc Firebase Auth).
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <strong>2. Phân quyền vai trò (RBAC):</strong> Admin toàn quyền, Kế toán viên quản lý hồ sơ, cộng tác viên xem báo cáo.
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <strong>3. Nhật ký hoạt động:</strong> Theo dõi thời gian đăng nhập, lịch sử cập nhật dữ liệu và thao tác quản trị.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
