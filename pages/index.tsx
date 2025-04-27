// pages/index.tsx

import { useState } from 'react'
import Link from 'next/link'

interface Movie {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/movies?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-4xl font-bold mb-6">🎬 Movie Search</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Type a movie title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length === 0 && !loading && (
        <p className="text-gray-600">Enter a title and hit Search to see results.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {results.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`} legacyBehavior>
            <a className="block bg-white rounded shadow hover:shadow-lg overflow-hidden">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  No Image
                </div>
              )}
              <div className="p-3">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(movie.release_date).getFullYear()}
                </p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}
