import { useEffect, useState } from 'react'

import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'

import Dashboard from './pages/Dashboard.jsx'
import AIAgent from './pages/AIAgent.jsx'

import { checkBackendHealth } from './services/api.js'


// ==================================================
// RESOLVEAI APPLICATION
// ==================================================

export default function App() {

  // --------------------------------------------------
  // BACKEND STATUS
  // --------------------------------------------------

  const [backendStatus, setBackendStatus] =
    useState('checking')


  // --------------------------------------------------
  // ACTIVE PAGE
  // --------------------------------------------------

  const [activePage, setActivePage] =
    useState('dashboard')


  // ==================================================
  // BACKEND HEALTH MONITOR
  // ==================================================

  useEffect(() => {

    let cancelled = false


    async function pollBackend() {

      const isOnline =
        await checkBackendHealth()


      if (!cancelled) {

        setBackendStatus(
          isOnline
            ? 'online'
            : 'offline'
        )

      }

    }


    // Initial health check
    pollBackend()


    // Check backend every 15 seconds
    const interval =
      setInterval(
        pollBackend,
        15000
      )


    return () => {

      cancelled = true

      clearInterval(interval)

    }

  }, [])


  // ==================================================
  // SIDEBAR NAVIGATION
  // ==================================================

  function handleNavigation(page) {

    setActivePage(page)

  }


  // ==================================================
  // PAGE RENDERER
  // ==================================================

  function renderPage() {

    switch (activePage) {


      // ==============================================
      // COMMAND CENTER
      // ==============================================

      case 'dashboard':

        return (
          <Dashboard
            backendStatus={backendStatus}
          />
        )


      // ==============================================
      // AI AGENT
      // ==============================================

      case 'agent':

        return <AIAgent />


      // ==============================================
      // INCIDENTS
      // ==============================================

      case 'incidents':

        return (
          <PlaceholderPage
            eyebrow="INCIDENT OPERATIONS"
            title="Incident Management"
            description="View, search and manage ResolveAI incidents and tickets."
            icon="▦"
          />
        )


      // ==============================================
      // KNOWLEDGE BASE
      // ==============================================

      case 'knowledge':

        return (
          <PlaceholderPage
            eyebrow="RESOLVEAI KNOWLEDGE"
            title="Knowledge Base"
            description="Explore the knowledge used by the RAG pipeline to diagnose incidents."
            icon="▤"
          />
        )


      // ==============================================
      // ANALYTICS
      // ==============================================

      case 'analytics':

        return (
          <PlaceholderPage
            eyebrow="IT OPERATIONS INTELLIGENCE"
            title="Analytics"
            description="Monitor incident volume, priority distribution, resolution performance and AI activity."
            icon="◫"
          />
        )


      // ==============================================
      // FALLBACK
      // ==============================================

      default:

        return (
          <Dashboard
            backendStatus={backendStatus}
          />
        )

    }

  }


  // ==================================================
  // APPLICATION UI
  // ==================================================

  return (

    <div className="app-shell">


      {/* ================================================
          HEADER
      ================================================ */}

      <Header
        backendStatus={backendStatus}
      />


      {/* ================================================
          APPLICATION LAYOUT
      ================================================ */}

      <div className="app-layout">


        {/* ==============================================
            SIDEBAR
        ============================================== */}

        <Sidebar

          active={activePage}

          onNavigate={
            handleNavigation
          }

        />


        {/* ==============================================
            MAIN APPLICATION
        ============================================== */}

        <div className="app-main">


          {renderPage()}


          {/* ============================================
              FOOTER
          ============================================ */}

          <footer className="footer">

            <span>
              ResolveAI
            </span>

            <span className="footer-separator">
              ·
            </span>

            <span>
              Autonomous AI IT Incident Operations
            </span>

            <span className="footer-status">

              <span
                className={
                  `footer-status-dot ${backendStatus}`
                }
              />

              {backendStatus === 'online'
                ? 'Systems operational'
                : backendStatus === 'checking'
                  ? 'Checking systems'
                  : 'Backend unavailable'
              }

            </span>

          </footer>

        </div>

      </div>

    </div>

  )

}


// ==================================================
// TEMPORARY MODULE PAGE
// ==================================================
//
// Used only for modules that we haven't built yet.
//
// AI Agent is NOT a placeholder anymore.
// It loads the real AIAgent.jsx page above.
//
// ==================================================

function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon,
}) {

  return (

    <main className="main-content">

      <div className="advanced-page-header">

        <div>

          <span className="card-eyebrow">
            {eyebrow}
          </span>

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>

        </div>

      </div>


      <section className="advanced-placeholder">

        <div className="advanced-placeholder-icon">
          {icon}
        </div>

        <span className="advanced-placeholder-label">
          MODULE READY
        </span>

        <h3>
          {title}
        </h3>

        <p>
          This ResolveAI module is connected to the
          command center navigation and will be expanded
          with live backend data next.
        </p>

        <div className="placeholder-status">

          <span className="status-dot online" />

          Navigation connected

        </div>

      </section>

    </main>

  )

}