import React, { useState } from 'react';
import { 
  PanelsTopLeft, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Navigation, 
  FileText, 
  ListOrdered, 
  DollarSign, 
  HelpCircle, 
  PhoneCall, 
  ShieldCheck, 
  Calculator, 
  PanelBottom, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { Link } from '../../router';
import { CmsToolbar } from '../components/CmsToolbar';
import { useCms, CmsSectionConfig } from '../../context/CmsContext';

// Helper icon mapping per section type
const sectionIcons: Record<string, React.ReactNode> = {
  header: <Navigation className="w-4 h-4 text-sky-600" />,
  hero: <Sparkles className="w-4 h-4 text-emerald-600" />,
  pains: <AlertCircle className="w-4 h-4 text-amber-600" />,
  services: <Layers className="w-4 h-4 text-indigo-600" />,
  process: <ListOrdered className="w-4 h-4 text-emerald-600" />,
  pricing: <DollarSign className="w-4 h-4 text-teal-600" />,
  diagnostic: <Calculator className="w-4 h-4 text-purple-600" />,
  credibility: <ShieldCheck className="w-4 h-4 text-blue-600" />,
  faq: <HelpCircle className="w-4 h-4 text-orange-600" />,
  contact: <PhoneCall className="w-4 h-4 text-emerald-600" />,
  footer: <PanelBottom className="w-4 h-4 text-slate-600" />,
};

export const CmsHomepage: React.FC = () => {
  const { 
    draftData, 
    updateSection, 
    toggleSectionVisibility, 
    reorderSection, 
    resetSectionToDefault,
    resetAllSections,
    updateHero, 
    updateBrand, 
    updateTrustPillars,
    updatePains,
    updateProcess,
    updatePricing,
    updateCredibility,
    updateContact,
    updateFooter,
    saveDraft
  } = useCms();

  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-hero');
  const [filterMode, setFilterMode] = useState<'all' | 'visible' | 'hidden'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sort sections by current order
  const sections = [...draftData.sections].sort((a, b) => a.order - b.order);

  // Filter sections
  const filteredSections = sections.filter(sec => {
    if (filterMode === 'visible') return sec.isVisible;
    if (filterMode === 'hidden') return !sec.isVisible;
    return true;
  });

  const selectedSection = sections.find(s => s.id === selectedSectionId) || sections[0];

  const handleSaveSectionDraft = () => {
    const res = saveDraft();
    if (res.success) {
      showNotification(`Đã lưu nháp thay đổi cho khối "${selectedSection.name}"`);
    } else {
      showNotification(res.message);
    }
  };

  const handleResetSection = () => {
    if (window.confirm(`Khôi phục cấu hình mặc định ban đầu cho khối "${selectedSection.name}"?`)) {
      resetSectionToDefault(selectedSection.id);
      showNotification(`Đã khôi phục mặc định cho khối "${selectedSection.name}"`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Universal Action Toolbar */}
      <CmsToolbar />

      {/* Breadcrumb Navigation & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/admin/cms" className="hover:text-slate-900 transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tổng quan CMS</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Hệ thống Section Builder Trang chủ</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tự động nhận diện {sections.length} Section theo thứ tự hiển thị</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Section Builder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: DANH SÁCH SECTION             */}
        {/* ========================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            
            {/* Header of Section List */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PanelsTopLeft className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Danh sách Section ({sections.length})
                  </h2>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Khôi phục toàn bộ thứ tự và hiển thị 11 Section về mặc định?")) {
                      resetAllSections();
                      showNotification("Đã khôi phục toàn bộ 11 Section về mặc định.");
                    }
                  }}
                  className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                  title="Khôi phục thứ tự ban đầu"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục thứ tự</span>
                </button>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition-all ${
                    filterMode === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({sections.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('visible')}
                  className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition-all ${
                    filterMode === 'visible'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hiển thị ({sections.filter(s => s.isVisible).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('hidden')}
                  className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition-all ${
                    filterMode === 'hidden'
                      ? 'bg-white text-rose-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đang ẩn ({sections.filter(s => !s.isVisible).length})
                </button>
              </div>
            </div>

            {/* List of Sections with Order, Visibility, & Reorder Controls */}
            <div className="p-3 space-y-2 max-h-[750px] overflow-y-auto">
              {filteredSections.map((sec, index) => {
                const isSelected = sec.id === selectedSectionId;
                const isFirst = index === 0;
                const isLast = index === sections.length - 1;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : sec.isVisible
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        : 'bg-slate-50/80 border-slate-200/70 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Left: Position Badge & Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        {sec.order}
                      </span>

                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs shrink-0">
                        {sectionIcons[sec.type] || <FileText className="w-4 h-4 text-slate-600" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isSelected ? 'text-emerald-950 font-extrabold' : 'text-slate-800'
                          }`}>
                            {sec.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                            {sec.id}
                          </span>
                          {!sec.isVisible && (
                            <span className="text-rose-600 font-semibold bg-rose-50 px-1 rounded">
                              Đã ẩn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions (Visibility Toggle & Reorder Buttons) */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleSectionVisibility(sec.id);
                          showNotification(
                            sec.isVisible
                              ? `Đã ẩn khối "${sec.name}" khỏi website`
                              : `Đã bật hiển thị khối "${sec.name}" trên website`
                          );
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          sec.isVisible
                            ? 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-200 bg-slate-100'
                        }`}
                        title={sec.isVisible ? "Khối đang hiển thị — Bấm để ẩn" : "Khối đang ẩn — Bấm để hiển thị"}
                      >
                        {sec.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {/* Reorder Up */}
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => reorderSection(sec.id, 'up')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFirst
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                        }`}
                        title="Đẩy lên vị trí trước"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => reorderSection(sec.id, 'down')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLast
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                        }`}
                        title="Đẩy xuống vị trí sau"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Active indicator arrow */}
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-emerald-700 ml-0.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Đang chọn: <strong>{selectedSection.name}</strong></span>
              <span className="font-mono text-[10px]">Thứ tự: #{selectedSection.order}</span>
            </div>

          </div>

          {/* Tips Card */}
          <div className="bg-emerald-900 text-emerald-100 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Info className="w-4 h-4" />
              <span>Nguyên tắc Section Builder</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Các thay đổi về thứ tự hoặc trạng thái Ẩn/Hiện sẽ lưu vào bản nháp. Website công khai chỉ cập nhật sau khi bạn bấm <strong>"Xuất bản"</strong> trên thanh công cụ.
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: BIÊN TẬP SECTION ĐANG CHỌN  */}
        {/* ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header of Selected Section Editor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  {sectionIcons[selectedSection.type] || <PanelsTopLeft className="w-5 h-5 text-emerald-700" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      Vị trí #{selectedSection.order}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {selectedSection.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedSection.description}
                  </p>
                </div>
              </div>

              {/* Quick Actions for this Section */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleResetSection}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                  title="Khôi phục nội dung mặc định của khối này"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSectionDraft}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu khối này</span>
                </button>
              </div>

            </div>

            {/* Visibility Toggle Switch & ID tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <label className="text-xs font-bold text-slate-700">Trạng thái hiển thị trên website:</label>
                <button
                  type="button"
                  onClick={() => {
                    toggleSectionVisibility(selectedSection.id);
                    showNotification(
                      selectedSection.isVisible
                        ? `Đã tắt hiển thị khối "${selectedSection.name}"`
                        : `Đã bật hiển thị khối "${selectedSection.name}"`
                    );
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSection.isVisible
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {selectedSection.isVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Đang BẬT (Hiển thị)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-rose-700" />
                      <span>Đang TẮT (Đã ẩn)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                ID: <strong>{selectedSection.id}</strong>
              </div>
            </div>

          </div>

          {/* Notification Toast */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* DYNAMIC FORM EDITOR TÙY THEO TỪNG SECTION ĐƯỢC CHỌN     */}
          {/* ======================================================== */}

          {/* 1. SEC-HEADER */}
          {selectedSection.id === 'sec-header' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Cấu hình Thanh điều hướng đầu trang (Header)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý biểu tượng, thương hiệu và thông tin hotline xuất hiện trên thanh menu
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên thương hiệu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draftData.brand.brandName}
                    onChange={(e) => updateBrand({ brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề phụ / Lĩnh vực
                  </label>
                  <input
                    type="text"
                    value={draftData.brand.title}
                    onChange={(e) => updateBrand({ title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hotline tư vấn nhanh
                  </label>
                  <input
                    type="text"
                    value={draftData.brand.contactPhone}
                    onChange={(e) => updateBrand({ contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email tiếp nhận
                  </label>
                  <input
                    type="email"
                    value={draftData.brand.email}
                    onChange={(e) => updateBrand({ email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Quick links overview */}
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-700 mb-2">5 Menu điều hướng nhanh:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">1. Dịch vụ trọn gói (#dich-vu)</div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">2. Quy trình 6 bước (#quy-trinh)</div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">3. Bảng phí (#bang-phi)</div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">4. Khảo sát (#khao-sat)</div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">5. Hỏi đáp FAQ (#faq)</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SEC-HERO */}
          {selectedSection.id === 'sec-hero' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Nội dung văn bản Hero Banner
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thông điệp định vị xuất hiện ngay trên đầu trang chủ
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nhãn định vị (Kicker Tag)
                    </label>
                    <input
                      type="text"
                      value={draftData.hero.kicker}
                      onChange={(e) => updateHero({ kicker: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tiêu đề chính (Headline) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={draftData.hero.headline}
                      onChange={(e) => updateHero({ headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mô tả phụ (Subheadline)
                    </label>
                    <textarea
                      rows={3}
                      value={draftData.hero.subheadline}
                      onChange={(e) => updateHero({ subheadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nút chính (Primary CTA Text)
                      </label>
                      <input
                        type="text"
                        value={draftData.hero.primaryCtaText}
                        onChange={(e) => updateHero({ primaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nút phụ (Secondary CTA Text)
                      </label>
                      <input
                        type="text"
                        value={draftData.hero.secondaryCtaText}
                        onChange={(e) => updateHero({ secondaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image & Caption */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Hình ảnh minh họa Hero & Chú thích minh bạch
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn tệp ảnh (URL)</label>
                    <input
                      type="text"
                      value={draftData.hero.imageUrl}
                      onChange={(e) => updateHero({ imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chú thích dưới ảnh (Caption)</label>
                    <input
                      type="text"
                      value={draftData.hero.imageCaption}
                      onChange={(e) => updateHero({ imageCaption: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Trust Pillars */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    4 Cột chỉ số niềm tin (Trust Pillars)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {draftData.trustPillars.map((pillar, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Chỉ số #{idx + 1}</span>
                      <input
                        type="text"
                        value={pillar.stat}
                        onChange={(e) => {
                          const updated = [...draftData.trustPillars];
                          updated[idx] = { ...updated[idx], stat: e.target.value };
                          updateTrustPillars(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        value={pillar.label}
                        onChange={(e) => {
                          const updated = [...draftData.trustPillars];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          updateTrustPillars(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                      />
                      <input
                        type="text"
                        value={pillar.subtext}
                        onChange={(e) => {
                          const updated = [...draftData.trustPillars];
                          updated[idx] = { ...updated[idx], subtext: e.target.value };
                          updateTrustPillars(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. SEC-PAINS */}
          {selectedSection.id === 'sec-pains' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Biên tập Thực trạng & 6 Nỗi đau doanh nghiệp (P1–P6)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thấu cảm khó khăn của chủ hộ kinh doanh khi chuyển lên công ty
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề chính của Section</label>
                  <input
                    type="text"
                    value={draftData.pains.title}
                    onChange={(e) => updatePains({ title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả dẫn nhập</label>
                  <textarea
                    rows={2}
                    value={draftData.pains.subtitle}
                    onChange={(e) => updatePains({ subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                {/* 6 Pain points preview & quick edit */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <span className="block text-xs font-bold text-slate-700">Danh mục 6 nỗi đau chuẩn BCM:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {draftData.pains.items.map((pain, idx) => (
                      <div key={pain.code} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                            {pain.code}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={pain.title}
                          onChange={(e) => {
                            const updated = [...draftData.pains.items];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            updatePains({ items: updated });
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold text-slate-900"
                        />
                        <p className="text-[11px] text-slate-500 line-clamp-2">{pain.symptom}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SEC-SERVICES */}
          {selectedSection.id === 'sec-services' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Khối Dịch vụ kế toán trọn gói (V1–V8)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý 8 giá trị cốt lõi và 3 dịch vụ bổ trợ
                  </p>
                </div>
                <Link
                  to="/admin/cms/services"
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Mở quản trị dịch vụ chi tiết</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5">
                  {draftData.services.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded mr-2">
                          {s.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{s.title}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold">Đang hoạt động</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 text-center pt-2">
                  Xem và chỉnh sửa toàn bộ 8 gói dịch vụ tại màn hình Quản lý dịch vụ.
                </p>
              </div>
            </div>
          )}

          {/* 5. SEC-PROCESS */}
          {selectedSection.id === 'sec-process' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Quy trình phối hợp 6 bước
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biên tập các bước làm việc từ tiếp nhận đến bàn giao định kỳ
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề khối quy trình</label>
                  <input
                    type="text"
                    value={draftData.process.title}
                    onChange={(e) => updateProcess({ title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {draftData.process.steps.map((st, idx) => (
                    <div key={st.step} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          {st.step}
                        </span>
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => {
                            const updated = [...draftData.process.steps];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            updateProcess({ steps: updated });
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <p className="text-xs text-slate-600 pl-8">{st.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. SEC-PRICING */}
          {selectedSection.id === 'sec-pricing' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Biểu phí dịch vụ kế toán trọn gói
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý 2 gói doanh thu chuẩn và các điều kiện minh bạch
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bảng phí</label>
                  <input
                    type="text"
                    value={draftData.pricing.title}
                    onChange={(e) => updatePricing({ title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {draftData.pricing.tiers.map((tier, idx) => (
                    <div key={tier.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="text-xs font-bold text-emerald-800">{tier.name}</div>
                      <div>
                        <label className="block text-[11px] text-slate-500">Mức phí tháng:</label>
                        <input
                          type="text"
                          value={tier.monthlyFee}
                          onChange={(e) => {
                            const updated = [...draftData.pricing.tiers];
                            updated[idx] = { ...updated[idx], monthlyFee: e.target.value };
                            updatePricing({ tiers: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500">Khung doanh thu:</label>
                        <input
                          type="text"
                          value={tier.revenueRange}
                          onChange={(e) => {
                            const updated = [...draftData.pricing.tiers];
                            updated[idx] = { ...updated[idx], revenueRange: e.target.value };
                            updatePricing({ tiers: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. SEC-DIAGNOSTIC */}
          {selectedSection.id === 'sec-diagnostic' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Công cụ khảo sát nhu cầu tương tác
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bộ câu hỏi 4 bước giúp chủ doanh nghiệp tự tính toán nhu cầu kế toán
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2">
                <div className="font-bold">Cơ chế khảo sát nhu cầu tương tác:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Bước 1: Tình trạng thành lập (Mới chuyển đổi / Đang hoạt động)</li>
                  <li>Bước 2: Lĩnh vực hoạt động (Thương mại / Dịch vụ / Sản xuất)</li>
                  <li>Bước 3: Khối lượng hóa đơn ước lượng (Dưới 100 / 100-300 / Trên 300)</li>
                  <li>Bước 4: Nhu cầu nhân công & BHXH (Chưa có / 1-3 người / 4-10 người)</li>
                </ul>
              </div>
            </div>
          )}

          {/* 8. SEC-CREDIBILITY */}
          {selectedSection.id === 'sec-credibility' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Năng lực & Uy tín chuyên môn Mã Thị Bích
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  12 năm kinh nghiệm kế toán, 5 năm chuyên sâu thuế và danh mục 4 khách hàng thực tế
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số năm kinh nghiệm kế toán</label>
                    <input
                      type="number"
                      value={draftData.credibility.experienceYears}
                      onChange={(e) => updateCredibility({ experienceYears: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số năm chuyên sâu thuế</label>
                    <input
                      type="number"
                      value={draftData.credibility.taxSpecialistYears}
                      onChange={(e) => updateCredibility({ taxSpecialistYears: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt khách hàng thực tế</label>
                  <textarea
                    rows={3}
                    value={draftData.credibility.summary}
                    onChange={(e) => updateCredibility({ summary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 9. SEC-FAQ */}
          {selectedSection.id === 'sec-faq' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hỏi đáp thường gặp FAQ (10 câu thực tế)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    10 câu hỏi đáp trực tiếp giải tỏa băn khoăn của khách hàng
                  </p>
                </div>
                <Link
                  to="/admin/cms/faq"
                  className="px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Mở quản lý FAQ chi tiết</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {draftData.faqs.slice(0, 4).map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-900">{f.question}</div>
                    <div className="text-[11px] text-slate-600 line-clamp-1 mt-1">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. SEC-CONTACT */}
          {selectedSection.id === 'sec-contact' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Kênh liên hệ & Tiếp nhận hồ sơ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kênh tiếp nhận tư vấn Zalo, điện thoại và địa chỉ văn phòng
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại Hotline</label>
                  <input
                    type="text"
                    value={draftData.contact.phone}
                    onChange={(e) => updateContact({ phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={draftData.contact.email}
                    onChange={(e) => updateContact({ email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ văn phòng</label>
                  <input
                    type="text"
                    value={draftData.contact.address}
                    onChange={(e) => updateContact({ address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 11. SEC-FOOTER */}
          {selectedSection.id === 'sec-footer' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Chân trang & Ghi chú pháp lý (Footer)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi chú minh bạch về trách nhiệm chuyên môn và thông tin bản quyền
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú chuyên môn & trách nhiệm</label>
                  <textarea
                    rows={3}
                    value={draftData.footer.disclaimer}
                    onChange={(e) => updateFooter({ disclaimer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thông tin bản quyền (Copyright)</label>
                  <input
                    type="text"
                    value={draftData.footer.copyright}
                    onChange={(e) => updateFooter({ copyright: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
