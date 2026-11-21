import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react';
import { websiteContext } from '../data/websiteContext';
import { useCrm } from '../context/CrmContext';

export const ContactForm: React.FC = () => {
  const { addLead } = useCrm();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneZalo: '',
    businessName: '',
    industry: 'Du lịch / Cho thuê xe máy',
    estimatedRevenue: 'under_3_billion',
    primaryProblem: 'invoicing',
    note: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addLead({
        fullName: formData.fullName,
        phoneZalo: formData.phoneZalo,
        businessName: formData.businessName || 'Doanh nghiệp đăng ký khảo sát',
        industry: formData.industry,
        estimatedRevenue: formData.estimatedRevenue === 'under_3_billion' ? 'Đến 3 tỷ/năm' : 'Trên 3 - 10 tỷ/năm',
        primaryProblem: formData.primaryProblem === 'invoicing' ? 'Chưa quen xuất hóa đơn điện tử' :
          formData.primaryProblem === 'no_accountant' ? 'Chưa có kế toán nội bộ phụ trách' :
          formData.primaryProblem === 'documents' ? 'Chứng từ rời rạc cần chuẩn hóa' :
          'Cần tư vấn kế toán trọn gói',
        status: 'new',
        notes: formData.note,
        source: 'Website Form',
      });
    } catch (err) {
      console.warn('Could not auto-add lead to CRM', err);
    }
    setSubmitted(true);
  };

  const generatedZaloMessage = `Chào chị Mã Thị Bích, em là ${formData.fullName || 'Khách hàng'} (${formData.businessName || 'Doanh nghiệp'}), SĐT: ${formData.phoneZalo}.
Ngành nghề: ${formData.industry}. Doanh thu dự kiến: ${formData.estimatedRevenue === 'under_3_billion' ? 'Đến 3 tỷ/năm' : 'Trên 3 - 10 tỷ/năm'}.
Vấn đề đang cần hỗ trợ: ${
    formData.primaryProblem === 'invoicing' ? 'Chưa quen hóa đơn điện tử' :
    formData.primaryProblem === 'no_accountant' ? 'Chưa có kế toán nội bộ phụ trách' :
    formData.primaryProblem === 'documents' ? 'Chứng từ rời rạc cần chuẩn hóa' :
    'Cần tư vấn kế toán trọn gói'
  }.
Ghi chú: ${formData.note || 'Không có'}.
Nhờ chị tư vấn giúp em về phạm vi công việc và báo giá phù hợp!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedZaloMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="lien-he" className="py-16 sm:py-20 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Tiếp nhận thông tin & Tư vấn
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Trao đổi tình trạng doanh nghiệp để nhận báo giá phù hợp
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Nhắn cho mình ngành kinh doanh, doanh thu dự kiến và vấn đề đang vướng. Mình sẽ trao đổi trực tiếp để xác định đúng phạm vi dịch vụ cần làm.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact Info & Guiding principles */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Kênh liên hệ trực tiếp
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Trao đổi trực tiếp cùng người chịu trách nhiệm chuyên môn
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Hotline / Zalo trao đổi nhanh</div>
                    <div className="font-bold text-slate-900 text-base">{websiteContext.business.contactPhone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Thị trường trực tiếp</div>
                    <div className="font-semibold text-slate-900">Thành phố Cao Bằng, Tỉnh Cao Bằng</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Phạm vi hỗ trợ trực tuyến</div>
                    <div className="font-semibold text-slate-900">Toàn quốc (qua nhóm Zalo & phần mềm MISA)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Email trao đổi tài liệu</div>
                    <div className="font-semibold text-slate-900">{websiteContext.business.email}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                  <span className="font-bold text-slate-800">Cam kết bảo vệ thông tin:</span> Mình chỉ yêu cầu thông tin cần thiết để ước tính phạm vi công việc. Tuyệt đối không yêu cầu số liệu nhạy cảm hay CCCD/mật khẩu khi chưa ký hợp đồng.
                </div>
              </div>
            </div>

            {/* Direct 60-second summary box */}
            <div className="p-5 rounded-2xl bg-emerald-900 text-white space-y-2.5">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Lời chào từ Mã Thị Bích
              </div>
              <p className="text-xs leading-relaxed text-emerald-100">
                "Chào anh/chị, mình có 12 năm kinh nghiệm làm kế toán, trong đó 5 năm làm kế toán thuế. Mình nhận kế toán trọn gói cho doanh nghiệp nhỏ, trực tiếp hướng dẫn hóa đơn, chứng từ và lên sổ MISA để bạn an tâm vận hành."
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
            
            {submitted ? (
              <div className="py-8 text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    Đã chuẩn bị nội dung khảo sát!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Nội dung thông tin của bạn đã được tổng hợp hoàn chỉnh. Để được phản hồi nhanh nhất, bạn có thể sao chép và gửi trực tiếp qua Zalo cho chị Bích:
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-w-lg mx-auto">
                  {generatedZaloMessage}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép tin nhắn gửi Zalo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors"
                  >
                    Chỉnh sửa lại thông tin
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                
                {/* Full name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Số điện thoại / Zalo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0912 345 678"
                      value={formData.phoneZalo}
                      onChange={(e) => setFormData({ ...formData, phoneZalo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Business name & industry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Tên doanh nghiệp / Đơn vị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Công ty TNHH Dịch vụ ABC"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Ngành nghề kinh doanh
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 bg-white"
                    >
                      <option value="Du lịch / Cho thuê xe máy">Du lịch / Cho thuê xe máy</option>
                      <option value="Sản xuất cơ khí / Nhôm kính">Sản xuất cơ khí / Nhôm kính</option>
                      <option value="Vệ sinh công nghiệp / Dịch vụ">Vệ sinh công nghiệp / Dịch vụ</option>
                      <option value="Thương mại / Bán lẻ">Thương mại / Bán lẻ</option>
                      <option value="Sửa chữa kỹ thuật / Ô tô">Sửa chữa kỹ thuật / Ô tô</option>
                      <option value="Ngành nghề khác">Ngành nghề khác</option>
                    </select>
                  </div>
                </div>

                {/* Revenue and problem */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Doanh thu năm dự kiến
                    </label>
                    <select
                      value={formData.estimatedRevenue}
                      onChange={(e) => setFormData({ ...formData, estimatedRevenue: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 bg-white"
                    >
                      <option value="under_3_billion">Đến 3 tỷ đồng / năm (Gói Mới & Nhỏ)</option>
                      <option value="above_3_to_10_billion">Trên 3 đến 10 tỷ đồng / năm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Vướng mắc chính cần giải quyết
                    </label>
                    <select
                      value={formData.primaryProblem}
                      onChange={(e) => setFormData({ ...formData, primaryProblem: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 bg-white"
                    >
                      <option value="invoicing">Chưa quen xuất hóa đơn điện tử</option>
                      <option value="no_accountant">Chưa có kế toán nội bộ phụ trách</option>
                      <option value="documents">Chứng từ rời rạc, chưa biết gửi sao</option>
                      <option value="general">Cần trọn gói sổ sách MISA & thuế</option>
                    </select>
                  </div>
                </div>

                {/* Additional note */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ghi chú thêm về tình trạng thực tế (nếu có)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Doanh nghiệp mới được cấp ĐKKD tháng trước, ước lượng mỗi tháng có khoảng 150 hóa đơn mua vào bán ra..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Demo notice required by Prompt */}
                <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Thông báo hệ thống:</strong> Form demo — Thông tin giúp tạo nội dung khảo sát nhanh. Sau khi bấm gửi, bạn có thể sao chép ngay để nhắn qua Zalo hoặc trao đổi trực tiếp với Mã Thị Bích.
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi thông tin khảo sát để nhận báo giá</span>
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
