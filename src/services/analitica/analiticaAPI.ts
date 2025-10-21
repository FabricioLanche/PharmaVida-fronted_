import { analiticaAPI } from '../apiConfig'

export const analiticaService = {
  echo: () => analiticaAPI.get('/api/analitica/echo'),
  
  // Consultas de datos
  getVentasDiarias: () => analiticaAPI.get('/api/analitica/ventas'),
  
  getTop10Productos: () => analiticaAPI.get('/api/analitica/top-productos'),
  
  getTop10Usuarios: () => analiticaAPI.get('/api/analitica/top-usuarios'),
  
  getProductosSinVenta: () => analiticaAPI.get('/api/analitica/productos-sin-venta'),
  
  // Ingesta de datos
  ingestaMysql: () => analiticaAPI.post('/api/analitica/ingesta-mysql'),
  
  ingestaPostgresql: () => analiticaAPI.post('/api/analitica/ingesta-postgresql'),
  
  ingestaMongodb: () => analiticaAPI.post('/api/analitica/ingesta-mongodb'),
}
