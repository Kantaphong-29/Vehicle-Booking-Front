/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0F2E56", // น้ำเงินเข้มสุด - หัวข้อ, ปุ่มหลัก hover
          800: "#153F73", // น้ำเงินหลัก - ปุ่ม, โลโก้
          700: "#1B4F91", // น้ำเงินกลาง - active state
          600: "#2563AB", // น้ำเงินอ่อนลง - ลิงก์, ไอคอน
          100: "#E8F0FB", // น้ำเงินอ่อนมาก - พื้นหลัง active/hover ใน sidebar
          50: "#F4F8FD",
        },
        gold: {
          100: "#FCEFD8",
          300: "#F0C36B",
          500: "#E0A526", // ทอง - ใช้ประดับเล็กน้อยเท่านั้น (โลโก้/สถานะ)
          600: "#B9840F",
        },
        paper: {
          50: "#F4F6F9", // พื้นหลังหน้าเว็บ - เทาอมฟ้าอ่อนแบบพอร์ทัล
          100: "#FFFFFF", // พื้นหลังการ์ด - ขาวสะอาด
        },
        ink: {
          900: "#1B2430",
          600: "#4A5568",
          500: "#6B7280",
        },
        sage: { 600: "#2F8558", 100: "#E3F3E9" }, // อนุมัติ
        brick: { 600: "#C22B22", 100: "#FBE7E5" }, // ปฏิเสธ
        amber: { 600: "#B7791F", 100: "#FCF1DC" }, // รออนุมัติ
      },
      fontFamily: {
        display: ['"IBM Plex Sans Thai"', "sans-serif"],
        body: ['"IBM Plex Sans Thai"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,46,86,0.04), 0 4px 14px rgba(15,46,86,0.06)",
      },
    },
  },
  plugins: [],
};
