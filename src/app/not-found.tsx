import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
      <div className="text-6xl">🛰️</div>
      <h1 className="mt-4 text-3xl font-bold text-white">Lost in space</h1>
      <p className="mt-2 text-sm text-white/55">
        This page drifted out of orbit. Let&rsquo;s get you back to the boardroom.
      </p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
