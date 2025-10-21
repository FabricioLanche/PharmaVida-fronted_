import { recetasAPI } from '../apiConfig'

export interface MedicoFilterParams {
  nombre?: string
  especialidad?: string
  colegiaturaValida?: boolean
  page?: number
  limit?: number
}

export const medicosService = {
  getMedicosFiltered: (params: MedicoFilterParams) => {
    const queryParams = new URLSearchParams()
    if (params.nombre) queryParams.append('nombre', params.nombre)
    if (params.especialidad) queryParams.append('especialidad', params.especialidad)
    if (params.colegiaturaValida !== undefined) queryParams.append('colegiaturaValida', String(params.colegiaturaValida))
    if (params.page) queryParams.append('page', String(params.page))
    if (params.limit) queryParams.append('limit', String(params.limit))
    
    return recetasAPI.get(`/api/medicos/filter?${queryParams.toString()}`)
  },
}
