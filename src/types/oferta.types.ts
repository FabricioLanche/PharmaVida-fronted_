export interface DetalleOferta {
  id: number
  producto_id: number
  descuento: number
}

export interface Oferta {
  id: number
  fecha_vencimiento: string
  fecha_creacion: string
  fecha_actualizacion: string
  detalles: DetalleOferta[]
}
