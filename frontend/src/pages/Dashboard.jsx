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

  const [confirmationLoading, setConfirmationLoading] =
    useState(false)


  // ==================================================
  // AUTOMATIC TICKET STATUS POLLING
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

        const latestTicket =
          await getTicket(ticketId)


        setResult((previous) => {

          if (!previous) {
            return previous
          }


          return {
            ...previous,
            ...latestTicket,
          }

        })

      } catch (err) {

        console.error(
          'Failed to refresh ticket status:',
          err
        )

      }

    }


    // Check immediately
    checkTicketStatus()


    // Then every 5 seconds
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

      const data =
        await analyzeIncident(incident)


      setResult(data)

      setStatus('success')


    } catch (err) {

      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err.message ||
                'Unexpected error.',
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

      const data =
        await resolveTicket(
          result.ticket_id
        )


      setResult((previous) => ({

        ...previous,

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

      const data =
        await keepTicketOpen(
          result.ticket_id
        )


      setResult((previous) => ({

        ...previous,

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


  // ==================================================
  // AUTONOMOUS AGENT TOOL STATUS
  // ==================================================

  const toolsUsed =
    result?.tools_used || []


  const agentCompleted =
    result?.agent_status === 'completed'


  const knowledgeUsed =
    toolsUsed.includes(
      'knowledge_search'
    )


  const similarIncidentUsed =
    toolsUsed.includes(
      'similar_incident_search'
    )


  const ticketLookupUsed =
    toolsUsed.includes(
      'ticket_lookup'
    )


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

        <ErrorBanner
          error={error}
        />

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
              isLoading={
                status === 'loading'
              }
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


            {/* ==================================================
                LOADING
                ================================================== */}

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


            {/* ==================================================
                RESULT
                ================================================== */}

            {status === 'success' &&
              result && (

                <>

                  <AnalysisResult
                    result={result}
                    onResolved={handleResolved}
                    onNotResolved={handleNotResolved}
                    confirmationLoading={
                      confirmationLoading
                    }
                  />


                  {/* ==================================================
                      AUTONOMOUS AGENT ACTIVITY
                      ================================================== */}

                  <div
                    style={{
                      marginTop: '32px',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      background: 'rgba(248, 250, 252, 0.7)',
                    }}
                  >

                    {/* HEADER */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                      }}
                    >

                      <div>

                        <span
                          className="card-eyebrow"
                        >
                          AGENT INTELLIGENCE
                        </span>


                        <h4
                          style={{
                            marginTop: '6px',
                            marginBottom: '4px',
                          }}
                        >
                          Autonomous Agent Activity
                        </h4>


                        <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            opacity: 0.7,
                          }}
                        >
                          ResolveAI gathered evidence
                          before generating the diagnosis.
                        </p>

                      </div>


                      <div
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background:
                            agentCompleted
                              ? '#dcfce7'
                              : '#fef3c7',
                          color:
                            agentCompleted
                              ? '#166534'
                              : '#92400e',
                        }}
                      >
                        {agentCompleted
                          ? '✓ Completed'
                          : 'Processing'}
                      </div>

                    </div>


                    {/* ==================================================
                        AGENT EXECUTION EVENTS
                        ================================================== */}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px',
                      }}
                    >

                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          background: 'white',
                          border:
                            '1px solid rgba(100,116,139,0.15)',
                        }}
                      >

                        <div
                          style={{
                            fontSize: '12px',
                            opacity: 0.6,
                            marginBottom: '6px',
                          }}
                        >
                          EXECUTION EVENTS
                        </div>


                        <strong
                          style={{
                            fontSize: '24px',
                          }}
                        >
                          {result.agent_steps || 0}
                        </strong>

                      </div>


                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          background: 'white',
                          border:
                            '1px solid rgba(100,116,139,0.15)',
                        }}
                      >

                        <div
                          style={{
                            fontSize: '12px',
                            opacity: 0.6,
                            marginBottom: '6px',
                          }}
                        >
                          AGENT STATUS
                        </div>


                        <strong>
                          {result.agent_status ||
                            'Unknown'}
                        </strong>

                      </div>


                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          background: 'white',
                          border:
                            '1px solid rgba(100,116,139,0.15)',
                        }}
                      >

                        <div
                          style={{
                            fontSize: '12px',
                            opacity: 0.6,
                            marginBottom: '6px',
                          }}
                        >
                          TOOLS USED
                        </div>


                        <strong
                          style={{
                            fontSize: '24px',
                          }}
                        >
                          {toolsUsed.length}
                        </strong>

                      </div>

                    </div>


                    {/* ==================================================
                        AGENT WORKFLOW
                        ================================================== */}

                    <div>

                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          letterSpacing: '1px',
                          opacity: 0.6,
                          marginBottom: '12px',
                        }}
                      >
                        AGENT WORKFLOW
                      </div>


                      {/* INCIDENT INTAKE */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                        }}
                      >

                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#dcfce7',
                            color: '#166534',
                            fontWeight: '700',
                          }}
                        >
                          ✓
                        </span>


                        <span>
                          Incident Intake
                        </span>

                      </div>


                      {/* KNOWLEDGE SEARCH */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                        }}
                      >

                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              knowledgeUsed
                                ? '#dcfce7'
                                : '#f1f5f9',
                            color:
                              knowledgeUsed
                                ? '#166534'
                                : '#64748b',
                            fontWeight: '700',
                          }}
                        >
                          {knowledgeUsed
                            ? '✓'
                            : '—'}
                        </span>


                        <span>
                          Knowledge Retrieval
                        </span>

                      </div>


                      {/* SIMILAR INCIDENT SEARCH */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                        }}
                      >

                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              similarIncidentUsed
                                ? '#dcfce7'
                                : '#f1f5f9',
                            color:
                              similarIncidentUsed
                                ? '#166534'
                                : '#64748b',
                            fontWeight: '700',
                          }}
                        >
                          {similarIncidentUsed
                            ? '✓'
                            : '—'}
                        </span>


                        <span>
                          Similar Incident Search
                        </span>

                      </div>


                      {/* TICKET LOOKUP */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                        }}
                      >

                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              ticketLookupUsed
                                ? '#dcfce7'
                                : '#f1f5f9',
                            color:
                              ticketLookupUsed
                                ? '#166534'
                                : '#64748b',
                            fontWeight: '700',
                          }}
                        >
                          {ticketLookupUsed
                            ? '✓'
                            : '—'}
                        </span>


                        <span>
                          Ticket Lookup
                        </span>

                      </div>


                      {/* AI REASONING */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                        }}
                      >

                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: agentCompleted
                              ? '#dcfce7'
                              : '#f1f5f9',
                            color: agentCompleted
                              ? '#166534'
                              : '#64748b',
                            fontWeight: '700',
                          }}
                        >
                          {agentCompleted
                            ? '✓'
                            : '—'}
                        </span>


                        <span>
                          AI Reasoning & Analysis
                        </span>

                      </div>


                      {/* RESOLUTION */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                        }}
                      >

                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: agentCompleted
                              ? '#dcfce7'
                              : '#f1f5f9',
                            color: agentCompleted
                              ? '#166534'
                              : '#64748b',
                            fontWeight: '700',
                          }}
                        >
                          {agentCompleted
                            ? '✓'
                            : '—'}
                        </span>


                        <span>
                          Resolution Planning
                        </span>

                      </div>

                    </div>


                    {/* ==================================================
                        TOOLS
                        ================================================== */}

                    {toolsUsed.length > 0 && (

                      <div
                        style={{
                          marginTop: '20px',
                          paddingTop: '18px',
                          borderTop:
                            '1px solid rgba(100,116,139,0.15)',
                        }}
                      >

                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            opacity: 0.6,
                            marginBottom: '10px',
                          }}
                        >
                          TOOLS USED
                        </div>


                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >

                          {toolsUsed.map(
                            (tool) => (

                              <span
                                key={tool}
                                style={{
                                  padding:
                                    '7px 11px',
                                  borderRadius:
                                    '20px',
                                  background:
                                    '#eef2ff',
                                  color:
                                    '#3730a3',
                                  fontSize:
                                    '12px',
                                  fontWeight:
                                    '600',
                                }}
                              >
                                {tool
                                  .replaceAll(
                                    '_',
                                    ' '
                                  )
                                  .replace(
                                    /\b\w/g,
                                    (letter) =>
                                      letter.toUpperCase()
                                  )}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    )}

                  </div>

                </>

              )}


            {/* ==================================================
                EMPTY
                ================================================== */}

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


            {/* ==================================================
                ERROR
                ================================================== */}

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