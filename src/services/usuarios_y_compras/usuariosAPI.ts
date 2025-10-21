import { usuariosAPI } from '../apiConfig'

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
}

export const usuariosService = {
  // Health check
  echo: () => usuariosAPI.get('/echo'),

  // Auth
  register: (data: RegisterData) => usuariosAPI.post('/auth/register', data),
  
  login: (data: LoginData) => usuariosAPI.post('/auth/login', data),

  // User management
  getAllUsers: () => usuariosAPI.get('/user/all'),
  
  getMyInfo: () => usuariosAPI.get('/user/me'),
  
  updateMyUser: (data: UpdateUserData) => usuariosAPI.put('/user/me', data),
  
  deleteMyUser: () => usuariosAPI.delete('/user/me'),
}
