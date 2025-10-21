import { recetasAPI } from '../apiConfig'

export const recetasService = {
  echo: () => recetasAPI.get('/echo'),
  
  // Listar recetas con filtros
  listarRecetas: (params?: {
    dni?: string
    cmp?: string
    estado?: string
    page?: number
    pagesize?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.dni) queryParams.append('dni', params.dni)
    if (params?.cmp) queryParams.append('cmp', params.cmp)
    if (params?.estado) queryParams.append('estado', params.estado)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.pagesize) queryParams.append('pagesize', String(params.pagesize))
    
    return recetasAPI.get(`/api/recetas/filter?${queryParams.toString()}`)
  },
  
  // Obtener receta por ID - Corregir endpoint
  obtenerRecetaPorId: (id: string) => recetasAPI.get(`/api/recetas/${id}`),
  
  // Subir receta
  subirReceta: (formData: FormData) => recetasAPI.post('/api/recetas/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Validar receta
  validarReceta: (id: string) => recetasAPI.put(`/api/recetas/${id}/validar`),
  
  // Eliminar receta
  eliminarReceta: (id: string) => recetasAPI.delete(`/api/recetas/archivo/${id}`),
  
  // Listar médicos
  listarMedicos: (params?: {
    nombre?: string
    especialidad?: string
    colegiaturaValida?: boolean
    page?: number
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.nombre) queryParams.append('nombre', params.nombre)
    if (params?.especialidad) queryParams.append('especialidad', params.especialidad)
    if (params?.colegiaturaValida !== undefined) queryParams.append('colegiaturaValida', String(params.colegiaturaValida))
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))
    
    return recetasAPI.get(`/api/medicos/filter?${queryParams.toString()}`)
  },
}
