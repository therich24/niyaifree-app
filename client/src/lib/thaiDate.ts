/**
 * Thai date/time formatting utilities
 * ทุกฟังก์ชันแปลงเป็นเวลาไทย GMT+7 เสมอ
 * แปลงวันที่เป็นรูปแบบไทย: "29 มีนาคม 2569"
 */

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

/**
 * แปลง Date เป็นเวลาไทย GMT+7
 * คืน Date object ที่ปรับเวลาแล้ว (สำหรับ getUTC* methods)
 */
function toThaiTime(dateStr: string | Date): Date {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return d;
  // Shift to GMT+7: add 7 hours in ms
  const thaiOffset = 7 * 60 * 60 * 1000;
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60 * 1000;
  return new Date(utcMs + thaiOffset);
}

/**
 * แปลงวันที่เป็นรูปแบบไทยเต็ม: "29 มีนาคม 2569"
 */
export function formatThaiDate(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  const month = THAI_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear() + 543;
  return `${day} ${month} ${year}`;
}

/**
 * แปลงวันที่เป็นรูปแบบไทยสั้น: "29 มี.ค. 69"
 */
export function formatThaiDateShort(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  const month = THAI_MONTHS_SHORT[d.getUTCMonth()];
  const year = (d.getUTCFullYear() + 543) % 100;
  return `${day} ${month} ${year}`;
}

/**
 * แปลงวันที่เป็นรูปแบบไทยกลาง: "29 มี.ค. 2569"
 */
export function formatThaiDateMedium(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  const month = THAI_MONTHS_SHORT[d.getUTCMonth()];
  const year = d.getUTCFullYear() + 543;
  return `${day} ${month} ${year}`;
}

/**
 * แปลงวันที่+เวลาเป็นรูปแบบไทย: "29 มี.ค. 2569 13:45"
 */
export function formatThaiDateTime(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  const month = THAI_MONTHS_SHORT[d.getUTCMonth()];
  const year = d.getUTCFullYear() + 543;
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * แปลงเวลาเป็นรูปแบบไทย: "13:45:30"
 */
export function formatThaiTime(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * แปลงวันที่เป็นรูปแบบไทยสำหรับ toLocaleDateString ทดแทน
 * ใช้แทน new Date(x).toLocaleDateString("th-TH")
 */
export function formatThaiDateLocale(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear() + 543;
  return `${day}/${month}/${year}`;
}

/**
 * แปลงวันที่+เวลาเป็นรูปแบบไทยสำหรับ toLocaleString ทดแทน
 * ใช้แทน new Date(x).toLocaleString("th-TH")
 */
export function formatThaiDateTimeLocale(dateStr: string): string {
  const d = toThaiTime(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear() + 543;
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * แปลงวันที่เป็นรูปแบบ "29 มี.ค. 2569" (short month + full year)
 * ใช้แทน toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
 */
export function formatThaiDateShortMonth(dateStr: string): string {
  return formatThaiDateMedium(dateStr);
}
