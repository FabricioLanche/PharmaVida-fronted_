import { recetasAPI } from '../apiConfig'

export interface RecetaFilterParams {
  dni?: string
  cmp?: string
  estado?: string
  page?: number
  pagesize?: number
}

export const recetasService = {
  // Health check
  echo: () => recetasAPI.get('/echo'),

  getRecetasFiltered: (params: RecetaFilterParams) => {
    const queryParams = new URLSearchParams()
    if (params.dni) queryParams.append('dni', params.dni)
    if (params.cmp) queryParams.append('cmp', params.cmp)
    if (params.estado) queryParams.append('estado', params.estado)
    queryParams.append('page', String(params.page || 1))
    queryParams.append('pagesize', String(params.pagesize || 10))
    
    return recetasAPI.get(`/recetas/filter?${queryParams.toString()}`)
  },
  
  getRecetaById: (id: string) => recetasAPI.get(`/recetas/${id}`),
  
  uploadReceta: (file: File) => {
    const formData = new FormData()
    formData.append('archivoPDF', file)
    
    return recetasAPI.post('/recetas/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  validarReceta: (id: string) => recetasAPI.put(`/recetas/${id}/validar`),
  
  deleteReceta: (id: string) => recetasAPI.delete(`/recetas/archivo/${id}`),
}
