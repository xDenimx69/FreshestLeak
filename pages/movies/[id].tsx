// pages/movies/[id].tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '../../components/ui/Card'
import { CardContent } from '../../components/ui/CardContent'
import { Button } from '../../components/ui/Button'

interface MovieDetail {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string | null
  genres: { id: number; name: string }[]
}

interface RdResult {
  title: string
  magnet: string
}

interface HostsResp {
  hosts?: string[]
  error?: string
}

export default function MoviePage() {
  const { query } = useRouter()
  const id =
    typeof query.id === 'string'
      ? query.id
      : Array.isArray(query.id)
      ? query.id[0]
      : ''

  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loadingMovie, setLoadingMovie] = useState(true)

  const [rdResults, setRdResults] = useState<RdResult[]>([])
  const [loadingRd, setLoadingRd] = useState(false)
  const [addingMagnet, setAddingMagnet] = useState<string | null>(null)
  const [hosts, setHosts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch movie detail
  useEffect(() => {
    if (!id) return
    setLoadingMovie(true)
    fetch(`/api/movies/${id}`)
      .then((r) => r.json())
      .then(setMovie)
      .catch(console.error)
      .finally(() => setLoadingMovie(false))
  }, [id])

  // Search Real-Debrid
  async function handleSearchRd() {
    if (!movie?.title) return
    setLoadingRd(true)
    setError(null)
    setHosts([])
    try {
      const res = await fetch(
        `/api/rd-search?q=${encodeURIComponent(movie.title)}`
      )
      const json = await res.json()
      setRdResults(json.results || [])
    } catch (e: any) {
      console.error(e)
      setError(e.message)
      setRdResults([])
    } finally {
      setLoadingRd(false)
    }
  }

  // Add magnet & fetch hosts
  async function handleAddMagnet(magnet: string) {
    setAddingMagnet(magnet)
    setError(null)
    try {
      const addRes = await fetch('/api/rd-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnet }),
      })
      const addJson = await addRes.json()
      if (!addRes.ok) throw new Error(addJson.error || 'Add failed')
      const torrentId = addJson.id

      const hostsRes = await fetch(`/api/rd-hosts?torrentId=${torrentId}`)
      const hostsJson: HostsResp = await hostsRes.json()
      if (hostsJson.error) throw new Error(hostsJson.error)
      setHosts(hostsJson.hosts || [])
    } catch (e: any) {
      console.error(e)
      setError(e.message)
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
      <p className="mb-6">{movie.overview}</p>

      <Button
        onClick={handleSearchRd}
        disabled={loadingRd}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {loadingRd ? 'Searching…' : '🔍 Search Real-Debrid'}
      </Button>

      {loadingRd && (
        <p className="mt-2 text-gray-600">🔄 Searching torrents…</p>
      )}

      {!loadingRd && rdResults.length === 0 && (
        <p className="mt-2 text-gray-600">
          No torrents found{movie.title ? ` for “${movie.title}”` : ''}.
        </p>
      )}

      <div className="space-y-4 mt-4">
        {rdResults.map((r) => (
          <Card key={r.magnet} className="flex justify-between items-center">
            <CardContent className="flex-1">
              <p className="font-medium">{r.title}</p>
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

      {addingMagnet && hosts.length === 0 && (
        <p className="mt-2 text-gray-600">🔄 Fetching stream links…</p>
      )}

      {hosts.length > 0 && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Stream Links</h2>
          <ul className="space-y-2">
            {hosts.map((h) => (
              <li key={h}>
                <a
                  href={h}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {new URL(h).hostname}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}
    </div>
  )
}
