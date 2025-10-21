import axios, { type AxiosInstance } from 'axios'

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

// Interceptor para agregar token a todas las peticiones
const addAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
}

// Aplicar interceptor a todas las instancias
addAuthInterceptor(usuariosAPI)
addAuthInterceptor(productosAPI)
addAuthInterceptor(recetasAPI)
addAuthInterceptor(analiticaAPI)
addAuthInterceptor(orquestadorAPI)
