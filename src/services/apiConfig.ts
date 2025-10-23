// apiConfig.ts
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'

export const API_BASE_URLS = {
  usuarios:    import.meta.env.VITE_API_USUARIOS    || '',
  productos:   import.meta.env.VITE_API_PRODUCTOS   || '',
  recetas:     import.meta.env.VITE_API_RECETAS     || '',
  analitica:   import.meta.env.VITE_API_ANALITICA   || '',
  orquestador: import.meta.env.VITE_API_ORQUESTADOR || '',
}

// Normaliza (quita "/" al final) para evitar // en las rutas
const normalize = (url: string) => (url ? url.replace(/\/+$/, '') : '')

// Crea una instancia con interceptores
const makeApi = (baseURL: string): AxiosInstance => {
  const api = axios.create({
    baseURL: normalize(baseURL),
    timeout: 15000,
    headers: {
      // No fijamos Content-Type global para no romper FormData
      Accept: 'application/json',
    },
  })

  // Inyecta token en cada request
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Manejo básico de errores (401 opcional)
  api.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
      // if (err?.response?.status === 401) { /* opcional: logout() o señal global */ }
      return Promise.reject(err)
    }
  )

  return api
}

// Instancias
export const usuariosAPI    = makeApi(API_BASE_URLS.usuarios)
export const productosAPI   = makeApi(API_BASE_URLS.productos)
export const recetasAPI     = makeApi(API_BASE_URLS.recetas)
export const analiticaAPI   = makeApi(API_BASE_URLS.analitica)
export const orquestadorAPI = makeApi(API_BASE_URLS.orquestador)

// Helpers para fijar/quitar token manualmente
export const setAuthToken = (token: string | null) => {
  const instances = [usuariosAPI, productosAPI, recetasAPI, analiticaAPI, orquestadorAPI]
  for (const api of instances) {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
    else delete api.defaults.headers.common.Authorization
  }
}
export const clearAuthToken = () => setAuthToken(null)

// Helper opcional si aún quieres headers “a mano”
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
