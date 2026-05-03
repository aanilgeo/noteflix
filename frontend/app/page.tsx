"use client";

import { useState } from "react";

type NoteResult = {
  extracted_text: string;
  summary: string[];
  key_concepts: string[];
  related_topics: string[];
  youtube_queries: string[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<NoteResult | null>(null);
  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanJsonText = (text: string) => {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
  };

  const resetApp = () => {
    setFile(null);
    setResult(null);
    setRawResult("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setRawResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const cleaned = cleanJsonText(data.result);
      setRawResult(cleaned);

      try {
        setResult(JSON.parse(cleaned));
      } catch {
        setError("AI response received, but it could not be formatted cleanly.");
      }
    } catch {
      setError("Could not connect to backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-8 py-10 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dc2626_0%,transparent_28%),radial-gradient(circle_at_top_right,#7f1d1d_0%,transparent_25%)] opacity-40" />

        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tight text-red-600 md:text-8xl">
            NoteFlix
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-zinc-300 md:text-2xl">
            Turn lecture note photos into summaries, concepts, and personalized
            study recommendations.
          </p>

          <div className="mt-10 max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <label className="flex-1 cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-6 text-zinc-300 transition hover:border-red-500 hover:bg-zinc-800">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <span className="block text-sm uppercase tracking-wide text-zinc-500">
                  Upload notes image
                </span>

                <span className="mt-2 block text-xl font-semibold">
                  {file ? file.name : "Choose a photo of your notes"}
                </span>
              </label>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="rounded-2xl bg-red-600 px-8 py-5 text-xl font-bold transition hover:scale-105 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing your notes..." : "Analyze Notes"}
              </button>
            </div>

            {file && (
              <div className="mt-6 flex justify-center">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Uploaded notes preview"
                  className="max-h-64 rounded-xl border border-zinc-700 shadow-lg"
                />
              </div>
            )}

            {loading && (
              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-zinc-900 p-5">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-red-600" />
                <div>
                  <p className="font-semibold">Reading your notes...</p>
                  <p className="text-sm text-zinc-400">
                    Extracting text, summarizing concepts, and building your
                    study feed.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/50 p-5 text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {result && (
        <section className="px-8 pb-16 md:px-16">
          <h2 className="mb-5 text-3xl font-bold">Your Study Feed</h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card title="📌 Summary" accent="bg-red-600">
              <ul className="space-y-3">
                {result.summary.map((item, index) => (
                  <li key={index} className="text-zinc-300">
                    • {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="🧠 Key Concepts" accent="bg-purple-600">
              <div className="flex flex-wrap gap-3">
                {result.key_concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-200"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </Card>

            <Card title="🚀 Explore Next" accent="bg-blue-600">
              <ul className="space-y-3">
                {result.related_topics.map((topic, index) => (
                  <li key={index} className="rounded-xl bg-zinc-800 p-3">
                    {topic}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="🎥 YouTube Searches" accent="bg-red-700">
              <div className="space-y-3">
                {result.youtube_queries.map((query, index) => (
                  <a
                    key={index}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      query
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl bg-zinc-800 p-3 text-zinc-200 transition hover:bg-red-600"
                  >
                    ▶ {query}
                  </a>
                ))}
              </div>
            </Card>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-500" />
                <h3 className="text-2xl font-bold">📝 Extracted Text</h3>
              </div>

              <p className="max-h-80 overflow-auto whitespace-pre-wrap text-zinc-300">
                {result.extracted_text}
              </p>
            </div>
          </div>

          <button
            onClick={resetApp}
            className="mt-8 rounded-xl bg-zinc-800 px-6 py-3 text-lg font-semibold transition hover:bg-zinc-700"
          >
            Upload New Notes
          </button>
        </section>
      )}

      {!result && rawResult && (
        <section className="px-8 pb-16 md:px-16">
          <pre className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 whitespace-pre-wrap text-zinc-300">
            {rawResult}
          </pre>
        </section>
      )}
    </main>
  );
}

function Card({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl transition hover:-translate-y-1 hover:border-zinc-600">
      <div className="mb-5 flex items-center gap-3">
        <span className={`h-4 w-4 rounded-full ${accent}`} />
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}