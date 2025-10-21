import { useState } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { analiticaService } from '../services/analitica/analiticaAPI'

function Analitica() {
  const [resultado, setResultado] = useState<any>(null)

  const ejecutarConsulta = async (nombre: string, fn: () => Promise<any>) => {
    try {
      const response = await fn()
      setResultado({ nombre, data: response.data })
      alert(`✅ ${nombre} ejecutada exitosamente`)
    } catch (error: any) {
      alert(`❌ Error en ${nombre}: ${error.message}`)
      console.error(error)
    }
  }

  return (
    <div>
      <Navbar />
      
      <main>
        <h1>Panel de Analítica</h1>

        <section>
          <h2>Consultas de Datos</h2>
          <button onClick={() => ejecutarConsulta('Ventas Diarias', analiticaService.getVentasDiarias)}>
            Ventas Diarias
          </button>
          <br/>
          <button onClick={() => ejecutarConsulta('Top 10 Productos', analiticaService.getTop10Productos)}>
            Top 10 Productos Más Vendidos
          </button>
          <br/>
          <button onClick={() => ejecutarConsulta('Top 10 Usuarios', analiticaService.getTop10Usuarios)}>
            Top 10 Mejores Clientes
          </button>
          <br/>
          <button onClick={() => ejecutarConsulta('Productos Sin Venta', analiticaService.getProductosSinVenta)}>
            Productos Sin Ventas u Ofertas
          </button>
        </section>

        <hr/>

        <section>
          <h2>Ingesta de Datos</h2>
          <button onClick={() => ejecutarConsulta('Ingesta MySQL', analiticaService.ingestaMysql)}>
            Ejecutar Ingesta MySQL
          </button>
          <br/>
          <button onClick={() => ejecutarConsulta('Ingesta PostgreSQL', analiticaService.ingestaPostgresql)}>
            Ejecutar Ingesta PostgreSQL
          </button>
          <br/>
          <button onClick={() => ejecutarConsulta('Ingesta MongoDB', analiticaService.ingestaMongodb)}>
            Ejecutar Ingesta MongoDB
          </button>
        </section>

        <hr/>

        {resultado && (
          <section>
            <h2>Resultado: {resultado.nombre}</h2>
            <pre>{JSON.stringify(resultado.data, null, 2)}</pre>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Analitica
