"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Clipboard,
  Download,
  FileText,
  Loader2,
  Search,
  Sparkles
} from "lucide-react";
import { defaultApplicantProfile } from "@/lib/defaultApplicantProfile";

type AnalyzeResponse = {
  report?: string;
  error?: string;
  source?: {
    url: string;
    ok: boolean;
    status?: number;
    title?: string;
    error?: string;
  };
};

export default function Home() {
  const [advisorName, setAdvisorName] = useState("");
  const [advisorUrl, setAdvisorUrl] = useState("");
  const [applicantProfile, setApplicantProfile] = useState(defaultApplicantProfile);
  const [optionalNotes, setOptionalNotes] = useState("");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canAnalyze = useMemo(
    () => advisorName.trim().length > 0 && advisorUrl.trim().length > 0 && !loading,
    [advisorName, advisorUrl, loading]
  );

  async function analyzeSupervisor() {
    setLoading(true);
    setError("");
    setReport("");
    setCopied(false);
    setSourceNote("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorName,
          advisorUrl,
          applicantProfile,
          optionalNotes
        })
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setReport(data.report || "");
      if (data.source) {
        const status = data.source.status ? `HTTP ${data.source.status}` : "status unknown";
        const fetchState = data.source.ok ? "page fetched" : "page partially available";
        setSourceNote(`${fetchState}; ${status}${data.source.title ? `; ${data.source.title}` : ""}`);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while generating the report."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadMarkdown() {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeName = advisorName.trim().replace(/[^\w\u4e00-\u9fa5-]+/g, "_") || "supervisor";
    anchor.href = url;
    anchor.download = `${safeName}_fit_report.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="border-b border-line pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-1 text-sm text-steel shadow-sm">
                <Sparkles className="h-4 w-4 text-ochre" />
                Supervisor shortlist intelligence
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
                PhD Supervisor Fit Analyzer
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-steel">
                Analyze supervisor fit based on research topics, methods, publications,
                and PhD application strategy.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-steel">
              <FileText className="h-4 w-4" />
              Chinese Markdown report
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="h-fit rounded border border-line bg-white p-5 shadow-panel">
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <h2 className="text-lg font-semibold">Supervisor Inputs</h2>
              <Search className="h-5 w-5 text-moss" />
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Advisor Name</span>
                <input
                  value={advisorName}
                  onChange={(event) => setAdvisorName(event.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full rounded border border-line bg-paper px-3 py-2.5 outline-none transition focus:border-moss focus:bg-white focus:ring-2 focus:ring-moss/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Advisor Profile URL</span>
                <input
                  value={advisorUrl}
                  onChange={(event) => setAdvisorUrl(event.target.value)}
                  placeholder="https://university.edu/profile"
                  className="w-full rounded border border-line bg-paper px-3 py-2.5 outline-none transition focus:border-moss focus:bg-white focus:ring-2 focus:ring-moss/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">
                  Applicant Research Profile
                </span>
                <textarea
                  value={applicantProfile}
                  onChange={(event) => setApplicantProfile(event.target.value)}
                  rows={14}
                  className="w-full resize-y rounded border border-line bg-paper px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-moss focus:bg-white focus:ring-2 focus:ring-moss/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Optional Notes</span>
                <textarea
                  value={optionalNotes}
                  onChange={(event) => setOptionalNotes(event.target.value)}
                  rows={4}
                  placeholder="Add programme preferences, country constraints, funding notes, or anything the analysis should consider."
                  className="w-full resize-y rounded border border-line bg-paper px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-moss focus:bg-white focus:ring-2 focus:ring-moss/20"
                />
              </label>

              <button
                type="button"
                disabled={!canAnalyze}
                onClick={analyzeSupervisor}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-moss px-4 font-medium text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:bg-steel/40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Analyze Supervisor
              </button>
            </div>
          </div>

          <div className="min-h-[720px] rounded border border-line bg-white shadow-panel">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Markdown Report</h2>
                <p className="mt-1 text-sm text-steel">
                  {sourceNote || "Generated report will appear here after analysis."}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!report}
                  onClick={copyMarkdown}
                  className="inline-flex h-10 items-center gap-2 rounded border border-line bg-paper px-3 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Markdown"}
                </button>
                <button
                  type="button"
                  disabled={!report}
                  onClick={downloadMarkdown}
                  className="inline-flex h-10 items-center gap-2 rounded border border-line bg-paper px-3 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Download className="h-4 w-4" />
                  Download Markdown
                </button>
              </div>
            </div>

            <div className="p-5">
              {loading && (
                <div className="flex min-h-[560px] flex-col items-center justify-center gap-4 text-center text-steel">
                  <Loader2 className="h-8 w-8 animate-spin text-moss" />
                  <div>
                    <p className="font-medium text-ink">Analyzing supervisor profile</p>
                    <p className="mt-1 text-sm">
                      Fetching public profile text and generating an evidence-aware screening report.
                    </p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="rounded border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  {error}
                </div>
              )}

              {!loading && !error && !report && (
                <div className="flex min-h-[560px] items-center justify-center rounded border border-dashed border-line bg-paper p-8 text-center">
                  <div className="max-w-md">
                    <FileText className="mx-auto h-10 w-10 text-moss" />
                    <p className="mt-4 font-medium">Ready for supervisor screening</p>
                    <p className="mt-2 text-sm leading-6 text-steel">
                      Enter a name and profile URL to produce a Chinese Markdown report with
                      scoring, risks, and application strategy.
                    </p>
                  </div>
                </div>
              )}

              {!loading && report && (
                <article className="prose prose-slate max-w-none prose-headings:scroll-mt-4 prose-h1:text-2xl prose-h2:border-b prose-h2:border-line prose-h2:pb-2 prose-table:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
                </article>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
