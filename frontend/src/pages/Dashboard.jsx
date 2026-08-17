import { useEffect, useState } from 'react'
import IncidentForm from '../components/IncidentForm.jsx'
import AnalysisResult from '../components/AnalysisResult.jsx'
import {
  LoadingPanel,
  EmptyPanel,
  ErrorBanner,
} from '../components/StatePanels.jsx'
import {
  analyzeIncident,
  getTicket,
  resolveTicket,
  keepTicketOpen,
  ApiError,
} from '../services/api.js'

export default function Dashboard() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [confirmationLoading, setConfirmationLoading] = useState(false)


  // ==================================================
  // AUTOMATIC TICKET STATUS POLLING
  // ==================================================
  //
  // The backend applies the 30-second rule:
  //
  // 0 - 30 seconds  -> Open
  // After 30 seconds -> In Progress
  // User confirms    -> Closed
  //
  // Frontend checks the backend every 5 seconds so the
  // displayed status updates automatically.
  // ==================================================

  useEffect(() => {

    if (
      status !== 'success' ||
      !result?.ticket_id
    ) {
      return
    }

    const ticketId = result.ticket_id

    async function checkTicketStatus() {

      try {

        const latestTicket = await getTicket(ticketId)

        setResult((prev) => {

          if (!prev) {
            return prev
          }

          return {
            ...prev,
            ...latestTicket,
          }
        })

      } catch (err) {

        // Status polling should not break the UI.
        // The existing result remains visible.
        console.error(
          'Failed to refresh ticket status:',
          err
        )
      }
    }


    // Check once after the result is displayed
    checkTicketStatus()


    // Then check every 5 seconds
    const interval = setInterval(
      checkTicketStatus,
      5000
    )


    return () => {
      clearInterval(interval)
    }

  }, [status, result?.ticket_id])


  // ==================================================
  // ANALYZE INCIDENT
  // ==================================================

  async function handleAnalyze(incident) {

    setStatus('loading')
    setError(null)
    setResult(null)

    try {

      const data = await analyzeIncident(incident)

      setResult(data)
      setStatus('success')

    } catch (err) {

      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err.message || 'Unexpected error.',
              'api_error'
            )

      setError(apiError)
      setStatus('error')
    }
  }


  // ==================================================
  // USER CONFIRMS ISSUE IS RESOLVED
  // ==================================================

  async function handleResolved() {

    if (
      confirmationLoading ||
      !result?.ticket_id
    ) {
      return
    }

    setConfirmationLoading(true)

    try {

      const data = await resolveTicket(
        result.ticket_id
      )

      setResult((prev) => ({
        ...prev,
        status: data.status,
      }))

      return data

    } finally {

      setConfirmationLoading(false)
    }
  }


  // ==================================================
  // USER SAYS ISSUE IS NOT RESOLVED
  // ==================================================

  async function handleNotResolved() {

    if (
      confirmationLoading ||
      !result?.ticket_id
    ) {
      return
    }

    setConfirmationLoading(true)

    try {

      const data = await keepTicketOpen(
        result.ticket_id
      )

      setResult((prev) => ({
        ...prev,
        status: data.status,
      }))

      return data

    } finally {

      setConfirmationLoading(false)
    }
  }


  // ==================================================
  // RESET / NEW INCIDENT
  // ==================================================

  function handleNewIncident() {

    setResult(null)
    setError(null)
    setStatus('idle')
    setConfirmationLoading(false)
  }


  return (
    <main className="main-content">

      {/* ==================================================
          PAGE INTRO
      ================================================== */}

      <div className="dashboard-intro">

        <div>

          <span className="card-eyebrow">
            INTELLIGENT IT OPERATIONS
          </span>

          <h2>
            ResolveAI Incident Center
          </h2>

          <p>
            Describe an IT issue and let AI analyze the incident,
            identify the likely root cause, and recommend a resolution.
          </p>

        </div>


        {status === 'success' && (

          <button
            type="button"
            className="new-incident-btn"
            onClick={handleNewIncident}
          >
            + New Incident
          </button>

        )}

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {status === 'error' && (
        <ErrorBanner error={error} />
      )}


      {/* ==================================================
          MAIN DASHBOARD
      ================================================== */}

      <div className="dashboard-grid">

        {/* ==================================================
            LEFT — INCIDENT INPUT
        ================================================== */}

        <section className="card incident-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                STEP 01
              </span>

              <h3>
                Report an incident
              </h3>

            </div>

            <div className="section-icon">
              +
            </div>

          </div>


          <div className="card-body">

            <div className="form-intro">

              <h4>
                What went wrong?
              </h4>

              <p>
                Provide the incident title and describe the
                symptoms or impact. ResolveAI will handle the
                classification automatically.
              </p>

            </div>


            <IncidentForm
              onAnalyze={handleAnalyze}
              isLoading={status === 'loading'}
            />

          </div>

        </section>


        {/* ==================================================
            RIGHT — AI ANALYSIS
        ================================================== */}

        <section className="card analysis-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                STEP 02
              </span>

              <h3>
                AI incident analysis
              </h3>

            </div>


            {status === 'success' &&
              result?.ticket_id && (

                <span className="ticket-id">
                  {result.ticket_id}
                </span>

              )}

          </div>


          <div className="card-body">

            {/* ----------------------------------------------
                LOADING
            ---------------------------------------------- */}

            {status === 'loading' && (

              <div className="ai-processing">

                <div className="ai-orb">

                  <div className="ai-orb-inner">
                    AI
                  </div>

                </div>

                <h4>
                  Analyzing incident...
                </h4>

                <p>
                  ResolveAI is identifying the category,
                  priority, root cause and recommended resolution.
                </p>

                <div className="analysis-progress">
                  <span />
                </div>

              </div>

            )}


            {/* ----------------------------------------------
                RESULT
            ---------------------------------------------- */}

            {status === 'success' &&
              result && (

                <AnalysisResult
                  result={result}
                  onResolved={()=>handleResolved()}
                  onNotResolved={()=>handleNotResolved}
                  confirmationLoading={confirmationLoading}
                />

              )}


            {/* ----------------------------------------------
                EMPTY
            ---------------------------------------------- */}

            {status === 'idle' && (

              <div className="analysis-empty">

                <div className="empty-ai-icon">
                  ✦
                </div>

                <h4>
                  Awaiting incident
                </h4>

                <p>
                  Submit an incident to start AI-powered
                  diagnosis and resolution.
                </p>

                <div className="analysis-capabilities">

                  <span>
                    AI Classification
                  </span>

                  <span>
                    Priority Detection
                  </span>

                  <span>
                    Root Cause Analysis
                  </span>

                  <span>
                    Resolution Guidance
                  </span>

                </div>

              </div>

            )}


            {/* ----------------------------------------------
                ERROR
            ---------------------------------------------- */}

            {status === 'error' && (

              <div className="analysis-error-state">

                <div className="empty-ai-icon">
                  !
                </div>

                <h4>
                  Analysis unavailable
                </h4>

                <p>
                  ResolveAI could not analyze this incident.
                  Check the backend connection and try again.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>


      {/* ==================================================
          SYSTEM CAPABILITIES
      ================================================== */}

      <section className="system-overview">

        <div className="overview-card">

          <span className="overview-number">
            01
          </span>

          <div>

            <strong>
              AI Classification
            </strong>

            <p>
              Automatically identifies the incident category.
            </p>

          </div>

        </div>


        <div className="overview-card">

          <span className="overview-number">
            02
          </span>

          <div>

            <strong>
              Smart Prioritization
            </strong>

            <p>
              Determines severity from actual business impact.
            </p>

          </div>

        </div>


        <div className="overview-card">

          <span className="overview-number">
            03
          </span>

          <div>

            <strong>
              Root Cause Analysis
            </strong>

            <p>
              Provides a likely technical cause for the issue.
            </p>

          </div>

        </div>


        <div className="overview-card">

          <span className="overview-number">
            04
          </span>

          <div>

            <strong>
              Resolution Guidance
            </strong>

            <p>
              Generates practical troubleshooting steps.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}