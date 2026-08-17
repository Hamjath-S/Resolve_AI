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
  } = result

  const [confirmation, setConfirmation] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // --------------------------------------------------
  // RESET WHEN NEW TICKET IS ANALYZED
  // --------------------------------------------------

  useEffect(() => {
    setConfirmation(null)
    setIsUpdating(false)
  }, [ticketId])

  // --------------------------------------------------
  // RESOLVE TICKET
  // --------------------------------------------------

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

  // --------------------------------------------------
  // KEEP TICKET OPEN
  // --------------------------------------------------

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

  // --------------------------------------------------
  // DISPLAY STATUS
  // --------------------------------------------------

  let displayedStatus = status || 'Open'

  if (confirmation === 'resolved') {
    displayedStatus = 'Closed'
  }

  if (confirmation === 'not-resolved') {
    displayedStatus = 'Open'
  }

  // --------------------------------------------------
  // FORMAT CREATED TIME
  // --------------------------------------------------

  function formatCreatedAt(value) {
    if (!value) return 'Just now'

    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
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
            ResolveAI analyzed the reported incident and generated
            a recommended troubleshooting path.
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

        {/* CATEGORY */}

        <div className="summary-card">

          <span className="summary-label">
            CATEGORY
          </span>

          <strong className="summary-category">
            {category || 'Uncategorized'}
          </strong>

        </div>


        {/* PRIORITY */}

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


        {/* STATUS */}

        <div className="summary-card">

          <span className="summary-label">
            STATUS
          </span>

          <div>
            <StatusBadge value={displayedStatus} />
          </div>

        </div>


        {/* CREATED */}

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
          AI DIAGNOSIS
          ================================================== */}

      <div className="result-section">

        <div className="result-section-header">

          <div className="result-section-number">
            01
          </div>

          <div>
            <span className="result-section-label">
              AI DIAGNOSIS
            </span>

            <h4>Likely root cause</h4>
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
            02
          </div>

          <div>
            <span className="result-section-label">
              RESOLUTION
            </span>

            <h4>Recommended troubleshooting</h4>
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
          RESOLVED CONFIRMATION
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
          NOT RESOLVED CONFIRMATION
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