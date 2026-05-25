import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID()
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    if (status === 404) return Promise.reject(new Error('Resource not found'))
    if (status === 422) return Promise.reject(new Error('Validation error — check your input'))
    if (status >= 500) return Promise.reject(new Error('Server error. Please try again later.'))
    return Promise.reject(err)
  }
)

async function safe(fn) {
  try {
    const res = await fn()
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'An unexpected error occurred' }
  }
}

export const getAllTickets  = ()         => safe(() => http.get('/tickets'))
export const getTicket      = (id)       => safe(() => http.get(`/tickets/${id}`))
export const createTicket   = (data)     => safe(() => http.post('/tickets', data))
export const updateTicket   = (id, data) => safe(() => http.put(`/tickets/${id}`, data))
export const deleteTicket   = (id)       => safe(() => http.delete(`/tickets/${id}`))
export const searchTickets  = (params)   => safe(() => http.get('/tickets/search', { params }))

// Analytics API
export const getPipelineStatus      = ()  => safe(() => http.get('/analytics/pipeline-status'))
export const getAnalyticsSummary    = ()  => safe(() => http.get('/analytics/summary'))
export const getAnalyticsByCategory = ()  => safe(() => http.get('/analytics/by-category'))
export const getAnalyticsByPriority = ()  => safe(() => http.get('/analytics/by-priority'))
export const getAnalyticsByDepartment = () => safe(() => http.get('/analytics/by-department'))
export const getAnalyticsByStatus   = ()  => safe(() => http.get('/analytics/by-status'))
export const getResolutionTrend     = ()  => safe(() => http.get('/analytics/resolution-trend'))
export const getTopIssues           = ()  => safe(() => http.get('/analytics/top-issues'))
export const runEtlPipeline         = ()  => safe(() => http.post('/etl/run'))

export default http
