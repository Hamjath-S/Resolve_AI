import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'


// ==================================================
// HEADER
// ==================================================

export default function Header({
  backendStatus,
  onLogout,
}) {

  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const menuRef =
    useRef(null)


function getNameFromEmail(email) {

  if (!email) return 'User'

  const username =
    email
      .split('@')[0]
      .trim()

  if (!username) return 'User'

  return username
    .split(/[._-]+/)
    .filter(Boolean)
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(' ')
}

// ============================================================
// USER
// ============================================================

function getNameFromEmail(email) {
  if (!email) return 'User'

  const username = email
    .split('@')[0]
    .trim()

  if (!username) return 'User'

  return username
    .split(/[._-]+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(' ')
}

const [user] = useState(() => {
  try {
    const storedUser = localStorage.getItem('resolveai_user')

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      return {
        ...parsedUser,
        name: getNameFromEmail(parsedUser.email),
      }
    }
  } catch (error) {
    console.error('Failed to load user:', error)
  }

  return {
    name: 'User',
    email: '',
    role: 'User',
  }
})
  // ==================================================
  // BACKEND STATUS
  // ==================================================

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


  // ==================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ==================================================

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {

        setMenuOpen(false)

      }

    }


    document.addEventListener(
      'mousedown',
      handleClickOutside
    )


    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )

    }

  }, [])


  // ==================================================
  // PROFILE NAVIGATION
  // ==================================================

  function handleProfile() {

    setMenuOpen(false)

    navigate('/profile')

  }


  // ==================================================
  // SETTINGS NAVIGATION
  // ==================================================

  function handleSettings() {

    setMenuOpen(false)

    navigate('/settings')

  }


  // ==================================================
  // LOGOUT
  // ==================================================

  function handleLogout() {

    setMenuOpen(false)

    localStorage.removeItem(
      'resolveai_authenticated'
    )

    localStorage.removeItem(
      'resolveai_user'
    )

    if (onLogout) {

      onLogout()

    } else {

      navigate('/login')

    }

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <header className="header">

      <div className="header-inner">


        {/* ==========================================
            MOBILE BRAND
        ========================================== */}

        <div className="mobile-brand">

          <div className="brand-mark">

            <svg
              width="25"
              height="25"
              viewBox="0 0 34 34"
              fill="none"
            >

              <path
                d="M17 3L28.5 9.5V22.5L17 29L5.5 22.5V9.5L17 3Z"
                stroke="currentColor"
                strokeWidth="2.4"
              />

              <path
                d="M11 12.5L17 9L23 12.5V19.5L17 23L11 19.5V12.5Z"
                stroke="currentColor"
                strokeWidth="2.4"
              />

            </svg>

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


        {/* ==========================================
            HEADER CONTEXT
        ========================================== */}

        <div className="header-context">

          <span className="header-context-label">
            OPERATIONS
          </span>

          <span className="header-context-title">
            Incident Command Center
          </span>

        </div>


        {/* ==========================================
            HEADER ACTIONS
        ========================================== */}

        <div className="header-actions">


          {/* ========================================
              SYSTEM STATUS
          ======================================== */}

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


          {/* ========================================
              USER MENU
          ======================================== */}

          <div
            className="user-menu-container"
            ref={menuRef}
          >

            <button
              type="button"
              className="user-menu-button"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >

              {/* AVATAR */}

              <div className="header-avatar">

                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M5 20C5.5 16.5 8 14.5 12 14.5C16 14.5 18.5 16.5 19 20"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                </svg>

              </div>


              {/* USER INFO */}

              <div className="user-menu-info">

                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.role}
                </span>

              </div>


              {/* CHEVRON */}

              <svg
                className={
                  `user-menu-chevron ${
                    menuOpen
                      ? 'open'
                      : ''
                  }`
                }
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >

                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </button>


            {/* ======================================
                USER DROPDOWN
            ====================================== */}

            {menuOpen && (

              <div
                className="user-dropdown"
                role="menu"
              >


                {/* ==================================
                    PROFILE
                ================================== */}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleProfile}
                  role="menuitem"
                >

                  <span className="dropdown-icon">

                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >

                      <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M5 20C5.5 16.5 8 14.5 12 14.5C16 14.5 18.5 16.5 19 20"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                    </svg>

                  </span>

                  <span>
                    Profile
                  </span>

                </button>


                {/* ==================================
                    SETTINGS
                ================================== */}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleSettings}
                  role="menuitem"
                >

                  <span className="dropdown-icon">

                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M19.4 15A1.7 1.7 0 0 0 19.7 16.9L19.8 17.1L17.1 19.8L16.9 19.7A1.7 1.7 0 0 0 15 19.4A1.7 1.7 0 0 0 13.8 21H10.2A1.7 1.7 0 0 0 9 19.4A1.7 1.7 0 0 0 7.1 19.7L6.9 19.8L4.2 17.1L4.3 16.9A1.7 1.7 0 0 0 4.6 15A1.7 1.7 0 0 0 3 13.8V10.2A1.7 1.7 0 0 0 4.6 9A1.7 1.7 0 0 0 4.3 7.1L4.2 6.9L6.9 4.2L7.1 4.3A1.7 1.7 0 0 0 9 4.6A1.7 1.7 0 0 0 10.2 3H13.8A1.7 1.7 0 0 0 15 4.6A1.7 1.7 0 0 0 16.9 4.3L17.1 4.2L19.8 6.9L19.7 7.1A1.7 1.7 0 0 0 19.4 9A1.7 1.7 0 0 0 21 10.2V13.8A1.7 1.7 0 0 0 19.4 15Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />

                    </svg>

                  </span>

                  <span>
                    Settings
                  </span>

                </button>


                {/* ==================================
                    DIVIDER
                ================================== */}

                <div className="dropdown-divider" />


                {/* ==================================
                    LOGOUT
                ================================== */}

                <button
                  type="button"
                  className="dropdown-item dropdown-logout"
                  onClick={handleLogout}
                  role="menuitem"
                >

                  <span className="dropdown-icon">

                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                    >

                      <path
                        d="M10 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M14 8L18 12L14 16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M18 12H9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                    </svg>

                  </span>

                  <span>
                    Logout
                  </span>

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>

  )

}