export interface Producto {
  id: number
  nombre: string
  tipo: string
  precio: number
  stock: number
  requiere_receta: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface ProductosResponse {
  total: number
  page: number
  pagesize: number
  productos: Producto[]
}

export interface ProductosFiltros {
  nombre?: string
  tipo?: string
  requiere_receta?: boolean
  stock_min?: number
  page?: number
  pagesize?: number
}

export const TIPOS_PRODUCTOS = [
  "Antibiotico",
  "Antiinflamatorio",
  "Antihistaminico",
  "Antimicotico",
  "Dermocosmetica",
  "Antigripal",
  "Analgesico",
  "Vitaminas",
  "Broncodilatador",
  "Antiacido"
] as const

export type TipoProducto = typeof TIPOS_PRODUCTOS[number]
