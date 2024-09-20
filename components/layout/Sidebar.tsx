import React, { useState } from "react";
import Link from "next/link";

const menuItems = [
  { icon: "fa-home", text: "Trang chủ", href: "/" },
  {
    icon: "fa-bookmark",
    text: "Theo dõi",
    href: "/follows",
    subItems: [
      "Cập nhật",
      "Thư viện",
      "MDLists",
      "Nhóm của tôi",
      "Lịch sử đọc",
    ],
  },
  {
    icon: "fa-book-open",
    text: "Tiêu đề",
    href: "/titles",
    subItems: [
      "Tìm kiếm nâng cao",
      "Mới thêm gần đây",
      "Cập nhật mới nhất",
      "Ngẫu nhiên",
    ],
  },
  {
    icon: "fa-users",
    text: "Cộng đồng",
    href: "/community",
    subItems: ["Diễn đàn", "Nhóm", "Người dùng"],
  },
  {
    icon: "fa-info-circle",
    text: "MangaDex",
    href: "/about",
    subItems: ["Quy tắc trang web", "Thông báo", "Về chúng tôi"],
  },
];

export const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (text: string) => {
    setOpenMenus((prev) =>
      prev.includes(text)
        ? prev.filter((item) => item !== text)
        : [...prev, text]
    );
  };

  return (
    <aside className="w-64 bg-light-surface shadow-md">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.text}>
              <div
                className="flex items-center justify-between text-light-onSurface hover:bg-light-surfaceVariant rounded-md p-2 cursor-pointer"
                onClick={() => toggleMenu(item.text)}
              >
                <Link href={item.href} className="flex items-center">
                  <i className={`fas ${item.icon} mr-3`}></i>
                  <span>{item.text}</span>
                </Link>
                {item.subItems && (
                  <i
                    className={`fas fa-chevron-${
                      openMenus.includes(item.text) ? "up" : "down"
                    }`}
                  ></i>
                )}
              </div>
              {item.subItems && openMenus.includes(item.text) && (
                <ul className="ml-6 mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem}>
                      <Link
                        href="#"
                        className="block text-light-onSurfaceVariant hover:text-light-primary p-2 rounded-md"
                      >
                        {subItem}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <div className="flex justify-center space-x-4 mb-4">
          {["facebook", "discord", "twitter", "reddit"].map((social) => (
            <a
              key={social}
              href="#"
              className="text-light-onSurfaceVariant hover:text-light-primary"
            >
              <i className={`fab fa-${social}`}></i>
            </a>
          ))}
        </div>
        <div className="text-center text-sm text-light-onSurfaceVariant">
          <p>v2024.8.19</p>
          <p>© MangaDex 2024</p>
        </div>
      </div>
    </aside>
  );
};
