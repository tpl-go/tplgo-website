"use client";

export default function CabBookingLoginSection() {
  function openLogin() {
    // 👉 YAHAN TUMHARA EXISTING LOGIN MODAL CALL KARNA HAI
    // example:
    // openAuthModal()
    alert("Open Login Modal");
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[15px] font-bold text-slate-900">
          Login for faster booking
        </div>
        <div className="text-[13px] text-slate-500">
          Use saved traveller details & get exclusive offers
        </div>
      </div>

      <button
        onClick={openLogin}
        className="rounded-xl bg-sky-500 px-4 py-2 text-[13px] font-bold text-white"
      >
        LOGIN
      </button>
    </div>
  );
}