import { useState } from 'react'

// ==================================================
// GET DISPLAY NAME
// ==================================================

function getNameFromEmail(email) {

  if (!email) {
    return 'User'
  }

  const username =
    email
      .split('@')[0]
      .trim()

  if (!username) {
    return 'User'
  }

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

// ==================================================
// PROFILE PAGE
// ==================================================

export default function Profile() {

  const [user] = useState(() => {

    try {

      const storedUser =
        localStorage.getItem(
          'resolveai_user'
        )

      if (storedUser) {

        const parsedUser =
          JSON.parse(storedUser)

        const email =
          parsedUser.email || ''

        return {
          ...parsedUser,

          // Always derive name from email
          name:
            getNameFromEmail(email),

        }

      }

      return {
        name: 'User',
        email: '',
        role: 'Administrator',
      }

    } catch {

      return {
        name: 'User',
        email: '',
        role: 'Administrator',
      }

    }

  })


  return (

    <main className="main-content">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="advanced-page-header">

        <div>

          <span className="card-eyebrow">
            ACCOUNT
          </span>

          <h2>
            Profile
          </h2>

          <p>
            Manage your ResolveAI account information.
          </p>

        </div>

      </div>


      {/* ==========================================
          PROFILE CARD
      ========================================== */}

      <section className="profile-page-card">

        {/* PROFILE SUMMARY */}

        <div className="profile-summary">

          <div className="profile-page-avatar">

            <span>
              {user.name
                .charAt(0)
                .toUpperCase()
              }
            </span>

          </div>

          <div className="profile-summary-text">

            <h3>
              {user.name}
            </h3>

            <p>
              {user.role}
            </p>

          </div>

        </div>


        {/* DIVIDER */}

        <div className="profile-divider" />


        {/* ACCOUNT DETAILS */}

        <div className="profile-details">

          <div className="profile-page-row">

            <div className="profile-detail-label">
              Full name
            </div>

            <div className="profile-detail-value">
              {user.name}
            </div>

          </div>


          <div className="profile-page-row">

            <div className="profile-detail-label">
              Email
            </div>

            <div className="profile-detail-value">
              {user.email}
            </div>

          </div>


          <div className="profile-page-row">

            <div className="profile-detail-label">
              Role
            </div>

            <div className="profile-detail-value">
              {user.role}
            </div>

          </div>


          <div className="profile-page-row">

            <div className="profile-detail-label">
              Account status
            </div>

            <div className="profile-detail-value">

              <span className="profile-status">

                <span className="profile-status-dot" />

                Active

              </span>

            </div>

          </div>

        </div>

      </section>

    </main>

  )

}