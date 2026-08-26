import { useState } from 'react'

const EMPTY_INCIDENT = {
  title: '',
  description: '',
}

export default function IncidentForm({
  onAnalyze,
  isLoading,
}) {
  const [incident, setIncident] =
    useState(EMPTY_INCIDENT)

  const [errors, setErrors] =
    useState({})


  // ==================================================
  // UPDATE FORM FIELD
  // ==================================================

  function updateField(field, value) {
    setIncident((previous) => ({
      ...previous,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: null,
      }))
    }
  }


  // ==================================================
  // VALIDATION
  // ==================================================

  function validate() {
    const nextErrors = {}

    if (!incident.title.trim()) {
      nextErrors.title =
        'Incident title is required.'
    }

    if (!incident.description.trim()) {
      nextErrors.description =
        'Incident description is required.'
    }

    if (
      incident.title.trim() &&
      incident.title.trim().length < 5
    ) {
      nextErrors.title =
        'Please provide a more descriptive incident title.'
    }

    if (
      incident.description.trim() &&
      incident.description.trim().length < 15
    ) {
      nextErrors.description =
        'Please provide more details about the incident.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }


  // ==================================================
  // SUBMIT INCIDENT
  // ==================================================

  function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) {
      return
    }

    if (!validate()) {
      return
    }

    /*
     * IMPORTANT
     *
     * Only send:
     *
     * title
     * description
     *
     * The backend / AI agent is responsible for:
     *
     * - Ticket ID
     * - Category
     * - Priority
     * - Root cause
     * - Resolution
     * - Status
     */

    onAnalyze({
      title: incident.title.trim(),
      description: incident.description.trim(),
    })
  }


  return (
    <form
      className="incident-form"
      onSubmit={handleSubmit}
      noValidate
    >

      {/* ==================================================
          AI ENGINE STATUS
          ================================================== */}

      <div className="form-status">

        <span className="form-status-dot" />

        <span>
          AI diagnosis engine ready
        </span>

      </div>


      {/* ==================================================
          INCIDENT TITLE
          ================================================== */}

      <div className="field">

        <div className="field-header">

          <label htmlFor="incident-title">
            Incident title
          </label>

          <span>
            REQUIRED
          </span>

        </div>


        <div className="input-wrapper">

          <span className="input-prefix">
            #
          </span>

          <input
            id="incident-title"
            type="text"
            className={
              errors.title
                ? 'field-error'
                : ''
            }
            placeholder="e.g. Production users unable to login"
            value={incident.title}
            onChange={(event) =>
              updateField(
                'title',
                event.target.value
              )
            }
            disabled={isLoading}
            autoComplete="off"
            maxLength={120}
          />

        </div>


        <div className="field-meta">

          {errors.title ? (
            <p className="field-error-msg">
              {errors.title}
            </p>
          ) : (
            <span>
              Use a short, descriptive incident title.
            </span>
          )}

          <span>
            {incident.title.length}/120
          </span>

        </div>

      </div>


      {/* ==================================================
          INCIDENT DESCRIPTION
          ================================================== */}

      <div className="field">

        <div className="field-header">

          <label htmlFor="incident-description">
            Incident description
          </label>

          <span>
            REQUIRED
          </span>

        </div>


        <div className="textarea-wrapper">

          <textarea
            id="incident-description"
            className={
              errors.description
                ? 'field-error'
                : ''
            }
            placeholder={
              'Describe what happened, affected users, ' +
              'error messages, affected systems, and when the issue started…'
            }
            value={incident.description}
            onChange={(event) =>
              updateField(
                'description',
                event.target.value
              )
            }
            disabled={isLoading}
            maxLength={3000}
          />

          <div className="textarea-corner">
            ✦
          </div>

        </div>


        <div className="field-meta">

          {errors.description ? (
            <p className="field-error-msg">
              {errors.description}
            </p>
          ) : (
            <span>
              More technical context helps the AI agent.
            </span>
          )}

          <span>
            {incident.description.length}/3000
          </span>

        </div>

      </div>


      {/* ==================================================
          AI CAPABILITIES
          ================================================== */}

      <div className="form-capabilities">

        <div className="capability-item">

          <span className="capability-icon">
            ◈
          </span>

          <span>
            Classification
          </span>

        </div>


        <div className="capability-item">

          <span className="capability-icon">
            ◉
          </span>

          <span>
            Prioritization
          </span>

        </div>


        <div className="capability-item">

          <span className="capability-icon">
            ✦
          </span>

          <span>
            Root Cause
          </span>

        </div>


        <div className="capability-item">

          <span className="capability-icon">
            ✓
          </span>

          <span>
            Resolution
          </span>

        </div>

      </div>


      {/* ==================================================
          ANALYZE BUTTON
          ================================================== */}

      <button
        type="submit"
        className="btn btn-primary analyze-button"
        disabled={isLoading}
      >

        {isLoading ? (

          <>
            <span className="button-spinner" />

            <span>
              AI is analyzing incident…
            </span>
          </>

        ) : (

          <>
            <span className="analyze-icon">
              ✦
            </span>

            <span>
              Analyze Incident
            </span>

            <span className="button-arrow">
              →
            </span>
          </>

        )}

      </button>


      {/* ==================================================
          SECURITY / PROCESS NOTE
          ================================================== */}

      <div className="form-security-note">

        <span className="security-icon">
          ◇
        </span>

        <span>
          ResolveAI will analyze the incident using its
          knowledge base and AI reasoning engine.
        </span>

      </div>

    </form>
  )
}