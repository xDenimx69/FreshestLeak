import { Button } from '../components/ui/Button'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to Kingstream!</h1>
        <Button onClick={() => alert('Hello Kingstream!')}>
          Get Started
        </Button>
      </div>
    </main>
  )
}
