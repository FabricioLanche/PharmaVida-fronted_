import { orquestadorAPI } from '../apiConfig'

export interface CompraOrquestadaData {
  usuarioId: number
  productos: number[]
  cantidades: number[]
}

export const orquestadorService = {
  // Health check
  echo: () => orquestadorAPI.get('/api/orchestrator/echo'),
  
  registrarCompraOrquestada: (data: CompraOrquestadaData) => 
    orquestadorAPI.post('/orchestrator/compras', data),
  
  getMisComprasDetalladas: () => orquestadorAPI.get('/orchestrator/compras/me'),
  
  validarYActualizarReceta: (recetaId: string) => 
    orquestadorAPI.put(`/orchestrator/recetas/validar/${recetaId}`),
}
