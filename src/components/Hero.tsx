import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface HeroProps {
  onOpenChecklist: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenChecklist }) => {
  const { publishedData } = useCms();

  return (
    <section className="relative overflow-hidden bg-mint-mesh pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-emerald-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-column Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Trust Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-100/80 text-emerald-800 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{publishedData.hero.kicker}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] text-balance">
              {publishedData.hero.headline}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {publishedData.hero.subheadline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                href={publishedData.hero.primaryCtaLink || '#khao-sat'}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all group whitespace-nowrap"
              >
                <span>{publishedData.hero.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <button
                type="button"
                onClick={onOpenChecklist}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{publishedData.hero.secondaryCtaText}</span>
              </button>
            </div>

            {/* Trust line */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Biểu phí rõ ràng, không phụ phí ẩn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Phân định trách nhiệm bằng hợp đồng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cao Bằng & hỗ trợ trực tuyến toàn quốc</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Image with Floating Badge Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-emerald-100/80 bg-white">
                <img
                  src={publishedData.hero.imageUrl}
                  alt={publishedData.hero.imageAlt}
                  className="w-full h-auto aspect-4/3 object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle caption adhering strictly to truth in advertising */}
                <div className="py-1.5 px-3 bg-slate-900/70 backdrop-blur-xs text-[11px] text-slate-200 text-center">
                  {publishedData.hero.imageCaption}
                </div>
              </div>

              {/* Floating Badge Card - matching reference design */}
              <div className="absolute -bottom-6 -left-3 sm:-left-6 bg-white p-3.5 sm:p-4 rounded-xl shadow-lg border border-emerald-100 flex items-center gap-3.5 max-w-[280px] sm:max-w-[320px]">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Chuẩn hóa phần mềm MISA
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Hạch toán sổ sách · 1:1 qua Zalo · Bàn giao định kỳ
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 4-Column Stat & Trust Strip (Directly aligned with reference design) */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-emerald-200/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {publishedData.trustPillars.map((pillar, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-3">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums text-emerald-800">
                  {pillar.stat}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide mt-1.5 uppercase">
                  {pillar.label}
                </div>
                <div className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  {pillar.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
