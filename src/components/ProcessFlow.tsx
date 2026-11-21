import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';

export const ProcessFlow: React.FC = () => {
  return (
    <section id="quy-trinh" className="py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Cơ chế làm việc 6 bước
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Tiếp nhận rõ — Xử lý đúng phạm vi — Bàn giao theo kỳ
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Quy trình phối hợp rõ ràng, chuẩn mực từ lúc tiếp nhận đến khi bàn giao kết quả, giúp chủ doanh nghiệp kiểm soát tốt mọi đầu việc.
          </p>
        </div>

        {/* 6 Step Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {websiteContext.processSteps.map((item) => (
            <div
              key={item.step}
              className="relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-emerald-700/80 font-mono">
                    {item.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {item.subtitle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Đầu ra:</span> {item.deliverable}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick action bar */}
        <div className="mt-12 text-center">
          <a
            href="#khao-sat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <span>Bắt đầu khảo sát hiện trạng doanh nghiệp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
