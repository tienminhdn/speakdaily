import type { ThemeWord } from "../types";

/**
 * Course headwords that the conversation chunks already used inside longer phrases
 * ("older brother", "walk the dog"), given their own entry so the course list is complete.
 */
const headwords: Record<string, ThemeWord[]> = {
  family: [
    { id: "family-brother", en: "brother", vi: "anh trai, em trai", pos: "n", tier: 1, hint: "BRÂ-đờ", chunk: "my little brother", chunkVi: "em trai mình", ex: "My little brother is still in high school.", exVi: "Em trai mình vẫn đang học cấp ba.", form: "brother", fromCourse: true },
    { id: "family-sister", en: "sister", vi: "chị gái, em gái", pos: "n", tier: 1, hint: "SIS-tờ", chunk: "my big sister", chunkVi: "chị gái mình", ex: "My big sister lives in Da Nang.", exVi: "Chị gái mình sống ở Đà Nẵng.", form: "sister", fromCourse: true },
    { id: "family-family", en: "family", vi: "gia đình", pos: "n", tier: 1, hint: "FAM-ờ-li", chunk: "a big family", chunkVi: "một gia đình đông người", ex: "I come from a big family.", exVi: "Mình sinh ra trong một gia đình đông người.", form: "family", fromCourse: true },
  ],
  school: [
    { id: "school-exam", en: "exam", vi: "kỳ thi, bài thi", pos: "n", tier: 1, hint: "ig-ZAM", chunk: "study for an exam", chunkVi: "ôn thi", ex: "I'm studying for an exam next week.", exVi: "Mình đang ôn cho bài thi tuần sau.", form: "exam", fromCourse: true },
  ],
  shopping: [
    { id: "shopping-card", en: "card", vi: "thẻ (thanh toán)", pos: "n", tier: 1, hint: "KAD", chunk: "pay by card", chunkVi: "trả bằng thẻ", ex: "Can I pay by card here?", exVi: "Ở đây tôi trả bằng thẻ được không?", form: "card", fromCourse: true },
    { id: "shopping-delivery", en: "delivery", vi: "việc giao hàng", pos: "n", tier: 2, hint: "đi-LI-vờ-ri", chunk: "free delivery", chunkVi: "giao hàng miễn phí", ex: "Is delivery free for this order?", exVi: "Đơn này có được giao miễn phí không?", form: "delivery", fromCourse: true },
    { id: "shopping-service", en: "service", vi: "dịch vụ, cách phục vụ", pos: "n", tier: 2, hint: "SƠ-vịs", chunk: "good service", chunkVi: "phục vụ tốt", ex: "The food was okay, but the service was great.", exVi: "Đồ ăn tạm được, nhưng phục vụ rất tốt.", form: "service", fromCourse: true },
    { id: "shopping-customer", en: "customer", vi: "khách hàng", pos: "n", tier: 2, hint: "KÁT-stờ-mờ", chunk: "a regular customer", chunkVi: "khách quen", ex: "I'm a regular customer at this coffee shop.", exVi: "Mình là khách quen của quán cà phê này.", form: "customer", fromCourse: true },
  ],
  travel: [
    { id: "travel-tour", en: "tour", vi: "chuyến tham quan, tour du lịch", pos: "n", tier: 1, hint: "TUA", chunk: "go on a tour", chunkVi: "đi một tour", ex: "We went on a food tour in Hoi An.", exVi: "Bọn mình đi một tour ẩm thực ở Hội An.", form: "tour", fromCourse: true },
    { id: "travel-flight", en: "flight", vi: "chuyến bay", pos: "n", tier: 1, hint: "FLAI", chunk: "a long flight", chunkVi: "một chuyến bay dài", ex: "My flight leaves at seven in the morning.", exVi: "Chuyến bay của mình cất cánh lúc bảy giờ sáng.", form: "flight", fromCourse: true },
    { id: "travel-guide", en: "guide", vi: "hướng dẫn viên", pos: "n", tier: 1, hint: "GAI", chunk: "a local guide", chunkVi: "hướng dẫn viên địa phương", ex: "Our guide spoke really good English.", exVi: "Hướng dẫn viên của bọn mình nói tiếng Anh rất giỏi.", form: "guide", fromCourse: true },
    { id: "travel-ticket", en: "ticket", vi: "vé", pos: "n", tier: 1, hint: "TÍK-kịt", chunk: "buy a ticket", chunkVi: "mua vé", ex: "I bought a train ticket online.", exVi: "Mình đã mua vé tàu trên mạng.", form: "ticket", fromCourse: true },
  ],
  weather: [
    { id: "weather-cool", en: "cool", vi: "mát mẻ", pos: "adj", tier: 1, hint: "KUUL", chunk: "a cool evening", chunkVi: "một buổi tối mát mẻ", ex: "It's nice and cool this evening.", exVi: "Tối nay trời mát dễ chịu.", form: "cool", fromCourse: true },
    { id: "weather-cold", en: "cold", vi: "lạnh", pos: "adj", tier: 1, hint: "KÂUL", chunk: "freezing cold", chunkVi: "lạnh cóng", ex: "It's so cold in Hanoi in January.", exVi: "Tháng Một ở Hà Nội lạnh lắm.", form: "cold", fromCourse: true },
    { id: "weather-forecast", en: "forecast", vi: "dự báo (thời tiết)", pos: "n", tier: 3, hint: "FO-kast", chunk: "check the forecast", chunkVi: "xem dự báo thời tiết", ex: "The forecast says it will rain tomorrow.", exVi: "Dự báo nói ngày mai trời mưa.", form: "forecast", fromCourse: true },
  ],
  clothing: [
    { id: "clothing-dress", en: "dress", vi: "váy liền, đầm", pos: "n", tier: 1, hint: "ĐRES", chunk: "a long dress", chunkVi: "một chiếc đầm dài", ex: "She wore a red dress to the wedding.", exVi: "Cô ấy mặc một chiếc đầm đỏ đi đám cưới.", form: "dress", fromCourse: true },
  ],
  animals: [
    { id: "animals-dog", en: "dog", vi: "con chó", pos: "n", tier: 1, hint: "ĐOG", chunk: "a friendly dog", chunkVi: "một chú chó thân thiện", ex: "Our dog sleeps next to my bed.", exVi: "Con chó nhà mình ngủ cạnh giường mình.", form: "dog", fromCourse: true },
  ],
  emotions: [
    { id: "emotions-excited", en: "excited", vi: "háo hức, phấn khích", pos: "adj", tier: 1, hint: "ik-SAI-tịt", chunk: "so excited about", chunkVi: "rất háo hức về", ex: "I'm so excited about our trip!", exVi: "Mình háo hức về chuyến đi của tụi mình quá!", form: "excited", fromCourse: true },
    { id: "emotions-tired", en: "tired", vi: "mệt", pos: "adj", tier: 1, hint: "TAI-ờđ", chunk: "too tired to", chunkVi: "mệt quá không thể", ex: "I'm too tired to cook tonight.", exVi: "Tối nay mình mệt quá không nấu nổi.", form: "tired", fromCourse: true },
    { id: "emotions-calm", en: "calm", vi: "bình tĩnh", pos: "adj", tier: 1, hint: "KAAM", chunk: "stay calm", chunkVi: "giữ bình tĩnh", ex: "Try to stay calm before the interview.", exVi: "Cố giữ bình tĩnh trước buổi phỏng vấn nhé.", form: "calm", fromCourse: true },
    { id: "emotions-proud", en: "proud", vi: "tự hào", pos: "adj", tier: 2, hint: "PRAUĐ", chunk: "proud of you", chunkVi: "tự hào về bạn", ex: "My parents are proud of me.", exVi: "Bố mẹ mình tự hào về mình.", form: "proud", fromCourse: true },
  ],
};

export default headwords;
