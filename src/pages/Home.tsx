import { Link } from 'react-router-dom'
import { usuariosService } from '../services/usuarios_y_compras/usuariosAPI'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { recetasService } from '../services/recetas_y_medicos/recetasAPI'
import { analiticaService } from '../services/analitica/analiticaAPI'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'

function Home() {
  const testConnection = async (serviceName: string, echoFn: () => Promise<any>) => {
    try {
      const response = await echoFn()
      alert(`✅ ${serviceName}: Conexión exitosa\n${JSON.stringify(response.data)}`)
    } catch (error: any) {
      alert(`❌ ${serviceName}: Error de conexión\n${error.message}`)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>PharmaVida - Home</h1>
      
      <section style={{ marginTop: '30px' }}>
        <h2>Prueba de Conexión a Microservicios</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <button onClick={() => testConnection('Usuarios', usuariosService.echo)}>
            Test Usuarios
          </button>
          <button onClick={() => testConnection('Productos', productosService.echo)}>
            Test Productos
          </button>
          <button onClick={() => testConnection('Recetas', recetasService.echo)}>
            Test Recetas
          </button>
          <button onClick={() => testConnection('Analítica', analiticaService.echo)}>
            Test Analítica
          </button>
          <button onClick={() => testConnection('Orquestador', orquestadorService.echo)}>
            Test Orquestador
          </button>
        </div>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>Navegación Pública</h2>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Registro</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          <li><Link to="/ofertas">Ofertas</Link></li>
        </ul>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>Usuario Autenticado</h2>
        <ul>
          <li><Link to="/carrito">Carrito</Link></li>
          <li><Link to="/mis-compras">Mis Compras</Link></li>
          <li><Link to="/recetas">Mis Recetas</Link></li>
          <li><Link to="/subir-receta">Subir Receta</Link></li>
          <li><Link to="/perfil">Mi Perfil</Link></li>
        </ul>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>Administración</h2>
        <ul>
          <li><Link to="/admin/usuarios">Admin - Usuarios</Link></li>
          <li><Link to="/admin/productos">Admin - Productos</Link></li>
          <li><Link to="/admin/recetas">Admin - Recetas</Link></li>
          <li><Link to="/admin/analitica">Admin - Analítica</Link></li>
        </ul>
      </section>
    </div>
  )
}

export default Home
