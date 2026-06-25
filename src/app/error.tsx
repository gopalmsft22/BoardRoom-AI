"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
      <div className="text-6xl">⚡</div>
      <h1 className="mt-4 text-2xl font-bold text-white">The board hit a snag</h1>
      <p className="mt-2 text-sm text-white/55">
        Something unexpected happened. You can retry, or start a fresh session.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="btn btn-ghost">
          Try again
        </button>
        <Link href="/idea" className="btn btn-primary">
          New session
        </Link>
      </div>
    </div>
  );
}
