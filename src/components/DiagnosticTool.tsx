import React, { useState, useMemo } from 'react';
import { 
  Building, 
  HelpCircle, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Receipt,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';
import { websiteContext } from '../data/websiteContext';

interface DiagnosticState {
  stage: string;
  industry: string;
  invoiceCount: string;
  needsHelpInvoicing: boolean;
  needsPayroll: boolean;
  needsBusinessChange: boolean;
}

export const DiagnosticTool: React.FC = () => {
  const [formState, setFormState] = useState<DiagnosticState>({
    stage: 'converted_household',
    industry: 'tourism_rental',
    invoiceCount: 'under_100',
    needsHelpInvoicing: true,
    needsPayroll: false,
    needsBusinessChange: false,
  });

  const [copied, setCopied] = useState(false);

  // Derived recommendation
  const recommendation = useMemo(() => {
    let tier = websiteContext.pricingTiers[0];
    let note = "Phù hợp với gói Kế toán trọn gói Doanh nghiệp Mới & Nhỏ.";
    
    if (formState.invoiceCount === 'above_300') {
      tier = websiteContext.pricingTiers[1];
      note = "Với lượng chứng từ từ 300-500+ hóa đơn/tháng, doanh nghiệp phù hợp với gói Phát Triển để đảm bảo theo dõi chi tiết tài khoản.";
    }

    return {
      tier,
      note,
    };
  }, [formState.invoiceCount]);

  // Generate copyable text for Zalo
  const zaloMessage = useMemo(() => {
    const stageMap: Record<string, string> = {
      converted_household: 'Mới chuyển từ hộ kinh doanh lên doanh nghiệp',
      existing_business: 'Doanh nghiệp nhỏ đang hoạt động chưa có kế toán nội bộ',
      preparing_setup: 'Đang chuẩn bị thành lập công ty mới',
    };

    const industryMap: Record<string, string> = {
      tourism_rental: 'Du lịch / Tour & Cho thuê xe máy',
      manufacturing: 'Sản xuất cơ khí / Nhôm kính',
      cleaning_service: 'Vệ sinh công nghiệp / Dịch vụ',
      trading_retail: 'Thương mại / Bán lẻ',
      auto_repair: 'Sửa chữa kỹ thuật / Ô tô',
      other: 'Ngành nghề khác',
    };

    const invoiceMap: Record<string, string> = {
      under_100: 'Dưới 100 hóa đơn/tháng',
      from_100_to_300: 'Khoảng 100 - 300 hóa đơn/tháng',
      above_300: 'Trên 300 - 500+ hóa đơn/tháng',
    };

    const extras = [];
    if (formState.needsHelpInvoicing) extras.push('Cần hướng dẫn xuất hóa đơn điện tử');
    if (formState.needsPayroll) extras.push('Có phát sinh lương & BHXH');
    if (formState.needsBusinessChange) extras.push('Cần thủ tục thay đổi ĐKKD/địa chỉ');

    return `Chào chị Bích, em tìm hiểu dịch vụ kế toán trên website quybich.vn và muốn gửi thông tin khảo sát:
- Tình trạng: ${stageMap[formState.stage] || formState.stage}
- Ngành nghề: ${industryMap[formState.industry] || formState.industry}
- Lượng hóa đơn dự kiến: ${invoiceMap[formState.invoiceCount] || formState.invoiceCount}
- Nghiệp vụ cần lưu ý: ${extras.length > 0 ? extras.join(', ') : 'Chưa có yêu cầu phát sinh'}
Nhờ chị Bích tư vấn giúp em về phạm vi công việc và báo giá phù hợp nhé!`;
  }, [formState]);

  const handleCopyZalo = () => {
    navigator.clipboard.writeText(zaloMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="khao-sat" className="py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Công cụ khảo sát tương tác</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Khảo sát nhanh nhu cầu & Dự toán dịch vụ phù hợp
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Chọn tình trạng doanh nghiệp của bạn bên dưới để xác định phạm vi kế toán cần chuẩn bị và ước tính chi phí tham chiếu theo biểu phí thực tế.
          </p>
        </div>

        {/* 2-Column Diagnostic Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-slate-50/80 p-6 sm:p-8 rounded-2xl border border-slate-200/90 space-y-6">
            
            {/* Step 1: Stage */}
            <div className="space-y-2.5">
              <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">1</span>
                <span>Tình trạng doanh nghiệp của bạn:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'converted_household', label: 'Vừa chuyển từ hộ KD' },
                  { id: 'existing_business', label: 'Đang hoạt động' },
                  { id: 'preparing_setup', label: 'Chuẩn bị thành lập' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, stage: item.id })}
                    className={`py-3 px-3 text-xs sm:text-sm font-semibold rounded-xl border text-left transition-all ${
                      formState.stage === item.id
                        ? 'border-emerald-600 bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Industry */}
            <div className="space-y-2.5">
              <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">2</span>
                <span>Ngành nghề kinh doanh chính:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'tourism_rental', label: 'Du lịch / Tour xe máy' },
                  { id: 'manufacturing', label: 'Cơ khí / Nhôm kính' },
                  { id: 'cleaning_service', label: 'Vệ sinh công nghiệp' },
                  { id: 'trading_retail', label: 'Thương mại / Bán lẻ' },
                  { id: 'auto_repair', label: 'Sửa chữa ô tô / Kỹ thuật' },
                  { id: 'other', label: 'Lĩnh vực khác' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, industry: item.id })}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                      formState.industry === item.id
                        ? 'border-emerald-600 bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Invoices */}
            <div className="space-y-2.5">
              <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">3</span>
                <span>Khối lượng hóa đơn đầu vào & đầu ra ước tính:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'under_100', label: 'Dưới 100 HĐ / tháng' },
                  { id: 'from_100_to_300', label: '100 – 300 HĐ / tháng' },
                  { id: 'above_300', label: '300 – 500+ HĐ / tháng' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormState({ ...formState, invoiceCount: item.id })}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                      formState.invoiceCount === item.id
                        ? 'border-emerald-600 bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-600/20'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Specific Needs */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">4</span>
                <span>Nghiệp vụ cần hỗ trợ thêm (chọn nếu có):</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:bg-emerald-50/20 text-xs sm:text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={formState.needsHelpInvoicing}
                    onChange={(e) => setFormState({ ...formState, needsHelpInvoicing: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Chưa quen xuất hóa đơn điện tử — Cần hướng dẫn thao tác chi tiết</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:bg-emerald-50/20 text-xs sm:text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={formState.needsPayroll}
                    onChange={(e) => setFormState({ ...formState, needsPayroll: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Có thuê thêm lao động — Cần làm hợp đồng nhân công & hồ sơ lương/BHXH</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:bg-emerald-50/20 text-xs sm:text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={formState.needsBusinessChange}
                    onChange={(e) => setFormState({ ...formState, needsBusinessChange: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Có nhu cầu thay đổi địa chỉ trụ sở hoặc đăng ký thêm địa điểm kinh doanh</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Diagnostic Result & Action */}
          <div className="lg:col-span-5 bg-emerald-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
            
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Kết quả dự toán đề xuất
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {recommendation.tier.name}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {recommendation.note}
              </p>
            </div>

            <div className="py-4 border-y border-emerald-800/80 space-y-1">
              <div className="text-xs text-emerald-300 font-medium">
                Mức phí tham chiếu theo biểu phí thực tế:
              </div>
              <div className="text-3xl font-extrabold text-white tabular-nums">
                {recommendation.tier.monthlyFee}{' '}
                <span className="text-xs font-normal text-emerald-200">{recommendation.tier.period}</span>
              </div>
              <div className="text-[11px] text-emerald-200/80">
                (Đã bao gồm hạch toán sổ sách MISA, kê khai thuế & hỗ trợ qua Zalo)
              </div>
            </div>

            {/* Included scope checklist */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                Đầu việc sẽ được phụ trách:
              </div>
              <ul className="space-y-2 text-xs text-emerald-50">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Hướng dẫn chuẩn hóa chứng từ & lập hóa đơn điện tử</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Tiếp nhận ảnh chụp chứng từ qua nhóm Zalo định kỳ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Hạch toán sổ sách MISA & nộp tờ khai thuế GTGT, TNCN quý</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Thông báo số thuế phải nộp & bàn giao Báo cáo tài chính năm</span>
                </li>
              </ul>
            </div>

            {/* Fast Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCopyZalo}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white text-emerald-950 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Đã sao chép nội dung tin nhắn!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-700" />
                    <span>Sao chép nội dung để nhắn qua Zalo</span>
                  </>
                )}
              </button>

              <a
                href="#lien-he"
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-800 hover:bg-emerald-700 text-white text-center transition-colors block border border-emerald-700"
              >
                Gửi thông tin này qua Form liên hệ
              </a>
            </div>

            <p className="text-[11px] text-emerald-200/70 text-center leading-normal">
              * Mức phí chính thức sẽ được xác nhận sau khi đối chiếu khối lượng hóa đơn thực tế và thống nhất thỏa thuận văn bản giữa hai bên.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};
