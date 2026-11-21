import React, { useState } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';
import { useCms, CmsSectionConfig } from '../../context/CmsContext';

// We can render the website views with draftData
import { Header } from '../../components/Header';
import { Hero } from '../../components/Hero';
import { PainPoints } from '../../components/PainPoints';
import { Services } from '../../components/Services';
import { ProcessFlow } from '../../components/ProcessFlow';
import { Pricing } from '../../components/Pricing';
import { DiagnosticTool } from '../../components/DiagnosticTool';
import { Credibility } from '../../components/Credibility';
import { FaqSection } from '../../components/FaqSection';
import { ContactForm } from '../../components/ContactForm';
import { Footer } from '../../components/Footer';

interface CmsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CmsPreviewModal: React.FC<CmsPreviewModalProps> = ({ isOpen, onClose }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const { draftData } = useCms();

  if (!isOpen) return null;

  const sections: CmsSectionConfig[] = draftData?.sections || [];
  const headerSection = sections.find((s: CmsSectionConfig) => s.id === 'sec-header');
  const footerSection = sections.find((s: CmsSectionConfig) => s.id === 'sec-footer');
  const bodySections = sections
    .filter((s: CmsSectionConfig) => s.id !== 'sec-header' && s.id !== 'sec-footer' && s.isVisible)
    .sort((a: CmsSectionConfig, b: CmsSectionConfig) => a.order - b.order);

  const renderSectionComponent = (id: string) => {
    switch (id) {
      case 'sec-hero':
        return <Hero key={id} onOpenChecklist={() => {}} />;
      case 'sec-pains':
        return <PainPoints key={id} />;
      case 'sec-services':
        return <Services key={id} />;
      case 'sec-process':
        return <ProcessFlow key={id} />;
      case 'sec-pricing':
        return <Pricing key={id} />;
      case 'sec-diagnostic':
        return <DiagnosticTool key={id} />;
      case 'sec-credibility':
        return <Credibility key={id} />;
      case 'sec-faq':
        return <FaqSection key={id} />;
      case 'sec-contact':
        return <ContactForm key={id} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      
      {/* Top Preview Control Bar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            MB
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <span>Chế độ Xem trước bản nháp (Preview Mode)</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Website công khai chưa đổi
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Đang kết xuất {bodySections.length} khối nội dung hiển thị theo thứ tự nháp
            </div>
          </div>
        </div>

        {/* Viewport switch: Desktop vs Mobile */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'desktop'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Máy tính (Desktop)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'mobile'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Di động (375px)</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Đóng cửa sổ xem trước"
        >
          <X className="w-5 h-5" />
        </button>

      </div>

      {/* Preview Viewport Canvas */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 flex items-start justify-center bg-slate-900/40">
        <div
          className={`bg-white transition-all duration-200 overflow-y-auto shadow-2xl rounded-2xl border border-slate-700/60 ${
            device === 'desktop'
              ? 'w-full max-w-7xl h-[88vh]'
              : 'w-[375px] h-[85vh] ring-8 ring-slate-800 rounded-3xl'
          }`}
        >
          {/* Mock banner inside preview */}
          <div className="bg-emerald-900 text-emerald-100 text-[11px] py-1 px-4 text-center border-b border-emerald-800">
            Xem trước nội dung nháp: {draftData.hero.headline} ({bodySections.length} khối nội dung)
          </div>

          {/* Render website sections using active draft values */}
          {(headerSection?.isVisible ?? true) && <Header onOpenChecklist={() => {}} />}
          <main className="flex-1">
            {bodySections.map(sec => renderSectionComponent(sec.id))}
          </main>
          {(footerSection?.isVisible ?? true) && <Footer />}
        </div>
      </div>

    </div>
  );
};
