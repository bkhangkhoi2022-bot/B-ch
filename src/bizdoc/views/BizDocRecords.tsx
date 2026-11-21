import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  FilePlus2,
  Trash2,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { useBizDoc } from '../BizDocContext';
import { TaskStatus } from '../types';

interface BizDocRecordsProps {
  onCreateNew: () => void;
  onOpenRecord: (recordId: string) => void;
}

export const BizDocRecords: React.FC<BizDocRecordsProps> = ({
  onCreateNew,
  onOpenRecord,
}) => {
  const { records, templateVersions, deleteRecord } = useBizDoc();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = records.filter((rec) => {
    const q = search.trim().toLowerCase();
    const matchQuery =
      !q ||
      rec.recordId.toLowerCase().includes(q) ||
      rec.attemptId.toLowerCase().includes(q) ||
      rec.data.taskName.toLowerCase().includes(q) ||
      rec.data.companyName.toLowerCase().includes(q) ||
      rec.data.companyCode.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' ? true : rec.taskStatus === statusFilter;
    return matchQuery && matchStatus;
  });

  const handleDelete = async (recordId: string) => {
    setErrorMsg(null);
    setConfirmDeleteId(null);
    const res = await deleteRecord(recordId);
    if (!res.success) {
      setErrorMsg(res.error || 'Không thể xóa hồ sơ.');
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    } catch {
      return iso;
    }
  };

  const renderStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="text-slate-600 font-semibold">DRAFT · Bản nháp</span>;
      case 'NEEDS_REVIEW':
        return <span className="text-amber-700 font-semibold">NEEDS_REVIEW · Cần kiểm tra</span>;
      case 'READY':
        return <span className="text-blue-700 font-semibold">READY · Sẵn sàng xuất</span>;
      case 'EXPORTED':
        return <span className="text-emerald-700 font-semibold">EXPORTED · Đã xuất Word/PDF</span>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh sách hồ sơ đã lưu</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mở lại bất kỳ bản nháp nào theo recordId cùng đúng attemptId và configSnapshot ban đầu (R13)
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Tạo hồ sơ mới</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo recordId, attemptId, tên công việc, MSDN..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs">
            {(['ALL', 'DRAFT', 'NEEDS_REVIEW', 'READY', 'EXPORTED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? `Tất cả (${records.length})` : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2.5">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-medium text-slate-700">
              {records.length === 0
                ? 'Chưa có hồ sơ nào trong bộ nhớ trình duyệt'
                : 'Không có hồ sơ nào khớp bộ lọc'}
            </div>
            {records.length === 0 && (
              <button
                type="button"
                onClick={onCreateNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Tạo hồ sơ mới</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">RecordId / AttemptId</th>
                  <th className="py-3 px-4">Công việc & Doanh nghiệp</th>
                  <th className="py-3 px-4">Cấu hình & Mẫu gắn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Cập nhật</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rec) => {
                  const boundKeys = Object.entries(rec.boundTemplateVersionKeys || {});
                  const boundM02Key = rec.boundTemplateVersionKeys?.M02;
                  const boundM02 = boundM02Key
                    ? templateVersions.find((v) => v.versionKey === boundM02Key)
                    : undefined;
                  const isPracticeM02 = Boolean(boundM02?.isSimplifiedDraft);

                  return (
                    <tr key={rec.recordId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono tabular-nums">
                        <div className="font-semibold text-slate-900">{rec.recordId}</div>
                        <div className="text-[11px] text-slate-500">{rec.attemptId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {rec.data.taskName || 'Chưa đặt tên công việc'}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {rec.data.companyName || 'Chưa nhập tên DN'} ·{' '}
                          <span className="font-mono">{rec.data.companyCode || 'Chưa có MSDN'}</span>
                        </div>
                        {isPracticeM02 && (
                          <div className="mt-1 text-[11px] font-semibold text-amber-800">
                            BẢN NHÁP THỰC HÀNH (M02 rút gọn · R16)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        <div>config v{rec.configVersion}</div>
                        <div className="text-[11px] text-slate-500">
                          {boundKeys.length > 0
                            ? boundKeys.map(([k, v]) => `${k}:${v.split('__')[1] || v}`).join(', ')
                            : 'Chưa gắn mẫu duyệt'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderStatusText(rec.taskStatus)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {formatTime(rec.updatedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenRecord(rec.recordId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold whitespace-nowrap"
                          >
                            <span>Mở hồ sơ</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === rec.recordId ? (
                            <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(rec.recordId)}
                                className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-semibold"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px]"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(rec.recordId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Xóa bản nháp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
