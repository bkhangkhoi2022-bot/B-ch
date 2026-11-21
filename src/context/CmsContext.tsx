import React, { createContext, useContext, useState, ReactNode } from 'react';
import { websiteContext, PricingTier, FaqItem, ProcessStep } from '../data/websiteContext';

export interface CmsHeroData {
  kicker: string;
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
}

export interface CmsBrandData {
  brandName: string;
  title: string;
  website: string;
  contactPhone: string;
  email: string;
  directMarket: string;
  onlineMarket: string;
}

export interface CmsServiceItem {
  id: string;
  code: string;
  title: string;
  description: string;
  solves: string;
  deliverable: string;
  isVisible: boolean;
  order: number;
}

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'onboarding' | 'invoicing' | 'pricing' | 'process' | 'security';
  isVisible: boolean;
  order: number;
}

export interface CmsTrustPillar {
  stat: string;
  label: string;
  subtext: string;
}

export interface CmsPainItem {
  code: string;
  title: string;
  symptom: string;
  impact: string;
}

export interface CmsProcessStep {
  step: string;
  title: string;
  subtitle: string;
  detail: string;
  deliverable: string;
}

export interface CmsSectionConfig {
  id: string;
  type: 'header' | 'hero' | 'pains' | 'services' | 'process' | 'pricing' | 'diagnostic' | 'credibility' | 'faq' | 'contact' | 'footer';
  name: string;
  badge: string;
  description: string;
  order: number;
  isVisible: boolean;
}

export interface CmsContentData {
  sections: CmsSectionConfig[];
  brand: CmsBrandData;
  hero: CmsHeroData;
  trustPillars: CmsTrustPillar[];
  services: CmsServiceItem[];
  faqs: CmsFaqItem[];
  pains: {
    title: string;
    subtitle: string;
    items: CmsPainItem[];
  };
  process: {
    title: string;
    subtitle: string;
    steps: CmsProcessStep[];
  };
  pricing: {
    title: string;
    subtitle: string;
    tiers: PricingTier[];
  };
  credibility: {
    title: string;
    subtitle: string;
    experienceYears: number;
    taxSpecialistYears: number;
    summary: string;
  };
  contact: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    address: string;
    responseCommitment: string;
  };
  footer: {
    disclaimer: string;
    copyright: string;
  };
}

export const defaultSections: CmsSectionConfig[] = [
  {
    id: 'sec-header',
    type: 'header',
    name: 'Thanh điều hướng đầu trang',
    badge: 'Navigation',
    description: 'Logo thương hiệu Mã Thị Bích, 5 liên kết điều hướng nhanh và nút nhận tư vấn',
    order: 1,
    isVisible: true,
  },
  {
    id: 'sec-hero',
    type: 'hero',
    name: 'Khối Hero Banner chính',
    badge: 'Hero Banner',
    description: 'Thông điệp định vị 12 năm kinh nghiệm, tiêu đề chính, nút CTA kép, ảnh bối cảnh và 4 chỉ số',
    order: 2,
    isVisible: true,
  },
  {
    id: 'sec-pains',
    type: 'pains',
    name: 'Thực trạng & 6 Nỗi đau doanh nghiệp',
    badge: 'Pain Points',
    description: '6 nỗi đau chuyển đổi hộ kinh doanh lên công ty (P1–P6) và bảng so sánh 3 phương án',
    order: 3,
    isVisible: true,
  },
  {
    id: 'sec-services',
    type: 'services',
    name: 'Dịch vụ kế toán trọn gói (V1–V8)',
    badge: 'Core Services',
    description: 'Gói 8 giá trị cốt lõi từ xuất hóa đơn đến quyết toán năm và 3 dịch vụ bổ trợ',
    order: 4,
    isVisible: true,
  },
  {
    id: 'sec-process',
    type: 'process',
    name: 'Quy trình làm việc 6 bước',
    badge: 'Process Flow',
    description: 'Cơ chế 6 bước minh bạch: Khảo sát, Hợp đồng, Zalo chứng từ, MISA, Bàn giao, Đồng hành',
    order: 5,
    isVisible: true,
  },
  {
    id: 'sec-pricing',
    type: 'pricing',
    name: 'Bảng phí dịch vụ minh bạch',
    badge: 'Pricing Table',
    description: 'Biểu phí 2 gói doanh thu chuẩn (đến 3 tỷ & 3–10 tỷ) và 4 yếu tố cấu thành chi phí',
    order: 6,
    isVisible: true,
  },
  {
    id: 'sec-diagnostic',
    type: 'diagnostic',
    name: 'Công cụ khảo sát nhu cầu tương tác',
    badge: 'Interactive Tool',
    description: 'Bảng chọn tương tác 4 bước giúp chủ doanh nghiệp tự tính toán nhu cầu kế toán phù hợp',
    order: 7,
    isVisible: true,
  },
  {
    id: 'sec-credibility',
    type: 'credibility',
    name: 'Năng lực & Uy tín chuyên môn',
    badge: 'Credibility',
    description: '12 năm kế toán, 5 năm chuyên sâu thuế, danh mục 4 khách hàng thực tế và nguyên tắc 4 Không',
    order: 8,
    isVisible: true,
  },
  {
    id: 'sec-faq',
    type: 'faq',
    name: 'Hỏi đáp thường gặp (10 câu thực tế)',
    badge: 'FAQ Section',
    description: '10 câu hỏi đáp chia theo 5 nhóm: Khởi đầu, Hóa đơn, Biểu phí, Quy trình, Bảo mật',
    order: 9,
    isVisible: true,
  },
  {
    id: 'sec-contact',
    type: 'contact',
    name: 'Kênh liên hệ & Đăng ký tư vấn',
    badge: 'Contact Form',
    description: 'Biểu mẫu gửi nhu cầu, số Zalo/Hotline trực tiếp, kênh liên hệ tại Cao Bằng và Online',
    order: 10,
    isVisible: true,
  },
  {
    id: 'sec-footer',
    type: 'footer',
    name: 'Chân trang & Ghi chú pháp lý',
    badge: 'Footer',
    description: 'Thông tin thương hiệu quybich.vn, liên kết nhanh, giờ làm việc và ghi chú trách nhiệm',
    order: 11,
    isVisible: true,
  },
];

