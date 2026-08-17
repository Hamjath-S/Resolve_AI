import { useState } from 'react'

const EMPTY_INCIDENT = {
  title: '',
  description: '',
}

export default function IncidentForm({ onAnalyze, isLoading }) {
  const [incident, setIncident] = useState(EMPTY_INCIDENT)
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    setIncident((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }

  function validate() {
    const nextErrors = {}

    if (!incident.title.trim()) {
      nextErrors.title = 'Title is required.'
    }

    if (!incident.description.trim()) {
      nextErrors.description = 'Description is required.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) return

    // Send ONLY the issue details to the backend.
    // Ticket ID, category, priority and status
    // are handled by the backend/AI.
    onAnalyze({
      title: incident.title.trim(),
      description: incident.description.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* --------------------------------------------- */}
      {/* INCIDENT TITLE */}
      {/* --------------------------------------------- */}

      <div className="field">
        <label htmlFor="incident-title">
          Incident title
        </label>

        <input
          id="incident-title"
          className={errors.title ? 'field-error' : ''}
          placeholder="e.g. Login failure on production"
          value={incident.title}
          onChange={(e) =>
            updateField('title', e.target.value)
          }
          disabled={isLoading}
        />

        {errors.title && (
          <p className="field-error-msg">
            {errors.title}
          </p>
        )}
      </div>


      {/* --------------------------------------------- */}
      {/* INCIDENT DESCRIPTION */}
      {/* --------------------------------------------- */}

      <div className="field">
        <label htmlFor="incident-description">
          Description
        </label>

        <textarea
          id="incident-description"
          className={errors.description ? 'field-error' : ''}
          placeholder="Describe symptoms, affected systems, and when it started…"
          value={incident.description}
          onChange={(e) =>
            updateField('description', e.target.value)
          }
          disabled={isLoading}
        />

        {errors.description && (
          <p className="field-error-msg">
            {errors.description}
          </p>
        )}
      </div>


      {/* --------------------------------------------- */}
      {/* ANALYZE BUTTON */}
      {/* --------------------------------------------- */}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          'Analyzing…'
        ) : (
          <>
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2l1.8 5.6L19 9.5l-5.2 1.9L12 17l-1.8-5.6L5 9.5l5.2-1.9L12 2z"
                fill="currentColor"
              />
            </svg>

            Analyze Incident
          </>
        )}
      </button>

    </form>
  )
}