import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getAllTickets = () => api.get('/tickets')

export const getTicket = (id) => api.get(`/tickets/${id}`)

export const createTicket = (data) => api.post('/tickets', data)

export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data)

export const deleteTicket = (id) => api.delete(`/tickets/${id}`)

export const searchTickets = (params) => api.get('/tickets/search', { params })

export default api
