export function LoadingPanel() {
  return (
    <div className="loading-panel">
      <div className="spinner" role="status" aria-label="Analyzing incident" />
      <p>Running incident through Gemini AI…</p>
    </div>
  )
}

export function EmptyPanel() {
  return (
    <div className="empty-panel">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p>Submit an incident on the left to see AI analysis results here.</p>
    </div>
  )
}

const ERROR_COPY = {
  backend_unavailable: 'Backend unavailable',
  network: 'Network error',
  not_implemented: 'Endpoint not connected',
  api_error: 'Analysis failed',
  validation: 'Missing information',
}

export function ErrorBanner({ error }) {
  if (!error) return null
  const title = ERROR_COPY[error.type] || 'Something went wrong'

  return (
    <div className="error-banner">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <p className="error-banner-title">{title}</p>
        <p className="error-banner-msg">{error.message}</p>
      </div>
    </div>
  )
}
