"use client";

import { useState } from "react";
import Link from "next/link";
import type { BoardroomReport } from "@/lib/types";
import { reportFilename, reportToMarkdown } from "@/lib/markdown";

export function ReportToolbar({ report }: { report: BoardroomReport }) {
  const [copied, setCopied] = useState(false);

  const markdown = () => reportToMarkdown(report);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const blob = new Blob([markdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportFilename(report);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button onClick={copy} className="btn btn-ghost text-sm" type="button">
        {copied ? "✓ Copied" : "📋 Copy report"}
      </button>
      <button onClick={download} className="btn btn-ghost text-sm" type="button">
        ⬇ Download .md
      </button>
      <button onClick={() => window.print()} className="btn btn-ghost text-sm" type="button">
        🖨 Print / PDF
      </button>
      <Link href="/idea" className="btn btn-primary text-sm">
        New session
      </Link>
    </div>
  );
}
