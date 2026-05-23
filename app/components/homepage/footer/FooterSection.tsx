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
    <footer className="bg-gray-800 text-gray-300 pt-5  rounded-t-3xl mt-1">
      {/* Top Grid */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-10">
          {/* Column 1 – Brand */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">TPL</h3>
            <p className="text-sm mb-6">
              Seamless travel bookings, curated experiences, and 24/7 expert
              support across India and international destinations.
            </p>
          </div>

          {/* Column 2 – Company */}
          <div>
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-orange-500 cursor-pointer"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Services (Grid) */}
          <div>
            <h4 className="text-white font-semibold mb-2">Services</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              {serviceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-orange-500 cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4 – Support */}
          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-orange-500 cursor-pointer"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Unified Bottom Strip */}
      <div className="mt-12 bg-[#0B1F3A] border-t border-gray-800 px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          {/* Social */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Follow Us:</span>
            <div className="flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="hover:text-orange-500 cursor-pointer"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Payment */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <span className="text-white font-medium">Payment:</span>
            <span>UPI</span>
            <span>Razorpay</span>
            <span>Net Banking</span>
            <span>Visa</span>
            <span>Mastercard</span>
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-center">
            © 2026 Treeyambak Pvt Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}