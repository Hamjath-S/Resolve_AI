import { useState } from 'react'
import { loginUser } from '../services/api'

// ==================================================
// LOGIN PAGE
// ==================================================

export default function Login({ onLogin }) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  // ==================================================
  // PASSWORD VALIDATION
  // ==================================================

  function validatePassword(value) {

    if (value.length < 6) {
      return 'Password must contain at least 6 characters.'
    }

    return ''
  }


  // ==================================================
  // HANDLE LOGIN
  // ==================================================

  async function handleSubmit(event) {

    event.preventDefault()

    setError('')

    const trimmedEmail =
      email.trim().toLowerCase()


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    if (!trimmedEmail) {

      setError(
        'Please enter your email address.'
      )

      return
    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail
      )
    ) {

      setError(
        'Please enter a valid email address.'
      )

      return
    }


    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    const passwordError =
      validatePassword(password)

    if (passwordError) {

      setError(passwordError)

      return
    }


    // ==================================================
    // START LOGIN
    // ==================================================

    setIsLoading(true)


    try {

      // ==================================================
      // CALL CENTRALIZED LOGIN FUNCTION
      // ==================================================

      const data = await loginUser(
        trimmedEmail,
        password
      )


      // ==================================================
      // CHECK JWT TOKEN
      // ==================================================

      if (!data.access_token) {

        throw new Error(
          'Login successful, but no authentication token was received.'
        )
      }


      // ==================================================
      // SAVE AUTHENTICATION STATE
      // ==================================================

      localStorage.setItem(
        'resolveai_authenticated',
        'true'
      )


      // ==================================================
      // SAVE LOGGED-IN USER
      // ==================================================

      if (data.user) {

        localStorage.setItem(
          'resolveai_user',
          JSON.stringify(data.user)
        )

      } else {

        // Fallback user object
        localStorage.setItem(
          'resolveai_user',
          JSON.stringify({
            email: trimmedEmail
          })
        )

      }


      // ==================================================
      // DEBUG
      // ==================================================

      console.log(
        'Login successful'
      )

      console.log(
        'ResolveAI token saved:',
        !!localStorage.getItem(
          'resolveai_access_token'
        )
      )

      console.log(
        'Logged-in user:',
        data.user
      )


      // ==================================================
      // LOGIN SUCCESS
      // ==================================================

      setIsLoading(false)

      onLogin(
        data.user || {
          email: trimmedEmail
        }
      )

    } catch (error) {

      console.error(
        'Login error:',
        error
      )


      // ==================================================
      // SHOW ERROR
      // ==================================================

      if (
        error instanceof TypeError
      ) {

        setError(
          'Unable to connect to ResolveAI server. Make sure the backend is running.'
        )

      } else {

        setError(
          error.message ||
          'Login failed.'
        )

      }


      setIsLoading(false)
    }
  }


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="login-page">

      <div className="login-background-pattern" />

      <main className="login-container">


        {/* BRAND */}

        <div className="login-brand">

          <div className="login-brand-mark">

            <svg
              width="34"
              height="34"
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

              <path
                d="M17 9V16.5"
                stroke="currentColor"
                strokeWidth="2.4"
              />

              <path
                d="M17 16.5L23 13"
                stroke="currentColor"
                strokeWidth="2.4"
              />

            </svg>

          </div>


          <div className="login-brand-text">

            <strong>
              RESOLVEAI
            </strong>

            <span>
              AI INCIDENT OPERATIONS
            </span>

          </div>

        </div>


        {/* HEADER */}

        <div className="login-header">

          <h1>
            Sign in
          </h1>

          <p>
            Access the ResolveAI incident operations
            platform.
          </p>

        </div>


        {/* LOGIN FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >


          {/* EMAIL */}

          <div className="login-field">

            <label htmlFor="login-email">
              Email
            </label>

            <div className="login-input-wrapper">

              <span className="login-input-icon">

                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M4 7L12 13L20 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                </svg>

              </span>


              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={event =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="login-field">

            <label htmlFor="login-password">
              Password
            </label>

            <div className="login-input-wrapper">

              <span className="login-input-icon">

                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                </svg>

              </span>


              <input
                id="login-password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="Enter your password"
                value={password}
                onChange={event =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >

                ◉

              </button>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="login-error">

              <span>
                !
              </span>

              <span>
                {error}
              </span>

            </div>

          )}


          {/* SIGN IN */}

          <button
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >

            {isLoading
              ? 'Signing in...'
              : 'Sign in'
            }

          </button>

        </form>


        {/* FOOTER */}

        <div className="login-footer">

          <span className="login-footer-dot" />

          Secure ResolveAI Operations Environment

        </div>

      </main>

    </div>

  )
}