// pages/api/ping.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // try fetching your own token endpoint
    const r1 = await fetch('https://api.real-debrid.com/rest/1.0')
    // try fetching a public test site
    const r2 = await fetch('https://httpbin.org/ip')

    return res.status(200).json({
      realDebridStatus: r1.status,
      httpBinStatus: r2.status,
      yourIP: await r2.json(),
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
