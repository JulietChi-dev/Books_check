import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#182230] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="font-display font-bold text-emerald-400 text-lg">404</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#182230] mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          The page or resource you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 text-white text-sm font-semibold rounded-xl shadow-xs transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