// Initial seed from websiteContext
const initialCmsData: CmsContentData = {
  sections: defaultSections,
  brand: {
    brandName: websiteContext.business.brandName,
    title: websiteContext.business.title,
    website: websiteContext.business.website,
    contactPhone: websiteContext.business.contactPhone,
    email: websiteContext.business.email,
    directMarket: websiteContext.business.directMarket,
    onlineMarket: websiteContext.business.onlineMarket,
  },
  hero: {
    kicker: "12 năm kinh nghiệm kế toán · 5 năm chuyên sâu thuế",
    headline: "Kế toán trọn gói — đồng hành từ ngày đầu doanh nghiệp.",
    subheadline: "Dành cho doanh nghiệp nhỏ và chủ hộ kinh doanh vừa chuyển lên công ty. Mã Thị Bích trực tiếp hướng dẫn hóa đơn, tiếp nhận chứng từ qua Zalo, lên sổ sách MISA và nộp tờ khai thuế theo kỳ — để bạn an tâm kinh doanh.",
    primaryCtaText: "Khảo sát nhu cầu & Báo giá",
    primaryCtaLink: "#khao-sat",
    secondaryCtaText: "Xem Checklist khởi đầu (Miễn phí)",
    imageUrl: "/src/assets/images/vietnamese_accountant_office_1794057086851.jpg",
    imageAlt: "Không gian làm việc dịch vụ kế toán và thuế doanh nghiệp Mã Thị Bích",
    imageCaption: "Hình ảnh minh họa không gian kế toán & chứng từ doanh nghiệp",
  },
  trustPillars: websiteContext.trustPillars.map(p => ({ ...p })),
  services: websiteContext.valueStack.map((v, idx) => ({
    id: `svc-${v.code.toLowerCase()}`,
    code: v.code,
    title: v.title,
    description: v.description,
    solves: v.solves,
    deliverable: v.deliverable,
    isVisible: true,
    order: idx + 1,
  })),
  faqs: websiteContext.faqs.map((f, idx) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category as CmsFaqItem['category'],
    isVisible: true,
    order: idx + 1,
  })),
  pains: {
    title: "Từ hộ kinh doanh lên doanh nghiệp: Bạn có đang gặp những trở ngại này?",
    subtitle: "Kinh doanh thì quen thuộc, nhưng quy định hóa đơn, chứng từ và kê khai thuế doanh nghiệp lại là một bài toán hoàn toàn mới.",
    items: websiteContext.painPoints.map(p => ({ ...p })),
  },
  process: {
    title: "Quy trình làm việc 6 bước minh bạch",
    subtitle: "Rõ ràng từ khâu tiếp nhận thông tin ban đầu đến bàn giao sổ sách định kỳ theo quy định",
    steps: websiteContext.processSteps.map(s => ({ ...s })),
  },
  pricing: {
    title: "Bảng phí kế toán trọn gói minh bạch theo quy mô",
    subtitle: "Biểu phí ổn định theo tháng, không phát sinh phụ phí ngoài thỏa thuận, phù hợp ngân sách doanh nghiệp nhỏ",
    tiers: websiteContext.pricingTiers.map(t => ({ ...t })),
  },
  credibility: {
    title: "Năng lực chuyên môn & Kinh nghiệm thực tế",
    subtitle: "Không hứa hẹn né tránh mọi rủi ro sai luật — Cam kết làm đúng phạm vi và phân định trách nhiệm minh bạch",
    experienceYears: websiteContext.business.experienceYears,
    taxSpecialistYears: websiteContext.business.taxSpecialistYears,
    summary: websiteContext.realCaseExperience.summary,
  },
  contact: {
    title: "Gửi nhu cầu tư vấn & Nhận phản hồi trong ngày",
    subtitle: "Mã Thị Bích trực tiếp tiếp nhận thông tin và phản hồi cụ thể qua Zalo hoặc điện thoại",
    phone: websiteContext.business.contactPhone,
    email: websiteContext.business.email,
    address: "Thành phố Cao Bằng, Tỉnh Cao Bằng (Hỗ trợ trực tuyến toàn quốc)",
    responseCommitment: "Phản hồi trong vòng 30 phút trong giờ làm việc",
  },
  footer: {
    disclaimer: "Dịch vụ kế toán và kê khai thuế được thực hiện trên cơ sở hóa đơn, chứng từ hợp pháp và thông tin trung thực do doanh nghiệp cung cấp theo phạm vi hợp đồng thỏa thuận.",
    copyright: "© 2026 Mã Thị Bích. Bản quyền thuộc về thương hiệu dịch vụ kế toán quybich.vn.",
  },
};

