/**
 * ResolveAI API service
 * ----------------------
 * Single place where the frontend talks to FastAPI.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const ANALYZE_ENDPOINT_PATH = '/analyze'


// --------------------------------------------------
// API Error
// --------------------------------------------------

export class ApiError extends Error {
  constructor(message, type = 'api_error', status = null) {
    super(message)
    this.name = 'ApiError'
    this.type = type
    this.status = status
  }
}


// --------------------------------------------------
// Error Response Parser
// --------------------------------------------------

async function parseErrorBody(response) {
  try {
    const data = await response.json()

    return (
      data.detail ||
      data.message ||
      JSON.stringify(data)
    )
  } catch {
    return response.statusText || 'Unknown error'
  }
}


// --------------------------------------------------
// Backend Health Check
// --------------------------------------------------

export async function checkBackendHealth() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/health`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }
    )

    return response.ok

  } catch {
    return false
  }
}


// ==================================================
// ANALYZE INCIDENT
// ==================================================

/**
 * POST /analyze
 *
 * Sends ONLY:
 *
 * {
 *   title,
 *   description
 * }
 *
 * Backend automatically generates:
 * - Ticket ID
 * - Category
 * - Priority
 * - Root Cause
 * - Resolution
 * - Initial Status
 */

export async function analyzeIncident(incident) {

  let response

  try {

    response = await fetch(
      `${API_BASE_URL}${ANALYZE_ENDPOINT_PATH}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          title: incident.title,
          description: incident.description,
        }),

        signal: AbortSignal.timeout(30000),
      }
    )

  } catch (err) {

    if (
      err.name === 'TimeoutError' ||
      err.name === 'AbortError'
    ) {

      throw new ApiError(
        'The backend did not respond in time. It may be busy or unreachable.',
        'network'
      )
    }

    throw new ApiError(
      `Could not reach the ResolveAI backend at ${API_BASE_URL}. Is it running?`,
      'backend_unavailable'
    )
  }


  // --------------------------------------------------
  // Endpoint not found
  // --------------------------------------------------

  if (response.status === 404) {

    throw new ApiError(
      `The backend at ${API_BASE_URL} does not expose ${ANALYZE_ENDPOINT_PATH}.`,
      'not_implemented',
      404
    )
  }


  // --------------------------------------------------
  // Other API errors
  // --------------------------------------------------

  if (!response.ok) {

    const message = await parseErrorBody(response)

    throw new ApiError(
      message,
      'api_error',
      response.status
    )
  }


  // --------------------------------------------------
  // Successful response
  // --------------------------------------------------

  return response.json()
}


// ==================================================
// CONFIRM ISSUE RESOLVED
// ==================================================

/**
 * POST /tickets/{ticket_id}/resolve
 *
 * Called ONLY when the user confirms:
 *
 * "Yes, Issue Resolved"
 *
 * Backend changes the ticket to CLOSED.
 */

export async function resolveTicket(ticketId) {

  if (!ticketId) {
    throw new ApiError(
      'Ticket ID is missing.',
      'validation'
    )
  }

  let response

  try {

    response = await fetch(
      `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/resolve`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        signal: AbortSignal.timeout(10000),
      }
    )

  } catch (err) {

    if (
      err.name === 'TimeoutError' ||
      err.name === 'AbortError'
    ) {

      throw new ApiError(
        'The backend did not respond while closing the ticket.',
        'network'
      )
    }

    throw new ApiError(
      'Could not reach the ResolveAI backend.',
      'backend_unavailable'
    )
  }


  if (!response.ok) {

    const message = await parseErrorBody(response)

    throw new ApiError(
      message,
      'api_error',
      response.status
    )
  }


  return response.json()
}


// ==================================================
// ISSUE NOT RESOLVED
// ==================================================

/**
 * POST /tickets/{ticket_id}/keep-open
 *
 * Called when the user says:
 *
 * "No, Still Having Issue"
 *
 * The ticket remains OPEN.
 *
 * The backend's one-hour rule can later change
 * the status to IN PROGRESS.
 */

export async function keepTicketOpen(ticketId) {

  if (!ticketId) {
    throw new ApiError(
      'Ticket ID is missing.',
      'validation'
    )
  }

  let response

  try {

    response = await fetch(
      `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/keep-open`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        signal: AbortSignal.timeout(10000),
      }
    )

  } catch (err) {

    if (
      err.name === 'TimeoutError' ||
      err.name === 'AbortError'
    ) {

      throw new ApiError(
        'The backend did not respond while updating the ticket.',
        'network'
      )
    }

    throw new ApiError(
      'Could not reach the ResolveAI backend.',
      'backend_unavailable'
    )
  }


  if (!response.ok) {

    const message = await parseErrorBody(response)

    throw new ApiError(
      message,
      'api_error',
      response.status
    )
  }


  return response.json()
}

// ==================================================
// GET CURRENT TICKET STATUS
// ==================================================

export async function getTicket(ticketId) {
  if (!ticketId) {
    throw new ApiError(
      'Ticket ID is missing.',
      'validation'
    )
  }

  let response

  try {
    response = await fetch(
      `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      }
    )
  } catch (err) {
    throw new ApiError(
      'Could not reach the ResolveAI backend.',
      'backend_unavailable'
    )
  }

  if (!response.ok) {
    const message = await parseErrorBody(response)

    throw new ApiError(
      message,
      'api_error',
      response.status
    )
  }

  return response.json()
}