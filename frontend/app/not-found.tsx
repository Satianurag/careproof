import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-lg text-neutral-400 mb-8">Page not found</p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
