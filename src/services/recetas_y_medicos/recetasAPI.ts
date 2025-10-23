import { recetasAPI } from '../apiConfig'

export const recetasService = {
  echo: () => recetasAPI.get('/echo'),

  // Listar
  listarRecetas: (params?: {
    dni?: string
    cmp?: string
    estado?: string
    page?: number
    pagesize?: number
  }) => {
    const qp = new URLSearchParams()
    if (params?.dni) qp.append('dni', params.dni)
    if (params?.cmp) qp.append('cmp', params.cmp)
    if (params?.estado) qp.append('estado', params.estado)
    if (params?.page) qp.append('page', String(params.page))
    if (params?.pagesize) qp.append('pagesize', String(params.pagesize))
    return recetasAPI.get(`/api/recetas/filter?${qp.toString()}`)
  },

  // Obtener por ID
  obtenerRecetaPorId: (id: string) =>
    recetasAPI.get(`/api/recetas/${encodeURIComponent(id)}`),

  // Subir
  subirReceta: (formData: FormData) =>
    recetasAPI.post('/api/recetas/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Validar
  validarReceta: (id: string) =>
    recetasAPI.put(`/api/recetas/${encodeURIComponent(id)}/validar`),

  // Eliminar — OJO: este endpoint espera el **_id** del documento, no la key del archivo
  eliminarReceta: (recetaId: string) =>
    recetasAPI.delete(`/api/recetas/archivo/${encodeURIComponent(recetaId)}`),

  // Médicos
  listarMedicos: (params?: {
    nombre?: string
    especialidad?: string
    colegiaturaValida?: boolean
    page?: number
    limit?: number
  }) => {
    const qp = new URLSearchParams()
    if (params?.nombre) qp.append('nombre', params.nombre)
    if (params?.especialidad) qp.append('especialidad', params.especialidad)
    if (params?.colegiaturaValida !== undefined) qp.append('colegiaturaValida', String(params.colegiaturaValida))
    if (params?.page) qp.append('page', String(params.page))
    if (params?.limit) qp.append('limit', String(params.limit))
    return recetasAPI.get(`/api/medicos/filter?${qp.toString()}`)
  },
}