const STORAGE_KEY_PUBLISHED = 'qb_cms_published_v2';
const STORAGE_KEY_DRAFT = 'qb_cms_draft_v2';
const STORAGE_KEY_META = 'qb_cms_meta_v2';

interface CmsMeta {
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
}

interface CmsContextType {
  publishedData: CmsContentData;
  draftData: CmsContentData;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
  
  // Section Builder actions
  updateSection: (id: string, updates: Partial<CmsSectionConfig>) => void;
  toggleSectionVisibility: (id: string) => void;
  reorderSection: (id: string, direction: 'up' | 'down') => void;
  resetSectionToDefault: (id: string) => void;
  resetAllSections: () => void;

  // Edit actions (mutates draft)
  updateHero: (fields: Partial<CmsHeroData>) => void;
  updateBrand: (fields: Partial<CmsBrandData>) => void;
  updateTrustPillars: (pillars: CmsTrustPillar[]) => void;
  updatePains: (fields: Partial<CmsContentData['pains']>) => void;
  updateProcess: (fields: Partial<CmsContentData['process']>) => void;
  updatePricing: (fields: Partial<CmsContentData['pricing']>) => void;
  updateCredibility: (fields: Partial<CmsContentData['credibility']>) => void;
  updateContact: (fields: Partial<CmsContentData['contact']>) => void;
  updateFooter: (fields: Partial<CmsContentData['footer']>) => void;
  
  // Service actions
  addService: (service: Omit<CmsServiceItem, 'id' | 'order'>) => void;
  updateService: (id: string, fields: Partial<CmsServiceItem>) => void;
  toggleServiceVisibility: (id: string) => void;
  reorderService: (id: string, direction: 'up' | 'down') => void;
  deleteService: (id: string) => void;

  // FAQ actions
  addFaq: (faq: Omit<CmsFaqItem, 'id' | 'order'>) => void;
  updateFaq: (id: string, fields: Partial<CmsFaqItem>) => void;
  toggleFaqVisibility: (id: string) => void;
  reorderFaq: (id: string, direction: 'up' | 'down') => void;
  deleteFaq: (id: string) => void;

  // Lifecycle
  saveDraft: () => { success: boolean; message: string };
  publishDraft: () => { success: boolean; message: string };
  discardDraft: () => void;
}

const CmsContext = createContext<CmsContextType | null>(null);

