import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  FileText, 
  CheckCircle2, 
  Calendar,
  PieChart,
  ArrowUpRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const CrmReports: React.FC = () => {
  const { leads, clients, deals, tasks } = useCrm();

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const closedLeads = leads.filter(l => l.status === 'closed').length;
  const signedDeals = deals.filter(d => d.status === 'signed').length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const taskComplianceRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 100;
  const conversionRate = totalLeads > 0 ? Math.round((signedDeals / totalLeads) * 100) : 0;

  // Breakdown by industry
  const industries = [
    { name: 'Du lịch / Cho thuê xe máy', count: 2, share: '50%' },
    { name: 'Sản xuất cơ khí / Nhôm kính', count: 1, share: '25%' },
    { name: 'Vệ sinh công nghiệp / Dịch vụ', count: 1, share: '25%' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              6. Báo Cáo & Chỉ Số KPI Quản Trị
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hiệu suất tiếp nhận khách hàng, tỷ lệ chuyển đổi hợp đồng và chỉ số chấp hành kỳ kế toán
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            Kỳ báo cáo: Tháng 11 / 2026
          </span>
        </div>
      </div>

      {/* 4 Summary Horizontal KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tỷ lệ chốt hợp đồng</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2 flex items-baseline gap-2">
            <span>{conversionRate}%</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Trên tổng số {totalLeads} khách quan tâm</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Khách hàng trung thành</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-2">
            {clients.length} DN
          </div>
          <p className="text-xs text-slate-500 mt-1">Hợp đồng duy trì từ ngày thành lập</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Hạn nộp tờ khai thuế</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-2">
            100%
          </div>
          <p className="text-xs text-slate-500 mt-1">Đúng hạn luật định Tổng cục Thuế</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Tiến độ việc trong tháng</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {taskComplianceRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">{completedTasks} / {tasks.length} công việc đã xử lý</p>
        </div>
      </div>

      {/* 2-Column Horizontal Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Phân bố ngành nghề khách hàng */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Cơ Cấu Khách Hàng Doanh Nghiệp Theo Ngành
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dựa trên 4 khách hàng thực tế và các hồ sơ đang xúc tiến
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              BCM 1.0 Chuẩn
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {industries.map((ind, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                  <span>{ind.name}</span>
                  <span className="text-emerald-800">{ind.count} DN ({ind.share})</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                    style={{ width: ind.share }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <strong>Ghi chú năng lực:</strong> Mã Thị Bích có kinh nghiệm đặc thù sâu trong quản lý hóa đơn máy tính tiền cho mảng Du lịch/Tour/Xe máy, định mức nguyên vật liệu cơ khí nhôm kính và hợp đồng dịch vụ vệ sinh công nghiệp.
          </div>
        </div>

        {/* Right Column (5 cols): Nguồn phát sinh Lead */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">
              Nguồn Tiếp Nhận Nhu Cầu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích kênh khách hàng tìm đến dịch vụ
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-950">Website Form Khảo Sát</div>
                <div className="text-[11px] text-emerald-700">Tự động ước tính nhu cầu kế toán</div>
              </div>
              <span className="text-sm font-extrabold text-emerald-800">55%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-950">Tải Checklist Khởi Đầu</div>
                <div className="text-[11px] text-blue-700">Chủ hộ kinh doanh vừa lập công ty</div>
              </div>
              <span className="text-sm font-extrabold text-blue-800">25%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-950">Zalo Trực Tiếp & Giới Thiệu</div>
                <div className="text-[11px] text-amber-700">Khách hàng cũ giới thiệu trực tiếp</div>
              </div>
              <span className="text-sm font-extrabold text-amber-800">20%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
