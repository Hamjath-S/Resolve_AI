/**
 * ResolveAI API service
 * ----------------------
 * Single place where the frontend talks to FastAPI.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const ANALYZE_ENDPOINT_PATH = '/analyze'

// IMPORTANT:
// Use ONE token key everywhere in the application.
const TOKEN_KEY = 'access_token'


// ==================================================
// AUTH TOKEN
// ==================================================

export function setAuthToken(token) {

  if (!token) {
    return
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  )
}


export function getAuthToken() {

  return localStorage.getItem(
    TOKEN_KEY
  )
}


export function clearAuthToken() {

  localStorage.removeItem(
    TOKEN_KEY
  )

  // Remove old token key if it exists
  // from previous versions of the application.
  localStorage.removeItem(
    'resolveai_access_token'
  )
}


// ==================================================
// AUTH HEADERS
// ==================================================

export function getAuthHeaders() {

  const token =
    getAuthToken()

  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}


// ==================================================
// API ERROR
// ==================================================

export class ApiError extends Error {

  constructor(
    message,
    type = 'api_error',
    status = null
  ) {

    super(message)

    this.name = 'ApiError'

    this.type = type

    this.status = status
  }
}


// ==================================================
// ERROR RESPONSE PARSER
// ==================================================

async function parseErrorBody(response) {

  try {

    const data =
      await response.json()

    return (
      data.detail ||
      data.message ||
      JSON.stringify(data)
    )

  } catch {

    return (
      response.statusText ||
      'Unknown error'
    )
  }
}


// ==================================================
// BACKEND HEALTH CHECK
// ==================================================

export async function checkBackendHealth() {

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/health`,
        {
          method: 'GET',
          signal:
            AbortSignal.timeout(300000),
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

export async function analyzeIncident(
  incident
) {

  if (!incident) {

    throw new ApiError(
      'Incident data is missing.',
      'validation'
    )
  }


  if (!incident.title?.trim()) {

    throw new ApiError(
      'Incident title is required.',
      'validation'
    )
  }


  if (!incident.description?.trim()) {

    throw new ApiError(
      'Incident description is required.',
      'validation'
    )
  }


  const token =
    getAuthToken()


  // ==================================================
  // AUTHENTICATION CHECK
  // ==================================================

  if (!token) {

    throw new ApiError(
      'You are not signed in. Please sign in again.',
      'authentication',
      401
    )
  }


  let response


  // ==================================================
  // CALL BACKEND
  // ==================================================

  try {

    response =
      await fetch(
        `${API_BASE_URL}${ANALYZE_ENDPOINT_PATH}`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            ...getAuthHeaders(),
          },

          body: JSON.stringify({

            title:
              incident.title.trim(),

            description:
              incident.description.trim(),

          }),

          signal:
            AbortSignal.timeout(300000),
        }
      )

  } catch (err) {

    if (
      err.name === 'TimeoutError' ||
      err.name === 'AbortError'
    ) {

      throw new ApiError(

        'The backend did not respond in time. The AI agent may still be processing the incident.',

        'network'

      )
    }


    throw new ApiError(

      `Could not reach the ResolveAI backend at ${API_BASE_URL}. Is it running?`,

      'backend_unavailable'

    )
  }


  // ==================================================
  // AUTHENTICATION ERROR
  // ==================================================

  if (response.status === 401) {

    console.warn(
      'ResolveAI authentication token is invalid or expired.'
    )


    clearAuthToken()


    localStorage.removeItem(
      'resolveai_authenticated'
    )


    localStorage.removeItem(
      'resolveai_user'
    )


    throw new ApiError(

      'Your session has expired. Please sign in again.',

      'authentication',

      401

    )
  }


  // ==================================================
  // ENDPOINT NOT FOUND
  // ==================================================

  if (response.status === 404) {

    throw new ApiError(

      `The backend at ${API_BASE_URL} does not expose ${ANALYZE_ENDPOINT_PATH}.`,

      'not_implemented',

      404

    )
  }


  // ==================================================
  // OTHER API ERRORS
  // ==================================================

  if (!response.ok) {

    const message =
      await parseErrorBody(response)


    throw new ApiError(

      message,

      'api_error',

      response.status

    )
  }


  // ==================================================
  // SUCCESSFUL RESPONSE
  // ==================================================

  let data


  try {

    data =
      await response.json()

  } catch {

    throw new ApiError(

      'The backend returned an invalid response.',

      'api_error',

      response.status

    )
  }


  // ==================================================
  // NORMALIZE AGENT TRACE
  // ==================================================

  return {

    ...data,

    execution_trace:

      Array.isArray(
        data.execution_trace
      )

        ? data.execution_trace

        : [],


    tools_used:

      Array.isArray(
        data.tools_used
      )

        ? data.tools_used

        : [],


    agent_steps:
      data.agent_steps ?? 0,


    agent_status:
      data.agent_status ||
      'completed',

  }
}


// ==================================================
// CONFIRM ISSUE RESOLVED
// ==================================================

export async function resolveTicket(
  ticketId
) {

  if (!ticketId) {

    throw new ApiError(
      'Ticket ID is missing.',
      'validation'
    )
  }


  const token =
    getAuthToken()


  if (!token) {

    throw new ApiError(
      'You are not signed in. Please sign in again.',
      'authentication',
      401
    )
  }


  let response


  try {

    response =
      await fetch(

        `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/resolve`,

        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            ...getAuthHeaders(),
          },

          signal:
            AbortSignal.timeout(300000),

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


  if (response.status === 401) {

    clearAuthToken()

    localStorage.removeItem(
      'resolveai_authenticated'
    )

    localStorage.removeItem(
      'resolveai_user'
    )


    throw new ApiError(

      'Your session has expired. Please sign in again.',

      'authentication',

      401

    )
  }


  if (!response.ok) {

    const message =
      await parseErrorBody(response)


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

export async function keepTicketOpen(
  ticketId
) {

  if (!ticketId) {

    throw new ApiError(
      'Ticket ID is missing.',
      'validation'
    )
  }


  const token =
    getAuthToken()


  if (!token) {

    throw new ApiError(
      'You are not signed in. Please sign in again.',
      'authentication',
      401
    )
  }


  let response


  try {

    response =
      await fetch(

        `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/keep-open`,

        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            ...getAuthHeaders(),
          },

          signal:
            AbortSignal.timeout(300000),

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


  if (response.status === 401) {

    clearAuthToken()

    localStorage.removeItem(
      'resolveai_authenticated'
    )

    localStorage.removeItem(
      'resolveai_user'
    )


    throw new ApiError(

      'Your session has expired. Please sign in again.',

      'authentication',

      401

    )
  }


  if (!response.ok) {

    const message =
      await parseErrorBody(response)


    throw new ApiError(

      message,

      'api_error',

      response.status

    )
  }


  return response.json()
}


// ==================================================
// GET CURRENT TICKET
// ==================================================

export async function getTicket(
  ticketId
) {

  if (!ticketId) {

    throw new ApiError(
      'Ticket ID is missing.',
      'validation'
    )
  }


  const token =
    getAuthToken()


  if (!token) {

    throw new ApiError(
      'You are not signed in. Please sign in again.',
      'authentication',
      401
    )
  }


  let response


  try {

    response =
      await fetch(

        `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}`,

        {
          method: 'GET',

          headers: {
            ...getAuthHeaders(),
          },

          signal:
            AbortSignal.timeout(300000),

        }

      )

  } catch {

    throw new ApiError(

      'Could not reach the ResolveAI backend.',

      'backend_unavailable'

    )
  }


  if (response.status === 401) {

    clearAuthToken()

    localStorage.removeItem(
      'resolveai_authenticated'
    )

    localStorage.removeItem(
      'resolveai_user'
    )


    throw new ApiError(

      'Your session has expired. Please sign in again.',

      'authentication',

      401

    )
  }


  if (!response.ok) {

    const message =
      await parseErrorBody(response)


    throw new ApiError(

      message,

      'api_error',

      response.status

    )
  }


  return response.json()
}


// ==================================================
// GET TICKETS
// ==================================================

export async function getTickets() {

  const token =
    getAuthToken()


  if (!token) {

    throw new ApiError(
      'You are not signed in. Please sign in again.',
      'authentication',
      401
    )
  }


  let response


  try {

    response =
      await fetch(

        `${API_BASE_URL}/tickets`,

        {
          method: 'GET',

          headers: {
            ...getAuthHeaders(),
          },

          signal:
            AbortSignal.timeout(300000),

        }

      )

  } catch {

    throw new ApiError(

      'Could not reach the ResolveAI backend.',

      'backend_unavailable'

    )
  }


  if (response.status === 401) {

    clearAuthToken()

    localStorage.removeItem(
      'resolveai_authenticated'
    )

    localStorage.removeItem(
      'resolveai_user'
    )


    throw new ApiError(

      'Your session has expired. Please sign in again.',

      'authentication',

      401

    )
  }


  if (!response.ok) {

    const message =
      await parseErrorBody(response)


    throw new ApiError(

      message,

      'api_error',

      response.status

    )
  }


  return response.json()
}


// ==================================================
// LOGIN
// ==================================================

export async function loginUser(
  email,
  password
) {

  let response


  try {

    response =
      await fetch(

        `${API_BASE_URL}/auth/login`,

        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            email:
              email.trim().toLowerCase(),

            password,

          }),

          signal:
            AbortSignal.timeout(300000),

        }

      )

  } catch {

    throw new ApiError(

      'Could not reach the ResolveAI backend.',

      'backend_unavailable'

    )
  }


  if (!response.ok) {

    const message =
      await parseErrorBody(response)


    throw new ApiError(

      message,

      'api_error',

      response.status

    )
  }


  const data =
    await response.json()


  // ==================================================
  // SAVE TOKEN
  // ==================================================

  if (
    data.access_token
  ) {

    setAuthToken(
      data.access_token
    )

  } else {

    throw new ApiError(

      'Login successful, but the backend did not return an authentication token.',

      'authentication'

    )
  }


  // ==================================================
  // SAVE LOGIN STATE
  // ==================================================

  localStorage.setItem(
    'resolveai_authenticated',
    'true'
  )


  if (data.user) {

    localStorage.setItem(

      'resolveai_user',

      JSON.stringify(
        data.user
      )

    )
  }


  console.log(
    'ResolveAI login successful.'
  )

  console.log(
    'Authentication token saved:',
    !!getAuthToken()
  )


  return data
}