import { usuariosAPI, getAuthHeaders } from '../apiConfig'

export interface RegisterData {
  nombre: string
  apellido: string
  email: string
  password: string
  distrito: string
  dni: string
}

export interface LoginData {
  email?: string
  password: string
  dni?: string
}

export interface UpdateUserData {
  nombre?: string
  apellido?: string
  email?: string
  password?: string
  distrito?: string
}

export const usuariosService = {
  // Health check - NO requiere auth
  echo: () => usuariosAPI.get('/echo'),

  // Auth - NO requieren auth
  register: (data: RegisterData) => {
    return usuariosAPI.post('/api/auth/register', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  
  login: (data: LoginData) => {
    return usuariosAPI.post('/api/auth/login', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  // User management - REQUIEREN auth
  getAllUsers: () => usuariosAPI.get('/api/user/all', { headers: getAuthHeaders() }),
  
  getMyInfo: () => usuariosAPI.get('/api/user/me', { headers: getAuthHeaders() }),
  
  updateMyUser: (data: UpdateUserData) => usuariosAPI.put('/api/user/me', data, { headers: getAuthHeaders() }),
  
  deleteMyUser: () => usuariosAPI.delete('/api/user/me', { 
    headers: getAuthHeaders() 
  }),
}
