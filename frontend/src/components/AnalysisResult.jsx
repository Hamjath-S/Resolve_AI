import { useEffect, useState } from 'react'
import { PriorityBadge, StatusBadge } from './Badges.jsx'

export default function AnalysisResult({
  result,
  onResolved,
  onNotResolved,
}) {
  const {
    ticket_id: ticketId,
    category,
    priority,
    root_cause: rootCause,
    resolution,
    status,
    created_at: createdAt,

    // Autonomous agent
    agent_status: agentStatus,
    agent_steps: agentSteps,
    tools_used: toolsUsed = [],
    execution_trace: executionTrace = [],

    // RAG / evidence
    retrieved_knowledge: retrievedKnowledge = [],
    similar_incidents: similarIncidents = [],
  } = result

  const [confirmation, setConfirmation] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // ==================================================
  // RESET WHEN NEW TICKET IS ANALYZED
  // ==================================================

  useEffect(() => {
    setConfirmation(null)
    setIsUpdating(false)
  }, [ticketId])

  // ==================================================
  // RESOLVE TICKET
  // ==================================================

  async function handleResolved() {
    if (isUpdating || confirmation) return

    setIsUpdating(true)

    try {
      await onResolved(ticketId)
      setConfirmation('resolved')
    } catch (error) {
      console.error('Failed to close ticket:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // ==================================================
  // KEEP TICKET OPEN
  // ==================================================

  async function handleNotResolved() {
    if (isUpdating || confirmation) return

    setIsUpdating(true)

    try {
      await onNotResolved(ticketId)
      setConfirmation('not-resolved')
    } catch (error) {
      console.error('Failed to keep ticket open:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // ==================================================
  // DISPLAY STATUS
  // ==================================================

  let displayedStatus = status || 'Open'

  if (confirmation === 'resolved') {
    displayedStatus = 'Closed'
  }

  if (confirmation === 'not-resolved') {
    displayedStatus = 'Open'
  }

  // ==================================================
  // FORMAT DATE
  // ==================================================

  function formatCreatedAt(value) {
    if (!value) return 'Just now'

    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  // ==================================================
  // FORMAT ACTION NAME
  // ==================================================

  function formatAction(action) {
    if (!action) return 'Unknown action'

    return String(action)
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // ==================================================
  // FORMAT EVENT STATUS
  // ==================================================

  function getEventStatus(event) {
    switch (event?.status) {
      case 'completed':
        return 'Completed'

      case 'failed':
        return 'Failed'

      case 'skipped':
        return 'Skipped'

      case 'decided':
        return 'Decision made'

      case 'running':
        return 'Running'

      default:
        return event?.status
          ? formatAction(event.status)
          : 'Unknown'
    }
  }

  // ==================================================
  // EVENT ICON
  // ==================================================

  function getEventIcon(event) {
    if (event?.status === 'failed') return '×'

    if (event?.status === 'completed') return '✓'

    if (event?.status === 'decided') return '◆'

    if (event?.type === 'ai_analysis') return '✦'

    if (event?.type === 'tool') return '⚙'

    return '•'
  }

  // ==================================================
  // EVENT CLASS
  // ==================================================

  function getEventClass(event) {
    if (event?.status === 'failed') {
      return 'failed'
    }

    if (event?.status === 'completed') {
      return 'completed'
    }

    if (event?.status === 'decided') {
      return 'decision'
    }

    return 'default'
  }

  // ==================================================
  // KNOWLEDGE SOURCE
  // ==================================================

  function getKnowledgeSource(item, index) {
    return (
      item?.source ||
      item?.metadata?.source ||
      item?.metadata?.file_name ||
      item?.metadata?.filename ||
      `Knowledge ${index + 1}`
    )
  }

  // ==================================================
  // KNOWLEDGE CONTENT
  // ==================================================

  function getKnowledgeContent(item) {
    return (
      item?.content ||
      item?.text ||
      item?.chunk ||
      item?.document ||
      'No knowledge content available.'
    )
  }

  return (
    <div className="analysis-result">

      {/* ==================================================
          TICKET HEADER
          ================================================== */}

      <div className="result-hero">

        <div>
          <span className="result-eyebrow">
            INCIDENT ANALYSIS COMPLETE
          </span>

          <h3 className="result-title">
            AI Diagnostic Report
          </h3>

          <p className="result-subtitle">
            ResolveAI analyzed the reported incident and
            generated a recommended troubleshooting path.
          </p>
        </div>

        <div className="result-ticket-box">
          <span>Ticket</span>

          <strong>
            {ticketId || 'Generating...'}
          </strong>
        </div>

      </div>


      {/* ==================================================
          QUICK SUMMARY
          ================================================== */}

      <div className="result-summary-grid">

        <div className="summary-card">
          <span className="summary-label">
            CATEGORY
          </span>

          <strong className="summary-category">
            {category || 'Uncategorized'}
          </strong>
        </div>


        <div className="summary-card">
          <span className="summary-label">
            PRIORITY
          </span>

          <div>
            {priority ? (
              <PriorityBadge value={priority} />
            ) : (
              '—'
            )}
          </div>
        </div>


        <div className="summary-card">
          <span className="summary-label">
            STATUS
          </span>

          <div>
            <StatusBadge value={displayedStatus} />
          </div>
        </div>


        <div className="summary-card">
          <span className="summary-label">
            CREATED
          </span>

          <strong className="summary-time">
            {formatCreatedAt(createdAt)}
          </strong>
        </div>

      </div>


      {/* ==================================================
          AUTONOMOUS AGENT
          ================================================== */}

      <div className="result-section">

        <div className="result-section-header">

          <div className="result-section-number">
            AI
          </div>

          <div>
            <span className="result-section-label">
              AUTONOMOUS AGENT
            </span>

            <h4>
              Agent execution trace
            </h4>
          </div>

        </div>


        {/* AGENT OVERVIEW */}

        <div className="agent-overview">

          <div className="agent-stat">
            <span>AGENT STATUS</span>

            <strong>
              {agentStatus
                ? formatAction(agentStatus)
                : 'Completed'}
            </strong>
          </div>


          <div className="agent-stat">
            <span>EXECUTION EVENTS</span>

            <strong>
              {executionTrace.length}
            </strong>
          </div>


          <div className="agent-stat">
            <span>TOOLS USED</span>

            <strong>
              {[...new Set(toolsUsed)].length}
            </strong>
          </div>

        </div>


        {/* ==================================================
            TOOLS USED
            ================================================== */}

        {toolsUsed.length > 0 && (

          <div className="agent-tools">

            <span className="evidence-label">
              TOOLS USED
            </span>

            <div className="tool-list">

              {[...new Set(toolsUsed)].map((tool) => (

                <span
                  className="tool-chip"
                  key={tool}
                >
                  {formatAction(tool)}
                </span>

              ))}

            </div>

          </div>

        )}


        {/* ==================================================
            EXECUTION TRACE
            ================================================== */}

        {executionTrace.length > 0 ? (

          <div className="execution-trace">

            {executionTrace.map((event, index) => (

              <div
                className={`execution-event execution-event-${getEventClass(event)}`}
                key={`${event?.step ?? 'step'}-${event?.action ?? 'action'}-${event?.status ?? 'status'}-${index}`}
              >

                {/* TIMELINE */}

                <div className="execution-event-marker">

                  <div className="execution-event-icon">
                    {getEventIcon(event)}
                  </div>

                  {index < executionTrace.length - 1 && (
                    <div className="execution-event-line" />
                  )}

                </div>


                {/* EVENT CONTENT */}

                <div className="execution-event-content">

                  <div className="execution-event-top">

                    <div className="execution-event-title">

                      <strong>
                        {formatAction(event?.action)}
                      </strong>

                      {event?.type && (
                        <span className="execution-event-type">
                          {formatAction(event.type)}
                        </span>
                      )}

                    </div>

                    <span className="execution-event-status">
                      {getEventStatus(event)}
                    </span>

                  </div>


                  {event?.reason && (
                    <p className="execution-event-reason">
                      {event.reason}
                    </p>
                  )}


                  {event?.result_count !== undefined && (
                    <div className="execution-event-result">
                      Results retrieved:
                      <strong>
                        {event.result_count}
                      </strong>
                    </div>
                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="execution-empty">
            No execution trace was returned by the autonomous agent.
          </div>

        )}

      </div>


      {/* ==================================================
          RAG KNOWLEDGE
          ================================================== */}

      <div className="result-section">

        <div className="result-section-header">

          <div className="result-section-number">
            03
          </div>

          <div>
            <span className="result-section-label">
              RAG KNOWLEDGE
            </span>

            <h4>
              Retrieved knowledge
            </h4>
          </div>

        </div>


        {retrievedKnowledge.length > 0 ? (

          <div className="knowledge-results">

            {retrievedKnowledge.map((item, index) => (

              <div
                className="knowledge-card"
                key={`${getKnowledgeSource(item, index)}-${index}`}
              >

                <div className="knowledge-card-header">

                  <div className="knowledge-title">

                    <span className="knowledge-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <strong>
                      Knowledge #{index + 1}
                    </strong>

                  </div>


                  <span className="knowledge-source">
                    {getKnowledgeSource(item, index)}
                  </span>

                </div>


                <div className="knowledge-content">

                  {getKnowledgeContent(item)}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="evidence-empty">
            No RAG knowledge was retrieved for this incident.
          </div>

        )}

      </div>


      {/* ==================================================
          SIMILAR HISTORICAL INCIDENTS
          ================================================== */}

      <div className="result-section">

        <div className="result-section-header">

          <div className="result-section-number">
            04
          </div>

          <div>
            <span className="result-section-label">
              INCIDENT MEMORY
            </span>

            <h4>
              Similar historical incidents
            </h4>
          </div>

        </div>


        {similarIncidents.length > 0 ? (

          <div className="similar-incidents">

            {similarIncidents.map((item, index) => {

              const historical =
                item?.incident || item || {}

              return (

                <div
                  className="similar-incident-card"
                  key={index}
                >

                  <div className="similar-score">

                    <span>
                      SIMILARITY
                    </span>

                    <strong>
                      {item?.similarity ?? '—'}
                    </strong>

                  </div>


                  <div className="similar-incident-content">

                    <strong>
                      {historical.title ||
                        'Historical incident'}
                    </strong>

                    <p>
                      {historical.description ||
                        'No description available.'}
                    </p>

                    <small>

                      Ticket:{' '}
                      {historical.ticket_id || 'N/A'}

                      {' • '}

                      Status:{' '}
                      {historical.status || 'N/A'}

                      {' • '}

                      Priority:{' '}
                      {historical.priority || 'N/A'}

                    </small>

                  </div>

                </div>

              )
            })}

          </div>

        ) : (

          <div className="evidence-empty">
            No similar historical incidents were found.
          </div>

        )}

      </div>


      {/* ==================================================
          AI DIAGNOSIS
          ================================================== */}

      <div className="result-section">

        <div className="result-section-header">

          <div className="result-section-number">
            05
          </div>

          <div>
            <span className="result-section-label">
              AI DIAGNOSIS
            </span>

            <h4>
              Likely root cause
            </h4>
          </div>

        </div>


        <div className="diagnosis-box">

          <div className="diagnosis-icon">
            AI
          </div>

          <p>
            {rootCause ||
              'The AI model did not provide a root cause.'}
          </p>

        </div>

      </div>


      {/* ==================================================
          RECOMMENDED RESOLUTION
          ================================================== */}

      <div className="result-section">

        <div className="result-section-header">

          <div className="result-section-number">
            06
          </div>

          <div>
            <span className="result-section-label">
              RESOLUTION
            </span>

            <h4>
              Recommended troubleshooting
            </h4>
          </div>

        </div>


        <div className="resolution-box">

          <div className="resolution-icon">
            ✓
          </div>

          <div className="resolution-content">

            <p>
              {resolution ||
                'No resolution steps were provided by the AI model.'}
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          USER CONFIRMATION
          ================================================== */}

      {!confirmation && (

        <div className="confirmation-card">

          <div className="confirmation-icon">
            ?
          </div>

          <div className="confirmation-content">

            <span className="confirmation-label">
              USER CONFIRMATION REQUIRED
            </span>

            <h4>
              Did this resolve your issue?
            </h4>

            <p>
              ResolveAI will only close this ticket after
              you explicitly confirm that the recommended
              resolution fixed the incident.
            </p>

            <div className="confirmation-actions">

              <button
                type="button"
                className="confirm-btn confirm-btn-success"
                onClick={handleResolved}
                disabled={isUpdating}
              >
                <span className="confirm-btn-icon">
                  ✓
                </span>

                {isUpdating
                  ? 'Updating ticket...'
                  : 'Yes, Issue Resolved'}
              </button>


              <button
                type="button"
                className="confirm-btn confirm-btn-open"
                onClick={handleNotResolved}
                disabled={isUpdating}
              >
                <span className="confirm-btn-icon">
                  ×
                </span>

                {isUpdating
                  ? 'Updating ticket...'
                  : 'No, Still Having Issue'}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          RESOLVED
          ================================================== */}

      {confirmation === 'resolved' && (

        <div className="confirmation-result confirmation-result-success">

          <div className="confirmation-result-icon">
            ✓
          </div>

          <div>

            <strong>
              Issue confirmed as resolved
            </strong>

            <p>
              Ticket <span>{ticketId}</span> has been
              successfully closed.
            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          NOT RESOLVED
          ================================================== */}

      {confirmation === 'not-resolved' && (

        <div className="confirmation-result confirmation-result-open">

          <div className="confirmation-result-icon">
            !
          </div>

          <div>

            <strong>
              Incident remains open
            </strong>

            <p>
              The issue is still unresolved. Ticket{' '}
              <span>{ticketId}</span> remains open for
              further investigation.
            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          FINAL STATUS
          ================================================== */}

      <div className="final-status-row">

        <div>

          <span className="final-status-label">
            CURRENT TICKET STATUS
          </span>

          <p>
            {displayedStatus === 'Closed'
              ? 'Resolution confirmed by the user.'
              : displayedStatus === 'In Progress'
                ? 'Incident is currently being investigated.'
                : 'Waiting for resolution confirmation.'}
          </p>

        </div>

        <StatusBadge value={displayedStatus} />

      </div>

    </div>
  )
}