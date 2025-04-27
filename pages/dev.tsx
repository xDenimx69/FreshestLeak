// pages/dev.tsx
import dynamic from 'next/dynamic'

// load the helper only on the client
const DevHelper = dynamic(() => import('../components/DevHelper'), {
  ssr: false,
})

export default function DevPage() {
  // Only render in development—return nothing in production
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  return <DevHelper />
}
