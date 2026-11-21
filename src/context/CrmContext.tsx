import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CrmLead {
  id: string;
  fullName: string;
  phoneZalo: string;
  phone?: string;
  zalo?: string;
  email?: string;
  contactAddress?: string;
  assignedStaff?: string;

  // Tab 2: Doanh nghiệp
  businessName: string;
  taxCode?: string;
  businessType?: string;
  industry: string;
  businessAddress?: string;
  estimatedRevenue: string;
  businessScale?: string;

  // Tab 3: Nhu cầu và tư vấn
  interestedService?: string;
  primaryProblem: string;
  invoiceStatus?: string;
  consultationContent?: string;
  clientFeedback?: string;
  nextStep?: string;
  followUpDate?: string;

  // Tab 4: Trạng thái và nguồn khách
  source: 'Website Form' | 'Checklist Download' | 'Zalo Trực tiếp' | 'Giới thiệu' | string;
  createdAt: string;
  updatedAt?: string;
  status: 'new' | 'contacting' | 'quoted' | 'closed' | 'archived';
  notes: string;
}

export interface CrmClient {
  id: string;
  companyName: string;
  taxCode: string;
  representative: string;
  phone: string;
  zalo?: string;
  email?: string;
  businessType?: string;
  businessAddress?: string;
  contactAddress?: string;
  taxAuthority?: string;
  industry: string;
  packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)' | 'Gói Đang Phát Triển (3-10 tỷ)' | 'Gói Đặc thù';
  monthlyFee: string;
  paymentCycle?: string;
  assignedAccountant: string;
  accountingSoftware?: string;
  taxPeriod?: string;
  invoiceMethod?: string;
  status: 'active' | 'pending_handover' | 'paused';
  startDate: string;
  updatedAt?: string;
  notes?: string;
}

export interface CrmDeal {
  id: string;
  code: string;
  clientName: string;
  packageTitle: string;
  feeMonthly: string;
  status: 'draft' | 'sent' | 'signed' | 'renewing';
  sentDate: string;
  signedDate?: string;
  notes: string;
}

export interface CrmTask {
  id: string;
  title: string;
  clientName: string;
  dueDate: string;
  category: 'Kê khai thuế' | 'Sổ sách MISA' | 'Chứng từ Zalo' | 'Báo cáo tài chính' | 'Hợp đồng';
  priority: 'Khẩn cấp' | 'Cao' | 'Bình thường';
  isCompleted: boolean;
  assignedTo: string;
}

export interface CrmSettings {
  brandName: string;
  hotline: string;
  email: string;
  notifyOnNewLead: boolean;
  misaSyncEnabled: boolean;
  autoRemindZalo: boolean;
  roles: Array<{ name: string; email: string; role: 'Super Admin' | 'Kế toán trưởng' | 'Chuyên viên' }>;
}

