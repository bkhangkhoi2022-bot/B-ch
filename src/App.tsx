import React, { useState } from 'react';
import { RouterProvider, useRouter } from './router';
import { CmsProvider, useCms, CmsSectionConfig } from './context/CmsContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PainPoints } from './components/PainPoints';
import { Services } from './components/Services';
import { ProcessFlow } from './components/ProcessFlow';
import { Pricing } from './components/Pricing';
import { DiagnosticTool } from './components/DiagnosticTool';
import { Credibility } from './components/Credibility';
import { FaqSection } from './components/FaqSection';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { ChecklistModal } from './components/ChecklistModal';
import { CrmProvider } from './context/CrmContext';

// Admin modules (8 modules)
import { AdminLayout } from './admin/AdminLayout';
import { AdminOverview } from './admin/views/AdminOverview';
import { CrmLeads } from './admin/views/CrmLeads';
import { CrmClients } from './admin/views/CrmClients';
import { CrmDeals } from './admin/views/CrmDeals';
import { CrmTasks } from './admin/views/CrmTasks';
import { CrmReports } from './admin/views/CrmReports';
import { CmsOverview } from './admin/views/CmsOverview';
import { CmsHomepage } from './admin/views/CmsHomepage';
import { CmsServices } from './admin/views/CmsServices';
import { CmsFaq } from './admin/views/CmsFaq';
import { AdminSettings } from './admin/views/AdminSettings';
import { BizDocApp } from './bizdoc/BizDocApp';

function AppContent() {
  const { path } = useRouter();
  const { publishedData } = useCms();
  const [checklistOpen, setChecklistOpen] = useState(false);

  // BizDoc Mini App route (preserves AdminLayout sidebar)
  if (path === '/bizdoc-mini' || path.startsWith('/bizdoc-mini/')) {
    return (
      <AdminLayout>
        <BizDocApp />
      </AdminLayout>
    );
  }

  // Dedicated Admin routing for all 8 modules
  if (path.startsWith('/admin')) {
    let adminView = <AdminOverview />;
    
    // 1. Dashboard
    if (path === '/admin') adminView = <AdminOverview />;
    
    // 2. Khách hàng tiềm năng
    else if (path === '/admin/crm/leads' || path === '/admin/crm') adminView = <CrmLeads />;

    // 3. Quản lý khách hàng
    else if (path === '/admin/crm/clients') adminView = <CrmClients />;

    // 4. Báo giá & Hợp đồng
    else if (path === '/admin/crm/deals') adminView = <CrmDeals />;

    // 5. Quản lý công việc
    else if (path === '/admin/crm/tasks') adminView = <CrmTasks />;

    // 6. Báo cáo & KPI
    else if (path === '/admin/crm/reports') adminView = <CrmReports />;

    // 7. CMS Quản trị website
    else if (path === '/admin/cms') adminView = <CmsOverview />;
    else if (path === '/admin/cms/homepage') adminView = <CmsHomepage />;
    else if (path === '/admin/cms/services') adminView = <CmsServices />;
    else if (path === '/admin/cms/faq') adminView = <CmsFaq />;
    
    // 8. Cài đặt & Phân quyền
    else if (path === '/admin/settings' || path === '/admin/users') adminView = <AdminSettings />;

    return <AdminLayout>{adminView}</AdminLayout>;
  }

  // Active section configuration from CMS
  const sections: CmsSectionConfig[] = publishedData?.sections || [];
  const headerSection = sections.find((s: CmsSectionConfig) => s.id === 'sec-header');
  const footerSection = sections.find((s: CmsSectionConfig) => s.id === 'sec-footer');
  const bodySections = sections
    .filter((s: CmsSectionConfig) => s.id !== 'sec-header' && s.id !== 'sec-footer' && s.isVisible)
    .sort((a: CmsSectionConfig, b: CmsSectionConfig) => a.order - b.order);

  const renderSectionComponent = (id: string) => {
    switch (id) {
      case 'sec-hero':
        return <Hero key={id} onOpenChecklist={() => setChecklistOpen(true)} />;
      case 'sec-pains':
        return <PainPoints key={id} />;
      case 'sec-services':
        return <Services key={id} />;
      case 'sec-process':
        return <ProcessFlow key={id} />;
      case 'sec-pricing':
        return <Pricing key={id} />;
      case 'sec-diagnostic':
        return <DiagnosticTool key={id} />;
      case 'sec-credibility':
        return <Credibility key={id} />;
      case 'sec-faq':
        return <FaqSection key={id} />;
      case 'sec-contact':
        return <ContactForm key={id} />;
      default:
        return null;
    }
  };

  // Public Homepage
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Navigation Header (if enabled) */}
      {(headerSection?.isVisible ?? true) && (
        <Header onOpenChecklist={() => setChecklistOpen(true)} />
      )}

      {/* Main Content Sections (ordered and filtered via Section Builder) */}
      <main className="flex-1">
        {bodySections.map(sec => renderSectionComponent(sec.id))}
      </main>

      {/* Footer (if enabled) */}
      {(footerSection?.isVisible ?? true) && <Footer />}

      {/* Free Starter Checklist Modal (Lead Magnet) */}
      <ChecklistModal
        isOpen={checklistOpen}
        onClose={() => setChecklistOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <CmsProvider>
        <CrmProvider>
          <AppContent />
        </CrmProvider>
      </CmsProvider>
    </RouterProvider>
  );
}
