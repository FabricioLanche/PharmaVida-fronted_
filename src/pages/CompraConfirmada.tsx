// src/pages/CompraConfirmada.tsx
import { useLocation, Link, Navigate } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'

export default function CompraConfirmada() {
  const { state } = useLocation() as { state?: { total?: number; ts?: string } }

  // Si entran directo sin state, llévalos al inicio
  if (!state?.total || !state?.ts) return <Navigate to="/" replace />

  const fecha = new Date(state.ts)

  return (
    <div>
      <Navbar />
      <main className="container-xl">
        <section className="pv-card p-4 mb-6">
          <h2 className="title-xl">¡Compra confirmada!</h2>
          <p><strong>Total pagado:</strong> S/.{state.total.toFixed(2)}</p>
          <p><strong>Fecha y hora:</strong> {fecha.toLocaleString('es-PE')}</p>

          <Link to="/" className="pv-link">Volver al inicio</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
