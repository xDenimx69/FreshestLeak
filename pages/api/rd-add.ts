// pages/api/rd-add.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.RD_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'Missing RD_TOKEN in env' })
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { magnet } = req.body
  if (!magnet || typeof magnet !== 'string') {
    return res.status(400).json({ error: 'Missing magnet in body' })
  }

  try {
    const rdRes = await fetch(
      'https://api.real-debrid.com/rest/1.0/torrents/addMagnet',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `magnet=${encodeURIComponent(magnet)}`,
      }
    )

    const data = await rdRes.json()
    return res.status(rdRes.status).json(data)
  } catch (err: any) {
    console.error('rd-add error:', err)
    return res.status(500).json({ error: err.message })
  }
}
