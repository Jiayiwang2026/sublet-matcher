import React from 'react';
import Link from 'next/link';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => (
  <Link
    href={href}
    className="text-gray-300 hover:text-white transition-colors duration-200"
  >
    {children}
  </Link>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Us Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">关于我们</h3>
            <ul className="space-y-3">
              <li>
                <FooterLink href="/about">公司介绍</FooterLink>
              </li>
              <li>
                <FooterLink href="/team">团队成员</FooterLink>
              </li>
              <li>
                <FooterLink href="/careers">加入我们</FooterLink>
              </li>
            </ul>
          </div>

          {/* Site Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">网站导航</h3>
            <ul className="space-y-3">
              <li>
                <FooterLink href="/">首页</FooterLink>
              </li>
              <li>
                <FooterLink href="/how-it-works">使用说明</FooterLink>
              </li>
              <li>
                <FooterLink href="/listing/new">发布房源</FooterLink>
              </li>
              <li>
                <FooterLink href="/contact">联系我们</FooterLink>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">法律条款</h3>
            <ul className="space-y-3">
              <li>
                <FooterLink href="/privacy">隐私政策</FooterLink>
              </li>
              <li>
                <FooterLink href="/terms">用户协议</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SubletMatcher. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {/* Social Media Links */}
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="WeChat"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21.502 19.525c1.524-1.105 2.498-2.738 2.498-4.554 0-3.326-3.237-6.023-7.229-6.023s-7.229 2.697-7.229 6.023c0 3.327 3.237 6.024 7.229 6.024.825 0 1.621-.117 2.36-.33l.212-.032c.139 0 .265.043.384.111l1.583.95.139.053c.128 0 .232-.104.232-.232l-.035-.145-.263-1.518-.03-.17c0-.128.043-.265.111-.384zm-12.787-4.639c0-3.816 3.701-6.912 8.267-6.912s8.267 3.096 8.267 6.912c0 2.054-.992 3.88-2.669 5.182-.283.277-.386.682-.314 1.066l.297 1.732-1.806-1.083c-.256-.152-.545-.202-.834-.147-.834.246-1.772.381-2.739.381-4.566 0-8.267-3.096-8.267-6.913zm4.938-2.108c0 .795-.645 1.44-1.44 1.44s-1.44-.645-1.44-1.44.645-1.44 1.44-1.44 1.44.645 1.44 1.44zm6.259 0c0 .795-.645 1.44-1.44 1.44s-1.44-.645-1.44-1.44.645-1.44 1.44-1.44 1.44.645 1.44 1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Weibo"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.194 14.197c0 4.418-5.685 8.004-12.694 8.004-7.008 0-12.694-3.586-12.694-8.004 0-4.419 5.686-8.005 12.694-8.005 7.009 0 12.694 3.586 12.694 8.005zm-2.331-7.425c.871-.524 1.88-.764 2.886-.694.432.031.865.144 1.251.335.384.19.723.456.997.781.545.644.847 1.466.847 2.316 0 .85-.302 1.672-.847 2.316-.274.324-.613.59-.997.78-.386.191-.819.305-1.251.335-1.006.071-2.015-.17-2.886-.694-.871-.524-1.516-1.306-1.837-2.235-.321-.929-.321-1.945 0-2.874.321-.929.966-1.711 1.837-2.235zm-2.028 4.912c-.091-.273-.273-.491-.509-.609-.236-.118-.509-.145-.763-.073-.254.073-.472.236-.609.473-.137.236-.164.509-.091.763.072.254.236.472.472.609.236.137.509.164.763.091.255-.072.473-.236.61-.472.136-.237.163-.51.09-.764zm-1.353-2.043c.218-.127.473-.164.718-.109.245.054.463.2.609.4.145.2.2.454.145.7-.054.245-.2.463-.4.609-.2.145-.454.2-.7.145-.245-.054-.463-.2-.609-.4-.145-.2-.2-.454-.145-.7.054-.245.2-.463.4-.609.609-.2.145-.454.2-.7.145-.245-.054-.463-.2-.609-.4-.145-.2-.2-.454-.145-.7.054-.245.2-.463.4-.609z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 