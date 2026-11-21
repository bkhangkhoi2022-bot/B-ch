import React from 'react';
import { AlertCircle, FileX, CalendarClock, UserX, Users, FileEdit, Check, X, ArrowRight } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';

const painIcons: Record<string, React.ReactNode> = {
  P1: <FileEdit className="w-5 h-5 text-emerald-700" />,
  P2: <FileX className="w-5 h-5 text-emerald-700" />,
  P3: <CalendarClock className="w-5 h-5 text-emerald-700" />,
  P4: <UserX className="w-5 h-5 text-emerald-700" />,
  P5: <Users className="w-5 h-5 text-emerald-700" />,
  P6: <AlertCircle className="w-5 h-5 text-emerald-700" />,
};

export const PainPoints: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Thực trạng & Trở ngại thực tế
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Từ hộ kinh doanh lên doanh nghiệp: Bạn có đang gặp những trở ngại này?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Kinh doanh thì quen thuộc, nhưng quy định hóa đơn, chứng từ và kê khai thuế doanh nghiệp lại là một bài toán hoàn toàn mới.
          </p>
        </div>

        {/* 6 Pain Point Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websiteContext.painPoints.map((pain) => (
            <div
              key={pain.code}
              className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                    {painIcons[pain.code]}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                    {pain.code}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-4">
                  {pain.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  {pain.symptom}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 text-xs text-emerald-800 font-medium flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Hệ quả: {pain.impact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Insight Callout */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-emerald-900 text-white shadow-md">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Góc nhìn chiến lược từ thực tế
              </div>
              <h3 className="text-lg sm:text-xl font-bold leading-snug">
                "Bạn không nhất thiết phải trở thành người giỏi kế toán."
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
                Điều chủ doanh nghiệp cần là mỗi khi phát sinh hóa đơn, chứng từ hay kỳ khai thuế, 
                biết rõ ai sẽ là người trực tiếp hướng dẫn và chịu trách nhiệm xử lý phần việc đã nhận.
              </p>
            </div>
            <a
              href="#khao-sat"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-900 text-xs sm:text-sm font-bold hover:bg-emerald-50 transition-colors shrink-0 shadow-xs"
            >
              <span>Xem giải pháp phù hợp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              So sánh các lựa chọn phụ trách kế toán
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Đánh giá khách quan giữa tự làm, tuyển kế toán nội bộ và giải pháp kế toán trọn gói
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-4 px-4 sm:px-6 font-bold w-1/4">Tiêu chí</th>
                  <th className="py-4 px-4 sm:px-6 font-medium text-slate-600 w-1/4">Tự làm kế toán</th>
                  <th className="py-4 px-4 sm:px-6 font-medium text-slate-600 w-1/4">Thuê kế toán riêng</th>
                  <th className="py-4 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/80 w-1/4">
                    Kế toán trọn gói Mã Thị Bích
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {websiteContext.comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      {row.criteria}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.selfMade}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <span className="w-4 h-4 text-amber-500 shrink-0 font-bold">~</span>
                        <span>{row.internalAccountant}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-emerald-900 font-semibold bg-emerald-50/40">
                      <div className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.quyBich}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
