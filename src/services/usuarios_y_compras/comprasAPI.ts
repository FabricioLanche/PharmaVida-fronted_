import { usuariosAPI, getAuthHeaders } from '../apiConfig'

export interface CompraData {
  usuarioId: number
  productos: number[]
  cantidades: number[]
}

export const comprasService = {
  getAllCompras: () => usuariosAPI.get('/api/compras/all', { headers: getAuthHeaders() }),
  
  getMisCompras: () => usuariosAPI.get('/api/compras/me', { headers: getAuthHeaders() }),
  
  createCompra: (data: CompraData) => usuariosAPI.post('/api/compras', data, { headers: getAuthHeaders() }),
}
