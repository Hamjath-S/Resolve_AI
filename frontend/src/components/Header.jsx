export default function Header({ backendStatus }) {
  const statusConfig = {
    checking: { dot: 'checking', label: 'Checking backend…' },
    online: { dot: 'online', label: 'Backend connected' },
    offline: { dot: 'offline', label: 'Backend unavailable' },
  }
  const { dot, label } = statusConfig[backendStatus] || statusConfig.checking

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 3l7.5 4.33v9.34L12 21l-7.5-4.33V7.33L12 3z"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M12 8v4.5l3 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>ResolveAI</h1>
            <p>AI Powered IT Incident Resolution</p>
          </div>
        </div>

        <div className="status-pill" role="status" aria-live="polite">
          <span className={`status-dot ${dot}`} />
          {label}
        </div>
      </div>
    </header>
  )
}
