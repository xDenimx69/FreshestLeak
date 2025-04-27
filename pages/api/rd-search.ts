// pages/api/rd-search.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.RD_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'Missing RD_TOKEN in env' })
  }

  // get & validate query
  const { q } = req.query
  const query = Array.isArray(q) ? q[0] : q
  if (!query) {
    return res.status(400).json({ error: 'Missing ?q= search term' })
  }

  try {
    const rdRes = await fetch(
      `https://api.real-debrid.com/rest/1.0/torrents/search/${encodeURIComponent(
        query
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!rdRes.ok) {
      const text = await rdRes.text()
      return res.status(rdRes.status).send(text)
    }

    const data = await rdRes.json()
    // wrap in a `results` array for consistency
    return res.status(200).json({ results: data })
  } catch (err: any) {
    console.error('rd-search error:', err)
    return res.status(500).json({ error: err.message })
  }
}
