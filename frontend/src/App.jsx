import { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'

import Dashboard from './pages/Dashboard.jsx'
import AIAgent from './pages/AIAgent.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'

import { checkBackendHealth } from './services/api.js'


// ==================================================
// RESOLVEAI APPLICATION
// ==================================================

export default function App() {

  // ==================================================
  // AUTHENTICATION
  // ==================================================

  const [
    isAuthenticated,
    setIsAuthenticated
  ] = useState(() => {

    return (
      localStorage.getItem(
        'resolveai_authenticated'
      ) === 'true'
    )

  })


  // ==================================================
  // BACKEND STATUS
  // ==================================================

  const [backendStatus, setBackendStatus] =
    useState('checking')


  // ==================================================
  // LOGIN
  // ==================================================

  function handleLogin() {

    setIsAuthenticated(true)

  }


  // ==================================================
  // LOGOUT
  // ==================================================

  function handleLogout() {

    localStorage.removeItem(
      'resolveai_authenticated'
    )

    localStorage.removeItem(
      'resolveai_user'
    )

    setIsAuthenticated(false)

  }


  // ==================================================
  // BACKEND HEALTH MONITOR
  // ==================================================

  useEffect(() => {

    if (!isAuthenticated) {
      return
    }

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


    pollBackend()


    const interval =
      setInterval(
        pollBackend,
        15000
      )


    return () => {

      cancelled = true

      clearInterval(interval)

    }

  }, [isAuthenticated])


  // ==================================================
  // LOGIN SCREEN
  // ==================================================

  if (!isAuthenticated) {

    return (
      <Login
        onLogin={handleLogin}
      />
    )

  }


  // ==================================================
  // AUTHENTICATED APPLICATION
  // ==================================================

  return (
    <AuthenticatedApp
      backendStatus={backendStatus}
      onLogout={handleLogout}
    />
  )

}


// ==================================================
// AUTHENTICATED APP
// ==================================================

function AuthenticatedApp({
  backendStatus,
  onLogout,
}) {

  const location = useLocation()
  const navigate = useNavigate()


  // ==================================================
  // SIDEBAR NAVIGATION
  // ==================================================

  function handleNavigation(page) {

    const routes = {

      dashboard: '/',
      agent: '/agent',
      incidents: '/incidents',
      knowledge: '/knowledge',
      analytics: '/analytics',

    }

    navigate(
      routes[page] || '/'
    )

  }


  // ==================================================
  // ACTIVE SIDEBAR ITEM
  // ==================================================

  function getActivePage() {

    const path =
      location.pathname


    if (path === '/') {
      return 'dashboard'
    }

    if (path === '/agent') {
      return 'agent'
    }

    if (path === '/incidents') {
      return 'incidents'
    }

    if (path === '/knowledge') {
      return 'knowledge'
    }

    if (path === '/analytics') {
      return 'analytics'
    }


    return null

  }


  return (

    <div className="app-shell">

      {/* ==========================================
          HEADER
      ========================================== */}

      <Header
        backendStatus={backendStatus}
        onLogout={onLogout}
      />


      {/* ==========================================
          APPLICATION LAYOUT
      ========================================== */}

      <div className="app-layout">


        {/* ========================================
            SIDEBAR
        ======================================== */}

        <Sidebar
          active={getActivePage()}
          onNavigate={handleNavigation}
        />


        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <div className="app-main">

          <Routes>

            {/* ====================================
                DASHBOARD
            ==================================== */}

            <Route
              path="/"
              element={
                <Dashboard
                  backendStatus={backendStatus}
                />
              }
            />


            {/* ====================================
                AI AGENT
            ==================================== */}

            <Route
              path="/agent"
              element={
                <AIAgent />
              }
            />


            {/* ====================================
                PROFILE
            ==================================== */}

            <Route
              path="/profile"
              element={
                <Profile />
              }
            />


            {/* ====================================
                SETTINGS
            ==================================== */}

            <Route
              path="/settings"
              element={
                <Settings
                  backendStatus={backendStatus}
                />
              }
            />


            {/* ====================================
                INCIDENTS
            ==================================== */}

            <Route
              path="/incidents"
              element={
                <PlaceholderPage
                  eyebrow="INCIDENT OPERATIONS"
                  title="Incident Management"
                  description="View, search and manage ResolveAI incidents and tickets."
                />
              }
            />


            {/* ====================================
                KNOWLEDGE
            ==================================== */}

            <Route
              path="/knowledge"
              element={
                <PlaceholderPage
                  eyebrow="RESOLVEAI KNOWLEDGE"
                  title="Knowledge Base"
                  description="Explore the knowledge used by the RAG pipeline to diagnose incidents."
                />
              }
            />


            {/* ====================================
                ANALYTICS
            ==================================== */}

            <Route
              path="/analytics"
              element={
                <PlaceholderPage
                  eyebrow="IT OPERATIONS INTELLIGENCE"
                  title="Analytics"
                  description="Monitor incident volume, priority distribution, resolution performance and AI activity."
                />
              }
            />


            {/* ====================================
                UNKNOWN PAGE
            ==================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>


          {/* ========================================
              FOOTER
          ======================================== */}

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

function PlaceholderPage({
  eyebrow,
  title,
  description,
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

          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
          >

            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.8"
            />

            <path
              d="M8 12H16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

          </svg>

        </div>


        <span className="advanced-placeholder-label">
          MODULE READY
        </span>


        <h3>
          {title}
        </h3>


        <p>
          This ResolveAI module is connected to
          the application navigation.
        </p>


        <div className="placeholder-status">

          <span className="status-dot online" />

          Navigation connected

        </div>

      </section>

    </main>

  )

}