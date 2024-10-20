import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl text-gray-600 mb-8">
        お探しのページは見つかりませんでした
      </h2>
      <Link
        href="/"
        className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
