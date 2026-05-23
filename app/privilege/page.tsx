"use client";

import {
  Crown,
  Sparkles,
  ShieldCheck,
  Wallet,
  Plane,
  Hotel,
  ArrowRight,
  Check,
} from "lucide-react";

const MEMBERSHIP_PLANS = [
  {
    id: "silver",
    title: "Silver",
    color:
      "from-gray-200 via-gray-100 to-white",
    savings: "Up to ₹5,000/year",

    benefits: [
      "Early access offers",
      "Wallet boost support",
      "Priority offer visibility",
      "Basic support priority",
    ],
  },

  {
    id: "gold",
    title: "Gold",
    color:
      "from-yellow-300 via-amber-200 to-white",
    savings: "Up to ₹25,000/year",

    benefits: [
      "Premium flight deals",
      "Higher wallet usage",
      "Priority booking support",
      "Hidden hotel discounts",
      "Festival special offers",
    ],
  },

  {
    id: "platinum",
    title: "Platinum",
    color:
      "from-orange-500 via-amber-400 to-yellow-300",
    savings: "Up to ₹75,000/year",

    benefits: [
      "VIP pricing engine",
      "AI smart savings priority",
      "Luxury hotel privileges",
      "Dedicated support",
      "Hidden OTA deals",
      "Highest wallet boost",
    ],
  },

  {
    id: "signature",
    title: "Signature",
    color:
      "from-black via-zinc-800 to-zinc-700",
    savings: "Unlimited premium benefits",

    benefits: [
      "Invitation-only benefits",
      "Premium concierge",
      "Exclusive inventory access",
      "High-value package offers",
      "Priority AI recommendations",
      "Highest cashback multiplier",
    ],
  },
];

const BENEFITS = [
  {
    icon: Plane,
    title: "Flight Benefits",
    desc: "Priority deals, hidden fares and AI-powered savings.",
  },

  {
    icon: Hotel,
    title: "Hotel Privileges",
    desc: "Luxury upgrades, member-only discounts and premium inventory.",
  },

  {
    icon: Wallet,
    title: "Wallet Boost",
    desc: "Higher TPL Credit usage and better cashback rewards.",
  },

  {
    icon: ShieldCheck,
    title: "Priority Support",
    desc: "Dedicated assistance for booking and travel support.",
  },
];

export default function PrivilegePage() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-orange-900 px-5 py-16 text-white md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,165,0,0.25),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-4 w-4" />
            TPL Privilege
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Unlock Premium Travel
            Benefits
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 md:text-lg">
            Smart AI deals, hidden
            discounts, wallet boosts,
            luxury privileges and
            advanced OTA-level member
            benefits across flights,
            hotels and holiday packages.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 text-sm font-black text-white shadow-2xl shadow-orange-500/30 transition hover:bg-orange-600">
              Upgrade Membership
              <ArrowRight className="h-4 w-4" />
            </button>

            <button className="flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">
              View Benefits
            </button>
          </div>
        </div>
      </section>

      {/* Membership Cards */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-orange-500" />

          <h2 className="text-3xl font-black text-gray-900">
            Membership Plans
          </h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {MEMBERSHIP_PLANS.map(
            (plan) => (
              <div
                key={plan.id}
                className="group relative overflow-hidden rounded-[32px] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className={`h-44 bg-gradient-to-br ${plan.color} p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur">
                      <Crown className="h-6 w-6 text-white" />
                    </div>

                    <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-white backdrop-blur">
                      {plan.title}
                    </div>
                  </div>

                  <div className="mt-10 text-2xl font-black text-white">
                    {plan.savings}
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {plan.benefits.map(
                    (benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5 rounded-full bg-orange-100 p-1">
                          <Check className="h-3.5 w-3.5 text-orange-600" />
                        </div>

                        <div className="text-sm leading-6 text-gray-700">
                          {benefit}
                        </div>
                      </div>
                    )
                  )}

                  <button className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-orange-500 text-sm font-black text-white transition hover:bg-orange-600">
                    Unlock Now
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-5 pb-14 md:px-10">
        <div className="rounded-[40px] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-orange-500" />

            <h2 className="text-3xl font-black text-gray-900">
              Premium Benefits
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {BENEFITS.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[30px] border border-orange-100 bg-orange-50 p-6"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="mt-5 text-xl font-black text-gray-900">
                      {item.title}
                    </div>

                    <div className="mt-3 text-sm leading-7 text-gray-600">
                      {item.desc}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-10">
        <div className="overflow-hidden rounded-[40px] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-10 text-white shadow-2xl shadow-orange-200">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur">
                <Sparkles className="h-4 w-4" />
                AI Travel Engine
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight">
                Let AI Find Your Best
                Savings Automatically
              </h2>

              <p className="mt-5 text-base leading-8 text-white/90">
                AI automatically combines
                membership benefits,
                wallet savings, hidden
                deals and smart offers to
                maximize your travel
                savings.
              </p>
            </div>

            <button className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-sm font-black text-orange-600 shadow-2xl transition hover:scale-[1.02]">
              Explore Smart Deals
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}