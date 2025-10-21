import { productosAPI } from '../apiConfig'

export interface ProductoData {
  nombre: string
  tipo: string
  precio: number
  stock: number
  requiere_receta: boolean
}

export interface ProductoUpdateData {
  nombre?: string
  tipo?: string
  precio?: number
  stock?: number
  requiere_receta?: boolean
}

export const productosService = {
  // Health check
  echo: () => productosAPI.get('/echo'),

  // Listar productos
  getProductosPaged: (page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/productos/paged?page=${page}&pagesize=${pagesize}`),
  
  getProductosByNombre: (nombre: string, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/productos/nombre?nombre=${nombre}&page=${page}&pagesize=${pagesize}`),
  
  getProductosByTipo: (tipo: string, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/productos/tipo?tipo=${tipo}&page=${page}&pagesize=${pagesize}`),
  
  getProductosConReceta: (requiere_receta: boolean, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/productos/receta?requiere_receta=${requiere_receta}&page=${page}&pagesize=${pagesize}`),
  
  getProductosStockBajo: (minimo: number = 10, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/productos/stock-bajo?minimo=${minimo}&page=${page}&pagesize=${pagesize}`),

  // CRUD productos
  getProductoById: (id: number) => productosAPI.get(`/productos/${id}`),
  
  createProducto: (data: ProductoData) => productosAPI.post('/productos', data),
  
  updateProducto: (id: number, data: ProductoUpdateData) => productosAPI.put(`/productos/${id}`, data),
  
  deleteProducto: (id: number) => productosAPI.delete(`/productos/${id}`),
}
