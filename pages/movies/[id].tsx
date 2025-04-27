// pages/movies/[id].tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Fix #1: import Card and CardContent separately
import { Card } from '../../components/ui/Card'
import { CardContent } from '../../components/ui/CardContent'
import { Button } from '../../components/ui/Button'

interface MovieDetail {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  genres: { id: number; name: string }[]
}

interface RdResult {
  title: string
  magnet: string
}

export default function MoviePage() {
  const { query } = useRouter()
  const id = typeof query.id === 'string' ? query.id : Array.isArray(query.id) ? query.id[0] : ''

  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loadingMovie, setLoadingMovie] = useState(true)

  // Real-Debrid state
  const [rdResults, setRdResults] = useState<RdResult[]>([])
  const [loadingRd, setLoadingRd] = useState(false)
  const [addingMagnet, setAddingMagnet] = useState<string | null>(null)
  const [addResponse, setAddResponse] = useState<any>(null)

  // 1) Load movie detail
  useEffect(() => {
    if (!id) return
    setLoadingMovie(true)
    fetch(`/api/movies/${id}`)
      .then(r => r.json())
      .then(setMovie)
      .catch(console.error)
      .finally(() => setLoadingMovie(false))
  }, [id])

  // 2) Search Real-Debrid
  async function handleSearchRd() {
    if (!movie?.title) return
    setLoadingRd(true)
    setAddResponse(null)
    try {
      const res = await fetch(
        `/api/rd-search?q=${encodeURIComponent(movie.title)}`
      )
      const json = await res.json()
      setRdResults(json.results || [])
    } catch (e) {
      console.error(e)
      setRdResults([])
    } finally {
      setLoadingRd(false)
    }
  }

  // 3) Add a magnet
  async function handleAddMagnet(magnet: string) {
    setAddingMagnet(magnet)
    try {
      const res = await fetch(`/api/rd-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnet }),
      })
      const json = await res.json()
      setAddResponse(json)
    } catch (e) {
      console.error(e)
      setAddResponse({ error: String(e) })
    } finally {
      setAddingMagnet(null)
    }
  }

  if (loadingMovie) return <p className="p-6">Loading movie…</p>
  if (!movie) return <p className="p-6">Movie not found.</p>

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <Link href="/" legacyBehavior>
        <a className="text-blue-600 hover:underline mb-4 block">
          ← Back to Search
        </a>
      </Link>

      <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
      <p className="text-gray-600 mb-4">
        Released: {new Date(movie.release_date).toLocaleDateString()}
      </p>

      {movie.poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full max-w-md rounded shadow mb-6"
        />
      )}

      <p className="mb-6">{movie.overview}</p>

      <h2 className="text-2xl font-semibold mb-2">Genres</h2>
      <ul className="flex flex-wrap gap-2 mb-8">
        {movie.genres.map((g) => (
          <li
            key={g.id}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded"
          >
            {g.name}
          </li>
        ))}
      </ul>

      {/* Real-Debrid Integration */}
      <section className="mb-8">
        <Button
          onClick={handleSearchRd}
          disabled={loadingRd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {loadingRd ? 'Searching…' : '🔍 Search Real-Debrid'}
        </Button>

        <div className="space-y-4 mt-4">
          {rdResults.map((r) => (
            <Card key={r.magnet} className="flex justify-between items-center">
              <CardContent className="flex-1">
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-gray-500 truncate">{r.magnet}</p>
              </CardContent>
              <Button
                onClick={() => handleAddMagnet(r.magnet)}
                disabled={addingMagnet === r.magnet}
                className="ml-4 bg-green-600 hover:bg-green-700 text-white"
              >
                {addingMagnet === r.magnet ? 'Adding…' : '➕ Add'}
              </Button>
            </Card>
          ))}
        </div>

        {addResponse && (
          <pre className="bg-white p-4 mt-4 rounded shadow-sm text-sm">
            {JSON.stringify(addResponse, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}
