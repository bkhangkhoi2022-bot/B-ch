import React from 'react';
import { Award, Briefcase, Building, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';
import { websiteContext } from '../data/websiteContext';

export const Credibility: React.FC = () => {
  return (
    <section id="kinh-nghiem" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
            Năng lực chuyên môn & Khách hàng thực tế
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Kinh nghiệm thực tế — Nói đúng sự thật, làm đúng cam kết
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Không tạo số liệu ảo, không hứa hẹn phi thực tế. Uy tín được xây dựng từ 12 năm làm kế toán và sự đồng hành bền bỉ cùng các doanh nghiệp nhỏ.
          </p>
        </div>

        {/* 3 Pillars of Credibility */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                12 Năm Kinh Nghiệm Thực Tế
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Trong đó có 5 năm chuyên sâu kế toán thuế
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Trực tiếp cọ xát với hàng trăm kỳ kê khai quý, quyết toán thuế năm và tiếp cận đa dạng các hình thức hóa đơn điện tử, chứng từ chi phí và sổ sách kế toán.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Đồng Hành Từ Thành Lập Đến Vận Hành
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Hỗ trợ trọn vòng đời doanh nghiệp
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Đã trực tiếp hỗ trợ thủ tục thành lập công ty cho 4 khách hàng dịch vụ hiện tại, sau đó tiếp tục nhận phụ trách kế toán trọn gói trong suốt quá trình kinh doanh.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Trực Tiếp Mã Thị Bích Phụ Trách
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Không qua trung gian tư vấn
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bạn trao đổi trực tiếp với người trực tiếp lên sổ MISA và làm tờ khai. Hướng dẫn tận tình từng bước xuất hóa đơn cho đến khi khách hàng hoàn toàn tự tin.
            </p>
          </div>

        </div>

        {/* Real Case Experience & Industry Portfolio */}
        <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Kinh nghiệm trong các ngành nghề cụ thể
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Đã và đang phụ trách kế toán cho các mô hình kinh doanh đặc thù:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-emerald-800">2 Doanh nghiệp</div>
              <div className="font-semibold text-slate-900 text-sm mt-1">Tour & Cho thuê xe máy</div>
              <div className="text-xs text-slate-500 mt-1">Doanh thu dưới 3 tỷ/năm · Quản lý hợp đồng tour & hóa đơn dịch vụ</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-emerald-800">1 Doanh nghiệp</div>
              <div className="font-semibold text-slate-900 text-sm mt-1">Sản xuất Cơ khí & Nhôm kính</div>
              <div className="text-xs text-slate-500 mt-1">Doanh thu dưới 3 tỷ/năm · Định mức vật tư, nhân công sản xuất</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-emerald-800">1 Doanh nghiệp</div>
              <div className="font-semibold text-slate-900 text-sm mt-1">Vệ sinh Công nghiệp</div>
              <div className="text-xs text-slate-500 mt-1">Doanh thu dưới 3 tỷ/năm · Hóa đơn dịch vụ & hồ sơ lao động theo ca</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-emerald-800">Kế toán nội bộ</div>
              <div className="font-semibold text-slate-900 text-sm mt-1">Doanh nghiệp Sửa chữa ô tô</div>
              <div className="text-xs text-slate-500 mt-1">Doanh thu quy mô ~10 tỷ/năm · Quản lý phụ tùng, nhân công kỹ thuật</div>
            </div>
          </div>

          {/* Case KH01 */}
          <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-slate-700 text-xs sm:text-sm space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{websiteContext.realCaseExperience.case01.name}</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              {websiteContext.realCaseExperience.case01.story}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
