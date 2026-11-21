import React, { useState } from 'react';
import { 
  HelpCircle, 
  ArrowLeft, 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Link } from '../../router';
import { CmsToolbar } from '../components/CmsToolbar';
import { useCms, CmsFaqItem } from '../../context/CmsContext';

export const CmsFaq: React.FC = () => {
  const { 
    draftData, 
    addFaq, 
    updateFaq, 
    toggleFaqVisibility, 
    reorderFaq, 
    deleteFaq 
  } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<CmsFaqItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [previewFaqId, setPreviewFaqId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<{
    question: string;
    answer: string;
    category: 'onboarding' | 'invoicing' | 'pricing' | 'process' | 'security';
    isVisible: boolean;
  }>({
    question: '',
    answer: '',
    category: 'onboarding',
    isVisible: true,
  });

  const filteredFaqs = draftData.faqs
    .filter(f => {
      const matchesSearch = f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.order - b.order);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.question.trim()) return;
    addFaq(newItem);
    setIsAddingNew(false);
    setNewItem({
      question: '',
      answer: '',
      category: 'onboarding',
      isVisible: true,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateFaq(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string, question: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi "${question.slice(0, 30)}..." khỏi bản nháp không?`)) {
      deleteFaq(id);
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
        <span className="text-slate-900 font-semibold">Quản lý câu hỏi thường gặp (FAQ)</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6">
        
        {/* Header & Search / Add Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Danh mục câu hỏi thường gặp ({draftData.faqs.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nội dung giải đáp thắc mắc xuất hiện trong khối FAQ Accordion trên trang chủ
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm câu hỏi..."
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
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'onboarding', label: 'Mới chuyển đổi' },
            { id: 'invoicing', label: 'Hóa đơn & Chứng từ' },
            { id: 'pricing', label: 'Chi phí' },
            { id: 'security', label: 'Bảo mật & Trách nhiệm' },
            { id: 'process', label: 'Cách phối hợp' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List Management */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = previewFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all ${
                  faq.isVisible ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'
                }`}
              >
                <div className="p-4 flex items-start justify-between gap-4">
                  
                  {/* Left: Order, Reorder & Question */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <span className="font-mono text-xs text-slate-400 font-bold w-5">{faq.order}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => reorderFaq(faq.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                          title="Lên trên"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderFaq(faq.id, 'down')}
                          disabled={idx === filteredFaqs.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                          title="Xuống dưới"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                          {faq.category}
                        </span>
                        {!faq.isVisible && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Đang ẩn
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewFaqId(isExpanded ? null : faq.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Xem nội dung trả lời"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFaqVisibility(faq.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title={faq.isVisible ? 'Ẩn câu hỏi' : 'Hiện câu hỏi'}
                    >
                      {faq.isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(faq)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Collapsible Answer Body */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Add New FAQ Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form 
            onSubmit={handleSaveNew}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Thêm câu hỏi FAQ mới</h3>
              <button type="button" onClick={() => setIsAddingNew(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
                <select
                  value={newItem.category}
                  onChange={(e: any) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="onboarding">Mới chuyển đổi (Onboarding)</option>
                  <option value="invoicing">Hóa đơn & Chứng từ</option>
                  <option value="pricing">Chi phí & Thanh toán</option>
                  <option value="security">Bảo mật & Trách nhiệm</option>
                  <option value="process">Cách phối hợp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Làm việc từ xa với Mã Thị Bích có tiện không?"
                  value={newItem.question}
                  onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu trả lời <span className="text-rose-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  placeholder="Câu trả lời giải thích chi tiết, rõ ràng..."
                  value={newItem.answer}
                  onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
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

      {/* Edit FAQ Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form 
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Chỉnh sửa câu hỏi FAQ</h3>
              <button type="button" onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
                <select
                  value={editingItem.category}
                  onChange={(e: any) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="onboarding">Mới chuyển đổi (Onboarding)</option>
                  <option value="invoicing">Hóa đơn & Chứng từ</option>
                  <option value="pricing">Chi phí & Thanh toán</option>
                  <option value="security">Bảo mật & Trách nhiệm</option>
                  <option value="process">Cách phối hợp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingItem.question}
                  onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu trả lời <span className="text-rose-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.answer}
                  onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
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

    </div>
  );
};
