import {
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function WebCheckInSideCards() {
  return (
    <aside className="space-y-5">
      <div className="rounded-[30px] bg-[#0B1F3A] p-6 text-white shadow-sm">
        <h3 className="text-2xl font-extrabold">
          Need help with check-in?
        </h3>

        <p className="mt-3 text-sm leading-7 text-white/75">
          TPL travel experts can assist with PNR, airline rules, seat
          selection guidance and boarding pass support.
        </p>

        <a
          href="https://wa.me/919649400299"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition"
        >
          Talk to Expert <ArrowRight size={16} />
        </a>
      </div>

      <div className="rounded-[30px] border border-orange-200 bg-orange-50 p-6">
        <div className="flex gap-3">
          <AlertTriangle
            className="mt-1 text-orange-700"
            size={20}
          />

          <div>
            <h3 className="font-extrabold text-orange-800">
              Important note
            </h3>

            <p className="mt-2 text-sm leading-7 text-orange-700">
              Final web check-in, seat allocation and boarding pass are
              controlled by the airline. TPL assists with the check-in
              journey and booking guidance.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}