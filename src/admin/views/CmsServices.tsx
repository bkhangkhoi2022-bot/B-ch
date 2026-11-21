import React, { useState } from 'react';
import { 
  Briefcase, 
  ArrowLeft, 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { Link } from '../../router';
import { CmsToolbar } from '../components/CmsToolbar';
import { useCms, CmsServiceItem } from '../../context/CmsContext';

export const CmsServices: React.FC = () => {
  const { 
    draftData, 
    addService, 
    updateService, 
    toggleServiceVisibility, 
    reorderService, 
    deleteService 
  } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<CmsServiceItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [previewItem, setPreviewItem] = useState<CmsServiceItem | null>(null);

  // New service form state
  const [newItem, setNewItem] = useState({
    code: `V${draftData.services.length + 1}`,
    title: '',
    description: '',
    solves: '',
    deliverable: '',
    isVisible: true,
  });

  const filteredServices = draftData.services
    .filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    addService(newItem);
    setIsAddingNew(false);
    setNewItem({
      code: `V${draftData.services.length + 2}`,
      title: '',
      description: '',
      solves: '',
      deliverable: '',
      isVisible: true,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateService(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${title}" khỏi bản nháp không?`)) {
      deleteService(id);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Universal Action Toolbar */}
      <CmsToolbar />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/admin/cms" className="hover:text-slate-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tổng quan CMS</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Quản lý dịch vụ</span>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6">
        
        {/* Header & Search / Add Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách dịch vụ ({draftData.services.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Các đầu việc cấu thành gói Kế toán trọn gói (Value Stack) hiển thị trên trang chủ
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 w-44 sm:w-56"
              />
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dịch vụ</span>
            </button>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
                <th className="py-3 px-3 w-16 text-center">Thứ tự</th>
                <th className="py-3 px-3 w-16">Mã</th>
                <th className="py-3 px-4">Tên dịch vụ & Mô tả</th>
                <th className="py-3 px-4">Đầu ra bàn giao</th>
                <th className="py-3 px-3 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-3 w-36 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((svc, idx) => (
                <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Order & Reorder arrows */}
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono text-slate-500 font-semibold">{svc.order}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => reorderService(svc.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                          title="Chuyển lên"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderService(svc.id, 'down')}
                          disabled={idx === filteredServices.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                          title="Chuyển xuống"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Code */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {svc.code}
                    </span>
                  </td>

                  {/* Title & Desc */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{svc.title}</div>
                    <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{svc.description}</div>
                  </td>

                  {/* Deliverable */}
                  <td className="py-3 px-4 text-emerald-800 font-medium text-[11px]">
                    {svc.deliverable}
                  </td>

                  {/* Visibility Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleServiceVisibility(svc.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        svc.isVisible
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {svc.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{svc.isVisible ? 'Hiển thị' : 'Đang ẩn'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(svc)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                        title="Xem trước thẻ"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem(svc)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(svc.id, svc.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add New Service Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form 
            onSubmit={handleSaveNew}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Thêm dịch vụ mới vào gói</h3>
              <button type="button" onClick={() => setIsAddingNew(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã hiệu</label>
                  <input
                    type="text"
                    required
                    value={newItem.code}
                    onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Rà soát hợp đồng kinh tế..."
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Mô tả công việc thực hiện..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vấn đề giải quyết</label>
                <input
                  type="text"
                  placeholder="Giải quyết nỗi đau nào của khách hàng..."
                  value={newItem.solves}
                  onChange={(e) => setNewItem({ ...newItem, solves: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đầu ra bàn giao</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Báo cáo rà soát & hợp đồng hoàn chỉnh..."
                  value={newItem.deliverable}
                  onChange={(e) => setNewItem({ ...newItem, deliverable: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
              >
                Lưu vào bản nháp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form 
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Chỉnh sửa dịch vụ ({editingItem.code})</h3>
              <button type="button" onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã hiệu</label>
                  <input
                    type="text"
                    required
                    value={editingItem.code}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vấn đề giải quyết</label>
                <input
                  type="text"
                  value={editingItem.solves}
                  onChange={(e) => setEditingItem({ ...editingItem, solves: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đầu ra bàn giao</label>
                <input
                  type="text"
                  value={editingItem.deliverable}
                  onChange={(e) => setEditingItem({ ...editingItem, deliverable: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Cập nhật bản nháp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Service Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                {previewItem.code}
              </span>
              <button type="button" onClick={() => setPreviewItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-base font-bold text-slate-900">
              {previewItem.title}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {previewItem.description}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="text-slate-500">
                <span className="font-semibold text-slate-700">Giải quyết:</span> {previewItem.solves}
              </div>
              <div className="text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg">
                Đầu ra: {previewItem.deliverable}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Đóng xem trước
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
