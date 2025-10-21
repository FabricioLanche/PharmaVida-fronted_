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
  createOferta: (data: OfertaData) => productosAPI.post('/ofertas/crear', data),
  
  getAllOfertas: () => productosAPI.get('/ofertas/all'),
  
  getOfertaById: (id: number) => productosAPI.get(`/ofertas/${id}`),
  
  updateOferta: (id: number, data: OfertaData) => productosAPI.put(`/ofertas/${id}`, data),
  
  deleteOferta: (id: number) => productosAPI.delete(`/ofertas/${id}`),
}
