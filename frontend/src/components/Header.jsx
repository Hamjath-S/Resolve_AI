export default function Header({ backendStatus }) {

  const statusConfig = {
    checking: {
      dot: 'checking',
      label: 'Checking systems',
    },

    online: {
      dot: 'online',
      label: 'All systems operational',
    },

    offline: {
      dot: 'offline',
      label: 'Backend unavailable',
    },
  }

  const {
    dot,
    label,
  } =
    statusConfig[backendStatus]
    || statusConfig.checking


  return (
    <header className="header">

      <div className="header-inner">

        <div className="mobile-brand">

          <div className="brand-mark">
            ✦
          </div>

          <div>
            <strong>
              ResolveAI
            </strong>

            <span>
              AI INCIDENT OPERATIONS
            </span>
          </div>

        </div>


        <div className="header-context">

          <span className="header-context-label">
            OPERATIONS
          </span>

          <span className="header-context-title">
            Incident Command Center
          </span>

        </div>


        <div className="header-actions">

          <div
            className="status-pill"
            role="status"
            aria-live="polite"
          >

            <span
              className={`status-dot ${dot}`}
            />

            <span>
              {label}
            </span>

          </div>


          <div className="header-avatar">
            AI
          </div>

        </div>

      </div>

    </header>
  )
}