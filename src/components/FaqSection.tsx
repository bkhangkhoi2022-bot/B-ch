import React, { useState } from 'react';
import { ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const FaqSection: React.FC = () => {
  const { publishedData } = useCms();
  const [openId, setOpenId] = useState<string | null>('faq-01');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const visibleFaqs = publishedData.faqs
    .filter(f => f.isVisible)
    .sort((a, b) => a.order - b.order);

  const filteredFaqs = visibleFaqs.filter((faq) => {
    if (activeFilter === 'all') return true;
    return faq.category === activeFilter;
  });

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Hỏi đáp thường gặp
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Những băn khoăn phổ biến khi thuê kế toán
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Giải đáp thẳng thắn, rõ ràng về hóa đơn, chứng từ, bảo mật, trách nhiệm và cách thức phối hợp hàng tháng.
          </p>
        </div>

        {/* Filter categories */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { id: 'all', label: `Tất cả (${visibleFaqs.length})` },
            { id: 'onboarding', label: 'Mới chuyển đổi' },
            { id: 'invoicing', label: 'Hóa đơn & Chứng từ' },
            { id: 'pricing', label: 'Chi phí' },
            { id: 'security', label: 'Bảo mật & Trách nhiệm' },
            { id: 'process', label: 'Cách phối hợp' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === cat.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <div className="mt-10 space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'bg-emerald-700 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions prompt */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>Bạn còn câu hỏi đặc thù về ngành nghề của mình?</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Đừng ngần ngại nhắn tình trạng doanh nghiệp cho Mã Thị Bích qua Zalo. Mình sẽ giải đáp trực tiếp và trao đổi phạm vi phù hợp.
          </p>
          <a
            href="#lien-he"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Nhắn tin trao đổi tình huống</span>
          </a>
        </div>

      </div>
    </section>
  );
};
