/**
 * NGUỒN DỮ LIỆU SỰ THẬT TỪ BCM 1.0 (07/11/2026)
 * Doanh nghiệp: Mã Thị Bích | Dịch vụ Kế toán và Thuế Doanh nghiệp
 * Website: quybich.vn | Thị trường: Cao Bằng & Trực tuyến toàn quốc
 */

export interface PricingTier {
  id: string;
  name: string;
  revenueRange: string;
  monthlyFee: string;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface ValueItem {
  code: string;
  title: string;
  description: string;
  solves: string;
  deliverable: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'onboarding' | 'invoicing' | 'pricing' | 'process' | 'security';
}

export interface ProcessStep {
  step: string;
  title: string;
  subtitle: string;
  detail: string;
  deliverable: string;
}

export const websiteContext = {
  business: {
    brandName: "Mã Thị Bích",
    title: "Dịch Vụ Kế Toán & Thuế Doanh Nghiệp",
    website: "quybich.vn",
    directMarket: "Cao Bằng",
    onlineMarket: "Toàn quốc (qua Zalo & phần mềm MISA)",
    experienceYears: 12,
    taxSpecialistYears: 5,
    primarySoftware: "MISA",
    contactZalo: "0912 345 678", // Hotline/Zalo format
    contactPhone: "0912 345 678",
    email: "bichthuykt26@gmail.com",
    consultantName: "Mã Thị Bích",
    position: "Phụ trách chuyên môn kế toán & thuế",
  },

  coreOffer: {
    name: "Kế toán trọn gói — Đồng hành từ ngày đầu doanh nghiệp",
    targetAudience: "Chủ hộ kinh doanh vừa chuyển lên công ty và doanh nghiệp nhỏ chưa có kế toán nội bộ",
    oneLineOffer: "Mã Thị Bích nhận kế toán trọn gói theo tháng cho doanh nghiệp nhỏ, trực tiếp hướng dẫn chứng từ và hóa đơn, thực hiện sổ sách MISA, kê khai và báo cáo thuế theo phạm vi thỏa thuận, để chủ doanh nghiệp có một đầu mối kế toán đồng hành trong quá trình hoạt động.",
    mechanism: "Tiếp nhận rõ — Xử lý đúng phạm vi — Bàn giao theo kỳ",
  },

  trustPillars: [
    {
      stat: "12 Năm",
      label: "Kinh nghiệm thực tế",
      subtext: "Trong đó có 5 năm chuyên sâu về kế toán thuế doanh nghiệp",
    },
    {
      stat: "1:1 Trực tiếp",
      label: "Đồng hành qua Zalo",
      subtext: "Trực tiếp Mã Thị Bích phụ trách, nhắc hồ sơ & giải đáp nghiệp vụ",
    },
    {
      stat: "Phần mềm MISA",
      label: "Chuẩn hóa sổ sách",
      subtext: "Hạch toán hóa đơn, chứng từ, sổ cái và báo cáo tài chính chuẩn mực",
    },
    {
      stat: "4 Doanh nghiệp",
      label: "Khách hàng thực tế",
      subtext: "Hỗ trợ từ khâu thành lập và tiếp tục phụ trách kế toán định kỳ",
    },
  ],

  realCaseExperience: {
    summary: "Đang phụ trách kế toán trọn gói cho 4 doanh nghiệp dịch vụ và sản xuất (doanh thu dưới 3 tỷ/năm) tại các lĩnh vực: Tour & cho thuê xe máy (2), Cơ khí nhôm kính (1), Vệ sinh công nghiệp (1). Đồng thời phụ trách kế toán nội bộ và thuế tại doanh nghiệp sửa chữa ô tô quy mô 10 tỷ/năm.",
    case01: {
      name: "Trường hợp KH01 (Doanh nghiệp Du lịch & Dịch vụ xe)",
      story: "Khách hàng chuyển đổi từ hộ kinh doanh lên doanh nghiệp. Mã Thị Bích đã hỗ trợ hoàn tất thủ tục thành lập, sau đó nhận phụ trách kế toán trọn gói theo tháng. Khi doanh nghiệp mở rộng quy mô, phát sinh nhu cầu thay đổi địa chỉ kinh doanh và đăng ký thêm địa điểm kinh doanh mới, Mã Thị Bích đã trực tiếp hoàn thiện cả hai thủ tục giúp chủ doanh nghiệp có một đầu mối thống nhất và hoạt động không bị gián đoạn.",
    },
    boundaries: "Không cam kết tránh mọi rủi ro thuế nếu thông tin không trung thực. Mọi công việc đều được thực hiện theo phạm vi thỏa thuận văn bản minh bạch, phân định rõ trách nhiệm hai bên."
  },

  painPoints: [
    {
      code: "P1",
      title: "Chưa quen xuất hóa đơn điện tử",
      symptom: "Chưa quen thao tác phần mềm hóa đơn, bối rối chuẩn bị thông tin mã số thuế, tên hàng hóa khi đối tác yêu cầu xuất ngay.",
      impact: "Ngại thao tác sai, mất thời gian trước mặt khách hàng."
    },
    {
      code: "P2",
      title: "Chứng từ mua vào - bán ra rời rạc",
      symptom: "Hóa đơn, phiếu chi, ảnh chụp biên lai nằm rải rác trên Zalo, tin nhắn hoặc lưu trong ví không có trật tự.",
      impact: "Đến kỳ kê khai quý bị thất lạc chứng từ, không tìm đủ hồ sơ hợp lệ để khấu trừ."
    },
    {
      code: "P3",
      title: "Chưa nắm chu kỳ kê khai & nghĩa vụ thuế",
      symptom: "Không rõ khi nào phải nộp tờ khai thuế GTGT, thuế TNDN tạm tính, hạn nộp tiền thuế là ngày bao nhiêu.",
      impact: "Bị động về dòng tiền và lo lắng nguy cơ bị phạt chậm nộp."
    },
    {
      code: "P4",
      title: "Chưa có nhân sự kế toán nội bộ riêng",
      symptom: "Quy mô doanh nghiệp nhỏ, chi phí tuyển kế toán riêng tại văn phòng (8-12 triệu/tháng) vượt quá ngân sách.",
      impact: "Chủ doanh nghiệp phải vừa bán hàng, vừa tự mày mò làm việc giấy tờ ngoài chuyên môn."
    },
    {
      code: "P5",
      title: "Lúng túng hồ sơ nhân công & BHXH",
      symptom: "Bắt đầu thuê thêm lao động nhưng chưa biết lập hợp đồng lao động, bảng chấm công, bảng thanh toán lương thế nào.",
      impact: "Ngại vướng mắc quy định lao động và chưa rõ thủ tục BHXH."
    },
    {
      code: "P6",
      title: "Phát sinh thay đổi thông tin doanh nghiệp",
      symptom: "Cần đổi địa chỉ trụ sở, thêm ngành nghề kinh doanh hoặc mở rộng thêm địa điểm nhưng không rõ thủ tục tại Sở KH&ĐT.",
      impact: "Mất nhiều ngày đi lại bổ sung hồ sơ nếu tự làm."
    },
  ],

  comparison: [
    {
      criteria: "Chi phí hàng tháng",
      selfMade: "0đ (nhưng tốn 20-30h/tháng)",
      internalAccountant: "8.000.000 - 15.000.000đ + BHXH + máy móc",
      quyBich: "Từ 2.500.000đ/tháng (tiết kiệm tối đa)",
    },
    {
      criteria: "Kinh nghiệm & nghiệp vụ thuế",
      selfMade: "Chưa quen luật thuế doanh nghiệp",
      internalAccountant: "Tùy trình độ nhân sự tuyển được",
      quyBich: "12 năm kinh nghiệm, 5 năm chuyên sâu thuế",
    },
    {
      criteria: "Hướng dẫn hóa đơn & chứng từ",
      selfMade: "Tự tìm hiểu trên mạng, dễ sai sót",
      internalAccountant: "Chờ có việc mới xử lý",
      quyBich: "Trực tiếp hướng dẫn thao tác, nhắc nộp hồ sơ",
    },
    {
      criteria: "Sổ sách & phần mềm kế toán",
      selfMade: "Ghi chép Excel rời rạc hoặc sổ tay",
      internalAccountant: "Phải mua phần mềm riêng",
      quyBich: "Hạch toán chuẩn hóa trên phần mềm MISA",
    },
    {
      criteria: "Tính ổn định & liên tục",
      selfMade: "Bị gián đoạn khi bận việc kinh doanh",
      internalAccountant: "Dễ nghỉ việc giữa kỳ quyết toán",
      quyBich: "Hợp đồng dịch vụ ổn định, đồng hành dài hạn",
    },
  ],

  valueStack: [
    {
      code: "V1",
      title: "Hướng dẫn khởi đầu hồ sơ & chứng từ",
      description: "Cung cấp danh mục giấy tờ cần chuẩn bị ngay sau khi chuyển từ hộ kinh doanh lên doanh nghiệp.",
      solves: "Giải quyết bỡ ngỡ ban đầu, biết ngay giấy tờ nào cần giữ lại.",
      deliverable: "Checklist tài liệu & hướng dẫn thiết lập hệ thống lưu trữ ban đầu",
    },
    {
      code: "V2",
      title: "Lập hóa đơn & hướng dẫn thao tác",
      description: "Hỗ trợ lập hóa đơn điện tử theo thông tin khách cung cấp hoặc hướng dẫn trực tiếp để chủ doanh nghiệp tự thao tác thành thạo.",
      solves: "Không sợ xuất sai đơn giá, thuế suất, thông tin người mua.",
      deliverable: "Hóa đơn điện tử hợp lệ gửi cho đối tác",
    },
    {
      code: "V3",
      title: "Tiếp nhận & rà soát chứng từ mua vào - bán ra",
      description: "Tiếp nhận ảnh chụp chứng từ qua nhóm Zalo, kiểm tra tính hợp lệ và định kỳ nhắc bổ sung chứng từ còn thiếu.",
      solves: "Tránh tình trạng dồn ứ chứng từ đến cuối quý mới phát hiện thiếu hóa đơn.",
      deliverable: "Bảng kiểm kê chứng từ định kỳ & thông báo hồ sơ thiếu",
    },
    {
      code: "V4",
      title: "Nhập liệu & lên sổ sách trên phần mềm MISA",
      description: "Hạch toán chi tiết các nghiệp vụ phát sinh, lên sổ nhật ký chung, sổ cái các tài khoản, sổ quỹ tiền mặt, tiền gửi.",
      solves: "Sổ sách doanh nghiệp được lưu trữ khoa học, chuẩn mực theo quy định.",
      deliverable: "Hệ thống sổ sách kế toán hoàn chỉnh trên phần mềm MISA",
    },
    {
      code: "V5",
      title: "Kê khai thuế & thông báo nghĩa vụ theo kỳ",
      description: "Lập và nộp tờ khai thuế GTGT, báo cáo tình hình sử dụng hóa đơn, thông báo số thuế TNDN tạm tính (nếu có).",
      solves: "Đảm bảo nộp tờ khai đúng hạn luật định, chủ động số tiền thuế cần nộp.",
      deliverable: "Tờ khai thuế có xác nhận của Tổng cục Thuế & bảng thông báo nghĩa vụ nộp",
    },
    {
      code: "V6",
      title: "Lập Báo cáo tài chính & Quyết toán năm",
      description: "Tổng hợp số liệu cả năm, lập BCTC, quyết toán thuế TNDN, quyết toán thuế TNCN và nộp cho cơ quan thuế, thống kê.",
      solves: "Hoàn tất trọn vẹn nghĩa vụ cuối năm, không để tồn đọng sang năm sau.",
      deliverable: "Bộ Báo cáo tài chính năm & hồ sơ quyết toán thuế hoàn chỉnh",
    },
    {
      code: "V7",
      title: "Hồ sơ lương & thủ tục BHXH thỏa thuận",
      description: "Lập bảng chấm công, bảng thanh toán tiền lương và hỗ trợ lập hồ sơ BHXH trong phạm vi đã thống nhất.",
      solves: "Chuẩn hóa chi phí tiền lương hợp lý, hợp lệ khi quyết toán.",
      deliverable: "Bảng thanh toán lương & hồ sơ nhân sự theo tháng",
    },
    {
      code: "V8",
      title: "Trao đổi trực tiếp 1:1 qua nhóm Zalo riêng",
      description: "Mã Thị Bích trực tiếp phụ trách nhóm trao đổi công việc, phản hồi nhanh các thắc mắc nghiệp vụ hàng ngày.",
      solves: "Không qua trung gian nhân viên tư vấn; hỏi người nào, người đó trực tiếp làm.",
      deliverable: "Nhóm Zalo hỗ trợ công việc 1:1 xuyên suốt hợp đồng",
    },
  ],

  supplementaryServices: [
    {
      title: "Thủ tục thành lập doanh nghiệp",
      description: "Hỗ trợ chuẩn bị hồ sơ, nộp hồ sơ tại Sở Kế hoạch & Đầu tư, nhận Giấy chứng nhận ĐKKD và con dấu.",
      pricingNote: "Khảo sát theo ngành nghề & địa bàn",
      highlight: "Từng hỗ trợ thành lập thành công cho cả 4 khách hàng dịch vụ hiện tại",
    },
    {
      title: "Thay đổi đăng ký kinh doanh",
      description: "Thay đổi địa chỉ trụ sở, bổ sung ngành nghề kinh doanh, thay đổi người đại diện, đăng ký địa điểm kinh doanh mới.",
      pricingNote: "500.000 – 2.000.000 đ/lần",
      highlight: "Thực hiện trọn gói hồ sơ pháp lý, không làm gián đoạn kinh doanh",
    },
    {
      title: "Hồ sơ giải trình thuế / BHXH",
      description: "Hỗ trợ rà soát, chuẩn bị số liệu và tài liệu giải trình khi có thông báo của cơ quan thuế hoặc cơ quan BHXH.",
      pricingNote: "Theo phạm vi & tính chất thực tế",
      highlight: "Phối hợp dựa trên chứng từ khách hàng đã cung cấp",
    },
  ],

  processSteps: [
    {
      step: "01",
      title: "Khảo sát hiện trạng",
      subtitle: "Tìm hiểu nhu cầu cụ thể",
      detail: "Hỏi rõ ngành nghề kinh doanh, tình trạng thành lập (mới chuyển đổi hay đã hoạt động), ước lượng số hóa đơn đầu vào - đầu ra và các nghiệp vụ phát sinh.",
      deliverable: "Bản tóm tắt hiện trạng doanh nghiệp",
    },
    {
      step: "02",
      title: "Thống nhất phạm vi & hợp đồng",
      subtitle: "Minh bạch công việc & trách nhiệm",
      detail: "Xác định rõ đầu việc được làm, tài liệu doanh nghiệp cần cung cấp, biểu phí theo tháng và trách nhiệm hai bên trước khi bắt đầu.",
      deliverable: "Hợp đồng dịch vụ kế toán & bảng phân định trách nhiệm",
    },
    {
      step: "03",
      title: "Tiếp nhận chứng từ định kỳ",
      subtitle: "Gửi ảnh qua Zalo thuận tiện",
      detail: "Tiếp nhận hóa đơn, thông tin giao dịch qua nhóm Zalo chung. Mã Thị Bích rà soát và định kỳ gửi bảng nhắc những hóa đơn, chứng từ còn thiếu.",
      deliverable: "Kho chứng từ được kiểm tra & phân loại khoa học",
    },
    {
      step: "04",
      title: "Hạch toán & kê khai thuế",
      subtitle: "Lên sổ MISA chuẩn mực",
      detail: "Nhập liệu trên phần mềm MISA, rà soát tính hợp lệ của hóa đơn, lập tờ khai thuế GTGT, thuế TNCN và các biểu mẫu báo cáo theo luật định.",
      deliverable: "Tờ khai thuế đã nộp & xác nhận của cơ quan thuế",
    },
    {
      step: "05",
      title: "Bàn giao kết quả theo kỳ",
      subtitle: "Báo cáo rõ ràng, dễ hiểu",
      detail: "Gửi thông báo số thuế phải nộp hằng quý để chủ doanh nghiệp chủ động tài chính. Hằng năm bàn giao trọn bộ sổ sách và Báo cáo tài chính.",
      deliverable: "Biên bản bàn giao số liệu thuế theo quý & BCTC năm",
    },
    {
      step: "06",
      title: "Định kỳ rà soát & đồng hành",
      subtitle: "Phù hợp sự phát triển doanh nghiệp",
      detail: "Khi doanh nghiệp mở rộng quy mô, thay đổi địa chỉ hoặc tăng đột biến số hóa đơn, hai bên cùng rà soát để cập nhật phạm vi hỗ trợ phù hợp.",
      deliverable: "Đánh giá định kỳ tình hình chứng từ & tài chính",
    },
  ],

  pricingTiers: [
    {
      id: "tier-1",
      name: "Doanh nghiệp Mới & Nhỏ",
      revenueRange: "Doanh thu năm đến 3 tỷ đồng",
      monthlyFee: "2.500.000 – 3.000.000",
      period: "đồng / tháng",
      description: "Rất phù hợp cho hộ kinh doanh vừa chuyển lên công ty, khối lượng chứng từ vừa phải (khoảng dưới 300 hóa đơn/tháng), cần hướng dẫn kỹ từ đầu.",
      features: [
        "Hướng dẫn xuất hóa đơn & chuẩn hóa chứng từ ban đầu",
        "Tiếp nhận ảnh chứng từ qua nhóm Zalo riêng 1:1",
        "Nhập liệu & hạch toán sổ sách trên phần mềm MISA",
        "Kê khai thuế GTGT, TNCN định kỳ theo quý",
        "Thông báo số thuế phải nộp & nhắc hạn nộp tiền",
        "Lập Báo cáo tài chính & Quyết toán thuế năm",
        "Hỗ trợ hồ sơ lương cơ bản theo phạm vi thống nhất",
      ],
      recommended: true,
    },
    {
      id: "tier-2",
      name: "Doanh nghiệp Đang Phát Triển",
      revenueRange: "Doanh thu năm trên 3 đến 10 tỷ đồng",
      monthlyFee: "5.000.000 – 8.000.000",
      period: "đồng / tháng",
      description: "Dành cho doanh nghiệp đã đi vào quỹ đạo, lượng hóa đơn phát sinh lớn (300-500+ hóa đơn/tháng), nhiều nghiệp vụ nhân công và giao dịch.",
      features: [
        "Toàn bộ quyền lợi của gói Doanh nghiệp Nhỏ",
        "Xử lý khối lượng hóa đơn mua vào - bán ra lớn",
        "Quản lý theo dõi sổ sách chi tiết tài khoản trên MISA",
        "Rà soát hợp đồng mua vào và các phiếu thu/chi kèm theo",
        "Xử lý hồ sơ lao động, thang bảng lương & thủ tục BHXH",
        "Hỗ trợ chuẩn bị hồ sơ giải trình khi có thông báo của thuế",
        "Tư vấn tối ưu quy trình lưu trữ nội bộ của doanh nghiệp",
      ],
      recommended: false,
    },
  ],

  starterChecklist: [
    {
      group: "1. Hồ sơ pháp lý nền tảng",
      items: [
        "Giấy chứng nhận đăng ký doanh nghiệp (bản scan hoặc ảnh chụp rõ nét)",
        "Thông tin con dấu doanh nghiệp và thông báo mẫu dấu",
        "Chữ ký số (Token điện tử) còn hạn sử dụng để nộp tờ khai và ký hóa đơn",
        "Tài khoản ngân hàng đứng tên công ty đã đăng ký với cơ quan thuế",
        "Tài khoản thuế điện tử (eTax) và tài khoản phần mềm hóa đơn điện tử",
      ]
    },
    {
      group: "2. Hóa đơn mua vào & bán ra",
      items: [
        "Hóa đơn đầu ra: Thông tin MST, tên đơn vị, địa chỉ người mua cần chính xác",
        "Hóa đơn đầu vào: Chỉ lấy hóa đơn đúng tên, MST công ty từ ngày cấp ĐKKD",
        "Tra cứu hóa đơn hợp lệ trên trang hoadondientu.gdt.gov.vn",
        "Chứng từ thanh toán không dùng tiền mặt (sao kê ngân hàng) cho hóa đơn từ 20 triệu",
      ]
    },
    {
      group: "3. Hợp đồng kinh tế & Thanh toán",
      items: [
        "Hợp đồng kinh tế với nhà cung cấp lớn hoặc khách hàng dự án",
        "Biên bản bàn giao hàng hóa / nghiệm thu dịch vụ kèm theo hóa đơn",
        "Sao kê ngân hàng hàng tháng có dấu xác nhận (đối chiếu sổ phụ)",
        "Phiếu thu, phiếu chi tiền mặt cho các khoản thanh toán dưới 20 triệu",
      ]
    },
    {
      group: "4. Hồ sơ lao động, tiền lương & BHXH",
      items: [
        "Danh sách lao động: CCCD gắn chip của người lao động",
        "Hợp đồng lao động ký giữa công ty và nhân viên",
        "Bảng chấm công hàng tháng có chữ ký xác nhận",
        "Bảng thanh toán tiền lương thể hiện số tiền nhận thực tế",
        "Mã số BHXH (nếu đăng ký tham gia đóng bảo hiểm)",
      ]
    },
    {
      group: "5. Các mốc hạn kê khai thuế quan trọng",
      items: [
        "Ngày 30 hoặc 31 tháng đầu quý sau: Hạn nộp tờ khai thuế GTGT và TNCN quý",
        "Ngày 30 tháng đầu quý sau: Hạn tạm nộp thuế TNDN (nếu có lãi tính thuế)",
        "Ngày 31/03 năm sau: Hạn nộp Báo cáo tài chính & Quyết toán thuế TNDN, TNCN năm",
        "Hạn nộp Lệ phí môn bài: Ngày 30/01 hàng năm (doanh nghiệp mới thành lập được miễn năm đầu theo quy định hiện hành)",
      ]
    }
  ],

  faqs: [
    {
      id: "faq-01",
      question: "Em vừa chuyển từ hộ kinh doanh lên công ty, chị có nhận làm kế toán từ đầu không?",
      answer: "Có em nhé. Mình có kinh nghiệm hỗ trợ doanh nghiệp ngay từ giai đoạn chuẩn bị thành lập và tiếp tục phụ trách kế toán trong suốt quá trình hoạt động. Mình sẽ khảo sát tình trạng giấy tờ hiện có, ngành nghề kinh doanh và các giao dịch phát sinh để xác định những công việc cần hoàn thiện ngay từ bước đầu.",
      category: "onboarding",
    },
    {
      id: "faq-02",
      question: "Công ty em chưa có kế toán nội bộ, thuê chị làm trọn gói thì gồm những việc gì?",
      answer: "Gói kế toán trọn gói theo tháng bao gồm: xuất hóa đơn theo thông tin khách cung cấp, tiếp nhận và kiểm tra chứng từ, nhập liệu lên sổ sách MISA, kê khai thuế định kỳ (quý), lập Báo cáo tài chính, quyết toán năm và xử lý hồ sơ lương/BHXH theo phạm vi đã thống nhất.",
      category: "process",
    },
    {
      id: "faq-03",
      question: "Em chưa quen xuất hóa đơn điện tử, chị Bích có hướng dẫn được không?",
      answer: "Có em. Mình từng hướng dẫn nhiều chủ doanh nghiệp từ chỗ chưa biết thao tác phần mềm đến khi có thể tự lập hóa đơn nhanh chóng khi khách yêu cầu. Mình sẽ hướng dẫn em cách kiểm tra thông tin người mua, chọn đúng mã hàng và kiểm tra thuế suất.",
      category: "invoicing",
    },
    {
      id: "faq-04",
      question: "Em chỉ chụp ảnh giấy tờ gửi qua Zalo thì có làm được sổ sách không?",
      answer: "Hiện nay 4 khách hàng dịch vụ của mình chủ yếu gửi ảnh chứng từ và thông tin giao dịch qua nhóm Zalo riêng. Mình sẽ kiểm tra tính rõ nét và nhắc ngay nếu thiếu thông tin. Với các chứng từ gốc quan trọng (như sao kê ngân hàng, hợp đồng lớn), mình sẽ hướng dẫn cách lưu trữ an toàn tại văn phòng em.",
      category: "process",
    },
    {
      id: "faq-05",
      question: "Phí dịch vụ kế toán bên chị là bao nhiêu một tháng?",
      answer: "Hiện tại với doanh nghiệp có doanh thu năm đến 3 tỷ đồng, mức phí là 2.500.000 – 3.000.000 đồng/tháng. Với doanh nghiệp có doanh thu trên 3 đến 10 tỷ đồng, mức phí là 5.000.000 – 8.000.000 đồng/tháng. Mức phí chính xác sẽ được báo cụ thể sau khi đối chiếu khối lượng hóa đơn và ngành nghề thực tế.",
      category: "pricing",
    },
    {
      id: "faq-06",
      question: "Doanh nghiệp ở tỉnh khác ngoài Cao Bằng, thuê chị làm việc từ xa có tiện không?",
      answer: "Rất thuận tiện em nhé. Mình nhận hỗ trợ trực tuyến cho doanh nghiệp trên toàn quốc. Mọi trao đổi, nhắc việc và gửi tờ khai đều thực hiện qua nhóm Zalo, phần mềm MISA điện tử và hệ thống Thuế điện tử của Tổng cục Thuế. Những thủ tục cần nộp hồ sơ bản cứng tại địa phương sẽ được xem xét và thống nhất trước khi thực hiện.",
      category: "process",
    },
    {
      id: "faq-07",
      question: "Nếu phát sinh sai sót thì trách nhiệm của hai bên được xử lý thế nào?",
      answer: "Trước khi bắt đầu, hợp đồng dịch vụ sẽ phân định rõ ràng: Doanh nghiệp chịu trách nhiệm về tính trung thực, đầy đủ và tính hợp pháp của hóa đơn chứng từ cung cấp; Kế toán chịu trách nhiệm về nghiệp vụ hạch toán, tính toán số liệu và nộp tờ khai đúng hạn theo hồ sơ đã nhận. Nếu sai sót do lỗi nghiệp vụ của kế toán, kế toán có trách nhiệm điều chỉnh và phối hợp xử lý theo thỏa thuận.",
      category: "security",
    },
    {
      id: "faq-08",
      question: "Thông tin và chứng từ kinh doanh của em có được bảo mật an toàn không?",
      answer: "Mình chỉ yêu cầu những thông tin thực sự cần thiết cho nghiệp vụ thuế và sổ sách. Toàn bộ dữ liệu được quản lý trong nhóm làm việc riêng và hệ thống phần mềm kế toán MISA bản quyền. Mình tuyệt đối không chia sẻ số liệu kinh doanh của doanh nghiệp cho bất kỳ bên thứ ba nào.",
      category: "security",
    },
    {
      id: "faq-09",
      question: "Nếu một tháng doanh nghiệp có lượng hóa đơn tăng đột biến thì phí thế nào?",
      answer: "Phí dịch vụ được tính ổn định theo thỏa thuận hàng tháng. Nếu trong một giai đoạn nhất định doanh nghiệp có sự thay đổi quy mô đột biến hoặc phát sinh nghiệp vụ đặc thù ngoài gói, hai bên sẽ cùng ngồi lại rà soát khối lượng để điều chỉnh mức phí phù hợp trên tinh thần minh bạch.",
      category: "pricing",
    },
    {
      id: "faq-10",
      question: "Công ty em muốn đổi địa chỉ hoặc mở thêm địa điểm kinh doanh, chị có làm không?",
      answer: "Có em nhé. Mình có nhận làm hồ sơ thay đổi đăng ký kinh doanh với mức phí từ 500.000 đến 2.000.000 đồng/lần tùy nội dung thay đổi. Trường hợp KH01 của mình từng được hỗ trợ hoàn tất cả thủ tục đổi địa chỉ và mở địa điểm kinh doanh mới rất suôn sẻ.",
      category: "process",
    },
  ],
};
