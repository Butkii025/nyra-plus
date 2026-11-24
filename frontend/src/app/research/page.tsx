
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Search, Brain, Sparkles, ArrowRight, Clock, Globe, TrendingUp,
  FileText, Lightbulb, ChevronDown, Loader2, AlertCircle,
  ExternalLink, KeyRound, BarChart3, CheckCircle2, ShieldCheck,
} from "lucide-react";

const suggestions = [
  "Why are AI agents trending right now?",
  "Emerging technologies in healthcare",
  "Future of AI coding tools",
  "Social media trends among Gen Z",
];

interface ResearchSource {
  id?: string;
  title: string;
  url: string;
  snippet?: string;
  source_name?: string;
}

interface EvidenceClaim {
  claim: string;
  source_ids: string[];
  evidence_type: "reported_fact" | "inference" | "trend" | string;

  verification?: {
    verification_status:
      | "supported"
      | "partially_supported"
      | "unverified"
      | "not_checked";

    evidence_excerpt: string;
    verification_confidence: number | null;
  };
}

interface CitationValidation {
  available_source_ids?: string[];
  invalid_citations_removed?: number;
  unsupported_claims_discarded?: number;
}

interface ResearchAnalysis {
  total_sources?: number;
  total_words?: number;
  total_characters?: number;
  successful_extractions?: number;
  failed_extractions?: number;
  analysis_status?: string;
  top_keywords?: { keyword: string; frequency: number }[];
}

interface ResearchSynthesis {
  status: string;
  summary?: string;
  key_findings?: EvidenceClaim[];
  patterns?: EvidenceClaim[];
  contradictions?: EvidenceClaim[];
  opportunities?: EvidenceClaim[];
  citation_validation?: CitationValidation;
  error?: string | null;
}

interface ResearchResult {
  status: string;
  query: string;
  research_mode: string;
  summary?: string;
  findings?: string[];
  sources?: ResearchSource[];
  analysis?: ResearchAnalysis;
  synthesis?: ResearchSynthesis;
  error?: string | null;
}

