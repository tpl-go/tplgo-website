type UnavailableAccountModuleProps = {
  title: string;
  description: string;
};

export default function UnavailableAccountModule({
  title,
  description,
}: UnavailableAccountModuleProps) {
  return (
    <section
      aria-labelledby="account-module-title"
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 id="account-module-title" className="text-2xl font-bold text-slate-950">
        {title}
      </h2>
      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900">Coming soon</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </section>
  );
}
