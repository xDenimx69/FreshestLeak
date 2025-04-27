// pages/api/movies/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  // 1️⃣ Validate ID
  if (!id || Array.isArray(id)) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid movie ID' })
  }

  try {
    // 2️⃣ Fetch from TMDB
    const apiRes = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    )

    // 3️⃣ If TMDB returns an error, pass it along
    if (!apiRes.ok) {
      const errBody = await apiRes.json()
      return res
        .status(apiRes.status)
        .json({ error: errBody.status_message || 'TMDB lookup failed' })
    }

    // 4️⃣ All good → return JSON
    const data = await apiRes.json()
    return res.status(200).json(data)
  } catch (err: any) {
    // 5️⃣ Network/other error
    return res
      .status(500)
      .json({ error: err.message || 'Unexpected error' })
  }
}
