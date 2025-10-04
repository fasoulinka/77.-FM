// pages/index.js
"use client";
import { useState } from "react";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [matches, setMatches] = useState([]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setLoading(true); setAnalysis(""); setMatches([]);
    try {
      const r = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Request failed");
      setAnalysis(json.analysis);
      setMatches(json.matches || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Image → Vibe → Music</h1>
        <p className="opacity-80 mb-6">Paste an image URL. We’ll match songs from the dataset.</p>

        <form onSubmit={onSubmit} className="bg-gray-100 rounded-2xl p-4 space-y-3 text-black">
          <input
            className="w-full rounded-xl px-3 py-2 border"
            placeholder="https://example.com/photo.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button disabled={!imageUrl || loading} className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-50">
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </form>

        {analysis && (
          <section className="mt-8 text-white">
            <h2 className="text-2xl font-semibold mb-2">Vibe analysis</h2>
            <p className="bg-white/10 rounded-xl p-4">{analysis}</p>
          </section>
        )}

        {!!matches.length && (
          <section className="mt-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">Top matches</h2>
            <ul className="space-y-3">
              {matches.map((m) => (
                <li key={`${m.id}-${m.title}`} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{m.title}</div>
                      <div className="opacity-80">{m.artist}</div>
                    </div>
                    {"matchScore" in m && <div className="text-sm opacity-80">Score: {m.matchScore}</div>}
                  </div>
                  {m.tags?.length ? (
                    <div className="mt-2 text-sm opacity-90">
                      {m.tags.slice(0, 12).map((t) => <span key={t} className="mr-2">#{t}</span>)}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
