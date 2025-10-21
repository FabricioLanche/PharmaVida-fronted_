import { productosAPI } from '../apiConfig'

export interface DetalleOferta {
  producto_id: number
  descuento: number
}

export interface OfertaData {
  detalles: DetalleOferta[]
  fecha_vencimiento: string
}

export const ofertasService = {
  // Listar todas las ofertas - Cambiar a /api/ofertas/all según el backend
  listar: () => productosAPI.get('/api/ofertas/all'),
  
  // Obtener oferta por ID
  obtenerPorId: (id: number) => productosAPI.get(`/api/ofertas/${id}`),
  
  createOferta: (data: OfertaData) => productosAPI.post('/api/ofertas/crear', data),
  
  getAllOfertas: () => productosAPI.get('/api/ofertas/all'),
  
  getOfertaById: (id: number) => productosAPI.get(`/api/ofertas/${id}`),
  
  updateOferta: (id: number, data: OfertaData) => productosAPI.put(`/api/ofertas/${id}`, data),
  
  deleteOferta: (id: number) => productosAPI.delete(`/api/ofertas/${id}`),
}
