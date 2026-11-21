import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  FilePlus2,
  FolderOpen,
  FileUp,
  RefreshCw,
} from 'lucide-react';
import { BizDocProvider, useBizDoc } from './BizDocContext';
import { BizDocViewTab } from './types';
import { BizDocOverview } from './views/BizDocOverview';
import { BizDocDossierForm } from './views/BizDocDossierForm';
import { BizDocRecords } from './views/BizDocRecords';
import { BizDocTemplates } from './views/BizDocTemplates';
import { useRouter } from '../router';

const pathToTab = (path: string): BizDocViewTab => {
  if (path === '/bizdoc-mini/create') return 'create';
  if (path === '/bizdoc-mini/records') return 'records';
  if (path === '/bizdoc-mini/templates') return 'templates';
  return 'overview';
};

const tabToPath = (tab: BizDocViewTab): string => {
  switch (tab) {
    case 'create':
      return '/bizdoc-mini/create';
    case 'records':
      return '/bizdoc-mini/records';
    case 'templates':
      return '/bizdoc-mini/templates';
    default:
      return '/bizdoc-mini';
  }
};

const BizDocWorkspaceInner: React.FC = () => {
  const { path, navigate } = useRouter();
  const { isLoading, storageError, currentConfig, records, templateVersions, refreshAll } =
    useBizDoc();

  const [activeTab, setActiveTab] = useState<BizDocViewTab>(() => pathToTab(path));
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(pathToTab(path));
  }, [path]);

  const handleNavigateTab = (tab: BizDocViewTab, recordId?: string) => {
    if (tab === 'create') {
      setEditingRecordId(recordId || null);
    }
    setActiveTab(tab);
    navigate(tabToPath(tab));
  };

  const approvedCount = currentConfig.templateSlots.filter((s) => s.status === 'APPROVED').length;

  const navItems: Array<{
    id: BizDocViewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: string;
  }> = [
    { id: 'overview', label: 'Tổng quan BizDoc Mini', icon: LayoutGrid },
    { id: 'create', label: 'Tạo hồ sơ', icon: FilePlus2 },
    { id: 'records', label: 'Danh sách hồ sơ', icon: FolderOpen, count: String(records.length) },
    {
      id: 'templates',
      label: 'Quản lý mẫu Word',
      icon: FileUp,
      count: `${approvedCount}/${currentConfig.templateSlots.length}`,
    },
  ];

  return (
    <div className="space-y-5 min-w-0">
      {/* BizDoc Mini Header & Sub-navigation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            BizDoc Mini – Trợ lý soạn hồ sơ doanh nghiệp
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono tabular-nums">
            <span className="font-sans text-slate-600">
              Mã Thị Bích – Kế toán & Thuế doanh nghiệp
            </span>
            <span>·</span>
            <span>{currentConfig.appId}</span>
            <span>·</span>
            <span>config v{currentConfig.configVersion}</span>
            <span>·</span>
            <span>{templateVersions.length} phiên bản mẫu</span>
          </div>
        </div>

        {/* Clean Segmented Tabs */}
        <nav
          aria-label="Điều hướng BizDoc Mini"
          className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="font-mono tabular-nums text-[11px] text-slate-500">
                    ({item.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Loading / Storage Error States */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2.5 text-slate-500 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-700" />
          <div>Đang nạp cấu hình và kho mẫu Word từ IndexedDB...</div>
        </div>
      ) : storageError ? (
        <div className="bg-white rounded-xl border border-rose-200 p-6 space-y-3">
          <div className="text-sm font-bold text-rose-800">
            Lỗi kết nối bộ nhớ cục bộ IndexedDB
          </div>
          <p className="text-xs text-rose-700">{storageError}</p>
          <button
            type="button"
            onClick={refreshAll}
            className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
          >
            Thử tải lại
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && <BizDocOverview onNavigateTab={handleNavigateTab} />}
          {activeTab === 'create' && (
            <BizDocDossierForm
              initialRecordId={editingRecordId}
              onGoToTemplates={() => handleNavigateTab('templates')}
              onGoToRecords={() => handleNavigateTab('records')}
            />
          )}
          {activeTab === 'records' && (
            <BizDocRecords
              onCreateNew={() => handleNavigateTab('create')}
              onOpenRecord={(recId) => handleNavigateTab('create', recId)}
            />
          )}
          {activeTab === 'templates' && <BizDocTemplates />}
        </>
      )}
    </div>
  );
};

export const BizDocApp: React.FC = () => {
  return (
    <BizDocProvider>
      <BizDocWorkspaceInner />
    </BizDocProvider>
  );
};