const INITIAL_LEADS: CrmLead[] = [
  {
    id: 'lead-01',
    fullName: 'Hoàng Văn Tuấn',
    phoneZalo: '0988 123 456',
    businessName: 'Công ty TNHH Vận tải Du lịch Bản Giốc',
    industry: 'Du lịch / Cho thuê xe máy',
    estimatedRevenue: 'Dưới 3 tỷ/năm',
    primaryProblem: 'Chưa quen xuất hóa đơn điện tử máy tính tiền',
    status: 'new',
    createdAt: '12/11/2026 09:15',
    notes: 'Mới chuyển đổi từ hộ kinh doanh xe máy lên công ty tháng 10/2026, cần hướng dẫn xuất hóa đơn khách đoàn.',
    source: 'Website Form',
  },
  {
    id: 'lead-02',
    fullName: 'Nông Thị Mai',
    phoneZalo: '0977 654 321',
    businessName: 'Xưởng Nhôm kính Cao Bằng Pro',
    industry: 'Sản xuất cơ khí / Nhôm kính',
    estimatedRevenue: 'Dưới 3 tỷ/năm',
    primaryProblem: 'Chứng từ mua nhôm kính và vật tư rời rạc',
    status: 'contacting',
    createdAt: '11/11/2026 14:30',
    notes: 'Đã trao đổi qua Zalo chiều qua. Khách cần hỗ trợ hợp đồng dịch vụ và hạch toán MISA định kỳ.',
    source: 'Website Form',
  },
  {
    id: 'lead-03',
    fullName: 'Triệu Phúc Hưng',
    phoneZalo: '0915 888 999',
    businessName: 'Công ty CP Dịch vụ Môi trường Xanh',
    industry: 'Vệ sinh công nghiệp / Dịch vụ',
    estimatedRevenue: '3 - 10 tỷ/năm',
    primaryProblem: 'Chưa có kế toán nội bộ, khối lượng ~250 HĐ/tháng',
    status: 'quoted',
    createdAt: '10/11/2026 10:00',
    notes: 'Đã gửi dự thảo báo giá Gói Phát Triển (5.500.000đ/tháng), hẹn phản hồi ngày 15/11.',
    source: 'Checklist Download',
  },
  {
    id: 'lead-04',
    fullName: 'Đặng Quốc Bảo',
    phoneZalo: '0942 333 444',
    businessName: 'Garage Ô tô Bắc Cạn - Cao Bằng',
    industry: 'Sửa chữa kỹ thuật / Ô tô',
    estimatedRevenue: '3 - 10 tỷ/năm',
    primaryProblem: 'Cần soát xét chứng từ và hồ sơ BHXH nhân công',
    status: 'closed',
    createdAt: '08/11/2026 16:20',
    notes: 'Đã ký hợp đồng dịch vụ kế toán trọn gói 1 năm. Bắt đầu tiếp nhận chứng từ tháng 11.',
    source: 'Giới thiệu',
  },
  {
    id: 'lead-05',
    fullName: 'Bế Thị Loan',
    phoneZalo: '0966 222 111',
    businessName: 'Cửa hàng Đặc sản Tây Bắc',
    industry: 'Thương mại / Bán lẻ',
    estimatedRevenue: 'Dưới 500 triệu/năm',
    primaryProblem: 'Muốn tìm hiểu thủ tục thành lập công ty',
    status: 'contacting',
    createdAt: '09/11/2026 11:45',
    notes: 'Đang là hộ kinh doanh cá thể, hướng dẫn quy định trước khi quyết định lên doanh nghiệp.',
    source: 'Zalo Trực tiếp',
  },
];

