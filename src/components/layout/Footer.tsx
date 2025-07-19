import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  sections: [
    {
      title: "Triton Tory",
      links: [
        { name: "Latest News", href: "/triton-tory" },
        { name: "Sports", href: "/triton-tory?category=Sports" },
        { name: "Student Government", href: "/triton-tory?category=Student Government" },
        { name: "Campus Events", href: "/triton-tory?category=Events" },
      ],
    },
    {
      title: "Triton Today",
      links: [
        { name: "Latest Videos", href: "/triton-today" },
        { name: "Campus Life", href: "/triton-today?category=Campus" },
        { name: "Interviews", href: "/triton-today?category=Interview" },
        { name: "Events Coverage", href: "/triton-today?category=Events" },
      ],
    },
    {
      title: "Science Journal",
      links: [
        { name: "Latest Research", href: "/triton-science" },
        { name: "Faculty Research", href: "/triton-science?type=faculty" },
        { name: "Student Research", href: "/triton-science?type=student" },
        { name: "Departments", href: "/triton-science/departments" },
      ],
    },
    {
      title: "Law Review",
      links: [
        { name: "Latest Analysis", href: "/triton-law" },
        { name: "Campus Policy", href: "/triton-law?category=Campus" },
        { name: "Supreme Court", href: "/triton-law?category=Supreme Court" },
        { name: "Student Rights", href: "/triton-law?category=Student Rights" },
      ],
    },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Admin Login", href: "/admin/login" },
  ],
  social: [
    {
      name: "Instagram - Triton Tory",
      href: "https://www.instagram.com/tritontory",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "Instagram - Triton Today",
      href: "https://www.instagram.com/tritontoday/",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mobile-safe-area py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Logo variant="default" size="sm" className="mb-4" />
            <p className="text-gray-400 text-sm mb-4 md:mb-6 max-w-md">
              The comprehensive voice of UC San Diego, bringing you the latest in campus news,
              videos, research, and legal analysis.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
                >
                  {item.icon}
                  <span className="sr-only">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Section Links */}
          {footerLinks.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-3 md:mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors block py-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-6 md:my-8 bg-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {footerLinks.company.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-400 text-center md:text-left">
            © {new Date().getFullYear()} Triton Tory Media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
