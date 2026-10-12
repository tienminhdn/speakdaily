import type { Pattern } from "./types";

export const patterns: Pattern[] = [
  {
    slug: "sorry-could-you",
    title: "Khi không nghe kịp",
    structure: "Sorry, could you + say that again / speak more slowly?",
    level: "A1",
    explanation:
      "Đây là mẫu câu cứu cánh số 1. Người mới học thường im lặng khi không hiểu. Chỉ cần xin nhắc lại thì cuộc trò chuyện vẫn tiếp tục, và người bản xứ sẽ nói chậm hơn cho bạn.",
    examples: [
      { en: "Sorry, could you say that again?", vi: "Xin lỗi, bạn nói lại được không?" },
      { en: "Sorry, I didn't catch that.", vi: "Xin lỗi, tôi chưa nghe kịp." },
      { en: "Could you speak more slowly, please?", vi: "Bạn nói chậm hơn được không?" },
      { en: "What does \"deadline\" mean?", vi: "\"Deadline\" nghĩa là gì?" },
      { en: "How do you say \"đặc sản\" in English?", vi: "\"Đặc sản\" tiếng Anh nói thế nào?" },
    ],
    mistakes: [
      { wrong: "Repeat!", right: "Sorry, could you repeat that?", note: "Câu mệnh lệnh cộc lốc nghe như ra lệnh." },
      { wrong: "What?", right: "Sorry? / Pardon?", note: "\"What?\" một mình dễ nghe thiếu lịch sự." },
    ],
    tip: "Nói \"Sorry?\" và lên giọng ở cuối câu là đủ để người kia nhắc lại.",
  },
  {
    slug: "i-usually",
    title: "Thói quen hằng ngày",
    structure: "I + always / usually / often / sometimes / never + động từ",
    level: "A1",
    explanation:
      "Dùng thì hiện tại đơn để nói việc lặp đi lặp lại. Trạng từ tần suất đứng trước động từ thường. Với he / she / it thì động từ thêm -s hoặc -es.",
    examples: [
      { en: "I usually get up at six.", vi: "Tôi thường dậy lúc 6 giờ." },
      { en: "I always have coffee in the morning.", vi: "Buổi sáng tôi luôn uống cà phê." },
      { en: "I sometimes work on the weekend.", vi: "Thỉnh thoảng tôi làm việc cuối tuần." },
      { en: "She often goes to the gym after work.", vi: "Cô ấy hay đi tập gym sau giờ làm." },
      { en: "I never eat breakfast.", vi: "Tôi không bao giờ ăn sáng." },
    ],
    mistakes: [
      { wrong: "I usually am late.", right: "I'm usually late.", note: "Với \"be\", trạng từ đứng sau: am/is/are + usually." },
      { wrong: "She go to work by bus.", right: "She goes to work by bus.", note: "Ngôi thứ ba số ít: thêm -s / -es." },
    ],
    tip: "Ghép mẫu này với các cụm trong chủ đề \"Sinh hoạt hằng ngày\" là kể được cả một ngày.",
  },
  {
    slug: "i-would-like",
    title: "Gọi món & yêu cầu lịch sự",
    structure: "I'd like + danh từ / I'd like to + động từ",
    level: "A1",
    explanation:
      "\"I'd like\" (= I would like) lịch sự hơn \"I want\". Theo sau là danh từ khi gọi món, là to + động từ khi muốn làm việc gì đó.",
    examples: [
      { en: "I'd like a cup of tea, please.", vi: "Cho tôi một tách trà." },
      { en: "I'd like to book a table for two.", vi: "Tôi muốn đặt bàn cho hai người." },
      { en: "I'd like the chicken, please.", vi: "Cho tôi món gà." },
      { en: "Can I have some water, please?", vi: "Cho tôi xin ít nước được không?" },
      { en: "Could I get the bill, please?", vi: "Cho tôi tính tiền được không?" },
    ],
    mistakes: [
      { wrong: "I want coffee.", right: "I'd like a coffee, please.", note: "\"I want\" khi gọi món nghe hơi cộc." },
      { wrong: "I'd like to a coffee.", right: "I'd like a coffee.", note: "Danh từ đứng ngay sau \"I'd like\", không có \"to\"." },
    ],
    tip: "Luôn thêm \"please\" ở cuối câu. Chỉ một từ mà câu mềm hơn hẳn.",
  },
  {
    slug: "can-could-you",
    title: "Nhờ vả lịch sự",
    structure: "Can / Could you + động từ nguyên mẫu (+ please)?",
    level: "A2",
    explanation:
      "\"Can you\" dùng với bạn bè. \"Could you\" lịch sự hơn, dùng với người lạ hoặc ở chỗ làm. Khi hỏi thông tin, dùng \"Could you tell me where ... is?\" (trật tự câu khẳng định).",
    examples: [
      { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
      { en: "Could you show me on the map?", vi: "Bạn chỉ cho tôi trên bản đồ được không?" },
      { en: "Could you tell me where the station is?", vi: "Bạn cho tôi biết nhà ga ở đâu được không?" },
      { en: "Can you take a photo of us?", vi: "Bạn chụp giúp chúng tôi một tấm ảnh được không?" },
      { en: "Sure. / Of course. / No problem.", vi: "Được chứ. / Tất nhiên. / Không vấn đề gì." },
    ],
    mistakes: [
      { wrong: "Could you to help me?", right: "Could you help me?", note: "Sau can / could là động từ nguyên mẫu, không có \"to\"." },
      { wrong: "Could you tell me where is the station?", right: "Could you tell me where the station is?", note: "Câu hỏi gián tiếp dùng trật tự khẳng định." },
    ],
    tip: "Mở đầu bằng \"Excuse me,\" khi nhờ người lạ.",
  },
  {
    slug: "do-you-have",
    title: "Hỏi \"có ... không?\"",
    structure: "Do you have ...? / Is there ...? / Are there any ...?",
    level: "A2",
    explanation:
      "Người Việt hay dịch \"có\" thành \"have\" ở mọi chỗ. \"Do you have\" là hỏi người đó sở hữu hoặc bán gì. \"Is there / Are there\" là hỏi một nơi có cái gì.",
    examples: [
      { en: "Do you have this in black?", vi: "Cái này có màu đen không?" },
      { en: "Do you have a smaller size?", vi: "Có size nhỏ hơn không?" },
      { en: "Is there an ATM near here?", vi: "Gần đây có cây ATM không?" },
      { en: "Are there any good restaurants around here?", vi: "Quanh đây có nhà hàng nào ngon không?" },
      { en: "Is there a discount today?", vi: "Hôm nay có giảm giá không?" },
    ],
    mistakes: [
      { wrong: "Have you this in black?", right: "Do you have this in black?", note: "Tiếng Anh giao tiếp dùng trợ động từ \"do\"." },
      { wrong: "Have a bank near here?", right: "Is there a bank near here?", note: "\"Có (ở đâu đó)\" là there is / there are." },
    ],
    tip: "Ở cửa hàng: \"Do you have ...?\". Hỏi về một nơi: \"Is there ...?\".",
  },
  {
    slug: "i-have-done",
    title: "Kinh nghiệm & khoảng thời gian",
    structure: "I've + V3 (+ for / since) / Have you ever + V3?",
    level: "A2",
    explanation:
      "Hiện tại hoàn thành dùng cho việc bắt đầu trong quá khứ và vẫn còn tiếp diễn, hoặc để kể kinh nghiệm. \"for\" đi với một khoảng thời gian, \"since\" đi với mốc thời gian.",
    examples: [
      { en: "I've worked here for three years.", vi: "Tôi đã làm ở đây được ba năm." },
      { en: "I've lived in Hanoi since 2020.", vi: "Tôi sống ở Hà Nội từ năm 2020." },
      { en: "I've been to Thailand twice.", vi: "Tôi đã đến Thái Lan hai lần." },
      { en: "Have you ever tried pho?", vi: "Bạn đã bao giờ ăn phở chưa?" },
      { en: "I've never been abroad.", vi: "Tôi chưa bao giờ ra nước ngoài." },
    ],
    mistakes: [
      { wrong: "I work here for three years.", right: "I've worked here for three years.", note: "Việc vẫn đang tiếp diễn thì dùng have + V3." },
      { wrong: "since three years", right: "for three years", note: "for + khoảng thời gian; since + mốc thời gian." },
    ],
    tip: "Ghi nhớ nguyên cụm \"How long have you ...?\" để hỏi lại người khác.",
  },
  {
    slug: "im-calling-to",
    title: "Gọi điện có mục đích",
    structure: "I'm calling to + động từ / I'm calling about + danh từ",
    level: "B1",
    explanation:
      "Câu thứ hai trong mọi cuộc gọi là nói lý do gọi. Dùng thì tiếp diễn \"I'm calling\" vì việc đang xảy ra ngay lúc nói.",
    examples: [
      { en: "I'm calling to make an appointment.", vi: "Tôi gọi để đặt lịch hẹn." },
      { en: "I'm calling about the job advertisement.", vi: "Tôi gọi về tin tuyển dụng." },
      { en: "I'm calling to confirm my booking.", vi: "Tôi gọi để xác nhận đặt chỗ." },
      { en: "Could I speak to the manager, please?", vi: "Cho tôi nói chuyện với quản lý được không?" },
      { en: "Could you ask her to call me back?", vi: "Bạn nhắn cô ấy gọi lại cho tôi được không?" },
    ],
    mistakes: [
      { wrong: "I call to make an appointment.", right: "I'm calling to make an appointment.", note: "Việc đang làm lúc nói: dùng be + V-ing." },
      { wrong: "I'm calling for make a booking.", right: "I'm calling to make a booking.", note: "Chỉ mục đích dùng to + động từ." },
    ],
    tip: "Chuẩn bị sẵn câu đầu: \"Hello, this is ... I'm calling to ...\". Cuộc gọi sẽ đỡ run hơn nhiều.",
  },
  {
    slug: "im-going-to",
    title: "Nói về kế hoạch",
    structure: "I'm going to + động từ / I'm + V-ing (đã hẹn trước)",
    level: "B1",
    explanation:
      "\"be going to\" dùng cho kế hoạch đã quyết định. Thì hiện tại tiếp diễn dùng cho lịch đã hẹn cụ thể, có thời gian và người. Cả hai đều tự nhiên hơn \"will\" khi kể kế hoạch.",
    examples: [
      { en: "I'm going to visit my parents this weekend.", vi: "Cuối tuần này tôi sẽ về thăm bố mẹ." },
      { en: "We're going to watch a movie tonight.", vi: "Tối nay bọn mình sẽ xem phim." },
      { en: "I'm meeting Lan on Saturday.", vi: "Thứ Bảy tôi gặp Lan." },
      { en: "What are you going to do tomorrow?", vi: "Ngày mai bạn định làm gì?" },
      { en: "I'm not going to work overtime today.", vi: "Hôm nay tôi sẽ không làm thêm giờ." },
    ],
    mistakes: [
      { wrong: "Tomorrow I go to the cinema.", right: "Tomorrow I'm going to the cinema.", note: "Kế hoạch tương lai không dùng hiện tại đơn." },
      { wrong: "I'm going to visiting my parents.", right: "I'm going to visit my parents.", note: "Sau \"going to\" là động từ nguyên mẫu." },
    ],
    tip: "Trong văn nói, \"going to\" thường được đọc nhanh thành \"gonna\".",
  },
  {
    slug: "i-think",
    title: "Nêu ý kiến",
    structure: "I think (that) + mệnh đề / I don't think + mệnh đề",
    level: "B1",
    explanation:
      "Nêu ý kiến rồi thêm lý do bằng \"because ...\". Muốn nói ý phủ định, người bản xứ thường đặt \"not\" ở \"think\": I don't think it's good.",
    examples: [
      { en: "I think it's a great idea.", vi: "Tôi nghĩ đó là một ý tuyệt vời." },
      { en: "I don't think it's true.", vi: "Tôi không nghĩ điều đó đúng." },
      { en: "In my opinion, the movie was too long.", vi: "Theo tôi, bộ phim quá dài." },
      { en: "I agree with you.", vi: "Tôi đồng ý với bạn." },
      { en: "What do you think about it?", vi: "Bạn nghĩ sao về chuyện đó?" },
    ],
    mistakes: [
      { wrong: "I think it's not good.", right: "I don't think it's good.", note: "Cách nói tự nhiên hơn của người bản xứ." },
      { wrong: "I'm agree.", right: "I agree.", note: "\"agree\" là động từ, không cần \"am\"." },
    ],
    tip: "Công thức 3 bước: Ý kiến (I think...) → Lý do (because...) → Hỏi lại (What do you think?).",
  },
];
