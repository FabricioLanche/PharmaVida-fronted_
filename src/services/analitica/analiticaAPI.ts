import { analiticaAPI } from '../apiConfig'

export const analiticaService = {
  // Health check
  echo: () => analiticaAPI.get('/api/analitica/echo'),
  
  getVentasDiarias: () => analiticaAPI.get('/analitica/ventas'),
  
  getTopProductos: () => analiticaAPI.get('/analitica/top-productos'),
  
  getTopUsuarios: () => analiticaAPI.get('/analitica/top-usuarios'),
  
  getProductosSinVenta: () => analiticaAPI.get('/analitica/productos-sin-venta'),
  
  ingestaMysql: () => analiticaAPI.post('/analitica/ingesta-mysql'),
  
  ingestaPostgresql: () => analiticaAPI.post('/analitica/ingesta-postgresql'),
  
  ingestaMongodb: () => analiticaAPI.post('/analitica/ingesta-mongodb'),
}
