// pages/api/movies/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query
  if (!query || Array.isArray(query)) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid query parameter' })
  }

  try {
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?` +
        `api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}` +
        `&query=${encodeURIComponent(query)}`
    )

    if (!tmdbRes.ok) {
      const errBody = await tmdbRes.json()
      return res
        .status(tmdbRes.status)
        .json({ error: errBody.status_message || 'TMDB error' })
    }

    const data = await tmdbRes.json()
    // Return the full data so your front-end can read data.results
    return res.status(200).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
