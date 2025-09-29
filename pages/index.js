import { useState } from "react"
import Head from "next/head"

export default function VibeAnalysisPage() {
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      setError("Please enter an image URL")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleAnalyze()
    }
  }

  return (
    <>
      <Head>
        <title>VibeMatch - Discover Music Through Visual Vibes</title>
        <meta name="description" content="Analyze images and discover songs that match their emotional essence" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">VibeMatch</h1>
                <p className="text-sm text-gray-300">Discover music through visual vibes</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Input Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl">
              <div className="text-center p-8 pb-6">
                <h2 className="text-3xl font-bold text-white mb-4">Analyze Your Image Vibe</h2>
                <p className="text-gray-300 text-lg">
                  Paste an image URL and discover songs that match its emotional essence
                </p>
              </div>
              <div className="p-8 pt-0 space-y-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      type="url"
                      placeholder="https://example.com/your-image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !imageUrl.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? "Analyzing..." : "Analyze"}
                  </button>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-md w-full h-64 object-cover rounded-xl border border-white/20"
                      onError={() => setError("Failed to load image")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-6">
                {/* Analysis */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Vibe Analysis</h3>
                  <p className="text-gray-300 leading-relaxed">{result.analysis}</p>
                </div>

                {/* Songs */}
                {result.matches && result.matches.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Matching Songs ({result.matches.length})</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.matches.map((song, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white">{song.title}</h4>
                              <p className="text-gray-400 text-sm">{song.artist}</p>
                              {song.matchingTags && song.matchingTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {song.matchingTags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-sm font-medium shrink-0">
                              {song.matchScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.matches && result.matches.length === 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6">
                    <p className="text-gray-400 text-center">No matching songs found. Try a different image!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
