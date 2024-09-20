import React from "react";
import Link from "next/link";

const footerLinks = [
  { text: "Về chúng tôi", href: "/about" },
  { text: "Điều khoản dịch vụ", href: "/terms" },
  { text: "Chính sách bảo mật", href: "/privacy" },
  { text: "Liên hệ", href: "/contact" },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-light-surface text-light-onSurfaceVariant">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">MangaDex</h3>
            <p className="text-sm">Nền tảng đọc và chia sẻ manga hàng đầu.</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Liên kết</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className="hover:text-light-primary transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-lg font-semibold mb-2">Theo dõi chúng tôi</h4>
            <div className="flex space-x-4">
              {["facebook", "twitter", "instagram", "discord"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-2xl hover:text-light-primary transition-colors"
                >
                  <i className={`fab fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-light-outline text-center text-sm">
          <p>&copy; 2024 MangaDex. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};
