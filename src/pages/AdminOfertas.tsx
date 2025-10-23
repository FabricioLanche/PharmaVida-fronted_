import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { useAuth } from '../hooks/AuthContext'
import { ofertasService } from '../services/productos_y_ofertas/ofertasAPI'

type OfertaItemUI = { productoId: number | string; descuento: number }
type OfertaUI = {
  id: string
  nombre: string
  activa?: boolean
  items: OfertaItemUI[]
  itemsCount: number
  fecha_vencimiento?: string
}

const PAGE_SIZE = 9

// Helpers fecha local "YYYY-MM-DDTHH:mm"
const pad = (n: number) => String(n).padStart(2, '0')
const nowLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const plusMonthsLocal = (m: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() + m)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminOfertas() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const isAdmin = useMemo(
    () => String((user as any)?.role ?? (user as any)?.rol ?? '').toUpperCase() === 'ADMIN',
    [user]
  )

  const [all, setAll] = useState<OfertaUI[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showCrear, setShowCrear] = useState(false)

  // form crear manual
  const [vencimiento, setVencimiento] = useState<string>(() => plusMonthsLocal(3))
  const [detallesText, setDetallesText] = useState<string>(
`17359,5.06
12505,28.58
15682,9.37`
  )

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) { navigate('/'); return }
    listar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin])

  const listar = async () => {
    setLoading(true)
    try {
      const resp = await ofertasService.listar() // GET /api/ofertas/all
      const arr: any[] = Array.isArray(resp?.data) ? resp.data : (resp?.data?.items ?? [])
      const normalizadas: OfertaUI[] = arr.map((o: any, idx: number) => {
        const detalles = Array.isArray(o?.detalles) ? o.detalles : []
        const items: OfertaItemUI[] = detalles.map((d: any) => ({
          productoId: d?.producto_id ?? d?.productoId ?? d?.id ?? '-',
          // el backend puede devolver fracción; guardamos tal cual
          descuento: Number(d?.descuento ?? 0),
        }))
        return {
          id: String(o?.id ?? idx + 1),
          nombre: String(o?.nombre ?? `Oferta ${o?.id ?? idx + 1}`),
          activa: Boolean(o?.activa),
          items,
          itemsCount: items.length,
          fecha_vencimiento: o?.fecha_vencimiento,
        }
      })
      setAll(normalizadas)
      setPage(1)
    } catch (e: any) {
      showError('Error al listar ofertas', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // ------- Crear oferta manual
  const crearOfertaManual = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validar fecha (debe ser futura)
      const vDate = new Date(vencimiento)
      if (isNaN(vDate.getTime()) || vDate <= new Date()) {
        alert('La fecha de vencimiento debe ser futura (YYYY-MM-DDTHH:mm).')
        return
      }

      // Parsear líneas "producto_id,descuento" o "producto_id descuento"
      const lineas = detallesText.split('\n').map(l => l.trim()).filter(Boolean)
      if (!lineas.length) {
        alert('Agrega al menos un detalle (producto_id,descuento)')
        return
      }

      const vistos = new Set<number>()
      const detalles = lineas.map((linea, i) => {
        const [pidRaw, descRaw] = linea.replace(',', ' ').replace(';', ' ').split(/\s+/)
        const producto_id = parseInt(pidRaw, 10)
        const dInput = parseFloat(String(descRaw).replace(',', '.'))

        if (!Number.isInteger(producto_id) || producto_id <= 0) {
          throw new Error(`Línea ${i + 1}: producto_id inválido: "${pidRaw}"`)
        }
        if (!Number.isFinite(dInput) || dInput <= 0) {
          throw new Error(`Línea ${i + 1}: descuento inválido: "${descRaw}"`)
        }
        if (vistos.has(producto_id)) {
          throw new Error(`Línea ${i + 1}: producto_id repetido (${producto_id}).`)
        }
        vistos.add(producto_id)

        // Normaliza: si viene en porcentaje (>1), pásalo a fracción (0–1)
        const descuento = dInput > 1 ? +(dInput / 100).toFixed(4) : +dInput.toFixed(4)
        if (!(descuento > 0 && descuento < 1)) {
          throw new Error(`Línea ${i + 1}: descuento debe quedar en (0,1). Valor normalizado: ${descuento}`)
        }
        return { producto_id, descuento }
      })

      setLoading(true)
      await ofertasService.createOferta({
        // Enviar ISO completo (común para validadores backend)
        fecha_vencimiento: new Date(vencimiento).toISOString(),
        detalles,
      })
      setShowCrear(false)
      await listar()
      alert('✅ Oferta creada')
    } catch (e: any) {
      showError('Error al crear oferta', e)
    } finally {
      setLoading(false)
    }
  }

  const showError = (prefix: string, e: any) => {
    const data = e?.response?.data
    const msg =
      (Array.isArray(data?.errors) && data.errors.join(' | ')) ||
      (typeof data === 'string' ? data : '') ||
      data?.message ||
      data?.error ||
      e?.message ||
      'Error desconocido'
    console.error(prefix, e?.response || e)
    alert(`❌ ${prefix}: ${msg}`)
  }

  // paginación cliente
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return all.slice(start, start + PAGE_SIZE)
  }, [all, page])

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <section className="pv-card p-4 mb-6">
          <h2 className="title-xl">Ofertas</h2>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className="btn btn-outline" onClick={listar} disabled={loading}>
              Listar Ofertas
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCrear(v => !v)}
              disabled={loading}
            >
              {showCrear ? 'Cancelar' : 'Nueva Oferta'}
            </button>
          </div>

          {/* Form crear manual */}
          {showCrear && (
            <form onSubmit={crearOfertaManual} className="pv-card p-3 mb-4" style={{ borderRadius: 12 }}>
              <div className="mb-3">
                <label className="form-label">Fecha de vencimiento</label>
                <input
                  type="datetime-local"               // CAMBIO: datetime-local
                  min={nowLocal()}                     // no permitir pasadas
                  className="form-control"
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  required
                />
                <small className="hint">Formato: YYYY-MM-DDTHH:mm (debe ser futura).</small>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Detalles (uno por línea, formato: <code>producto_id,descuento</code>)
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={detallesText}
                  onChange={(e) => setDetallesText(e.target.value)}
                  placeholder="12345,10.5"
                  required
                />
                <small className="hint">
                  Puedes escribir porcentaje (ej. <code>28.58</code>) y lo convierto a fracción (0–1) para la API.
                </small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Guardar oferta
              </button>
            </form>
          )}

          {/* Grid */}
          {loading ? (
            <p style={{ marginTop: 16 }}>Cargando…</p>
          ) : pageItems.length === 0 ? (
            <p style={{ marginTop: 16 }}>No hay ofertas.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              {pageItems.map((o) => {
                const isOpen = !!expanded[o.id]
                return (
                  <article key={o.id} className="pv-card" style={{ padding: 16, borderRadius: 12 }}>
                    <header
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {o.nombre}{' '}
                        {o.fecha_vencimiento && (
                          <span className="hint">• Vence: {o.fecha_vencimiento}</span>
                        )}
                      </div>
                      <button className="btn btn-link" onClick={() => toggleExpand(o.id)} style={{ padding: 0 }}>
                        {isOpen ? 'Ocultar' : 'Detalles'}
                      </button>
                    </header>

                    <div style={{ color: '#6b7280', marginBottom: 8 }}>
                      Items: <strong>{o.itemsCount}</strong>
                    </div>

                    {isOpen && (
                      <div style={{ overflowX: 'auto' }}>
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            background: '#fff',
                          }}
                        >
                          <thead>
                            <tr>
                              <th style={{ position: 'sticky', top: 0, background: '#fff', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
                                Producto ID
                              </th>
                              <th style={{ position: 'sticky', top: 0, background: '#fff', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
                                Descuento (%)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((it, idx) => {
                              // Mostrar siempre en porcentaje
                              const pct = it.descuento <= 1 ? it.descuento * 100 : it.descuento
                              return (
                                <tr key={idx} style={{ background: idx % 2 ? 'rgba(2,6,23,.02)' : 'transparent' }}>
                                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7' }}>
                                    {it.productoId}
                                  </td>
                                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7' }}>
                                    {pct.toFixed(2)}
                                  </td>
                                </tr>
                              )
                            })}
                            {o.items.length === 0 && (
                              <tr>
                                <td colSpan={2} style={{ padding: 12, color: '#64748b' }}>
                                  Sin items en esta oferta.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {/* Paginación */}
          {all.length > PAGE_SIZE && (
            <div className="pv-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'none', marginTop: 16 }}>
              <span className="hint">Página {page} / {totalPages}</span>
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}>Prev</button>
                <button className="btn btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>Next</button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