export const CmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Published data (used by public site)
  const [publishedData, setPublishedData] = useState<CmsContentData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PUBLISHED);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure sections exist in parsed data
        if (!parsed.sections || parsed.sections.length === 0) {
          parsed.sections = defaultSections;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Cannot read published CMS data from storage', e);
    }
    return initialCmsData;
  });

  // Draft working data
  const [draftData, setDraftData] = useState<CmsContentData>(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (!parsed.sections || parsed.sections.length === 0) {
          parsed.sections = defaultSections;
        }
        return parsed;
      }
      const savedPub = localStorage.getItem(STORAGE_KEY_PUBLISHED);
      if (savedPub) {
        const parsed = JSON.parse(savedPub);
        if (!parsed.sections || parsed.sections.length === 0) {
          parsed.sections = defaultSections;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Cannot read draft CMS data from storage', e);
    }
    return initialCmsData;
  });

  // Metadata
  const [meta, setMeta] = useState<CmsMeta>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_META);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Cannot read meta from storage', e);
    }
    return {
      lastSavedAt: null,
      lastPublishedAt: "07/11/2026 05:10",
    };
  });

  // Check if draft has unsaved differences against published
  const hasUnsavedChanges = JSON.stringify(draftData) !== JSON.stringify(publishedData);

  // Section Builder actions
  const updateSection = (id: string, updates: Partial<CmsSectionConfig>) => {
    setDraftData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const toggleSectionVisibility = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)),
    }));
  };

  const reorderSection = (id: string, direction: 'up' | 'down') => {
    setDraftData(prev => {
      const sorted = [...prev.sections].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(s => s.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = sorted[index];
      sorted[index] = sorted[targetIndex];
      sorted[targetIndex] = temp;

      // Re-assign 1-based order numbers
      const updated = sorted.map((s, idx) => ({ ...s, order: idx + 1 }));
      return {
        ...prev,
        sections: updated,
      };
    });
  };

  const resetSectionToDefault = (id: string) => {
    const defaultSec = defaultSections.find(s => s.id === id);
    if (!defaultSec) return;
    setDraftData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...defaultSec, order: s.order } : s)),
    }));
  };

  const resetAllSections = () => {
    setDraftData(prev => ({
      ...prev,
      sections: defaultSections.map(s => ({ ...s })),
    }));
  };

  // Update Hero
  const updateHero = (fields: Partial<CmsHeroData>) => {
    setDraftData(prev => ({
      ...prev,
      hero: { ...prev.hero, ...fields },
    }));
  };

  // Update Brand
  const updateBrand = (fields: Partial<CmsBrandData>) => {
    setDraftData(prev => ({
      ...prev,
      brand: { ...prev.brand, ...fields },
    }));
  };

  // Update Trust Pillars
  const updateTrustPillars = (pillars: CmsTrustPillar[]) => {
    setDraftData(prev => ({
      ...prev,
      trustPillars: pillars,
    }));
  };

  // Update Pains
  const updatePains = (fields: Partial<CmsContentData['pains']>) => {
    setDraftData(prev => ({
      ...prev,
      pains: { ...prev.pains, ...fields },
    }));
  };

  // Update Process
  const updateProcess = (fields: Partial<CmsContentData['process']>) => {
    setDraftData(prev => ({
      ...prev,
      process: { ...prev.process, ...fields },
    }));
  };

  // Update Pricing
  const updatePricing = (fields: Partial<CmsContentData['pricing']>) => {
    setDraftData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, ...fields },
    }));
  };

  // Update Credibility
  const updateCredibility = (fields: Partial<CmsContentData['credibility']>) => {
    setDraftData(prev => ({
      ...prev,
      credibility: { ...prev.credibility, ...fields },
    }));
  };

  // Update Contact
  const updateContact = (fields: Partial<CmsContentData['contact']>) => {
    setDraftData(prev => ({
      ...prev,
      contact: { ...prev.contact, ...fields },
    }));
  };

  // Update Footer
  const updateFooter = (fields: Partial<CmsContentData['footer']>) => {
    setDraftData(prev => ({
      ...prev,
      footer: { ...prev.footer, ...fields },
    }));
  };

  // Service actions
  const addService = (service: Omit<CmsServiceItem, 'id' | 'order'>) => {
    setDraftData(prev => {
      const newOrder = prev.services.length + 1;
      const newId = `svc-${Date.now().toString(36)}`;
      return {
        ...prev,
        services: [...prev.services, { ...service, id: newId, order: newOrder }],
      };
    });
  };

  const updateService = (id: string, fields: Partial<CmsServiceItem>) => {
    setDraftData(prev => ({
      ...prev,
      services: prev.services.map(s => (s.id === id ? { ...s, ...fields } : s)),
    }));
  };

  const toggleServiceVisibility = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      services: prev.services.map(s => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)),
    }));
  };

  const reorderService = (id: string, direction: 'up' | 'down') => {
    setDraftData(prev => {
      const index = prev.services.findIndex(s => s.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.services.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const newServices = [...prev.services];
      const temp = newServices[index];
      newServices[index] = newServices[targetIndex];
      newServices[targetIndex] = temp;

      return {
        ...prev,
        services: newServices.map((s, idx) => ({ ...s, order: idx + 1 })),
      };
    });
  };

  const deleteService = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 })),
    }));
  };

  // FAQ actions
  const addFaq = (faq: Omit<CmsFaqItem, 'id' | 'order'>) => {
    setDraftData(prev => {
      const newOrder = prev.faqs.length + 1;
      const newId = `faq-${Date.now().toString(36)}`;
      return {
        ...prev,
        faqs: [...prev.faqs, { ...faq, id: newId, order: newOrder }],
      };
    });
  };

  const updateFaq = (id: string, fields: Partial<CmsFaqItem>) => {
    setDraftData(prev => ({
      ...prev,
      faqs: prev.faqs.map(f => (f.id === id ? { ...f, ...fields } : f)),
    }));
  };

  const toggleFaqVisibility = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      faqs: prev.faqs.map(f => (f.id === id ? { ...f, isVisible: !f.isVisible } : f)),
    }));
  };

  const reorderFaq = (id: string, direction: 'up' | 'down') => {
    setDraftData(prev => {
      const index = prev.faqs.findIndex(f => f.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.faqs.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const newFaqs = [...prev.faqs];
      const temp = newFaqs[index];
      newFaqs[index] = newFaqs[targetIndex];
      newFaqs[targetIndex] = temp;

      return {
        ...prev,
        faqs: newFaqs.map((f, idx) => ({ ...f, order: idx + 1 })),
      };
    });
  };

  const deleteFaq = (id: string) => {
    setDraftData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id).map((f, idx) => ({ ...f, order: idx + 1 })),
    }));
  };

  // Save Draft (does NOT publish to live site)
  const saveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draftData));
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const newMeta = { ...meta, lastSavedAt: timeStr };
      setMeta(newMeta);
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(newMeta));

      return { success: true, message: `Đã lưu bản nháp thành công lúc ${timeStr}` };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Lỗi lưu bản nháp vào bộ nhớ cục bộ" };
    }
  };

  // Publish Draft (copies draft into published)
  const publishDraft = () => {
    try {
      if (!draftData.hero.headline.trim()) {
        return { success: false, message: "Tiêu đề chính (Hero Headline) không được để trống!" };
      }
      if (!draftData.brand.brandName.trim()) {
        return { success: false, message: "Tên thương hiệu không được để trống!" };
      }

      const clone = JSON.parse(JSON.stringify(draftData));
      setPublishedData(clone);
      localStorage.setItem(STORAGE_KEY_PUBLISHED, JSON.stringify(clone));
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(clone));

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const newMeta = {
        lastSavedAt: timeStr,
        lastPublishedAt: timeStr,
      };
      setMeta(newMeta);
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(newMeta));

      return { success: true, message: `Đã xuất bản thành công nội dung lên website lúc ${timeStr}!` };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Lỗi trong quá trình xuất bản dữ liệu" };
    }
  };

  // Discard Draft (reverts to published)
  const discardDraft = () => {
    const clone = JSON.parse(JSON.stringify(publishedData));
    setDraftData(clone);
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(clone));
  };

  return (
    <CmsContext.Provider
      value={{
        publishedData,
        draftData,
        hasUnsavedChanges,
        lastSavedAt: meta.lastSavedAt,
        lastPublishedAt: meta.lastPublishedAt,
        updateSection,
        toggleSectionVisibility,
        reorderSection,
        resetSectionToDefault,
        resetAllSections,
        updateHero,
        updateBrand,
        updateTrustPillars,
        updatePains,
        updateProcess,
        updatePricing,
        updateCredibility,
        updateContact,
        updateFooter,
        addService,
        updateService,
        toggleServiceVisibility,
        reorderService,
        deleteService,
        addFaq,
        updateFaq,
        toggleFaqVisibility,
        reorderFaq,
        deleteFaq,
        saveDraft,
        publishDraft,
        discardDraft,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
