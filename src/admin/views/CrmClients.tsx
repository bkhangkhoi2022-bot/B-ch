import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Clock,
  ExternalLink,
  Eye,
  Hourglass,
  PauseCircle,
  AlertCircle
} from 'lucide-react';
import { useCrm, CrmClient } from '../../context/CrmContext';
import { ClientDetailModal } from '../components/ClientDetailModal';

export const CrmClients: React.FC = () => {
  const { clients, addClient } = useCrm();

  const [search, setSearch] = useState('');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    taxCode: '',
    representative: '',
    phone: '',
    industry: 'Du lịch / Cho thuê xe máy',
    packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)' as CrmClient['packageType'],
    monthlyFee: '2.500.000 đ/tháng',
    assignedAccountant: 'Mã Thị Bích',
    startDate: '01/11/2026',
  });

  const filtered = clients.filter(c => {
    const matchSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.taxCode.includes(search) ||
      c.representative.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const matchPackage = filterPackage === 'all' ? true : c.packageType === filterPackage;

    return matchSearch && matchPackage;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.taxCode) return;
    addClient({
      companyName: form.companyName,
      taxCode: form.taxCode,
      representative: form.representative,
      phone: form.phone,
      industry: form.industry,
      packageType: form.packageType,
      monthlyFee: form.monthlyFee,
      assignedAccountant: form.assignedAccountant,
      status: 'active',
      startDate: form.startDate,
    });
    setForm({
      companyName: '',
      taxCode: '',
      representative: '',
      phone: '',
      industry: 'Du lịch / Cho thuê xe máy',
      packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)',
      monthlyFee: '2.500.000 đ/tháng',
      assignedAccountant: 'Mã Thị Bích',
      startDate: '01/11/2026',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              3. Quản Lý Khách Hàng (Doanh Nghiệp Đang Phục Vụ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hồ sơ 4 doanh nghiệp thực tế đang ủy quyền kế toán trọn gói và các khách hàng mới ký kết
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm doanh nghiệp mới</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên công ty, MST, người đại diện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 text-slate-800 bg-white"
            >
              <option value="all">Tất cả gói dịch vụ</option>
              <option value="Gói Mới & Nhỏ (đến 3 tỷ)">Gói Mới & Nhỏ (đến 3 tỷ)</option>
              <option value="Gói Đang Phát Triển (3-10 tỷ)">Gói Đang Phát Triển (3-10 tỷ)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Tên công ty & MST</th>
                <th className="py-3 px-4">Người đại diện & SĐT</th>
                <th className="py-3 px-4">Ngành nghề</th>
                <th className="py-3 px-4">Gói kế toán</th>
                <th className="py-3 px-4">Biểu phí / tháng</th>
                <th className="py-3 px-4">Phụ trách 1:1</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                    <div>Không tìm thấy doanh nghiệp nào khớp với bộ lọc</div>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setIsDetailModalOpen(true);
                    }}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    title="Bấm để xem toàn bộ thông tin doanh nghiệp trên hệ thống"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-700 text-blue-800 group-hover:text-white font-bold flex items-center justify-center shrink-0 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-900 leading-tight flex items-center gap-1.5">
                            <span>{client.companyName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">MST: {client.taxCode}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{client.representative}</div>
                      <a
                        href={`https://zalo.me/${client.phone.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-700 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                        title="Mở Zalo liên hệ"
                      >
                        <span>{client.phone}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {client.industry}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                        {client.packageType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {client.monthlyFee}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold whitespace-nowrap">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{client.assignedAccountant}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {client.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đang phục vụ</span>
                        </span>
                      )}
                      {client.status === 'pending_handover' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 whitespace-nowrap">
                          <Hourglass className="w-3.5 h-3.5" />
                          <span>Chờ bàn giao</span>
                        </span>
                      )}
                      {client.status === 'paused' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 whitespace-nowrap">
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>Tạm ngưng</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors inline-flex items-center gap-1"
                          title="Xem toàn bộ thông tin doanh nghiệp trên hệ thống"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số: <strong>{filtered.length}</strong> doanh nghiệp</span>
          <span>Sổ sách MISA & Bàn giao định kỳ theo hợp đồng</span>
        </div>

      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Doanh Nghiệp Khách Hàng Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên công ty đầy đủ *</label>
                <input
                  type="text"
                  required
                  placeholder="Công ty TNHH..."
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã số thuế (MST) *</label>
                  <input
                    type="text"
                    required
                    placeholder="4800xxxxxx"
                    value={form.taxCode}
                    onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người đại diện pháp luật</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.representative}
                    onChange={(e) => setForm({ ...form, representative: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    placeholder="0912 xxx xxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biểu phí thỏa thuận</label>
                  <input
                    type="text"
                    placeholder="2.500.000 đ/tháng"
                    value={form.monthlyFee}
                    onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gói dịch vụ</label>
                  <select
                    value={form.packageType}
                    onChange={(e) => setForm({ ...form, packageType: e.target.value as CrmClient['packageType'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Gói Mới & Nhỏ (đến 3 tỷ)">Gói Mới & Nhỏ (đến 3 tỷ)</option>
                    <option value="Gói Đang Phát Triển (3-10 tỷ)">Gói Đang Phát Triển (3-10 tỷ)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kế toán phụ trách</label>
                  <input
                    type="text"
                    value={form.assignedAccountant}
                    onChange={(e) => setForm({ ...form, assignedAccountant: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  Lưu khách hàng
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Client Full System Detail & Edit Modal */}
      <ClientDetailModal
        clientId={selectedClientId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

    </div>
  );
};
