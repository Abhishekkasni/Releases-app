import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export const getReleases = () => api.get('/releases')
export const getRelease = (id) => api.get(`/releases/${id}`)
export const createRelease = (data) => api.post('/releases', data)
export const updateRelease = (id, data) => api.patch(`/releases/${id}`, data)
export const deleteRelease = (id) => api.delete(`/releases/${id}`)