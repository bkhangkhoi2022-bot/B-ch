import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  FolderCheck, 
  BookOpen, 
  Calculator, 
  PieChart, 
  Users2, 
  MessageSquare,
  Building2,
  FileCog,
  FileSearch,
  CheckCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { websiteContext } from '../data/websiteContext';
import { useCms } from '../context/CmsContext';

const valueIcons: Record<string, React.ReactNode> = {
  V1: <FileText className="w-5 h-5 text-emerald-700" />,
  V2: <Receipt className="w-5 h-5 text-emerald-700" />,
  V3: <FolderCheck className="w-5 h-5 text-emerald-700" />,
  V4: <BookOpen className="w-5 h-5 text-emerald-700" />,
  V5: <Calculator className="w-5 h-5 text-emerald-700" />,
  V6: <PieChart className="w-5 h-5 text-emerald-700" />,
  V7: <Users2 className="w-5 h-5 text-emerald-700" />,
  V8: <MessageSquare className="w-5 h-5 text-emerald-700" />,
};

export const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'core' | 'supplementary'>('core');
  const { publishedData } = useCms();

  const visibleServices = publishedData.services
    .filter(s => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <section id="dich-vu" className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Phạm vi công việc & Lời đề nghị
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            {websiteContext.coreOffer.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {websiteContext.coreOffer.oneLineOffer}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('core')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'core'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gói Kế toán trọn gói ({visibleServices.length} đầu việc)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('supplementary')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'supplementary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dịch vụ hỗ trợ & Thủ tục phát sinh
            </button>
          </div>
        </div>

        {/* Core Services (Value Stack) */}
        {activeTab === 'core' && (
          <div className="mt-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleServices.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        {valueIcons[item.code] || <Briefcase className="w-5 h-5 text-emerald-700" />}
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                        {item.code}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    {item.solves && (
                      <div className="text-slate-500">
                        <span className="font-semibold text-slate-700">Giải quyết:</span> {item.solves}
                      </div>
                    )}
                    <div className="text-emerald-800 font-medium flex items-center gap-1.5 bg-emerald-50/60 p-2 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item.deliverable}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note on Core boundaries */}
            <div className="p-4 sm:p-5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
              <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Nguyên tắc làm việc minh bạch:</span> Dịch vụ kế toán trọn gói được thực hiện nghiêm túc theo phạm vi và thỏa thuận văn bản giữa hai bên. Kế toán không cam kết các yêu cầu xử lý số liệu thiếu trung thực hoặc vượt ngoài quy định pháp luật.
              </div>
            </div>
          </div>
        )}

        {/* Supplementary Services */}
        {activeTab === 'supplementary' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {websiteContext.supplementaryServices.map((svc, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    {idx === 0 ? <Building2 className="w-6 h-6" /> : idx === 1 ? <FileCog className="w-6 h-6" /> : <FileSearch className="w-6 h-6" />}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {svc.title}
                    </h3>
                    <div className="text-xs font-semibold text-emerald-800 mt-1">
                      Mức phí: {svc.pricingNote}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="font-semibold text-emerald-700">Điểm mạnh:</span> {svc.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
