// pages/api/rd-search.ts
import type { NextApiRequest, NextApiResponse } from 'next'

interface YtsMovie {
  title: string
  title_long: string
  torrents: Array<{
    hash: string
    quality: string
    type: string
  }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawQ = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q
  if (!rawQ) {
    return res.status(400).json({ error: 'Missing ?q=' })
  }

  // 1) Fetch from YTS
  const url = `https://yts.mx/api/v2/list_movies.json?limit=20&query_term=${encodeURIComponent(
    rawQ
  )}`
  const yRes = await fetch(url)
  if (!yRes.ok) {
    const txt = await yRes.text()
    return res.status(yRes.status).json({ error: txt })
  }
  const { data } = await yRes.json() as { data: { movies: YtsMovie[] } }
  const movies = data.movies || []

  // 2) Map to { title, magnet }
  const results = movies.flatMap((m) =>
    m.torrents.map((t) => {
      // build a simple magnet URI with one tracker
      const magnet = [
        `xt=urn:btih:${t.hash}`,
        `dn=${encodeURIComponent(m.title_long)}`,
        // you can add more trackers here if you like
        'tr=udp://tracker.openbittorrent.com:80',
      ].join('&').replace(/&/g, '&')
      return {
        title: `${m.title} — ${t.quality}`,
        magnet: `magnet:?${magnet}`,
      }
    })
  )

  return res.status(200).json({ results })
}
