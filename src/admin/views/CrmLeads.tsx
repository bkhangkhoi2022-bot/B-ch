import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  Plus, 
  PhoneCall, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Building,
  Calendar,
  FileSpreadsheet,
  Trash2,
  Eye
} from 'lucide-react';
import { useCrm, CrmLead } from '../../context/CrmContext';
import { CustomerDetailModal } from '../components/CustomerDetailModal';

export const CrmLeads: React.FC = () => {
  const { leads, addLead, updateLeadStatus, deleteLead } = useCrm();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacting' | 'quoted' | 'closed' | 'archived'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Customer Detail Modal state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phoneZalo: '',
    businessName: '',
    industry: 'Du lịch / Cho thuê xe máy',
    estimatedRevenue: 'Dưới 3 tỷ/năm',
    primaryProblem: 'Chưa quen xuất hóa đơn điện tử',
    notes: '',
    source: 'Website Form' as CrmLead['source'],
  });

  const filtered = leads.filter(l => {
    const matchSearch = 
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.phoneZalo.includes(search) ||
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.primaryProblem.toLowerCase().includes(search.toLowerCase());

    const matchTab = activeTab === 'all' ? true : l.status === activeTab;
    const matchSource = filterSource === 'all' ? true : l.source === filterSource;
    const matchIndustry = filterIndustry === 'all' ? true : l.industry === filterIndustry;

    return matchSearch && matchTab && matchSource && matchIndustry;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phoneZalo) return;
    addLead({
      fullName: form.fullName,
      phoneZalo: form.phoneZalo,
      businessName: form.businessName || 'Doanh nghiệp mới',
      industry: form.industry,
      estimatedRevenue: form.estimatedRevenue,
      primaryProblem: form.primaryProblem,
      status: 'new',
      notes: form.notes,
      source: form.source,
    });
    setForm({
      fullName: '',
      phoneZalo: '',
      businessName: '',
      industry: 'Du lịch / Cho thuê xe máy',
      estimatedRevenue: 'Dưới 3 tỷ/năm',
      primaryProblem: 'Chưa quen xuất hóa đơn điện tử',
      notes: '',
      source: 'Website Form',
    });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: CrmLead['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Mới nhận</span>;
      case 'contacting':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Đang tư vấn</span>;
      case 'quoted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Đã gửi báo giá</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Đã ký kết</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Lưu trữ</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              2. Khách Hàng Tiềm Năng (Leads)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tiếp nhận thông tin khách khảo sát nhu cầu từ trang chủ quybich.vn và kênh Zalo trực tiếp
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khách tiềm năng</span>
        </button>
      </div>

      {/* Main Table Card (Horizontal Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Search, Filters, and Tabs Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm theo tên khách, SĐT Zalo, doanh nghiệp, vướng mắc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 bg-white"
              >
                <option value="all">Tất cả nguồn tiếp nhận</option>
                <option value="Website Form">Website Form (Trang chủ)</option>
                <option value="Checklist Download">Tải Checklist khởi đầu</option>
                <option value="Zalo Trực tiếp">Zalo Trực tiếp</option>
                <option value="Giới thiệu">Khách hàng giới thiệu</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 bg-white"
              >
                <option value="all">Tất cả ngành nghề</option>
                <option value="Du lịch / Cho thuê xe máy">Du lịch / Thuê xe</option>
                <option value="Sản xuất cơ khí / Nhôm kính">Sản xuất / Cơ khí</option>
                <option value="Vệ sinh công nghiệp / Dịch vụ">Vệ sinh công nghiệp</option>
                <option value="Thương mại / Bán lẻ">Thương mại / Bán lẻ</option>
                <option value="Sửa chữa kỹ thuật / Ô tô">Sửa chữa / Ô tô</option>
              </select>
            </div>
          </div>

          {/* Interactive Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Mới nhận</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-extrabold">
                {leads.filter(l => l.status === 'new').length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contacting')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'contacting'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đang tư vấn ({leads.filter(l => l.status === 'contacting').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quoted')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'quoted'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đã báo giá ({leads.filter(l => l.status === 'quoted').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('closed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'closed'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đã ký hợp đồng ({leads.filter(l => l.status === 'closed').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'archived'
                  ? 'bg-slate-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Lưu trữ ({leads.filter(l => l.status === 'archived').length})
            </button>
          </div>

        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Họ tên & Zalo</th>
                <th className="py-3 px-4">Doanh nghiệp / Ngành</th>
                <th className="py-3 px-4">Quy mô & Vấn đề</th>
                <th className="py-3 px-4">Nguồn & Thời gian</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                    <div>Không tìm thấy khách hàng nào khớp với điều kiện tìm kiếm</div>
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setIsDetailModalOpen(true);
                    }}
                    className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                    title="Bấm để xem và chỉnh sửa toàn bộ thông tin chi tiết khách hàng"
                  >
                    
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white font-bold flex items-center justify-center shrink-0 transition-colors">
                          {lead.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-900 leading-tight flex items-center gap-1.5">
                            <span>{lead.fullName}</span>
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <a 
                            href={`https://zalo.me/${lead.phoneZalo.replace(/\s+/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-emerald-700 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                            title="Mở Zalo nhắn tin trực tiếp"
                          >
                            <span>{lead.phoneZalo}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={lead.businessName}>
                        {lead.businessName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lead.industry}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 line-clamp-1 max-w-[220px]" title={lead.primaryProblem}>
                        {lead.primaryProblem}
                      </div>
                      <div className="text-xs text-emerald-800 font-medium mt-0.5">
                        Doanh thu: {lead.estimatedRevenue}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">
                        {lead.source}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {lead.createdAt}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                          title="Xem & Chỉnh sửa hồ sơ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chi tiết</span>
                        </button>

                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as CrmLead['status'])}
                          className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700"
                        >
                          <option value="new">Mới nhận</option>
                          <option value="contacting">Đang tư vấn</option>
                          <option value="quoted">Đã báo giá</option>
                          <option value="closed">Đã ký hợp đồng</option>
                          <option value="archived">Lưu trữ</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xóa hồ sơ của khách hàng ${lead.fullName}?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-100"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <span>Tổng số: <strong>{filtered.length}</strong> khách hàng</span>
          <span>Dữ liệu lưu trữ độc lập trên hệ thống</span>
        </div>

      </div>

      {/* Modal Add Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Khách Hàng Tiềm Năng Mới
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên khách *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Zalo / Điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={form.phoneZalo}
                    onChange={(e) => setForm({ ...form, phoneZalo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên doanh nghiệp</label>
                <input
                  type="text"
                  placeholder="Công ty TNHH..."
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngành nghề</label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Du lịch / Cho thuê xe máy">Du lịch / Cho thuê xe máy</option>
                    <option value="Sản xuất cơ khí / Nhôm kính">Sản xuất cơ khí / Nhôm kính</option>
                    <option value="Vệ sinh công nghiệp / Dịch vụ">Vệ sinh công nghiệp / Dịch vụ</option>
                    <option value="Thương mại / Bán lẻ">Thương mại / Bán lẻ</option>
                    <option value="Sửa chữa kỹ thuật / Ô tô">Sửa chữa kỹ thuật / Ô tô</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn tiếp nhận</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value as CrmLead['source'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Website Form">Website Form (Trang chủ)</option>
                    <option value="Checklist Download">Tải Checklist khởi đầu</option>
                    <option value="Zalo Trực tiếp">Zalo Trực tiếp</option>
                    <option value="Giới thiệu">Khách hàng giới thiệu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vấn đề chính đang gặp</label>
                <input
                  type="text"
                  placeholder="Chưa quen xuất hóa đơn / Chưa có kế toán..."
                  value={form.primaryProblem}
                  onChange={(e) => setForm({ ...form, primaryProblem: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Thông tin trao đổi ban đầu..."
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
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Lưu khách hàng
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Customer Detail & Edit Modal */}
      <CustomerDetailModal
        leadId={selectedLeadId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

    </div>
  );
};
