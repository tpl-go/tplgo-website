"use client";

import Link from "next/link";
import {
  companyLinks,
  serviceLinks,
  supportLinks,
  socialLinks,
} from "@/app/lib/footer/footerLinks";

export default function FooterSection() {
  return (
    <footer className="mt-1 rounded-t-[28px] bg-gray-800 pt-5 text-gray-300 sm:rounded-t-3xl">
      {/* Top Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 pb-2 md:grid-cols-4 md:gap-12 md:pb-0">
          {/* Column 1 – Brand */}
          <div>
            <h3 className="mb-4 text-2xl font-bold text-white">TPL</h3>

            <p className="text-sm leading-7 text-gray-300">
              Seamless travel bookings, curated experiences, and 24/7 expert
              support across India and international destinations.
            </p>
          </div>

          {/* Column 2 – Company */}
          <div>
            <h4 className="mb-3 text-base font-semibold text-white">
              Company
            </h4>

            <ul className="space-y-3 text-sm">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition hover:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Services */}
          <div>
            <h4 className="mb-3 text-base font-semibold text-white">
              Services
            </h4>

            <div className="grid grid-cols-2 gap-y-3 text-sm">
              {serviceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-orange-500"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4 – Support */}
          <div>
            <h4 className="mb-3 text-base font-semibold text-white">
              Support
            </h4>

            <ul className="space-y-3 text-sm">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition hover:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="mt-10 border-t border-gray-700 bg-[#0B1F3A] px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
          {/* Social */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <span className="font-medium text-gray-400">Follow Us:</span>

            <div className="flex items-center gap-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="transition hover:text-orange-500"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Payment */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-center text-xs text-gray-400 sm:gap-4 sm:text-sm">
            <span className="font-medium text-white">Payment:</span>

            <span>UPI</span>
            <span>Razorpay</span>
            <span>Net Banking</span>
            <span>Visa</span>
            <span>Mastercard</span>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs leading-6 text-gray-500 sm:text-sm">
            © 2026 Treeyambak Pvt Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}