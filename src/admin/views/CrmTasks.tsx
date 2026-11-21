import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Tag
} from 'lucide-react';
import { useCrm, CrmTask } from '../../context/CrmContext';

export const CrmTasks: React.FC = () => {
  const { tasks, toggleTask, addTask, deleteTask } = useCrm();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    clientName: 'Công ty TNHH Du lịch & Khám phá Non Nước',
    dueDate: '30/11/2026',
    category: 'Kê khai thuế' as CrmTask['category'],
    priority: 'Cao' as CrmTask['priority'],
    assignedTo: 'Mã Thị Bích',
  });

  const filtered = tasks.filter(t => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase());

    const matchCategory = filterCategory === 'all' ? true : t.category === filterCategory;
    const matchTab = activeTab === 'all' ? true : activeTab === 'pending' ? !t.isCompleted : t.isCompleted;

    return matchSearch && matchCategory && matchTab;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    addTask({
      title: form.title,
      clientName: form.clientName,
      dueDate: form.dueDate,
      category: form.category,
      priority: form.priority,
      assignedTo: form.assignedTo,
    });
    setForm({
      title: '',
      clientName: 'Công ty TNHH Du lịch & Khám phá Non Nước',
      dueDate: '30/11/2026',
      category: 'Kê khai thuế',
      priority: 'Cao',
      assignedTo: 'Mã Thị Bích',
    });
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: CrmTask['priority']) => {
    switch (p) {
      case 'Khẩn cấp':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Khẩn cấp</span>;
      case 'Cao':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Cao</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Bình thường</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              5. Quản Lý Công Việc & Lịch Nhắc Kế Toán
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi kỳ kê khai thuế quý, nhắc chứng từ Zalo và hạch toán sổ sách MISA
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm việc mới</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Search, Category, and Status Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm việc cần làm, tên doanh nghiệp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-purple-600 text-slate-800 bg-white"
              >
                <option value="all">Tất cả nghiệp vụ</option>
                <option value="Kê khai thuế">Kê khai thuế</option>
                <option value="Sổ sách MISA">Sổ sách MISA</option>
                <option value="Chứng từ Zalo">Chứng từ Zalo</option>
                <option value="Báo cáo tài chính">Báo cáo tài chính</option>
                <option value="Hợp đồng">Hợp đồng</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Chờ xử lý ({tasks.filter(t => !t.isCompleted).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đã hoàn thành ({tasks.filter(t => t.isCompleted).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({tasks.length})
            </button>
          </div>
        </div>

        {/* List of Tasks */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <div>Không có công việc nào trong danh sách này</div>
            </div>
          ) : (
            filtered.map((task) => (
              <div
                key={task.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  task.isCompleted ? 'bg-slate-50/70' : 'hover:bg-purple-50/20'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />

                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-bold leading-snug ${
                      task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700">{task.clientName}</span>
                      <span>•</span>
                      <span className="px-2 py-0.2 rounded bg-slate-100 font-medium text-slate-600">
                        {task.category}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600">Phụ trách: <strong>{task.assignedTo}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="mt-0.5">{getPriorityBadge(task.priority)}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Xóa công việc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số: <strong>{filtered.length}</strong> công việc</span>
          <span>Bàn giao theo kỳ • Trực tiếp phụ trách</span>
        </div>

      </div>

      {/* Modal Add Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Lịch Công Việc Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung công việc *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Rà soát chứng từ mua vào tháng 11..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doanh nghiệp khách hàng</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn hoàn thành</label>
                  <input
                    type="text"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as CrmTask['priority'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Cao">Cao</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nghiệp vụ</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as CrmTask['category'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="Kê khai thuế">Kê khai thuế</option>
                    <option value="Sổ sách MISA">Sổ sách MISA</option>
                    <option value="Chứng từ Zalo">Chứng từ Zalo</option>
                    <option value="Báo cáo tài chính">Báo cáo tài chính</option>
                    <option value="Hợp đồng">Hợp đồng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  Lưu công việc
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
