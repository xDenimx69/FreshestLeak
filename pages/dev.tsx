// pages/dev.tsx
import dynamic from 'next/dynamic'

// client-only DevHelper now lives in /components/DevHelper.tsx
const DevHelper = dynamic(() => import('../components/DevHelper'), {
  ssr: false,
})

export default function DevPage() {
  return <DevHelper />
}
