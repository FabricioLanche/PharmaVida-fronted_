import { usuariosAPI } from '../apiConfig'

export interface CompraData {
  usuarioId: number
  productos: number[]
  cantidades: number[]
}

export const comprasService = {
  getAllCompras: () => usuariosAPI.get('/compras/all'),
  
  getMisCompras: () => usuariosAPI.get('/compras/me'),
  
  createCompra: (data: CompraData) => usuariosAPI.post('/compras', data),
}
