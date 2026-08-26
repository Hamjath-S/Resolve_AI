// ==================================================
// RESOLVEAI SIDEBAR
// ==================================================

export default function Sidebar({
  active,
  onNavigate,
}) {


  // ==================================================
  // NAVIGATION ITEMS
  // ==================================================

  const navigationItems = [

    {
      id: 'dashboard',
      label: 'Command Center',
      icon: '⌂',
      description: 'Incident command center',
    },

    {
      id: 'incidents',
      label: 'Incidents',
      icon: '▱',
      description: 'Incident and ticket management',
    },

    {
      id: 'agent',
      label: 'AI Agent',
      icon: '✦',
      description: 'Autonomous agent activity',
    },

    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: '▤',
      description: 'RAG knowledge sources',
    },

    {
      id: 'analytics',
      label: 'Analytics',
      icon: '◫',
      description: 'IT operations analytics',
    },

  ]


  // ==================================================
  // HANDLE NAVIGATION
  // ==================================================

  function handleClick(id) {

    if (typeof onNavigate === 'function') {

      onNavigate(id)

    }

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <aside className="sidebar">


      {/* ==================================================
          BRAND
          ================================================== */}

      <div className="sidebar-brand">

        <div className="sidebar-brand-mark">

          <span>
            ✦
          </span>

        </div>

        <div>

          <strong>
            ResolveAI
          </strong>

          <span>
            AI Operations
          </span>

        </div>

      </div>


      {/* ==================================================
          NAVIGATION LABEL
          ================================================== */}

      <div className="sidebar-section-label">

        RESOLVEAI OPS

      </div>


      {/* ==================================================
          NAVIGATION
          ================================================== */}

      <nav
        className="sidebar-nav"
        aria-label="ResolveAI navigation"
      >

        {navigationItems.map((item) => {

          const isActive =
            active === item.id


          return (

            <button
              key={item.id}
              type="button"

              className={
                `sidebar-nav-item ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }

              onClick={() =>
                handleClick(item.id)
              }

              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }

            >

              {/* Active indicator */}

              <span className="sidebar-active-indicator" />


              {/* Icon */}

              <span className="sidebar-nav-icon">

                {item.icon}

              </span>


              {/* Text */}

              <span className="sidebar-nav-content">

                <span className="sidebar-nav-label">

                  {item.label}

                </span>

                <span className="sidebar-nav-description">

                  {item.description}

                </span>

              </span>


              {/* Arrow */}

              <span className="sidebar-nav-arrow">

                →

              </span>

            </button>

          )

        })}

      </nav>


      {/* ==================================================
          SIDEBAR FOOTER
          ================================================== */}

      <div className="sidebar-bottom">

        <div className="sidebar-system-card">

          <div className="sidebar-system-header">

            <span className="sidebar-system-dot" />

            <span>
              AI SYSTEM
            </span>

          </div>

          <strong>
            ResolveAI Agent
          </strong>

          <p>
            Autonomous incident intelligence
          </p>

        </div>

      </div>


    </aside>

  )

}