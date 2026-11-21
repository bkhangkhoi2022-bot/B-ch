import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Save, 
  RotateCcw, 
  User, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Building2, 
  FileText, 
  HelpCircle, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCrm, CrmLead } from '../../context/CrmContext';

interface CustomerDetailModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  leadId,
  isOpen,
  onClose,
}) => {
  const { leads, updateLead } = useCrm();

  const currentLead = leads.find((l) => l.id === leadId);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'business' | 'needs' | 'status'>('contact');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Editable form state
  const [formData, setFormData] = useState<Partial<CrmLead>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Reset or initialize when leadId or modal opens
  useEffect(() => {
    if (currentLead) {
      setFormData({
        fullName: currentLead.fullName || '',
        phoneZalo: currentLead.phoneZalo || '',
        phone: currentLead.phone || currentLead.phoneZalo || '',
        zalo: currentLead.zalo || currentLead.phoneZalo || '',
        email: currentLead.email || '',
        contactAddress: currentLead.contactAddress || '',
        assignedStaff: currentLead.assignedStaff || 'Mã Thị Bích',

        businessName: currentLead.businessName || '',
        taxCode: currentLead.taxCode || '',
        businessType: currentLead.businessType || 'Công ty TNHH 1 Thành viên',
        industry: currentLead.industry || 'Du lịch / Cho thuê xe máy',
        businessAddress: currentLead.businessAddress || '',
        estimatedRevenue: currentLead.estimatedRevenue || 'Dưới 3 tỷ/năm',
        businessScale: currentLead.businessScale || 'Dưới 5 nhân sự (Chuyển từ Hộ KD)',

        interestedService: currentLead.interestedService || 'Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)',
        primaryProblem: currentLead.primaryProblem || '',
        invoiceStatus: currentLead.invoiceStatus || 'Chưa quen xuất hóa đơn điện tử',
        consultationContent: currentLead.consultationContent || '',
        clientFeedback: currentLead.clientFeedback || '',
        nextStep: currentLead.nextStep || 'Gửi dự thảo hợp đồng & hướng dẫn Zalo',
        followUpDate: currentLead.followUpDate || '',

        source: currentLead.source || 'Website Form',
        status: currentLead.status || 'new',
        notes: currentLead.notes || '',
      });
      setIsEditing(false);
      setIsDirty(false);
      setErrorMessage(null);
      setActiveTab('contact');
    }
  }, [leadId, isOpen]);

  if (!isOpen || !currentLead) return null;

  const handleFieldChange = (field: keyof CrmLead, value: any) => {
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
  };

  const handleCancelEditing = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy bỏ các thay đổi này không?');
      if (!confirmDiscard) return;
    }
    // Revert to current lead
    setFormData({
      fullName: currentLead.fullName || '',
      phoneZalo: currentLead.phoneZalo || '',
      phone: currentLead.phone || currentLead.phoneZalo || '',
      zalo: currentLead.zalo || currentLead.phoneZalo || '',
      email: currentLead.email || '',
      contactAddress: currentLead.contactAddress || '',
      assignedStaff: currentLead.assignedStaff || 'Mã Thị Bích',

      businessName: currentLead.businessName || '',
      taxCode: currentLead.taxCode || '',
      businessType: currentLead.businessType || 'Công ty TNHH 1 Thành viên',
      industry: currentLead.industry || 'Du lịch / Cho thuê xe máy',
      businessAddress: currentLead.businessAddress || '',
      estimatedRevenue: currentLead.estimatedRevenue || 'Dưới 3 tỷ/năm',
      businessScale: currentLead.businessScale || 'Dưới 5 nhân sự (Chuyển từ Hộ KD)',

      interestedService: currentLead.interestedService || 'Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)',
      primaryProblem: currentLead.primaryProblem || '',
      invoiceStatus: currentLead.invoiceStatus || 'Chưa quen xuất hóa đơn điện tử',
      consultationContent: currentLead.consultationContent || '',
      clientFeedback: currentLead.clientFeedback || '',
      nextStep: currentLead.nextStep || 'Gửi dự thảo hợp đồng & hướng dẫn Zalo',
      followUpDate: currentLead.followUpDate || '',

      source: currentLead.source || 'Website Form',
      status: currentLead.status || 'new',
      notes: currentLead.notes || '',
    });
    setIsEditing(false);
    setIsDirty(false);
    setErrorMessage(null);
  };

  const handleSave = () => {
    if (!currentLead) return;

    // Validate phone number preserves leading 0 and is not blank
    const phoneToSave = (formData.phoneZalo || formData.phone || '').trim();
    if (!phoneToSave) {
      setErrorMessage('Số điện thoại / Zalo là thông tin bắt buộc, không được để trống.');
      return;
    }

    if (!formData.fullName || !formData.fullName.trim()) {
      setErrorMessage('Họ và tên khách hàng là thông tin bắt buộc, không được để trống.');
      return;
    }

    // Call updateLead
    const result = updateLead(currentLead.id, {
      ...formData,
      phoneZalo: phoneToSave,
      phone: (formData.phone || phoneToSave).trim(),
      zalo: (formData.zalo || phoneToSave).trim(),
    });

    if (result.success) {
      setIsEditing(false);
      setIsDirty(false);
      setErrorMessage(null);
      setSuccessToast('Đã lưu thành công thông tin khách hàng!');
      setTimeout(() => setSuccessToast(null), 3500);
    } else {
      setErrorMessage(result.error || 'Có lỗi xảy ra trong quá trình lưu dữ liệu.');
    }
  };

  const handleCloseModal = () => {
    if (isEditing && isDirty) {
      const confirmClose = window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng và bỏ qua thay đổi không?');
      if (!confirmClose) return;
    }
    onClose();
  };

  const getStatusBadge = (status?: CrmLead['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Mới nhận</span>;
      case 'contacting':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Đang tư vấn</span>;
      case 'quoted':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Đã gửi báo giá</span>;
      case 'closed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">Đã ký hợp đồng</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Lưu trữ</span>;
    }
  };

  const renderEmptyField = () => <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Modal Container: 850px - 1000px on desktop, full on mobile, max-h 90% */}
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
              {currentLead.fullName ? currentLead.fullName.charAt(0).toUpperCase() : 'K'}
            </div>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {currentLead.fullName}
                </h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                  {currentLead.id}
                </span>
                {getStatusBadge(isEditing ? formData.status : currentLead.status)}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span>{currentLead.businessName || 'Doanh nghiệp chưa đặt tên'}</span>
                <span>•</span>
                <span className="font-mono text-emerald-800 font-semibold">{currentLead.phoneZalo}</span>
                <span>•</span>
                <span>Tiếp nhận: {currentLead.createdAt}</span>
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

        {/* Success or Error Alerts inside modal */}
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
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm">
            
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'contact'
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Tab 1 – Thông tin liên hệ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'business'
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Tab 2 – Thông tin doanh nghiệp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('needs')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'needs'
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tab 3 – Nhu cầu & Tư vấn</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`pb-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'status'
                  ? 'border-emerald-600 text-emerald-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Tab 4 – Trạng thái & Nguồn</span>
            </button>

          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY (SCROLLABLE, VIEW VS EDIT MODE)                */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
          
          {/* TAB 1: THÔNG TIN LIÊN HỆ */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Thông Tin Liên Hệ Khách Hàng
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đầu mối trao đổi chuyên môn 1:1 qua điện thoại, Zalo và Email
                  </p>
                </div>
                {!isEditing && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Chế độ xem
                  </span>
                )}
              </div>

              {isEditing ? (
                /* EDIT MODE */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số điện thoại liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => {
                        handleFieldChange('phone', e.target.value);
                        if (!formData.zalo) handleFieldChange('zalo', e.target.value);
                        handleFieldChange('phoneZalo', e.target.value);
                      }}
                      placeholder="0912 345 678 (giữ nguyên số 0 đầu)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-mono"
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
                      placeholder="0912 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="khachhang@congty.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Địa chỉ liên hệ cá nhân / Nơi cư trú
                    </label>
                    <input
                      type="text"
                      value={formData.contactAddress || ''}
                      onChange={(e) => handleFieldChange('contactAddress', e.target.value)}
                      placeholder="Thành phố Cao Bằng, Tỉnh Cao Bằng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Người phụ trách trao đổi 1:1
                    </label>
                    <input
                      type="text"
                      value={formData.assignedStaff || 'Mã Thị Bích'}
                      onChange={(e) => handleFieldChange('assignedStaff', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Họ và tên khách hàng:</span>
                    <div className="font-extrabold text-slate-900 text-base">{currentLead.fullName || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Số điện thoại:</span>
                    <div className="font-bold text-slate-900 font-mono flex items-center justify-between">
                      <span>{currentLead.phone || currentLead.phoneZalo || renderEmptyField()}</span>
                      {currentLead.phoneZalo && (
                        <a 
                          href={`tel:${(currentLead.phone || currentLead.phoneZalo).replace(/\s+/g, '')}`} 
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Số Zalo trao đổi 1:1:</span>
                    <div className="font-bold text-emerald-800 font-mono flex items-center justify-between">
                      <span>{currentLead.zalo || currentLead.phoneZalo || renderEmptyField()}</span>
                      {currentLead.phoneZalo && (
                        <a 
                          href={`https://zalo.me/${(currentLead.zalo || currentLead.phoneZalo).replace(/\s+/g, '')}`} 
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
                    <span className="text-slate-500 font-semibold block text-[11px]">Email liên hệ:</span>
                    <div className="font-bold text-slate-900">
                      {currentLead.email ? (
                        <a href={`mailto:${currentLead.email}`} className="text-emerald-700 hover:underline">
                          {currentLead.email}
                        </a>
                      ) : renderEmptyField()}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Địa chỉ liên hệ:</span>
                    <div className="font-medium text-slate-800">{currentLead.contactAddress || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1 sm:col-span-2">
                    <span className="text-emerald-800 font-semibold block text-[11px]">Người phụ trách chuyên môn trực tiếp:</span>
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>{currentLead.assignedStaff || 'Mã Thị Bích — 12 năm kinh nghiệm kế toán, 5 năm thuế'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THÔNG TIN DOANH NGHIỆP */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Thông Tin Pháp Nhân & Doanh Nghiệp
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hồ sơ đăng ký kinh doanh và đặc thù ngành nghề vận hành
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Tên doanh nghiệp / Đơn vị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName || ''}
                      onChange={(e) => handleFieldChange('businessName', e.target.value)}
                      placeholder="Công ty TNHH..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mã số thuế (MST)
                    </label>
                    <input
                      type="text"
                      value={formData.taxCode || ''}
                      onChange={(e) => handleFieldChange('taxCode', e.target.value)}
                      placeholder="4800xxxxxx (10 hoặc 13 số)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Loại hình doanh nghiệp
                    </label>
                    <select
                      value={formData.businessType || 'Công ty TNHH 1 Thành viên'}
                      onChange={(e) => handleFieldChange('businessType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
                    >
                      <option value="Công ty TNHH 1 Thành viên">Công ty TNHH 1 Thành viên</option>
                      <option value="Công ty TNHH 2 Thành viên trở lên">Công ty TNHH 2 Thành viên trở lên</option>
                      <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                      <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                      <option value="Hộ kinh doanh cá thể">Hộ kinh doanh cá thể</option>
                      <option value="Chuẩn bị thành lập">Chuẩn bị thành lập</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ngành nghề kinh doanh
                    </label>
                    <select
                      value={formData.industry || 'Du lịch / Cho thuê xe máy'}
                      onChange={(e) => handleFieldChange('industry', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
                    >
                      <option value="Du lịch / Cho thuê xe máy">Du lịch / Cho thuê xe máy</option>
                      <option value="Sản xuất cơ khí / Nhôm kính">Sản xuất cơ khí / Nhôm kính</option>
                      <option value="Vệ sinh công nghiệp / Dịch vụ">Vệ sinh công nghiệp / Dịch vụ</option>
                      <option value="Thương mại / Bán lẻ">Thương mại / Bán lẻ</option>
                      <option value="Sửa chữa kỹ thuật / Ô tô">Sửa chữa kỹ thuật / Ô tô</option>
                      <option value="Lĩnh vực khác">Lĩnh vực khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Doanh thu năm dự kiến
                    </label>
                    <select
                      value={formData.estimatedRevenue || 'Dưới 3 tỷ/năm'}
                      onChange={(e) => handleFieldChange('estimatedRevenue', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
                    >
                      <option value="Dưới 3 tỷ/năm">Dưới 3 tỷ/năm (Gói Doanh nghiệp Mới & Nhỏ)</option>
                      <option value="3 - 10 tỷ/năm">3 - 10 tỷ/năm (Gói Doanh nghiệp Đang Phát Triển)</option>
                      <option value="Trên 10 tỷ/năm">Trên 10 tỷ/năm (Gói Quy mô lớn)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Địa chỉ trụ sở doanh nghiệp
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress || ''}
                      onChange={(e) => handleFieldChange('businessAddress', e.target.value)}
                      placeholder="Thành phố Cao Bằng, Tỉnh Cao Bằng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Quy mô hoạt động & Nhân công
                    </label>
                    <input
                      type="text"
                      value={formData.businessScale || ''}
                      onChange={(e) => handleFieldChange('businessScale', e.target.value)}
                      placeholder="Ví dụ: 3 nhân viên cố định, 150 hóa đơn/tháng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Tên doanh nghiệp:</span>
                    <div className="font-extrabold text-slate-900 text-base">{currentLead.businessName || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Mã số thuế (MST):</span>
                    <div className="font-bold text-slate-900 font-mono">{currentLead.taxCode || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Loại hình doanh nghiệp:</span>
                    <div className="font-bold text-slate-900">{currentLead.businessType || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Ngành nghề kinh doanh:</span>
                    <div className="font-bold text-emerald-800">{currentLead.industry || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Khung doanh thu năm dự kiến:</span>
                    <div className="font-bold text-slate-900">{currentLead.estimatedRevenue || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Địa chỉ trụ sở đăng ký:</span>
                    <div className="font-medium text-slate-800">{currentLead.businessAddress || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold block text-[11px]">Quy mô nhân sự & chứng từ:</span>
                    <div className="font-medium text-slate-800">{currentLead.businessScale || renderEmptyField()}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NHU CẦU VÀ TƯ VẤN */}
          {activeTab === 'needs' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Nhu Cầu Kế Toán & Nhật Ký Tư Vấn
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nhận vướng mắc chứng từ, nội dung đã tư vấn và các mốc hẹn liên hệ lại
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Gói dịch vụ khách quan tâm
                      </label>
                      <input
                        type="text"
                        value={formData.interestedService || ''}
                        onChange={(e) => handleFieldChange('interestedService', e.target.value)}
                        placeholder="Kế toán trọn gói Doanh nghiệp Nhỏ..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tình trạng hóa đơn, chứng từ hiện nay
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceStatus || ''}
                        onChange={(e) => handleFieldChange('invoiceStatus', e.target.value)}
                        placeholder="Chưa quen xuất HĐĐT / Chưa có phần mềm..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Vướng mắc chính cần giải quyết <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.primaryProblem || ''}
                      onChange={(e) => handleFieldChange('primaryProblem', e.target.value)}
                      placeholder="Mô tả khó khăn về hóa đơn, chứng từ hoặc kỳ nộp thuế..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nội dung tư vấn chi tiết đã trao đổi
                    </label>
                    <textarea
                      rows={3}
                      value={formData.consultationContent || ''}
                      onChange={(e) => handleFieldChange('consultationContent', e.target.value)}
                      placeholder="Ghi chú nội dung hướng dẫn hóa đơn, gửi checklist, giải thích quy trình 6 bước..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Phản hồi của khách hàng
                      </label>
                      <input
                        type="text"
                        value={formData.clientFeedback || ''}
                        onChange={(e) => handleFieldChange('clientFeedback', e.target.value)}
                        placeholder="Đã hiểu quy trình, đồng ý mức phí..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Bước tiếp theo (Next Action)
                      </label>
                      <input
                        type="text"
                        value={formData.nextStep || ''}
                        onChange={(e) => handleFieldChange('nextStep', e.target.value)}
                        placeholder="Gửi hợp đồng dự thảo / Hẹn trao đổi Zalo..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ngày hẹn liên hệ lại (Follow-up Date)
                    </label>
                    <input
                      type="text"
                      value={formData.followUpDate || ''}
                      onChange={(e) => handleFieldChange('followUpDate', e.target.value)}
                      placeholder="Ví dụ: 15/11/2026 hoặc 20/11/2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Gói dịch vụ quan tâm:</span>
                      <div className="font-bold text-emerald-900">{currentLead.interestedService || renderEmptyField()}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Tình trạng hóa đơn:</span>
                      <div className="font-bold text-slate-900">{currentLead.invoiceStatus || renderEmptyField()}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1">
                    <span className="text-amber-900 font-bold block text-[11px]">Vướng mắc cần tháo gỡ (BCM Pain):</span>
                    <div className="font-medium text-slate-900 leading-relaxed">{currentLead.primaryProblem || renderEmptyField()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Nội dung đã tư vấn:</span>
                    <div className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {currentLead.consultationContent || renderEmptyField()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Phản hồi của khách hàng:</span>
                      <div className="font-medium text-slate-800">{currentLead.clientFeedback || renderEmptyField()}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Bước tiếp theo:</span>
                      <div className="font-bold text-emerald-800">{currentLead.nextStep || renderEmptyField()}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-blue-900 font-semibold block text-[11px]">Hạn liên hệ lại:</span>
                      <div className="font-bold text-blue-950 text-sm">{currentLead.followUpDate || renderEmptyField()}</div>
                    </div>
                    <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRẠNG THÁI VÀ NGUỒN KHÁCH */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Trạng Thái Phễu, Nguồn Khách & Ghi Chú
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý chu trình chuyển đổi và ghi chú nội bộ kế toán
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Trạng thái khách hàng <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.status || 'new'}
                        onChange={(e) => handleFieldChange('status', e.target.value as CrmLead['status'])}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white font-bold"
                      >
                        <option value="new">Mới nhận (Chưa liên hệ)</option>
                        <option value="contacting">Đang tư vấn (Đang trao đổi Zalo)</option>
                        <option value="quoted">Đã gửi báo giá (Chờ xác nhận)</option>
                        <option value="closed">Đã ký hợp đồng (Đã thành khách hàng)</option>
                        <option value="archived">Lưu trữ (Tạm ngưng / Không phù hợp)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nguồn tiếp nhận
                      </label>
                      <select
                        value={formData.source || 'Website Form'}
                        onChange={(e) => handleFieldChange('source', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white"
                      >
                        <option value="Website Form">Website Form (Trang chủ quybich.vn)</option>
                        <option value="Checklist Download">Tải Checklist khởi đầu (Miễn phí)</option>
                        <option value="Zalo Trực tiếp">Zalo Trực tiếp</option>
                        <option value="Giới thiệu">Khách hàng cũ giới thiệu</option>
                        <option value="Khác">Kênh khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ghi chú nội bộ chuyên môn
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      placeholder="Ghi chú chi tiết về chứng từ đặc thù, ngày bắt đầu bàn giao..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Trạng thái hiện tại:</span>
                      <div className="pt-0.5">{getStatusBadge(currentLead.status)}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Nguồn tiếp nhận:</span>
                      <div className="font-bold text-slate-900">{currentLead.source}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Thời gian tiếp nhận:</span>
                      <div className="font-mono text-slate-900 font-bold">{currentLead.createdAt}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Cập nhật gần nhất:</span>
                      <div className="font-mono text-emerald-800 font-bold">
                        {currentLead.updatedAt || currentLead.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Ghi chú nội bộ:</span>
                    <div className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {currentLead.notes || renderEmptyField()}
                    </div>
                  </div>
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
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mã khách hàng: <strong className="font-mono text-slate-800">{currentLead.id}</strong> (Bảo mật nội bộ)</span>
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa thông tin</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
