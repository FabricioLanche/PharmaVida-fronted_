import { orquestadorAPI, getAuthHeaders } from '../apiConfig'

export interface CompraOrquestadaData {
  dni?: string
  usuarioId?: number
  productos: number[]
  cantidades: number[]
}

export const orquestadorService = {
  // Health check
  echo: () => orquestadorAPI.get('/api/orchestrator/echo'),
  
  // REQUIEREN auth según Postman
  registrarCompra: (data: CompraOrquestadaData) => 
    orquestadorAPI.post('/api/orchestrator/compras', data, { headers: getAuthHeaders() }),
  
  listarMisComprasDetalladas: () => 
    orquestadorAPI.get('/api/orchestrator/compras/me', { headers: getAuthHeaders() }),
  
  validarReceta: (recetaId: string) => 
    orquestadorAPI.put(
      `/api/orchestrator/recetas/validar/${recetaId}`, 
      {}, // Body vacío
      { headers: getAuthHeaders() }
    ),
}
