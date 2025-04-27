// pages/movies/[id].tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '../../components/ui/Card'
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
  const router = useRouter()
  const { id } = router.query

  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loadingMovie, setLoadingMovie] = useState(true)

  // Real-Debrid states
  const [rdResults, setRdResults] = useState<RdResult[]>([])
  const [loadingRd, setLoadingRd] = useState(false)
  const [addingMagnet, setAddingMagnet] = useState<string | null>(null)
  const [addResponse, setAddResponse] = useState<any>(null)

  // 1) Fetch TMDB detail
  useEffect(() => {
    if (!id) return
    setLoadingMovie(true)
    fetch(`/api/movies/${id}`)
      .then((r) => r.json())
      .then((data) => setMovie(data))
      .catch(console.error)
      .finally(() => setLoadingMovie(false))
  }, [id])

  // 2) Search Real-Debrid
  async function handleSearchRd() {
    if (!movie?.title) return
    setLoadingRd(true)
    setAddResponse(null)           // clear any previous add
    try {
      const r = await fetch(
        `/api/rd-search?q=${encodeURIComponent(movie.title)}`
      )
      const json = await r.json()
      setRdResults(json.results || [])
    } catch (e) {
      console.error(e)
      setRdResults([])
    } finally {
      setLoadingRd(false)
    }
  }

  // 3) Add a magnet to Real-Debrid
  async function handleAddMagnet(magnet: string) {
    setAddingMagnet(magnet)
    try {
      const r = await fetch(`/api/rd-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnet }),
      })
      const json = await r.json()
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
        <Button onClick={handleSearchRd} disabled={loadingRd}>
          {loadingRd ? 'Searching…' : '🔍 Search Real-Debrid'}
        </Button>

        {rdResults.map((r) => (
          <Card key={r.magnet} className="mt-4">
            <CardContent className="flex justify-between items-center">
              <span>{r.title}</span>
              <Button
                variant="secondary"
                onClick={() => handleAddMagnet(r.magnet)}
                disabled={addingMagnet === r.magnet}
              >
                {addingMagnet === r.magnet ? 'Adding…' : '➕ Add'}
              </Button>
            </CardContent>
          </Card>
        ))}

        {addResponse && (
          <pre className="bg-white p-4 mt-4 rounded shadow-sm text-sm">
            {JSON.stringify(addResponse, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}