const INITIAL_CLIENTS: CrmClient[] = [
  {
    id: 'cli-01',
    companyName: 'Công ty TNHH Du lịch & Khám phá Non Nước',
    taxCode: '4800123456',
    representative: 'Nguyễn Hải Đăng',
    phone: '0912 345 601',
    zalo: '0912 345 601',
    email: 'ketoan@nonnuoccaobang.vn',
    businessType: 'Công ty TNHH 1 Thành viên',
    businessAddress: 'Phường Hợp Giang, TP. Cao Bằng, Tỉnh Cao Bằng',
    contactAddress: 'Số 45 Phố Kim Đồng, TP. Cao Bằng',
    taxAuthority: 'Chi cục Thuế khu vực Thành phố Cao Bằng',
    industry: 'Tour & Cho thuê xe máy',
    packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)',
    monthlyFee: '2.500.000 đ/tháng',
    paymentCycle: 'Thanh toán theo Quý',
    assignedAccountant: 'Mã Thị Bích',
    accountingSoftware: 'MISA SME',
    taxPeriod: 'Kê khai theo Quý',
    invoiceMethod: 'Hóa đơn điện tử MISA meInvoice',
    status: 'active',
    startDate: '01/01/2025',
    notes: 'Chứng từ đầu vào chủ yếu là xăng xe, bảo dưỡng và chi phí lưu trú cho khách đoàn.',
  },
  {
    id: 'cli-02',
    companyName: 'Công ty TNHH Phượt Xe Cao Bằng Express',
    taxCode: '4800234567',
    representative: 'Trần Văn Mạnh',
    phone: '0912 345 602',
    zalo: '0912 345 602',
    email: 'phuotxecaobang@gmail.com',
    businessType: 'Công ty TNHH 2 Thành viên trở lên',
    businessAddress: 'Phường Sông Bằng, TP. Cao Bằng, Tỉnh Cao Bằng',
    taxAuthority: 'Chi cục Thuế khu vực Thành phố Cao Bằng',
    industry: 'Tour & Cho thuê xe máy',
    packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)',
    monthlyFee: '2.800.000 đ/tháng',
    paymentCycle: 'Thanh toán theo Quý',
    assignedAccountant: 'Mã Thị Bích',
    accountingSoftware: 'MISA SME',
    taxPeriod: 'Kê khai theo Quý',
    invoiceMethod: 'Hóa đơn điện tử máy tính tiền',
    status: 'active',
    startDate: '15/03/2025',
    notes: 'Đã thiết lập nhóm Zalo nhận ảnh hóa đơn hằng tuần. Lưu ý đối chiếu sao kê tài khoản công ty vào ngày 05 hàng tháng.',
  },
  {
    id: 'cli-03',
    companyName: 'Công ty TNHH Cơ khí & Nhôm kính Sông Bằng',
    taxCode: '4800345678',
    representative: 'Lê Đình Khoa',
    phone: '0912 345 603',
    zalo: '0912 345 603',
    businessType: 'Công ty TNHH 1 Thành viên',
    businessAddress: 'Xã Hưng Đạo, TP. Cao Bằng, Tỉnh Cao Bằng',
    taxAuthority: 'Chi cục Thuế khu vực Thành phố Cao Bằng',
    industry: 'Sản xuất cơ khí / Nhôm kính',
    packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)',
    monthlyFee: '3.000.000 đ/tháng',
    paymentCycle: 'Thanh toán theo Quý',
    assignedAccountant: 'Mã Thị Bích',
    accountingSoftware: 'MISA SME',
    taxPeriod: 'Kê khai theo Quý',
    invoiceMethod: 'Hóa đơn điện tử Viettel S-Invoice',
    status: 'active',
    startDate: '01/06/2025',
    notes: 'Theo dõi định mức vật tư nhôm kính, sắt thép theo từng công trình thi công.',
  },
  {
    id: 'cli-04',
    companyName: 'Công ty TNHH Vệ sinh Công nghiệp Pac Bo Clean',
    taxCode: '4800456789',
    representative: 'Phạm Thị Thúy',
    phone: '0912 345 604',
    zalo: '0912 345 604',
    email: 'pacboclean@gmail.com',
    businessType: 'Công ty TNHH 1 Thành viên',
    businessAddress: 'Phường Đề Thám, TP. Cao Bằng, Tỉnh Cao Bằng',
    taxAuthority: 'Chi cục Thuế khu vực Thành phố Cao Bằng',
    industry: 'Vệ sinh công nghiệp / Dịch vụ',
    packageType: 'Gói Mới & Nhỏ (đến 3 tỷ)',
    monthlyFee: '3.000.000 đ/tháng',
    paymentCycle: 'Thanh toán theo Tháng',
    assignedAccountant: 'Mã Thị Bích',
    accountingSoftware: 'MISA AMIS Kế toán',
    taxPeriod: 'Kê khai theo Quý',
    invoiceMethod: 'Hóa đơn điện tử MISA meInvoice',
    status: 'active',
    startDate: '01/08/2025',
    notes: 'Nhiều hóa đơn dịch vụ cho cơ quan, trường học. Nhắc xuất hóa đơn ngay khi nghiệm thu.',
  },
];

