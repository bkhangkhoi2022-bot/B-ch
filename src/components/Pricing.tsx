import React from 'react';
import { Check, ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';

export const Pricing: React.FC = () => {
  return (
    <section id="bang-phi" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Biểu phí dịch vụ thực tế
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Bảng phí minh bạch — Đúng khối lượng & quy mô thực tế
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Phí kế toán trọn gói được phân nhóm minh bạch theo doanh thu và khối lượng chứng từ. 
            Không phụ phí phát sinh ngoài thỏa thuận đã thống nhất.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {websiteContext.pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl bg-white border p-7 sm:p-8 flex flex-col justify-between transition-all ${
                tier.recommended
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider">
                  Phù hợp nhất cho doanh nghiệp mới
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {tier.name}
                  </h3>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                    {tier.revenueRange}
                  </div>
                </div>

                <div className="py-2 border-y border-slate-100 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                    {tier.monthlyFee}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">
                    {tier.period}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {tier.description}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Phạm vi công việc bao gồm:
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href="#khao-sat"
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    tier.recommended
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>Khảo sát để nhận báo giá chính xác</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Factors & Clarifications */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <span>Mức phí cụ thể cho từng doanh nghiệp được xác định dựa trên những yếu tố nào?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
              <span><strong>Doanh thu & số lượng hóa đơn:</strong> Trung bình số hóa đơn đầu vào và đầu ra cần rà soát hàng tháng.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
              <span><strong>Đặc thù ngành nghề:</strong> Tính chất giao dịch thương mại, dịch vụ, du lịch hay sản xuất cơ khí.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
              <span><strong>Quy mô nhân sự & BHXH:</strong> Số lượng hợp đồng lao động, mức độ quản lý lương và thủ tục bảo hiểm.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
              <span><strong>Hiện trạng chứng từ cũ:</strong> Doanh nghiệp thành lập mới tinh hay đã hoạt động và có hồ sơ tồn đọng.</span>
            </div>
          </div>
        </div>

        {/* Warning / Boundary Statement */}
        <div className="mt-6 max-w-4xl mx-auto p-4 sm:p-5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            <span>Quy định thanh toán & cam kết:</span>
          </div>
          <p>
            Phí dịch vụ được tính theo tháng và thanh toán theo thỏa thuận hợp đồng. 
            Mã Thị Bích không tự ý phát sinh phụ phí nếu không có yêu cầu thay đổi phạm vi đã thống nhất bằng văn bản giữa hai bên.
          </p>
        </div>

      </div>
    </section>
  );
};
