// components/DevHelper.tsx
'use client'

import { useState, useEffect } from 'react'

export default function DevHelper() {
  const [tokenLoaded, setTokenLoaded] = useState(false)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [magnet, setMagnet] = useState('')
  const [addResponse, setAddResponse] = useState<any>(null)

  useEffect(() => {
    // this reads NEXT_PUBLIC_RD_TOKEN from your .env.local
    setTokenLoaded(!!process.env.NEXT_PUBLIC_RD_TOKEN)
  }, [])

  async function doSearch() {
    const res = await fetch(`/api/rd-search?q=inception`)
    setSearchResults(await res.json())
  }

  async function doAdd() {
    const res = await fetch(`/api/rd-add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ magnet }),
    })
    setAddResponse(await res.json())
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🎛️ Dev Helper</h2>
      <p>RD_TOKEN loaded? {tokenLoaded ? '✅' : '❌'}</p>

      <div className="mt-6">
        <button
          onClick={doSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          🔎 Search “inception”
        </button>
        {searchResults && (
          <pre className="mt-2 bg-gray-100 p-2">
            {JSON.stringify(searchResults, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <input
          value={magnet}
          onChange={(e) => setMagnet(e.target.value)}
          placeholder="magnet:?xt=urn:btih:…"
          className="border px-2 py-1 flex-1"
        />
        <button
          onClick={doAdd}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          📎 Add Magnet
        </button>
      </div>

      {addResponse && (
        <pre className="mt-4 bg-gray-100 p-2">
          {JSON.stringify(addResponse, null, 2)}
        </pre>
      )}
    </div>
  )
}