const INITIAL_DEALS: CrmDeal[] = [
  {
    id: 'deal-01',
    code: 'HD-2026/01',
    clientName: 'Công ty TNHH Vận tải Du lịch Bản Giốc',
    packageTitle: 'Kế toán trọn gói Doanh nghiệp Nhỏ (đến 3 tỷ)',
    feeMonthly: '2.500.000 đ/tháng',
    status: 'sent',
    sentDate: '12/11/2026',
    notes: 'Đã gửi qua Zalo, khách đồng ý phạm vi tiếp nhận chứng từ và nộp thuế GTGT quý.',
  },
  {
    id: 'deal-02',
    code: 'HD-2026/02',
    clientName: 'Công ty CP Dịch vụ Môi trường Xanh',
    packageTitle: 'Kế toán trọn gói Doanh nghiệp Đang Phát Triển',
    feeMonthly: '5.500.000 đ/tháng',
    status: 'draft',
    sentDate: '10/11/2026',
    notes: 'Đang hoàn thiện điều khoản phân định trách nhiệm hồ sơ lao động theo yêu cầu của đối tác.',
  },
  {
    id: 'deal-03',
    code: 'HD-2025/08',
    clientName: 'Công ty TNHH Du lịch & Khám phá Non Nước',
    packageTitle: 'Kế toán trọn gói 12 tháng (Gia hạn năm thứ 2)',
    feeMonthly: '2.500.000 đ/tháng',
    status: 'signed',
    sentDate: '15/12/2025',
    signedDate: '20/12/2025',
    notes: 'Đã thanh toán theo quý định kỳ.',
  },
];

const INITIAL_TASKS: CrmTask[] = [
  {
    id: 'tsk-01',
    title: 'Rà soát chứng từ mua vào - bán ra tháng 11 qua nhóm Zalo',
    clientName: 'Công ty TNHH Phượt Xe Cao Bằng Express',
    dueDate: '15/11/2026',
    category: 'Chứng từ Zalo',
    priority: 'Cao',
    isCompleted: false,
    assignedTo: 'Mã Thị Bích',
  },
  {
    id: 'tsk-02',
    title: 'Hạch toán số liệu nhập xuất hóa đơn vào phần mềm MISA',
    clientName: 'Công ty TNHH Cơ khí & Nhôm kính Sông Bằng',
    dueDate: '20/11/2026',
    category: 'Sổ sách MISA',
    priority: 'Bình thường',
    isCompleted: false,
    assignedTo: 'Mã Thị Bích',
  },
  {
    id: 'tsk-03',
    title: 'Nhắc khách gửi file sao kê ngân hàng đối chiếu sổ phụ',
    clientName: 'Công ty TNHH Vệ sinh Công nghiệp Pac Bo Clean',
    dueDate: '18/11/2026',
    category: 'Chứng từ Zalo',
    priority: 'Cao',
    isCompleted: false,
    assignedTo: 'Mã Thị Bích',
  },
  {
    id: 'tsk-04',
    title: 'Chuẩn bị tờ khai thuế GTGT và thông báo số thuế tạm tính',
    clientName: 'Công ty TNHH Du lịch & Khám phá Non Nước',
    dueDate: '30/11/2026',
    category: 'Kê khai thuế',
    priority: 'Khẩn cấp',
    isCompleted: false,
    assignedTo: 'Mã Thị Bích',
  },
];

const INITIAL_SETTINGS: CrmSettings = {
  brandName: 'Mã Thị Bích — Kế toán & Thuế Doanh nghiệp',
  hotline: '0912 345 678',
  email: 'bichthuykt26@gmail.com',
  notifyOnNewLead: true,
  misaSyncEnabled: true,
  autoRemindZalo: true,
  roles: [
    { name: 'Mã Thị Bích', email: 'bichthuykt26@gmail.com', role: 'Super Admin' },
    { name: 'Chuyên viên Hỗ trợ Thuế', email: 'troly.ketoan@quybich.vn', role: 'Chuyên viên' },
  ],
};

const STORAGE_KEY_LEADS = 'qb_crm_leads_v2';
const STORAGE_KEY_CLIENTS = 'qb_crm_clients_v2';
const STORAGE_KEY_DEALS = 'qb_crm_deals_v2';
const STORAGE_KEY_TASKS = 'qb_crm_tasks_v2';
const STORAGE_KEY_SETTINGS = 'qb_crm_settings_v2';

