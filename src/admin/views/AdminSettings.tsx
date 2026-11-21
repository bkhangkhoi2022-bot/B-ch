import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  UserPlus, 
  Bell, 
  Save, 
  CheckCircle2, 
  Key, 
  Lock,
  Mail,
  PhoneCall,
  Database
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useCrm();

  const [form, setForm] = useState({
    brandName: settings.brandName,
    hotline: settings.hotline,
    email: settings.email,
    notifyOnNewLead: settings.notifyOnNewLead,
    misaSyncEnabled: settings.misaSyncEnabled,
    autoRemindZalo: settings.autoRemindZalo,
  });

  const [toast, setToast] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setToast('Đã lưu cấu hình cài đặt hệ thống thành công!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              8. Cài Đặt & Phân Quyền Hệ Thống
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị tài khoản chuyên viên, thông báo tự động và phân quyền truy cập hệ thống
          </p>
        </div>

        {toast && (
          <div className="p-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: General settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Thông Tin Đơn Vị & Kênh Tiếp Nhận
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đồng bộ số Hotline Zalo và Email nhận thông báo yêu cầu khảo sát
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên thương hiệu dịch vụ</label>
                <input
                  type="text"
                  value={form.brandName}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại / Hotline Zalo</label>
                  <input
                    type="text"
                    value={form.hotline}
                    onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email tiếp nhận Lead</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              {/* Automation Switches */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="block font-bold text-slate-800">Tự động hóa thông báo:</span>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">Bật thông báo khi có Lead mới từ Website</div>
                    <div className="text-xs text-slate-500">Tự động lưu vào CRM và gửi tín hiệu âm thanh</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.notifyOnNewLead}
                    onChange={(e) => setForm({ ...form, notifyOnNewLead: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">Tự động nhắc lịch hạn tờ khai thuế GTGT quý</div>
                    <div className="text-xs text-slate-500">Tạo công việc khẩn cấp trước ngày 30 hàng quý</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.autoRemindZalo}
                    onChange={(e) => setForm({ ...form, autoRemindZalo: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Pane: RBAC & Accounts (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Tài Khoản & Phân Quyền (RBAC)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách nhân sự được cấp quyền truy cập CRM
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {settings.roles.map((role, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                    {role.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{role.name}</div>
                    <div className="text-[11px] text-slate-500">{role.email}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  role.role === 'Super Admin'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {role.role}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Chế độ phân quyền thử nghiệm nội bộ</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Khung quản trị hiện đang mở cho tài khoản quản trị thử nghiệm. Khi kết nối Firebase Authentication, bạn có thể thiết lập mật khẩu và xác thực 2 lớp cho từng chuyên viên.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
