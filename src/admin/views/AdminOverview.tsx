import React, { useState } from 'react';
import { 
  Target, 
  Users, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  PanelsTopLeft, 
  Settings, 
  ArrowRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  ExternalLink, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  Plus,
  Send,
  Calendar,
  Building2,
  Tag,
  Eye
} from 'lucide-react';
import { Link } from '../../router';
import { useCrm, CrmLead } from '../../context/CrmContext';
import { CustomerDetailModal } from '../components/CustomerDetailModal';

export const AdminOverview: React.FC = () => {
  const { leads, clients, deals, tasks, toggleTask, updateLeadStatus, addLead } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacting' | 'quoted' | 'closed'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // New quick lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    phoneZalo: '',
    businessName: '',
    industry: 'Du lịch / Cho thuê xe máy',
    estimatedRevenue: 'Dưới 3 tỷ/năm',
    primaryProblem: 'Chưa quen xuất hóa đơn điện tử',
    notes: '',
  });

  // KPI Calculations
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const signedDealsCount = deals.filter(d => d.status === 'signed').length;
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const conversionRate = totalLeads > 0 ? Math.round((signedDealsCount / totalLeads) * 100) : 0;

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phoneZalo.includes(searchQuery) ||
      l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.primaryProblem.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' ? true : l.status === activeTab;
    const matchesIndustry = selectedIndustry === 'all' ? true : l.industry === selectedIndustry;

    return matchesSearch && matchesTab && matchesIndustry;
  });

  const handleCreateQuickLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.fullName || !newLeadForm.phoneZalo) return;
    addLead({
      fullName: newLeadForm.fullName,
      phoneZalo: newLeadForm.phoneZalo,
      businessName: newLeadForm.businessName || 'Doanh nghiệp chưa đăng ký',
      industry: newLeadForm.industry,
      estimatedRevenue: newLeadForm.estimatedRevenue,
      primaryProblem: newLeadForm.primaryProblem,
      status: 'new',
      notes: newLeadForm.notes,
      source: 'Zalo Trực tiếp',
    });
    setNewLeadForm({
      fullName: '',
      phoneZalo: '',
      businessName: '',
      industry: 'Du lịch / Cho thuê xe máy',
      estimatedRevenue: 'Dưới 3 tỷ/năm',
      primaryProblem: 'Chưa quen xuất hóa đơn điện tử',
      notes: '',
    });
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: CrmLead['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Mới nhận</span>;
      case 'contacting':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Đang tư vấn</span>;
      case 'quoted':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Đã gửi báo giá</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Đã ký hợp đồng</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">Lưu trữ</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: System status & Horizontal KPI Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Dashboard Điều Hành CRM</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              8 Phân hệ chuẩn
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi khách hàng tiềm năng, tiến độ hợp đồng và công việc kế toán 1:1
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nhập Lead nhanh</span>
          </button>
        </div>
      </div>

      {/* 4 Horizontal KPI Cards (Compact, informative, zero vertical waste) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Leads */}
        <Link 
          to="/admin/crm/leads"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khách tiềm năng</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalLeads}
            </div>
            {newLeadsCount > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +{newLeadsCount} mới
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Đến từ Form khảo sát & Zalo
          </div>
        </Link>

        {/* Card 2: Active Clients */}
        <Link 
          to="/admin/crm/clients"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh nghiệp phục vụ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {activeClientsCount}
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              100% Hoạt động
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Hạch toán MISA & nộp thuế định kỳ
          </div>
        </Link>

        {/* Card 3: Deals & Quotes */}
        <Link 
          to="/admin/crm/deals"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hợp đồng & Báo giá</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {deals.length}
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {signedDealsCount} đã ký
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Biểu phí từ 2.500.000 đ/tháng
          </div>
        </Link>

        {/* Card 4: Tasks & Compliance */}
        <Link 
          to="/admin/crm/tasks"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-purple-400 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch công việc kế toán</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {pendingTasks.length}
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Đang chờ xử lý
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Tờ khai thuế quý & Sổ sách MISA
          </div>
        </Link>

      </div>

      {/* Main Horizontal Workspace: 7-Column Master Table vs 5-Column Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT PANE (7 COLS): BẢNG DỮ LIỆU TƯƠNG TÁC + SEARCH + TABS */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          
          {/* Header of Master Table */}
          <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Dòng Khách Hàng Tiềm Năng (Leads Flow)
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {filteredLeads.length} hồ sơ
                </span>
              </div>

              {/* View all leads link */}
              <Link 
                to="/admin/crm/leads" 
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <span>Xem đầy đủ danh sách</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Search and Industry Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên, SĐT Zalo, tên công ty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 bg-white"
                >
                  <option value="all">Tất cả ngành nghề</option>
                  <option value="Du lịch / Cho thuê xe máy">Du lịch / Xe máy</option>
                  <option value="Sản xuất cơ khí / Nhôm kính">Sản xuất / Cơ khí</option>
                  <option value="Vệ sinh công nghiệp / Dịch vụ">Vệ sinh công nghiệp</option>
                  <option value="Thương mại / Bán lẻ">Thương mại / Bán lẻ</option>
                  <option value="Sửa chữa kỹ thuật / Ô tô">Kỹ thuật / Ô tô</option>
                </select>
              </div>
            </div>

            {/* Status Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'new'
                    ? 'bg-emerald-700 text-white'
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
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'contacting'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đang tư vấn ({leads.filter(l => l.status === 'contacting').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quoted')}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'quoted'
                    ? 'bg-amber-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đã gửi báo giá ({leads.filter(l => l.status === 'quoted').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('closed')}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'closed'
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đã chốt ({leads.filter(l => l.status === 'closed').length})
              </button>
            </div>

          </div>

          {/* Table Container with Horizontal Scroll optimization */}
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-3">Doanh nghiệp & Ngành</th>
                  <th className="py-3 px-3">Vướng mắc cần tháo gỡ</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chuyển trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 space-y-2">
                      <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                      <div>Không tìm thấy khách hàng nào khớp với bộ lọc</div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setIsDetailModalOpen(true);
                      }}
                      className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                      title="Bấm để xem và chỉnh sửa thông tin chi tiết khách hàng"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white font-bold flex items-center justify-center text-xs shrink-0 transition-colors">
                            {lead.fullName.charAt(0)}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-900 leading-snug flex items-center gap-1.5">
                              <span>{lead.fullName}</span>
                              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phoneZalo}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 font-medium truncate max-w-[160px]" title={lead.businessName}>
                          {lead.businessName}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {lead.industry}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-700 line-clamp-1 max-w-[180px]" title={lead.primaryProblem}>
                          {lead.primaryProblem}
                        </div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          {lead.estimatedRevenue}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {getStatusBadge(lead.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">Chi tiết</span>
                          </button>

                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as CrmLead['status'])}
                            className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:border-emerald-600"
                          >
                            <option value="new">Mới nhận</option>
                            <option value="contacting">Đang tư vấn</option>
                            <option value="quoted">Đã báo giá</option>
                            <option value="closed">Đã ký kết</option>
                            <option value="archived">Lưu trữ</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hiển thị <strong>{filteredLeads.length}</strong> / {leads.length} khách hàng</span>
            <span>Đồng bộ thời gian thực với Form Khảo sát Website</span>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE (5 COLS): LỊCH NHẮC NGHĨA VỤ + PHỄU + PHÂN HỆ */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Widget 1: Lịch nhắc nghĩa vụ kế toán & Zalo */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Lịch Nhắc Nghĩa Vụ Kế Toán
                </h3>
              </div>
              <Link 
                to="/admin/crm/tasks" 
                className="text-xs font-bold text-purple-700 hover:text-purple-800 transition-colors"
              >
                Xem tất cả ({tasks.length})
              </Link>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    task.isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-purple-300 shadow-2xs'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold leading-snug ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700 truncate">{task.clientName}</span>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">Hạn: {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Phễu chuyển đổi dịch vụ Kế toán trọn gói */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Phễu Chuyển Đổi Khách Hàng
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Hiệu suất: {conversionRate}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>1. Tiếp nhận Form & Zalo</span>
                  <span className="font-bold text-slate-900">{totalLeads} Lead (100%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>2. Tư vấn 1:1 qua Zalo</span>
                  <span className="font-bold text-slate-900">
                    {leads.filter(l => l.status !== 'new').length} KH ({totalLeads > 0 ? Math.round((leads.filter(l => l.status !== 'new').length / totalLeads) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${totalLeads > 0 ? (leads.filter(l => l.status !== 'new').length / totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>3. Gửi Báo giá & Dự thảo HĐ</span>
                  <span className="font-bold text-slate-900">{deals.length} Báo giá</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${totalLeads > 0 ? (deals.length / totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>4. Hợp đồng chính thức</span>
                  <span className="font-bold text-emerald-800">{activeClientsCount} Doanh nghiệp</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-700 rounded-full" 
                    style={{ width: `${totalLeads > 0 ? (activeClientsCount / totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Quick Jump to 8 Modules */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">
                Trung tâm 8 Phân Hệ CRM
              </span>
              <span className="text-slate-400">Điều hướng 1 chạm</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link to="/admin/crm/leads" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">2. Khách tiềm năng</span>
              </Link>
              <Link to="/admin/crm/clients" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">3. QL Khách hàng</span>
              </Link>
              <Link to="/admin/crm/deals" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">4. Báo giá & Hợp đồng</span>
              </Link>
              <Link to="/admin/crm/tasks" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">5. QL Công việc</span>
              </Link>
              <Link to="/admin/crm/reports" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                <span className="truncate">6. Báo cáo & KPI</span>
              </Link>
              <Link to="/admin/cms/homepage" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                <PanelsTopLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">7. CMS Section Builder</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Add Lead Modal */}
      {isAddModalOpen && (
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
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuickLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Tuấn Anh"
                    value={newLeadForm.fullName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại / Zalo *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={newLeadForm.phoneZalo}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phoneZalo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên công ty / Doanh nghiệp</label>
                <input
                  type="text"
                  placeholder="Công ty TNHH Dịch vụ ABC"
                  value={newLeadForm.businessName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngành nghề</label>
                  <select
                    value={newLeadForm.industry}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, industry: e.target.value })}
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
                  <label className="block font-bold text-slate-700 mb-1">Doanh thu dự kiến</label>
                  <select
                    value={newLeadForm.estimatedRevenue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedRevenue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Dưới 3 tỷ/năm">Dưới 3 tỷ/năm (Gói Nhỏ)</option>
                    <option value="3 - 10 tỷ/năm">3 - 10 tỷ/năm (Gói Phát triển)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú nhu cầu tư vấn</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm thông tin khách trao đổi qua Zalo..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Lưu Lead vào CRM
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