interface CrmContextType {
  leads: CrmLead[];
  clients: CrmClient[];
  deals: CrmDeal[];
  tasks: CrmTask[];
  settings: CrmSettings;
  
  // Lead actions
  addLead: (lead: Omit<CrmLead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, updates: Partial<CrmLead>) => { success: boolean; error?: string };
  updateLeadStatus: (id: string, status: CrmLead['status']) => void;
  deleteLead: (id: string) => void;

  // Client actions
  addClient: (client: Omit<CrmClient, 'id'>) => void;
  updateClient: (id: string, updates: Partial<CrmClient>) => { success: boolean; error?: string };
  deleteClient: (id: string) => void;

  // Deal actions
  addDeal: (deal: Omit<CrmDeal, 'id' | 'code'>) => void;
  updateDealStatus: (id: string, status: CrmDeal['status']) => void;

  // Task actions
  toggleTask: (id: string) => void;
  addTask: (task: Omit<CrmTask, 'id' | 'isCompleted'>) => void;
  deleteTask: (id: string) => void;

  // Settings
  updateSettings: (updates: Partial<CrmSettings>) => void;
}

const CrmContext = createContext<CrmContextType | null>(null);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<CrmLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load leads from localStorage', e);
    }
    return INITIAL_LEADS;
  });

  const [clients, setClients] = useState<CrmClient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load clients from localStorage', e);
    }
    return INITIAL_CLIENTS;
  });

  const [deals, setDeals] = useState<CrmDeal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load deals from localStorage', e);
    }
    return INITIAL_DEALS;
  });

  const [tasks, setTasks] = useState<CrmTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [settings, setSettings] = useState<CrmSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return INITIAL_SETTINGS;
  });

  // Auto-sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Lead actions
  const addLead = (leadData: Omit<CrmLead, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newLead: CrmLead = {
      ...leadData,
      id: `lead-${Date.now().toString(36)}`,
      createdAt: timeStr,
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<CrmLead>): { success: boolean; error?: string } => {
    // 1. Validation
    if (updates.fullName !== undefined && !updates.fullName.trim()) {
      return { success: false, error: 'Họ và tên khách hàng không được để trống.' };
    }

    if (updates.phoneZalo !== undefined && !updates.phoneZalo.trim()) {
      return { success: false, error: 'Số điện thoại / Zalo không được để trống.' };
    }

    // Ensure phone numbers preserve strings with leading 0
    const safeUpdates: Partial<CrmLead> = { ...updates };
    if (safeUpdates.phoneZalo !== undefined) {
      safeUpdates.phoneZalo = safeUpdates.phoneZalo.trim();
    }
    if (safeUpdates.phone !== undefined && safeUpdates.phone) {
      safeUpdates.phone = safeUpdates.phone.trim();
    }
    if (safeUpdates.zalo !== undefined && safeUpdates.zalo) {
      safeUpdates.zalo = safeUpdates.zalo.trim();
    }

    // Validate email if provided
    if (safeUpdates.email && safeUpdates.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(safeUpdates.email.trim())) {
        return { success: false, error: 'Định dạng email không hợp lệ (Ví dụ: ten@congty.com).' };
      }
      safeUpdates.email = safeUpdates.email.trim();
    }

    // Validate tax code if provided (10 or 13 digits)
    if (safeUpdates.taxCode && safeUpdates.taxCode.trim()) {
      const cleanedTaxCode = safeUpdates.taxCode.trim().replace(/\s+/g, '');
      const taxRegex = /^[0-9]{10}(-[0-9]{3})?$|^[0-9]{13}$/;
      if (!taxRegex.test(cleanedTaxCode)) {
        return { success: false, error: 'Mã số thuế không đúng định dạng (cần 10 hoặc 13 chữ số).' };
      }
      safeUpdates.taxCode = cleanedTaxCode;
    }

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let found = false;
    setLeads(prev =>
      prev.map(l => {
        if (l.id === id) {
          found = true;
          // Protect id and createdAt from being overwritten
          const { id: _ignoreId, createdAt: _ignoreCreated, ...allowedUpdates } = safeUpdates;
          return {
            ...l,
            ...allowedUpdates,
            updatedAt: timeStr,
          };
        }
        return l;
      })
    );

    if (!found) {
      return { success: false, error: `Không tìm thấy khách hàng với mã ID "${id}".` };
    }

    return { success: true };
  };

  const updateLeadStatus = (id: string, status: CrmLead['status']) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, status } : l)));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  // Client actions
  const addClient = (clientData: Omit<CrmClient, 'id'>) => {
    const newClient: CrmClient = {
      ...clientData,
      id: `cli-${Date.now().toString(36)}`,
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<CrmClient>): { success: boolean; error?: string } => {
    if (updates.companyName !== undefined && !updates.companyName.trim()) {
      return { success: false, error: 'Tên công ty / doanh nghiệp không được để trống.' };
    }

    if (updates.taxCode !== undefined && !updates.taxCode.trim()) {
      return { success: false, error: 'Mã số thuế (MST) là thông tin bắt buộc.' };
    }

    const safeUpdates: Partial<CrmClient> = { ...updates };
    if (safeUpdates.companyName !== undefined) {
      safeUpdates.companyName = safeUpdates.companyName.trim();
    }
    if (safeUpdates.taxCode !== undefined) {
      const cleanedTaxCode = safeUpdates.taxCode.trim().replace(/\s+/g, '');
      const taxRegex = /^[0-9]{10}(-[0-9]{3})?$|^[0-9]{13}$/;
      if (!taxRegex.test(cleanedTaxCode)) {
        return { success: false, error: 'Mã số thuế không đúng định dạng (cần 10 hoặc 13 chữ số).' };
      }
      safeUpdates.taxCode = cleanedTaxCode;
    }
    if (safeUpdates.phone !== undefined) {
      safeUpdates.phone = safeUpdates.phone.trim();
    }
    if (safeUpdates.zalo !== undefined) {
      safeUpdates.zalo = safeUpdates.zalo.trim();
    }
    if (safeUpdates.email && safeUpdates.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(safeUpdates.email.trim())) {
        return { success: false, error: 'Định dạng email không hợp lệ (Ví dụ: ten@congty.com).' };
      }
      safeUpdates.email = safeUpdates.email.trim();
    }

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let found = false;
    setClients(prev =>
      prev.map(c => {
        if (c.id === id) {
          found = true;
          const { id: _ignoreId, ...allowedUpdates } = safeUpdates;
          return {
            ...c,
            ...allowedUpdates,
            updatedAt: timeStr,
          };
        }
        return c;
      })
    );

    if (!found) {
      return { success: false, error: `Không tìm thấy doanh nghiệp với mã "${id}".` };
    }

    return { success: true };
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Deal actions
  const addDeal = (dealData: Omit<CrmDeal, 'id' | 'code'>) => {
    const code = `HD-${new Date().getFullYear()}/${(deals.length + 1).toString().padStart(2, '0')}`;
    const newDeal: CrmDeal = {
      ...dealData,
      code,
      id: `deal-${Date.now().toString(36)}`,
    };
    setDeals(prev => [newDeal, ...prev]);
  };

  const updateDealStatus = (id: string, status: CrmDeal['status']) => {
    setDeals(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        if (status === 'signed' && !d.signedDate) {
          const now = new Date();
          return {
            ...d,
            status,
            signedDate: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
          };
        }
        return { ...d, status };
      })
    );
  };

  // Task actions
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)));
  };

  const addTask = (taskData: Omit<CrmTask, 'id' | 'isCompleted'>) => {
    const newTask: CrmTask = {
      ...taskData,
      id: `tsk-${Date.now().toString(36)}`,
      isCompleted: false,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (updates: Partial<CrmSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <CrmContext.Provider
      value={{
        leads,
        clients,
        deals,
        tasks,
        settings,
        addLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        addClient,
        updateClient,
        deleteClient,
        addDeal,
        updateDealStatus,
        toggleTask,
        addTask,
        deleteTask,
        updateSettings,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
