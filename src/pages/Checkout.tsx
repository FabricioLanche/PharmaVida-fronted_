// src/pages/Checkout.tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { useCart } from '../hooks/CartContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const [procesando, setProcesando] = useState(false)

  const total = useMemo(
    () => items.reduce((sum, it: any) => sum + (Number(it.precio) || 0) * Number(it.cantidad || 0), 0),
    [items]
  )

  const currency = (n: number) => `S/. ${n.toFixed(2)}`

  const handleComprar = async () => {
    if (!user?.dni) {
      navigate('/login')
      return
    }
    setProcesando(true)
    try {
      const productos  = items.map((it: any) => it.productoId ?? it.id)
      const cantidades = items.map((it: any) => it.cantidad)

      await orquestadorService.registrarCompra({ dni: user.dni, productos, cantidades })

      clearCart()
      navigate('/compra-confirmada', {
        state: { total, ts: new Date().toISOString() },
        replace: true,
      })
    } catch (error: any) {
      if (error?.response?.status === 400 && error?.response?.data?.details?.productos_sin_receta) {
        const faltan = error.response.data.details.productos_sin_receta.join(', ')
        alert(
          `Los siguientes productos requieren receta válida: ${faltan}.\n` +
          `Sube tu receta en la sección "Recetas" y vuelve a intentarlo.`
        )
        navigate('/recetas')
      } else {
        alert('No se pudo procesar la compra. Inténtalo nuevamente.')
      }
    } finally {
      setProcesando(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="container-xl">
          <section className="pv-card p-4 mb-6">
            <h2 className="title-xl">Resumen y Pago</h2>
            <p>No hay productos en el carrito.</p>
            <button className="btn btn-accent" onClick={() => navigate('/')}>
              Ver productos
            </button>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <h2 className="title-xl">Resumen y Pago</h2>

        {/* TOTAL A PAGAR */}
        <section
          className="pv-card"
          style={{ padding: '12px 16px', marginBottom: '16px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '16px' }}>Total a pagar</strong>
            <strong style={{ fontSize: '16px' }}>{currency(total)}</strong>
          </div>
          <div className="hint" style={{ marginTop: '.5rem' }}>
            Los productos que requieran receta pueden quedar pendientes hasta su validación.
          </div>
        </section>

        {/* DETALLE DE CARRITO */}
        <section className="pv-card" style={{ padding: 0, marginBottom: '24px' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700 }}>Detalle de carrito</div>

          <div style={{ padding: '0 12px 12px 12px' }}>
            <div
              style={{
                border: '1px solid var(--pv-border, #e5e7eb)',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  fontSize: 14
                }}
              >
                <colgroup>
                  <col />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 120 }} />
                </colgroup>

                <thead>
                  <tr
                    style={{
                      background: 'var(--pv-table-head, #f8fafc)',
                      borderBottom: '1px solid var(--pv-border, #e5e7eb)'
                    }}
                  >
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Producto</th>
                    <th style={{ textAlign: 'center', padding: '10px 14px' }}>Cant.</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>P. Unit</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it: any, idx: number) => {
                    const precio = Number(it.precio || 0)
                    const cant   = Number(it.cantidad || 0)
                    const sub    = precio * cant
                    return (
                      <tr key={(it.productoId ?? it.id) + '-' + idx}>
                        <td style={{ padding: '12px 14px', borderTop: '1px solid var(--pv-border, #e5e7eb)' }}>
                          {it.nombre || `Producto #${it.productoId ?? it.id}`}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          borderTop: '1px solid var(--pv-border, #e5e7eb)'
                        }}>
                          {cant}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          borderTop: '1px solid var(--pv-border, #e5e7eb)'
                        }}>
                          {currency(precio)}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          borderTop: '1px solid var(--pv-border, #e5e7eb)'
                        }}>
                          {currency(sub)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BOTONES (verde arriba, naranja abajo) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <button
            className="btn btn-primary"
            onClick={handleComprar}
            disabled={procesando}
          >
            {procesando ? 'Procesando…' : 'Realizar compra'}
          </button>

          <button
            className="btn btn-accent"
            onClick={() => navigate('/carrito')}
            disabled={procesando}
          >
            Volver al carrito
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
