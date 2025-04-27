// pages/index.tsx

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CardContent } from '../components/ui/CardContent'

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
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-4xl font-bold mb-6">🎬 Movie Search</h1>

      <div className="flex gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a movie title…"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>

      {loading && (
        <p className="text-gray-600">🔄 Loading results…</p>
      )}

      {!loading && results.length === 0 && (
        <p className="text-gray-600">
          {query
            ? `No results found for “${query}.”`
            : 'Enter a title and hit Search to begin.'}
        </p>
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
              <CardContent className="p-3">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(movie.release_date).getFullYear()}
                </p>
              </CardContent>
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}
