import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  PanelsTopLeft,
  Settings,
  Globe,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Briefcase,
  HelpCircle,
  LayoutTemplate,
  UserCheck,
  FileCheck2,
  FilePlus2,
  FolderOpen,
  FileUp
} from 'lucide-react';
import { useRouter, Link } from '../router';
import { useCrm } from '../context/CrmContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { path } = useRouter();
  const { leads, tasks } = useCrm();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCrmActive =
    path === '/admin' || path === '/admin/crm' || path.startsWith('/admin/crm/');
  const isCmsActive = path.startsWith('/admin/cms');
  const isSettingsActive = path === '/admin/settings' || path === '/admin/users';
  const isBizDocActive = path.startsWith('/bizdoc-mini');

  const [crmSubmenuOpen, setCrmSubmenuOpen] = useState(isCrmActive);
  const [cmsSubmenuOpen, setCmsSubmenuOpen] = useState(isCmsActive);
  const [bizDocSubmenuOpen, setBizDocSubmenuOpen] = useState(isBizDocActive);

  useEffect(() => {
    if (isCrmActive) {
      setCrmSubmenuOpen(true);
    }
  }, [isCrmActive]);

  useEffect(() => {
    if (isCmsActive) {
      setCmsSubmenuOpen(true);
    }
  }, [isCmsActive]);

  useEffect(() => {
    if (isBizDocActive) {
      setBizDocSubmenuOpen(true);
    }
  }, [isBizDocActive]);

  const pendingLeadsCount = leads.filter(l => l.status === 'new').length;
  const pendingTasksCount = tasks.filter(t => !t.isCompleted).length;

  const crmSubLinks = [
    {
      id: 'dashboard',
      name: 'Dashboard – Tổng quan',
      to: '/admin',
      icon: LayoutDashboard,
      active: path === '/admin',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'leads',
      name: 'Khách hàng tiềm năng',
      to: '/admin/crm/leads',
      icon: Target,
      active: path === '/admin/crm/leads' || path === '/admin/crm',
      badge: pendingLeadsCount > 0 ? `${pendingLeadsCount} mới` : null,
      badgeColor: 'bg-teal-500 text-white',
    },
    {
      id: 'clients',
      name: 'Quản lý khách hàng',
      to: '/admin/crm/clients',
      icon: Users,
      active: path === '/admin/crm/clients',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'deals',
      name: 'Báo giá & Hợp đồng',
      to: '/admin/crm/deals',
      icon: FileText,
      active: path === '/admin/crm/deals',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'tasks',
      name: 'Quản lý công việc',
      to: '/admin/crm/tasks',
      icon: CheckSquare,
      active: path === '/admin/crm/tasks',
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'reports',
      name: 'Báo cáo & KPI',
      to: '/admin/crm/reports',
      icon: BarChart3,
      active: path === '/admin/crm/reports',
      badge: null,
      badgeColor: '',
    },
  ];

  const cmsSubLinks = [
    { name: 'Tổng quan CMS', to: '/admin/cms', icon: LayoutTemplate, active: path === '/admin/cms' },
    { name: 'Quản trị trang chủ', to: '/admin/cms/homepage', icon: PanelsTopLeft, active: path === '/admin/cms/homepage' },
    { name: 'Quản lý dịch vụ', to: '/admin/cms/services', icon: Briefcase, active: path === '/admin/cms/services' },
    { name: 'Quản lý câu hỏi FAQ', to: '/admin/cms/faq', icon: HelpCircle, active: path === '/admin/cms/faq' },
  ];

  const bizDocSubLinks = [
    { name: 'Tổng quan BizDoc Mini', to: '/bizdoc-mini', icon: LayoutDashboard, active: path === '/bizdoc-mini' },
    { name: 'Tạo hồ sơ', to: '/bizdoc-mini/create', icon: FilePlus2, active: path === '/bizdoc-mini/create' },
    { name: 'Danh sách hồ sơ', to: '/bizdoc-mini/records', icon: FolderOpen, active: path === '/bizdoc-mini/records' },
    { name: 'Quản lý mẫu Word', to: '/bizdoc-mini/templates', icon: FileUp, active: path === '/bizdoc-mini/templates' },
  ];

  const getBreadcrumbTitle = () => {
    if (path === '/admin') return 'Dashboard – Tổng quan điều hành';
    if (path === '/admin/crm/leads' || path === '/admin/crm') return 'Khách hàng tiềm năng (Leads)';
    if (path === '/admin/crm/clients') return 'Quản lý khách hàng chính thức';
    if (path === '/admin/crm/deals') return 'Báo giá & Hợp đồng dịch vụ';
    if (path === '/admin/crm/tasks') return 'Quản lý công việc & Lịch nhắc';
    if (path === '/admin/crm/reports') return 'Báo cáo & Chỉ số KPI';
    if (path === '/admin/cms') return 'CMS – Quản trị website';
    if (path === '/admin/cms/homepage') return 'CMS – Section Builder Trang chủ';
    if (path === '/admin/cms/services') return 'CMS – Quản lý dịch vụ';
    if (path === '/admin/cms/faq') return 'CMS – Quản lý câu hỏi thường gặp';
    if (path === '/admin/settings' || path === '/admin/users') return 'Cài đặt & Phân quyền hệ thống';
    if (path === '/bizdoc-mini') return 'BizDoc Mini – Tổng quan';
    if (path === '/bizdoc-mini/create') return 'BizDoc Mini – Tạo hồ sơ thay đổi địa chỉ';
    if (path === '/bizdoc-mini/records') return 'BizDoc Mini – Danh sách hồ sơ';
    if (path === '/bizdoc-mini/templates') return 'BizDoc Mini – Quản lý mẫu Word';
    return 'QUÝ BÍCH CRM PRO';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (3 Main Management Modules) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 border-r border-slate-800/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Brand Logo Header */}
          <div className="h-18 px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/95 sticky top-0 z-10">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                MB
              </div>
              <div>
                <div className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>QUÝ BÍCH CRM PRO</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    v2.0
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Kế toán & Thuế Doanh nghiệp
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Đóng thanh điều hướng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links: Exactly 3 Main Menus */}
          <nav aria-label="Menu quản trị chính" className="px-3.5 py-5 space-y-2 flex-1">
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>3 Phân hệ Quản trị</span>
              <span className="text-[10px] font-mono text-teal-400">3 / 3</span>
            </div>

            {/* MENU 1: CRM – Quản lý khách hàng */}
            <div>
              <button
                type="button"
                onClick={() => setCrmSubmenuOpen(prev => !prev)}
                aria-expanded={crmSubmenuOpen}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  isCrmActive
                    ? 'bg-slate-800/95 text-white border border-teal-500/30 shadow-2xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserCheck
                    className={`w-4 h-4 shrink-0 ${
                      isCrmActive ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">CRM – Quản lý khách hàng</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    crmSubmenuOpen ? 'rotate-180 text-teal-400' : 'text-slate-400'
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ease-out ${
                  crmSubmenuOpen
                    ? 'grid-rows-[1fr] opacity-100 mt-1.5'
                    : 'grid-rows-[0fr] opacity-0 mt-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4">
                    {crmSubLinks.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.id}
                          to={sub.to}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                            sub.active
                              ? 'bg-teal-600 text-white font-bold shadow-2xs'
                              : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                sub.active ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{sub.name}</span>
                          </div>

                          {sub.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                sub.active
                                  ? 'bg-white/20 text-white'
                                  : sub.badgeColor || 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MENU 2: CMS – Quản trị website */}
            <div>
              <button
                type="button"
                onClick={() => setCmsSubmenuOpen(prev => !prev)}
                aria-expanded={cmsSubmenuOpen}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  isCmsActive
                    ? 'bg-slate-800/95 text-white border border-teal-500/30 shadow-2xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PanelsTopLeft
                    className={`w-4 h-4 shrink-0 ${
                      isCmsActive ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">CMS – Quản trị website</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    cmsSubmenuOpen ? 'rotate-180 text-teal-400' : 'text-slate-400'
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ease-out ${
                  cmsSubmenuOpen
                    ? 'grid-rows-[1fr] opacity-100 mt-1.5'
                    : 'grid-rows-[0fr] opacity-0 mt-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4">
                    {cmsSubLinks.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                            sub.active
                              ? 'bg-teal-600 text-white font-bold shadow-2xs'
                              : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 font-medium'
                          }`}
                        >
                          <SubIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              sub.active ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MENU 3: Cài đặt & Phân quyền */}
            <div>
              <Link
                to="/admin/settings"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSettingsActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Settings
                    className={`w-4 h-4 shrink-0 ${
                      isSettingsActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">Cài đặt & Phân quyền</span>
                </div>
                {isSettingsActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-teal-100 shrink-0" />
                )}
              </Link>
            </div>

            {/* Mini App Công Việc: BizDoc Mini */}
            <div className="pt-4 mt-4 border-t border-slate-800/90 space-y-1.5">
              <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Mini App Công Việc</span>
                <span className="text-[10px] font-mono text-amber-400">V1</span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setBizDocSubmenuOpen(prev => !prev)}
                  aria-expanded={bizDocSubmenuOpen}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isBizDocActive
                      ? 'bg-slate-800/95 text-white border border-teal-500/30 shadow-2xs'
                      : 'text-slate-200 hover:bg-slate-800/70 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCheck2
                      className={`w-4 h-4 shrink-0 ${
                        isBizDocActive ? 'text-teal-400' : 'text-teal-400/80'
                      }`}
                    />
                    <span className="truncate">BizDoc Mini</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      bizDocSubmenuOpen ? 'rotate-180 text-teal-400' : 'text-slate-400'
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-200 ease-out ${
                    bizDocSubmenuOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-1.5'
                      : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4">
                      {bizDocSubLinks.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                              sub.active
                                ? 'bg-teal-600 text-white font-bold shadow-2xs'
                                : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 font-medium'
                            }`}
                          >
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                sub.active ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Sidebar Status Footer */}
          <div className="p-3.5 m-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-[11px] space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-slate-400">
              <span>Đơn vị:</span>
              <span className="font-semibold text-teal-400">quybich.vn</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Chuyên môn:</span>
              <span className="font-semibold text-slate-200">Kế toán & Thuế</span>
            </div>
            <div className="pt-1.5 border-t border-slate-700/50 text-slate-400 text-[10px]">
              Tối ưu bố cục ngang • Độc lập website
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-18 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Mở thanh điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 truncate">
              <span className="font-bold text-teal-800">QUÝ BÍCH CRM PRO</span>
              <span>/</span>
              <span className="text-slate-900 font-extrabold truncate">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Quick status badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>3 Phân hệ sẵn sàng</span>
            </div>

            {/* Back to Website Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>Về website</span>
            </Link>

          </div>

        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
};