export default function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [researchMode, setResearchMode] = useState("balanced");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash-lite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);

  async function handleResearch() {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: topic.trim(),
          research_mode: researchMode,
          max_sources:
            researchMode === "quick" ? 3 : researchMode === "deep" ? 10 : 5,
          ai_api_key: apiKey.trim() || null,
          ai_model: model,
          ai_base_url: "https://generativelanguage.googleapis.com/v1beta",
        }),
      });

      const responseText = await response.text();

      let data: ResearchResult & {
        message?: string;
        details?: string;
        response_preview?: string;
        backend_status?: number;
      };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `API returned HTML or invalid JSON. HTTP Status: ${response.status}. Preview: ${responseText.slice(0, 300)}`
        );
      }

      if (!response.ok || data.status === "error") {
        throw new Error(
          [
            data.error,
            data.message,
            data.details,
            data.response_preview
              ? `Backend response: ${data.response_preview}`
              : "",
          ]
            .filter(Boolean)
            .join("\n") || "Research request failed."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while conducting research."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(suggestion: string) {
    setTopic(suggestion);
    setError("");
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-5 md:p-8">
          <header className="mb-10">
            <p className="mb-2 text-sm font-medium tracking-widest text-crimson">
              NYRA INTELLIGENCE
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              AI Research Engine
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Go beyond the trends. Ask questions, investigate emerging signals,
              and uncover insights that matter.
            </p>
          </header>

          <section className="relative mb-8 overflow-hidden rounded-3xl border border-gray-500/15 bg-white/5 p-6 md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-crimson/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-crimson/10 p-3 text-crimson">
                  <Brain size={24} />
                </div>
                <div>
                  <h2 className="font-semibold">Start a new investigation</h2>
                  <p className="text-xs text-gray-500">
                    Powered by data-driven intelligence
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-500/20 bg-background p-4 transition focus-within:border-crimson/60">
                <textarea
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setResult(null);
                    setError("");
                  }}
                  placeholder="What do you want NYRA to investigate? Ask a question, explore a topic, or discover an emerging trend..."
                  rows={4}
                  className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-gray-500"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-500/10 pt-4">
                  <div className="relative flex items-center gap-2 rounded-xl border border-gray-500/15 px-3 py-2">
                    <Globe size={16} className="text-gray-500" />
                    <select
                      value={researchMode}
                      onChange={(e) => setResearchMode(e.target.value)}
                      disabled={loading}
                      className="appearance-none bg-transparent pr-5 text-xs outline-none"
                    >
                      <option value="quick">Quick Research</option>
                      <option value="balanced">Balanced Research</option>
                      <option value="deep">Deep Research</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2 text-gray-500"
                    />
                  </div>

                  <button
                    onClick={handleResearch}
                    disabled={!topic.trim() || loading}
                    className="flex items-center gap-2 rounded-xl bg-crimson px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Start Research
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Configuration */}
              <div className="mt-4 rounded-2xl border border-gray-500/15 bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <KeyRound size={16} className="text-crimson" />
                  <h3 className="text-sm font-medium">AI Configuration · BYOK</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      autoComplete="off"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-500/15 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-crimson/50"
                    />
                    <p className="mt-1 text-[10px] text-gray-500">
                      Used for this session&apos;s requests. Not saved to your database.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">
                      Gemini Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-500/15 bg-background px-3 py-2.5 text-sm outline-none focus:border-crimson/50"
                    >
                      <option value="gemini-3.5-flash-lite">
                        Gemini 3.5 Flash-Lite
                      </option>
                    </select>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Budget-friendly AI synthesis
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="mt-5 rounded-2xl border border-crimson/20 bg-crimson/5 p-5">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-crimson" size={20} />
                    <div>
                      <p className="text-sm font-medium">
                        NYRA is investigating your topic
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Searching sources, extracting content, analyzing evidence,
                        and generating intelligence. This may take a little while.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-5 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <AlertCircle size={20} className="shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-500">
                      Research failed
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-500">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Results */}
          {result && <ResearchResults result={result} />}

          {/* Suggestions */}
          {!result && !loading && (
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-crimson" />
                <h2 className="font-semibold">Suggested investigations</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-gray-500/15 bg-white/5 p-4 text-left transition hover:border-crimson/40 hover:bg-crimson/5"
                  >
                    <span className="text-sm leading-6">{suggestion}</span>
                    <ArrowRight
                      size={16}
                      className="mt-1 shrink-0 text-gray-500 transition group-hover:translate-x-1 group-hover:text-crimson"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Capabilities */}
          {!result && !loading && (
            <section className="mb-10">
              <div className="mb-4">
                <h2 className="font-semibold">Research capabilities</h2>
                <p className="mt-1 text-sm text-gray-500">
                  What NYRA is designed to investigate
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <CapabilityCard
                  icon={<TrendingUp size={20} />}
                  title="Trend Detection"
                  description="Identify rising topics, emerging patterns, and momentum."
                />
                <CapabilityCard
                  icon={<Search size={20} />}
                  title="Topic Exploration"
                  description="Investigate a subject and uncover connected themes."
                />
                <CapabilityCard
                  icon={<Lightbulb size={20} />}
                  title="Opportunity Discovery"
                  description="Explore content, business, and innovation opportunities."
                />
                <CapabilityCard
                  icon={<FileText size={20} />}
                  title="Research Reports"
                  description="Organize findings into structured, readable reports."
                />
              </div>
            </section>
          )}

          {/* Research Modes */}
          {!result && !loading && (
            <section className="mb-8 rounded-2xl border border-gray-500/15 bg-white/5 p-5">
              <div className="mb-5 flex items-center gap-2">
                <Clock size={18} className="text-crimson" />
                <h2 className="font-semibold">Research modes</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ModeCard
                  title="Quick"
                  duration="Fast investigation"
                  description="Focused exploration with a concise summary and key insights."
                />
                <ModeCard
                  title="Balanced"
                  duration="Standard investigation"
                  description="Multiple signals, structured analysis, and actionable findings."
                  featured
                />
                <ModeCard
                  title="Deep"
                  duration="Comprehensive investigation"
                  description="Broader exploration, deeper reasoning, and a detailed research report."
                />
              </div>
            </section>
          )}

          <footer className="border-t border-gray-500/10 py-5">
            <p className="text-center text-xs text-gray-500">
              NYRA PLUS · Research Intelligence Workspace
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Research Results ---------------- */

function ResearchResults({ result }: { result: ResearchResult }) {
  const synthesis = result.synthesis;
  const analysis = result.analysis;
  const aiReady = synthesis?.status === "success";
  const sources = result.sources ?? [];

  const sourceMap = new Map<string, ResearchSource>(
    sources
      .filter(
        (source): source is ResearchSource & { id: string } =>
          Boolean(source.id)
      )
      .map((source) => [source.id, source] as const)
  );

  return (
    <section className="mb-10 space-y-6">
      {/* Report Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-crimson">
            RESEARCH REPORT
          </p>
          <h2 className="mt-1 text-2xl font-bold">Research Intelligence</h2>
          <p className="mt-2 text-sm text-gray-500">{result.query}</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-gray-500/15 px-3 py-1.5 text-xs">
          {aiReady ? (
            <CheckCircle2 size={14} className="text-green-500" />
          ) : (
            <AlertCircle size={14} className="text-amber-500" />
          )}
          {aiReady ? "AI synthesis complete" : "Research collected"}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={<Globe size={18} />}
          label="Sources found"
          value={analysis?.total_sources ?? sources.length}
        />
        <MetricCard
          icon={<FileText size={18} />}
          label="Words analyzed"
          value={(analysis?.total_words ?? 0).toLocaleString()}
        />
        <MetricCard
          icon={<CheckCircle2 size={18} />}
          label="Pages extracted"
          value={analysis?.successful_extractions ?? 0}
        />
        <MetricCard
          icon={<BarChart3 size={18} />}
          label="Keywords detected"
          value={analysis?.top_keywords?.length ?? 0}
        />
      </div>

      {/* Executive Summary */}
      <ResultSection title="Executive Summary" icon={<Brain size={18} />}>
        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">
          {synthesis?.summary || result.summary || "No summary was generated."}
        </p>
        {!aiReady && synthesis?.error && (
          <p className="mt-3 text-xs text-amber-500">
            AI synthesis: {synthesis.error}
          </p>
        )}
      </ResultSection>

      {/* Citation Validation Report */}
      {aiReady && synthesis?.citation_validation && (
        <ResultSection
          title="Citation Validation"
          icon={<ShieldCheck size={18} />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ValidationMetric
              label="Available source IDs"
              value={synthesis.citation_validation.available_source_ids?.length ?? 0}
            />
            <ValidationMetric
              label="Invalid citations removed"
              value={synthesis.citation_validation.invalid_citations_removed ?? 0}
            />
            <ValidationMetric
              label="Unsupported claims discarded"
              value={synthesis.citation_validation.unsupported_claims_discarded ?? 0}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            This check verifies citation IDs against collected sources. It does not
            independently prove that a source fully supports a claim.
          </p>
        </ResultSection>
      )}

      {/* Key Findings */}
      <ResultSection title="Key Findings" icon={<Sparkles size={18} />}>
        <ClaimList items={synthesis?.key_findings} sourceMap={sourceMap} />
      </ResultSection>

      {/* Patterns */}
      <ResultSection title="Emerging Patterns" icon={<TrendingUp size={18} />}>
        <ClaimList items={synthesis?.patterns} sourceMap={sourceMap} />
      </ResultSection>

      {/* Contradictions */}
      <ResultSection
        title="Contradictions & Conflicts"
        icon={<AlertCircle size={18} />}
      >
        <ClaimList
          items={synthesis?.contradictions}
          sourceMap={sourceMap}
          emptyText="No explicit contradictions were identified in this research."
        />
      </ResultSection>

      {/* Opportunities */}
      <ResultSection title="Opportunities" icon={<Lightbulb size={18} />}>
        <ClaimList items={synthesis?.opportunities} sourceMap={sourceMap} />
      </ResultSection>

      {/* Keywords */}
      {analysis?.top_keywords && analysis.top_keywords.length > 0 && (
        <ResultSection title="Research Keywords" icon={<BarChart3 size={18} />}>
          <div className="flex flex-wrap gap-2">
            {analysis.top_keywords.map((item) => (
              <span
                key={item.keyword}
                className="rounded-lg border border-gray-500/15 bg-white/5 px-3 py-1.5 text-xs"
              >
                {item.keyword}
                <span className="ml-2 text-crimson">{item.frequency}</span>
              </span>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Sources */}
      <ResultSection title="Sources & References" icon={<Globe size={18} />}>
        <div className="space-y-3">
          {sources.map((source, index) => (
            <a
              key={`${source.id ?? source.url}-${index}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-gray-500/15 bg-white/5 p-4 transition hover:border-crimson/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    {source.id && (
                      <span className="rounded-md border border-crimson/25 bg-crimson/10 px-1.5 py-0.5 text-[10px] font-semibold text-crimson">
                        {source.id}
                      </span>
                    )}
                    <p className="text-sm font-medium leading-5 group-hover:text-crimson">
                      {source.title}
                    </p>
                  </div>
                  <p className="mt-1 break-all text-xs text-gray-500">
                    {source.source_name || source.url}
                  </p>
                </div>
                <ExternalLink
                  size={15}
                  className="shrink-0 text-gray-500 group-hover:text-crimson"
                />
              </div>
              {source.snippet && (
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {source.snippet}
                </p>
              )}
            </a>
          ))}
          {sources.length === 0 && (
            <p className="text-sm text-gray-500">No sources returned.</p>
          )}
        </div>
      </ResultSection>

      {/* Metadata */}
      <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-4">
        <p className="text-xs text-gray-500">
          Research mode: <span className="capitalize">{result.research_mode}</span>
          {" · "}
          Pipeline status: {result.status}
          {" · "}
          AI: {synthesis?.status ?? "not available"}
        </p>
      </div>
    </section>
  );
}

/* ---------------- Citation Claim UI ---------------- */


/* ---------------- Citation Claim UI ---------------- */

function ClaimList({
  items,
  sourceMap,
  emptyText = "No information was returned for this section.",
}: {
  items?: EvidenceClaim[];
  sourceMap: Map<string, ResearchSource>;
  emptyText?: string;
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const verification = item.verification;
        const status = verification?.verification_status;

        const verificationStyles = {
          supported:
            "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
          partially_supported:
            "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
          unverified:
            "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
          not_checked:
            "border-gray-500/20 bg-gray-500/10 text-gray-500",
        };

        const verificationLabels = {
          supported: "Supported",
          partially_supported: "Partially Supported",
          unverified: "Unverified",
          not_checked: "Not Checked",
        };

        const badgeStyle =
          verificationStyles[status as keyof typeof verificationStyles] ??
          verificationStyles.not_checked;

        const badgeLabel =
          verificationLabels[status as keyof typeof verificationLabels] ??
          "Not Checked";

        return (
          <article
            key={`${item.claim}-${index}`}
            className="rounded-xl border border-gray-500/10 bg-background/40 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {item.claim}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <EvidenceBadge type={item.evidence_type} />

                  {/* Evidence Verification Badge */}
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${badgeStyle}`}
                  >
                    {badgeLabel}
                  </span>

                  {/* Verification Confidence */}
                  {verification?.verification_confidence != null && (
                    <span className="rounded-md border border-gray-500/20 px-2 py-1 text-[10px] text-gray-500">
                      Match:{" "}
                      {Math.round(
                        verification.verification_confidence * 100
                      )}%
                    </span>
                  )}

                  {/* Source Citation Links */}
                  {item.source_ids?.map((sourceId) => {
                    const source = sourceMap.get(sourceId);

                    if (!source) {
                      return (
                        <span
                          key={sourceId}
                          className="rounded-md border border-gray-500/20 px-2 py-1 text-[10px] text-gray-400"
                          title="Source ID was not found in returned source records"
                        >
                          {sourceId} · unavailable
                        </span>
                      );
                    }

                    return (
                      <a
                        key={sourceId}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={source.title}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/5 px-2 py-1 text-[10px] font-medium text-blue-500 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                      >
                        {sourceId}
                        <ExternalLink size={10} />
                      </a>
                    );
                  })}
                </div>

                {/* Evidence Excerpt */}
                {verification?.evidence_excerpt && (
                  <details className="mt-3 rounded-lg border border-gray-500/10 bg-gray-500/5 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-gray-500 transition hover:text-crimson">
                      View verification evidence
                    </summary>

                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {verification.evidence_excerpt}
                    </p>
                  </details>
                )}

                {/* Source Details */}
                {item.source_ids?.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-gray-500/10 pt-3">
                    {item.source_ids.map((sourceId) => {
                      const source = sourceMap.get(sourceId);
                      if (!source) return null;

                      return (
                        <a
                          key={`detail-${sourceId}`}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 text-xs text-gray-500 transition hover:text-crimson"
                        >
                          <ExternalLink
                            size={13}
                            className="mt-0.5 shrink-0"
                          />
                          <span className="line-clamp-2">
                            {sourceId}: {source.title}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}


function EvidenceBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    reported_fact: "border-green-500/20 bg-green-500/5 text-green-500",
    inference: "border-amber-500/20 bg-amber-500/5 text-amber-500",
    trend: "border-blue-500/20 bg-blue-500/5 text-blue-500",
  };

  const labels: Record<string, string> = {
    reported_fact: "Reported fact",
    inference: "Inference",
    trend: "Trend",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[10px] font-medium ${
        styles[type] ?? "border-gray-500/20 bg-gray-500/5 text-gray-500"
      }`}
    >
      {labels[type] ?? type}
    </span>
  );
}

function ValidationMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-500/10 bg-background/50 p-3">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-4">
      <div className="mb-3 text-crimson">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-crimson">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-5 transition hover:border-crimson/30">
      <div className="mb-4 inline-flex rounded-xl bg-navy p-3 text-moonlight">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function ModeCard({
  title,
  duration,
  description,
  featured = false,
}: {
  title: string;
  duration: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        featured
          ? "border-crimson/40 bg-crimson/5"
          : "border-gray-500/15 bg-white/5"
      }`}
    >
      {featured && (
        <span className="mb-3 inline-block rounded-full bg-crimson px-2.5 py-1 text-[10px] font-medium text-white">
          RECOMMENDED
        </span>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{duration}</p>
      <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}
