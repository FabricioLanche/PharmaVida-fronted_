import axios from 'axios'

export const API_BASE_URLS = {
  usuarios: import.meta.env.VITE_API_USUARIOS || '',
  productos: import.meta.env.VITE_API_PRODUCTOS || '',
  recetas: import.meta.env.VITE_API_RECETAS || '',
  analitica: import.meta.env.VITE_API_ANALITICA || '',
  orquestador: import.meta.env.VITE_API_ORQUESTADOR || '',
}

// Crear instancias de axios para cada microservicio
export const usuariosAPI = axios.create({
  baseURL: API_BASE_URLS.usuarios,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const productosAPI = axios.create({
  baseURL: API_BASE_URLS.productos,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const recetasAPI = axios.create({
  baseURL: API_BASE_URLS.recetas,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const analiticaAPI = axios.create({
  baseURL: API_BASE_URLS.analitica,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const orquestadorAPI = axios.create({
  baseURL: API_BASE_URLS.orquestador,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper para obtener headers con token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
