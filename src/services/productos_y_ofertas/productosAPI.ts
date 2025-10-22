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
  // Health check - NO requiere auth
  echo: () => productosAPI.get('/echo'),

  // Método unificado para listar con filtros
  listar: (filtros?: {
    nombre?: string
    tipo?: string
    requiere_receta?: boolean
    stock_min?: number
    page?: number
    pagesize?: number
  }) => {
    const { nombre, tipo, requiere_receta, stock_min, page = 1, pagesize = 25 } = filtros || {}
    
    // Prioridad: nombre > tipo > receta > stock bajo > paginado
    if (nombre) {
      return productosAPI.get(`/api/productos/nombre?nombre=${nombre}&page=${page}&pagesize=${pagesize}`)
    }
    if (tipo) {
      return productosAPI.get(`/api/productos/tipo?tipo=${tipo}&page=${page}&pagesize=${pagesize}`)
    }
    if (requiere_receta !== undefined) {
      return productosAPI.get(`/api/productos/receta?requiere_receta=${requiere_receta}&page=${page}&pagesize=${pagesize}`)
    }
    if (stock_min !== undefined) {
      return productosAPI.get(`/api/productos/stock-bajo?minimo=${stock_min}&page=${page}&pagesize=${pagesize}`)
    }
    
    return productosAPI.get(`/api/productos/paged?page=${page}&pagesize=${pagesize}`)
  },

  // Obtener producto por ID
  obtenerPorId: (id: number) => productosAPI.get(`/api/productos/${id}`),

  // Listar productos - NO requieren auth
  getProductosPaged: (page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/api/productos/paged?page=${page}&pagesize=${pagesize}`),
  
  getProductosByNombre: (nombre: string, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/api/productos/nombre?nombre=${nombre}&page=${page}&pagesize=${pagesize}`),
  
  getProductosByTipo: (tipo: string, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/api/productos/tipo?tipo=${tipo}&page=${page}&pagesize=${pagesize}`),
  
  getProductosConReceta: (requiere_receta: boolean, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/api/productos/receta?requiere_receta=${requiere_receta}&page=${page}&pagesize=${pagesize}`),
  
  getProductosStockBajo: (minimo: number = 10, page: number = 1, pagesize: number = 25) => 
    productosAPI.get(`/api/productos/stock-bajo?minimo=${minimo}&page=${page}&pagesize=${pagesize}`),

  getProductoById: (id: number) => productosAPI.get(`/api/productos/${id}`),
  
  // CRUD productos - NO requieren auth
  createProducto: (data: ProductoData) => productosAPI.post('/api/productos', data),
  
  updateProducto: (id: number, data: ProductoUpdateData) => productosAPI.put(`/api/productos/${id}`, data),
  
  deleteProducto: (id: number) => productosAPI.delete(`/api/productos/${id}`),
}
