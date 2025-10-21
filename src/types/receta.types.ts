export interface ProductoReceta {
  _id: string
  id: number
  nombre: string
  cantidad: number
}

export interface Receta {
  _id: string
  pacienteDNI: string
  medicoCMP: string
  fechaEmision: string
  productos: ProductoReceta[]
  archivoPDF: string
  estadoValidacion: 'pendiente' | 'validada' | 'rechazada'
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface RecetasResponse {
  page: number
  pagesize: number
  total: number
  items: Receta[]
}

export interface Medico {
  _id: string
  cmp: string
  nombre: string
  especialidad: string
  colegiaturaValida: boolean
}

export interface MedicosResponse {
  page: number
  limit: number
  total: number
  items: Medico[]
}
