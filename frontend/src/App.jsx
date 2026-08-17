import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { checkBackendHealth } from './services/api.js'

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function poll() {
      const isOnline = await checkBackendHealth()
      if (!cancelled) setBackendStatus(isOnline ? 'online' : 'offline')
    }

    poll()
    const interval = setInterval(poll, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="app-shell">
      <Header backendStatus={backendStatus} />
      <Dashboard />
      <footer className="footer">ResolveAI · AI Powered IT Incident Analyzer</footer>
    </div>
  )
}
