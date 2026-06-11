"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Coverage Matrix" },
  { href: "/feeds", label: "Feeds" },
  { href: "/methodology", label: "Methodology" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 text-sm text-gray-600">
      {ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/" || pathname.startsWith("/protocol")
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "font-semibold text-gray-900 underline underline-offset-8"
                : "hover:text-gray-900"
            }
          >
            {item.label}
          </Link>
        );
      })}
      <a
        href="https://github.com/timfong888/defi-risk"
        className="hover:text-gray-900"
      >
        GitHub
      </a>
    </nav>
  );
}
