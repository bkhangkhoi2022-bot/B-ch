import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Send, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useCrm, CrmDeal } from '../../context/CrmContext';

export const CrmDeals: React.FC = () => {
  const { deals, addDeal, updateDealStatus } = useCrm();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    packageTitle: 'Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)',
    feeMonthly: '2.500.000 đ/tháng',
    status: 'sent' as CrmDeal['status'],
    sentDate: '12/11/2026',
    notes: 'Phạm vi: xuất hóa đơn, tiếp nhận chứng từ qua Zalo, nộp thuế GTGT quý, BCTC năm.',
  });

  const filtered = deals.filter(d => {
    const matchSearch =
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.packageTitle.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === 'all' ? true : d.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName) return;
    addDeal({
      clientName: form.clientName,
      packageTitle: form.packageTitle,
      feeMonthly: form.feeMonthly,
      status: form.status,
      sentDate: form.sentDate,
      notes: form.notes,
    });
    setForm({
      clientName: '',
      packageTitle: 'Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)',
      feeMonthly: '2.500.000 đ/tháng',
      status: 'sent',
      sentDate: '12/11/2026',
      notes: '',
    });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: CrmDeal['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Dự thảo</span>;
      case 'sent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Đã gửi khách</span>;
      case 'signed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Đã ký kết</span>;
      case 'renewing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Gia hạn</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              4. Báo Giá & Hợp Đồng Dịch Vụ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý các bản báo giá theo khung BCM (2.5tr–3tr & 5tr–8tr) và hợp đồng dịch vụ kế toán
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo báo giá / Hợp đồng</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Search & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, tên khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-amber-600 text-slate-800 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản dự thảo</option>
              <option value="sent">Đã gửi báo giá</option>
              <option value="signed">Đã ký kết</option>
              <option value="renewing">Đang gia hạn</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Mã Hợp đồng</th>
                <th className="py-3 px-4">Khách hàng / Doanh nghiệp</th>
                <th className="py-3 px-4">Gói dịch vụ thỏa thuận</th>
                <th className="py-3 px-4">Biểu phí tháng</th>
                <th className="py-3 px-4">Ngày gửi / Ký</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Chuyển trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                    {deal.code}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {deal.clientName}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {deal.packageTitle}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {deal.feeMonthly}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                    Gửi: {deal.sentDate}
                    {deal.signedDate && (
                      <span className="block text-emerald-700 font-semibold">Ký: {deal.signedDate}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(deal.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={deal.status}
                      onChange={(e) => updateDealStatus(deal.id, e.target.value as CrmDeal['status'])}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <option value="draft">Bản dự thảo</option>
                      <option value="sent">Đã gửi báo giá</option>
                      <option value="signed">Đã ký kết</option>
                      <option value="renewing">Gia hạn</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số: <strong>{filtered.length}</strong> báo giá & hợp đồng</span>
          <span>Phân định trách nhiệm rõ ràng bằng hợp đồng dịch vụ</span>
        </div>

      </div>

      {/* Modal Add Deal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Tạo Báo Giá / Dự Thảo Hợp Đồng
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

            <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khách hàng / Doanh nghiệp *</label>
                <input
                  type="text"
                  required
                  placeholder="Công ty TNHH..."
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gói dịch vụ áp dụng</label>
                <select
                  value={form.packageTitle}
                  onChange={(e) => setForm({ ...form, packageTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                >
                  <option value="Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)">Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)</option>
                  <option value="Kế toán trọn gói Doanh nghiệp Đang Phát Triển (3-10 tỷ)">Kế toán trọn gói Doanh nghiệp Đang Phát Triển (3-10 tỷ)</option>
                  <option value="Dịch vụ Bổ trợ: Thành lập & Thay đổi ĐKKD">Dịch vụ Bổ trợ: Thành lập & Thay đổi ĐKKD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biểu phí hàng tháng</label>
                  <input
                    type="text"
                    value={form.feeMonthly}
                    onChange={(e) => setForm({ ...form, feeMonthly: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái ban đầu</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CrmDeal['status'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="draft">Bản dự thảo</option>
                    <option value="sent">Đã gửi báo giá</option>
                    <option value="signed">Đã ký kết</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú phạm vi công việc</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold"
                >
                  Lưu báo giá
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
