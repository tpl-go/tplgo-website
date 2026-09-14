export default function WishlistPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-bold text-black">Wishlist</h2>
      <p className="text-gray-600 mt-2">
        Saved travel items will appear here when Wishlist is available.
      </p>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900">Coming soon</h3>
        <p className="mt-2 text-sm text-slate-600">
          Wishlist saving is being prepared. Your account does not have a saved-item list yet.
        </p>
      </div>
    </div>
  );
}
