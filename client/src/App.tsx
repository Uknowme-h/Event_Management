import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-3xl font-bold">Event Planning App</h1>
      <p className="mt-4 text-gray-600">Scaffold booting. API health check:</p>
      <HealthCheck />
    </div>
  )
}

function HealthCheck() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  return <p className="mt-2 font-mono text-sm text-green-600">{status}</p>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
