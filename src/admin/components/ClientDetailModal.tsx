import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Save,
  RotateCcw,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  CheckSquare,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Landmark,
  Briefcase,
  Target,
  Sparkles,
  PauseCircle,
  Hourglass
} from 'lucide-react';
import { useCrm, CrmClient, CrmDeal, CrmTask } from '../../context/CrmContext';

interface ClientDetailModalProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  clientId,
  isOpen,
  onClose,
}) => {
  const {
    clients,
    deals,
    tasks,
    leads,
    updateClient,
    addDeal,
    updateDealStatus,
    toggleTask,
    addTask,
  } = useCrm();

  const currentClient = clients.find((c) => c.id === clientId);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'accounting' | 'deals' | 'tasks'>('profile');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CrmClient>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Quick-add Task inline form inside Tab 4
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskDue, setQuickTaskDue] = useState('30/11/2026');
  const [quickTaskCategory, setQuickTaskCategory] = useState<CrmTask['category']>('Kê khai thuế');
  const [quickTaskPriority, setQuickTaskPriority] = useState<CrmTask['priority']>('Cao');

  // Quick-add Deal inline form inside Tab 3
  const [showQuickDeal, setShowQuickDeal] = useState(false);
  const [quickDealPackage, setQuickDealPackage] = useState('Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)');
  const [quickDealFee, setQuickDealFee] = useState('2.500.000 đ/tháng');
  const [quickDealNotes, setQuickDealNotes] = useState('');

  const initFormFromClient = (client: CrmClient) => {
    setFormData({
      companyName: client.companyName || '',
      taxCode: client.taxCode || '',
      representative: client.representative || '',
      phone: client.phone || '',
      zalo: client.zalo || client.phone || '',
      email: client.email || '',
      businessType: client.businessType || 'Công ty TNHH 1 Thành viên',
      businessAddress: client.businessAddress || '',
      contactAddress: client.contactAddress || '',
      taxAuthority: client.taxAuthority || '',
      industry: client.industry || '',
      packageType: client.packageType || 'Gói Mới & Nhỏ (đến 3 tỷ)',
      monthlyFee: client.monthlyFee || '',
      paymentCycle: client.paymentCycle || 'Thanh toán theo Quý',
      assignedAccountant: client.assignedAccountant || 'Mã Thị Bích',
      accountingSoftware: client.accountingSoftware || 'MISA SME',
      taxPeriod: client.taxPeriod || 'Kê khai theo Quý',
      invoiceMethod: client.invoiceMethod || 'Hóa đơn điện tử MISA meInvoice',
      status: client.status || 'active',
      startDate: client.startDate || '',
      notes: client.notes || '',
    });
  };

  useEffect(() => {
    if (currentClient && isOpen) {
      initFormFromClient(currentClient);
      setQuickDealPackage(
        currentClient.packageType === 'Gói Đang Phát Triển (3-10 tỷ)'
          ? 'Kế toán trọn gói Doanh nghiệp Đang Phát Triển (3-10 tỷ)'
          : 'Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)'
      );
      setQuickDealFee(currentClient.monthlyFee || '2.500.000 đ/tháng');
      setIsEditing(false);
      setIsDirty(false);
      setErrorMessage(null);
      setSuccessToast(null);
      setShowQuickTask(false);
      setShowQuickDeal(false);
      setActiveTab('profile');
    }
  }, [clientId, isOpen]);

  if (!isOpen || !currentClient) return null;

  // Find related data on the system for this client
  const normalizedCompany = currentClient.companyName.trim().toLowerCase();
  const normalizedPhone = currentClient.phone.replace(/\s+/g, '');

  const clientDeals = deals.filter(
    (d) =>
      d.clientName.trim().toLowerCase() === normalizedCompany ||
      d.clientName.trim().toLowerCase().includes(normalizedCompany) ||
      normalizedCompany.includes(d.clientName.trim().toLowerCase())
  );

  const clientTasks = tasks.filter(
    (t) =>
      t.clientName.trim().toLowerCase() === normalizedCompany ||
      t.clientName.trim().toLowerCase().includes(normalizedCompany) ||
      normalizedCompany.includes(t.clientName.trim().toLowerCase())
  );

  const matchedLeads = leads.filter(
    (l) =>
      (l.taxCode && l.taxCode === currentClient.taxCode) ||
      (normalizedPhone && l.phoneZalo.replace(/\s+/g, '') === normalizedPhone) ||
      l.businessName.trim().toLowerCase() === normalizedCompany
  );

  const handleFieldChange = (field: keyof CrmClient, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
    setErrorMessage(null);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setErrorMessage(null);
    if (activeTab === 'deals' || activeTab === 'tasks') {
      setActiveTab('profile');
    }
  };

  const handleCancelEditing = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy bỏ các thay đổi này không?'
      );
      if (!confirmDiscard) return;
    }
    initFormFromClient(currentClient);
    setIsEditing(false);
    setIsDirty(false);
    setErrorMessage(null);
  };

  const handleSave = () => {
    if (!currentClient) return;

    if (!formData.companyName || !formData.companyName.trim()) {
      setErrorMessage('Tên công ty / doanh nghiệp là thông tin bắt buộc.');
      return;
    }

    if (!formData.taxCode || !formData.taxCode.trim()) {
      setErrorMessage('Mã số thuế (MST) là thông tin bắt buộc.');
      return;
    }

    const result = updateClient(currentClient.id, formData);
    if (result.success) {
      setIsEditing(false);
      setIsDirty(false);
      setErrorMessage(null);
      setSuccessToast('Đã cập nhật đầy đủ hồ sơ doanh nghiệp trên hệ thống!');
      setTimeout(() => setSuccessToast(null), 3500);
    } else {
      setErrorMessage(result.error || 'Có lỗi xảy ra khi lưu thông tin.');
    }
  };

  const handleCloseModal = () => {
    if (isEditing && isDirty) {
      const confirmClose = window.confirm(
        'Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng và bỏ qua thay đổi không?'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const handleQuickCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      clientName: currentClient.companyName,
      dueDate: quickTaskDue || '30/11/2026',
      category: quickTaskCategory,
      priority: quickTaskPriority,
      assignedTo: currentClient.assignedAccountant || 'Mã Thị Bích',
    });
    setQuickTaskTitle('');
    setShowQuickTask(false);
    setSuccessToast('Đã thêm lịch công việc kế toán mới cho doanh nghiệp!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleQuickCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const todayStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()}`;
    addDeal({
      clientName: currentClient.companyName,
      packageTitle: quickDealPackage,
      feeMonthly: quickDealFee || currentClient.monthlyFee,
      status: 'sent',
      sentDate: todayStr,
      notes:
        quickDealNotes.trim() ||
        'Phạm vi: hạch toán MISA, kê khai thuế định kỳ, hỗ trợ chứng từ 1:1 qua Zalo.',
    });
    setQuickDealNotes('');
    setShowQuickDeal(false);
    setSuccessToast('Đã tạo báo giá / hợp đồng mới gắn với doanh nghiệp!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const getClientStatusBadge = (status?: CrmClient['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đang phục vụ</span>
          </span>
        );
      case 'pending_handover':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Hourglass className="w-3.5 h-3.5" />
            <span>Chờ bàn giao</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Tạm ngưng</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getDealStatusBadge = (status: CrmDeal['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">Dự thảo</span>;
      case 'sent':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Đã gửi khách</span>;
      case 'signed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Đã ký kết</span>;
      case 'renewing':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Gia hạn</span>;
    }
  };

  const renderEmptyField = () => <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleCloseModal}
    >
      {/* Modal Container */}
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-extrabold flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {currentClient.companyName}
                </h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                  {currentClient.id}
                </span>
                {getClientStatusBadge(isEditing ? formData.status : currentClient.status)}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="font-mono font-bold text-blue-800">MST: {currentClient.taxCode}</span>
                <span>•</span>
                <span>Đại diện: <strong className="text-slate-700">{currentClient.representative || 'Chưa cập nhật'}</strong></span>
                <span>•</span>
                <span>Bắt đầu: {currentClient.startDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Đang chỉnh sửa</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleCloseModal}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
              aria-label="Đóng cửa sổ chi tiết"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successToast && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* HORIZONTAL TABS (4 TABS)                                  */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. Hồ sơ DN & Liên hệ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('accounting')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'accounting'
                  ? 'border-blue-600 text-blue-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>2. Gói dịch vụ & Thiết lập thuế</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deals')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'deals'
                  ? 'border-blue-600 text-blue-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. Hợp đồng & Báo giá ({clientDeals.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>4. Công việc & Lịch sử ({clientTasks.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY                                                */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">

          {/* TAB 1: HỒ SƠ DOANH NGHIỆP & LIÊN HỆ */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Thông Tin Pháp Nhân & Đầu Mối Liên Hệ
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toàn bộ thông tin đăng ký kinh doanh, người đại diện và kênh liên lạc 1:1
                  </p>
                </div>
                {!isEditing && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Chế độ xem
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Tên doanh nghiệp đầy đủ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName || ''}
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mã số thuế (MST) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.taxCode || ''}
                      onChange={(e) => handleFieldChange('taxCode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Loại hình doanh nghiệp
                    </label>
                    <select
                      value={formData.businessType || 'Công ty TNHH 1 Thành viên'}
                      onChange={(e) => handleFieldChange('businessType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                    >
                      <option value="Công ty TNHH 1 Thành viên">Công ty TNHH 1 Thành viên</option>
                      <option value="Công ty TNHH 2 Thành viên trở lên">Công ty TNHH 2 Thành viên trở lên</option>
                      <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                      <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                      <option value="Hộ kinh doanh cá thể">Hộ kinh doanh cá thể</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ngành nghề kinh doanh chính
                    </label>
                    <input
                      type="text"
                      value={formData.industry || ''}
                      onChange={(e) => handleFieldChange('industry', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cơ quan thuế quản lý
                    </label>
                    <input
                      type="text"
                      value={formData.taxAuthority || ''}
                      onChange={(e) => handleFieldChange('taxAuthority', e.target.value)}
                      placeholder="Chi cục Thuế khu vực..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Địa chỉ trụ sở trên ĐKKD
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress || ''}
                      onChange={(e) => handleFieldChange('businessAddress', e.target.value)}
                      placeholder="Số nhà, phường/xã, TP. Cao Bằng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Người đại diện pháp luật
                    </label>
                    <input
                      type="text"
                      value={formData.representative || ''}
                      onChange={(e) => handleFieldChange('representative', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số Zalo trao đổi chứng từ
                    </label>
                    <input
                      type="tel"
                      value={formData.zalo || ''}
                      onChange={(e) => handleFieldChange('zalo', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email doanh nghiệp / nhận thông báo thuế
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="ketoan@congty.vn"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Địa chỉ liên hệ / giao nhận chứng từ gốc
                    </label>
                    <input
                      type="text"
                      value={formData.contactAddress || ''}
                      onChange={(e) => handleFieldChange('contactAddress', e.target.value)}
                      placeholder="Địa chỉ văn phòng làm việc thực tế..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Tên công ty đầy đủ:</span>
                    <div className="font-extrabold text-slate-900 text-base">{currentClient.companyName}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Mã số thuế (MST):</span>
                    <div className="font-bold text-blue-800 font-mono">{currentClient.taxCode || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Loại hình doanh nghiệp:</span>
                    <div className="font-bold text-slate-900">{currentClient.businessType || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Ngành nghề hoạt động:</span>
                    <div className="font-bold text-slate-900">{currentClient.industry || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Cơ quan thuế quản lý:</span>
                    <div className="font-medium text-slate-800 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{currentClient.taxAuthority || renderEmptyField()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Địa chỉ trụ sở ĐKKD:</span>
                    <div className="font-medium text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{currentClient.businessAddress || renderEmptyField()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Người đại diện pháp luật:</span>
                    <div className="font-extrabold text-slate-900">{currentClient.representative || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Số điện thoại:</span>
                    <div className="font-bold text-slate-900 font-mono flex items-center justify-between">
                      <span>{currentClient.phone || renderEmptyField()}</span>
                      {currentClient.phone && (
                        <a
                          href={`tel:${currentClient.phone.replace(/\s+/g, '')}`}
                          className="text-blue-700 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi ngay</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Zalo nhóm / cá nhân 1:1:</span>
                    <div className="font-bold text-emerald-800 font-mono flex items-center justify-between">
                      <span>{currentClient.zalo || currentClient.phone || renderEmptyField()}</span>
                      {(currentClient.zalo || currentClient.phone) && (
                        <a
                          href={`https://zalo.me/${(currentClient.zalo || currentClient.phone).replace(/\s+/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Mở Zalo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Email nhận tờ khai & thông báo:</span>
                    <div className="font-bold text-slate-900">
                      {currentClient.email ? (
                        <a href={`mailto:${currentClient.email}`} className="text-blue-700 hover:underline inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{currentClient.email}</span>
                        </a>
                      ) : (
                        renderEmptyField()
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Địa chỉ giao nhận chứng từ:</span>
                    <div className="font-medium text-slate-800">{currentClient.contactAddress || renderEmptyField()}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GÓI DỊCH VỤ & THIẾT LẬP KẾ TOÁN */}
          {activeTab === 'accounting' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Cấu Hình Dịch Vụ Kế Toán, Phần Mềm MISA & Nghĩa Vụ Thuế
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chi tiết gói dịch vụ, biểu phí thỏa thuận, phần mềm hạch toán và lưu ý chuyên môn
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Gói dịch vụ đang áp dụng
                    </label>
                    <select
                      value={formData.packageType || 'Gói Mới & Nhỏ (đến 3 tỷ)'}
                      onChange={(e) =>
                        handleFieldChange('packageType', e.target.value as CrmClient['packageType'])
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white font-bold"
                    >
                      <option value="Gói Mới & Nhỏ (đến 3 tỷ)">Gói Mới & Nhỏ (đến 3 tỷ)</option>
                      <option value="Gói Đang Phát Triển (3-10 tỷ)">Gói Đang Phát Triển (3-10 tỷ)</option>
                      <option value="Gói Đặc thù">Gói Đặc thù</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Biểu phí hàng tháng
                    </label>
                    <input
                      type="text"
                      value={formData.monthlyFee || ''}
                      onChange={(e) => handleFieldChange('monthlyFee', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Chu kỳ thanh toán phí
                    </label>
                    <select
                      value={formData.paymentCycle || 'Thanh toán theo Quý'}
                      onChange={(e) => handleFieldChange('paymentCycle', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                    >
                      <option value="Thanh toán theo Tháng">Thanh toán theo Tháng</option>
                      <option value="Thanh toán theo Quý">Thanh toán theo Quý</option>
                      <option value="Thanh toán 6 tháng">Thanh toán 6 tháng</option>
                      <option value="Thanh toán theo Năm">Thanh toán theo Năm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Trạng thái phục vụ
                    </label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) =>
                        handleFieldChange('status', e.target.value as CrmClient['status'])
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white font-bold"
                    >
                      <option value="active">Đang phục vụ</option>
                      <option value="pending_handover">Chờ bàn giao chứng từ</option>
                      <option value="paused">Tạm ngưng dịch vụ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kế toán phụ trách 1:1
                    </label>
                    <input
                      type="text"
                      value={formData.assignedAccountant || ''}
                      onChange={(e) => handleFieldChange('assignedAccountant', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ngày bắt đầu phục vụ
                    </label>
                    <input
                      type="text"
                      value={formData.startDate || ''}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Phần mềm hạch toán sổ sách
                    </label>
                    <input
                      type="text"
                      value={formData.accountingSoftware || ''}
                      onChange={(e) => handleFieldChange('accountingSoftware', e.target.value)}
                      placeholder="MISA SME / MISA AMIS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kỳ kê khai thuế GTGT / TNCN
                    </label>
                    <select
                      value={formData.taxPeriod || 'Kê khai theo Quý'}
                      onChange={(e) => handleFieldChange('taxPeriod', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 bg-white"
                    >
                      <option value="Kê khai theo Quý">Kê khai theo Quý</option>
                      <option value="Kê khai theo Tháng">Kê khai theo Tháng</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Nhà cung cấp Hóa đơn điện tử (HĐĐT)
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceMethod || ''}
                      onChange={(e) => handleFieldChange('invoiceMethod', e.target.value)}
                      placeholder="MISA meInvoice / Viettel S-Invoice / VNPT..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Ghi chú chuyên môn & Lưu ý hồ sơ
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      placeholder="Đặc thù chứng từ, lưu ý tồn kho, công nợ, bảo hiểm xã hội..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                      <span className="text-blue-800 font-semibold block text-[11px]">Gói dịch vụ kế toán:</span>
                      <div className="font-extrabold text-blue-950">{currentClient.packageType}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                      <span className="text-emerald-800 font-semibold block text-[11px]">Biểu phí thỏa thuận:</span>
                      <div className="font-extrabold text-emerald-950 text-base">
                        {currentClient.monthlyFee}
                        {currentClient.paymentCycle && (
                          <span className="ml-2 text-xs font-semibold text-emerald-700">
                            ({currentClient.paymentCycle})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Phụ trách chuyên môn 1:1:</span>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{currentClient.assignedAccountant}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Ngày bắt đầu & Cập nhật cuối:</span>
                      <div className="font-mono text-slate-900 font-bold">
                        {currentClient.startDate}
                        {currentClient.updatedAt && (
                          <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                            Sửa gần nhất: {currentClient.updatedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Phần mềm hạch toán:</span>
                      <div className="font-bold text-slate-900">{currentClient.accountingSoftware || renderEmptyField()}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Kỳ kê khai thuế:</span>
                      <div className="font-bold text-slate-900">{currentClient.taxPeriod || renderEmptyField()}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Hệ thống Hóa đơn điện tử (HĐĐT):</span>
                    <div className="font-bold text-slate-900">{currentClient.invoiceMethod || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <span className="text-amber-900 font-bold block text-[11px]">Ghi chú chuyên môn & Đặc thù hồ sơ:</span>
                    <div className="font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                      {currentClient.notes || renderEmptyField()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HỢP ĐỒNG & BÁO GIÁ TRÊN HỆ THỐNG */}
          {activeTab === 'deals' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Báo Giá & Hợp Đồng Gắn Với Doanh Nghiệp ({clientDeals.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu đồng bộ trực tiếp từ phân hệ 4. Báo giá & Hợp đồng
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuickDeal((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold self-start sm:self-auto transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo hợp đồng / báo giá</span>
                </button>
              </div>

              {showQuickDeal && (
                <form
                  onSubmit={handleQuickCreateDeal}
                  className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs sm:text-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gói dịch vụ</label>
                      <input
                        type="text"
                        value={quickDealPackage}
                        onChange={(e) => setQuickDealPackage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Biểu phí tháng</label>
                      <input
                        type="text"
                        value={quickDealFee}
                        onChange={(e) => setQuickDealFee(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú phạm vi</label>
                    <input
                      type="text"
                      placeholder="Phạm vi: hạch toán MISA, kê khai thuế định kỳ..."
                      value={quickDealNotes}
                      onChange={(e) => setQuickDealNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickDeal(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs"
                    >
                      Lưu hợp đồng
                    </button>
                  </div>
                </form>
              )}

              {clientDeals.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
                  <FileText className="w-7 h-7 mx-auto text-slate-300" />
                  <div className="text-xs sm:text-sm">
                    Chưa có bản ghi hợp đồng / báo giá riêng nào trên hệ thống cho doanh nghiệp này.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/40 space-y-2.5 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md text-xs">
                            {deal.code}
                          </span>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {deal.packageTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getDealStatusBadge(deal.status)}
                          <select
                            value={deal.status}
                            onChange={(e) =>
                              updateDealStatus(deal.id, e.target.value as CrmDeal['status'])
                            }
                            className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-slate-300 bg-white text-slate-700"
                          >
                            <option value="draft">Dự thảo</option>
                            <option value="sent">Đã gửi</option>
                            <option value="signed">Đã ký kết</option>
                            <option value="renewing">Gia hạn</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Phí dịch vụ: <strong className="text-slate-900">{deal.feeMonthly}</strong>
                        </span>
                        <span>•</span>
                        <span className="font-mono">Ngày gửi: {deal.sentDate}</span>
                        {deal.signedDate && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-emerald-700 font-bold">
                              Ngày ký: {deal.signedDate}
                            </span>
                          </>
                        )}
                      </div>

                      {deal.notes && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                          {deal.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CÔNG VIỆC KẾ TOÁN & LỊCH SỬ HỆ THỐNG */}
          {activeTab === 'tasks' && (
            <div className="space-y-5">
              {/* Tasks section */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Công Việc Kế Toán & Lịch Nhắc Thuế ({clientTasks.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đồng bộ trực tiếp với phân hệ 5. Quản lý công việc (có thể đánh dấu hoàn thành ngay tại đây)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuickTask((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold self-start sm:self-auto transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm lịch nhắc mới</span>
                  </button>
                </div>

                {showQuickTask && (
                  <form
                    onSubmit={handleQuickCreateTask}
                    className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3 text-xs sm:text-sm"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nội dung công việc *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Kiểm tra bảng kê hóa đơn đầu vào quý IV..."
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Hạn hoàn thành</label>
                        <input
                          type="text"
                          value={quickTaskDue}
                          onChange={(e) => setQuickTaskDue(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nghiệp vụ</label>
                        <select
                          value={quickTaskCategory}
                          onChange={(e) => setQuickTaskCategory(e.target.value as CrmTask['category'])}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                        >
                          <option value="Kê khai thuế">Kê khai thuế</option>
                          <option value="Sổ sách MISA">Sổ sách MISA</option>
                          <option value="Chứng từ Zalo">Chứng từ Zalo</option>
                          <option value="Báo cáo tài chính">Báo cáo tài chính</option>
                          <option value="Hợp đồng">Hợp đồng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Ưu tiên</label>
                        <select
                          value={quickTaskPriority}
                          onChange={(e) => setQuickTaskPriority(e.target.value as CrmTask['priority'])}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                        >
                          <option value="Bình thường">Bình thường</option>
                          <option value="Cao">Cao</option>
                          <option value="Khẩn cấp">Khẩn cấp</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickTask(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-xs"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                      >
                        Lưu công việc
                      </button>
                    </div>
                  </form>
                )}

                {clientTasks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl">
                    <CheckSquare className="w-7 h-7 mx-auto text-slate-300" />
                    <div className="text-xs sm:text-sm">
                      Hiện chưa có công việc tồn đọng nào cho doanh nghiệp này.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {clientTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          task.isCompleted
                            ? 'bg-slate-50 border-slate-200 opacity-70'
                            : 'bg-white border-slate-200 hover:border-purple-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => toggleTask(task.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div
                              className={`text-xs sm:text-sm font-bold leading-snug ${
                                task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                                {task.category}
                              </span>
                              <span>•</span>
                              <span>Phụ trách: {task.assignedTo}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-rose-700 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{task.dueDate}</span>
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'Khẩn cấp'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'Cao'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Lead History if any */}
              {matchedLeads.length > 0 && (
                <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs sm:text-sm">
                    <Target className="w-4 h-4" />
                    <span>Hồ Sơ Tiếp Nhận Ban Đầu (Lead Tiền Thân)</span>
                  </div>
                  {matchedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          {lead.fullName} — <span className="font-mono">{lead.phoneZalo}</span>
                        </span>
                        <span className="text-slate-500 font-mono">
                          Nguồn: {lead.source} ({lead.createdAt})
                        </span>
                      </div>
                      <p className="text-slate-700">
                        <strong>Vướng mắc ban đầu:</strong> {lead.primaryProblem}
                      </p>
                      {lead.notes && (
                        <p className="text-slate-600">
                          <strong>Ghi chú tư vấn:</strong> {lead.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                              */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              Mã DN: <strong className="font-mono text-slate-800">{currentClient.id}</strong> • MST:{' '}
              <strong className="font-mono text-slate-800">{currentClient.taxCode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Hủy thay đổi</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
