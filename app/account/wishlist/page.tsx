export default function WishlistPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-bold text-black">Wishlist</h2>
      <p className="text-gray-600 mt-2">
        Save your favourite packages, hotels and stays here.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
        Your wishlist is empty right now.
      </div>
    </div>
  );
}