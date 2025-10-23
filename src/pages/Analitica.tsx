import { useMemo, useState } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { analiticaService } from '../services/analitica/analiticaAPI'

type Resultado =
  | null
  | {
      nombre: string
      data: any[]
    }

const PAGE_SIZE = 10

// --- Helpers de formato
const toNumber = (v: any): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const formatMoney = (v: any) =>
  `S/. ${toNumber(v).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
const prettyInt = (v: any) => toNumber(v).toLocaleString('es-PE')

// Busca el primer campo que cumpla los predicados
const findField = (row: any, preds: ((k: string) => boolean)[]): string | null => {
  const keys = Object.keys(row || {})
  for (const pred of preds) {
    const k = keys.find(pred)
    if (k) return k
  }
  return null
}
const labelize = (k: string) =>
  k
    .replace(/[_\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (m) => m.toUpperCase())

// --- Sparkline grande con relleno
const Sparkline: React.FC<{ values: number[]; width?: number; height?: number }> = ({
  values,
  width = 420,
  height = 120,
}) => {
  if (!values.length) return null
  const W = width
  const H = height
  const min = Math.min(...values)
  const max = Math.max(...values)
  const rng = max - min || 1
  const step = values.length > 1 ? W / (values.length - 1) : W

  const points = values.map((v, i) => {
    const x = i * step
    const y = H - ((v - min) / rng) * H
    return `${x},${y}`
  })

  const areaPoints = `0,${H} ${points.join(' ')} ${W},${H}`

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="sparkline">
      <defs>
        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#glow)" />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#16a34a"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Analitica() {
  const [resultado, setResultado] = useState<Resultado>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const ejecutarConsulta = async (nombre: string, fn: () => Promise<any>) => {
    setLoading(true)
    try {
      const response = await fn()
      const raw = response?.data
      const data: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
        ? raw.items
        : raw?.rows && Array.isArray(raw.rows)
        ? raw.rows
        : raw
        ? [raw]
        : []
      setResultado({ nombre, data })
      setPage(1)
    } catch (error: any) {
      alert(`❌ Error en ${nombre}: ${error?.message || 'Desconocido'}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Columnas derivadas (heurística + alias conocidos)
  const columns = useMemo(() => {
    if (!resultado?.data?.length) return [] as { key: string; label: string; align?: 'right' | 'center' }[]

    const first = resultado.data[0]
    const q = (resultado.nombre || '').toLowerCase()

    if (q.includes('venta') && q.includes('diaria')) {
      const fechaKey =
        findField(first, [(k) => /fecha/i.test(k), (k) => /day|date/i.test(k)]) || 'fecha'
      const montoKey =
        findField(first, [(k) => /monto|importe|amount|total/i.test(k)]) || 'total'
      const unidadesKey =
        findField(first, [(k) => /unidades|cantidad|qty/i.test(k)]) || 'unidades'
      return [
        { key: fechaKey, label: 'Fecha' },
        { key: montoKey, label: 'Total monto (S/)', align: 'right' as const },
        { key: unidadesKey, label: 'Unidades', align: 'right' as const },
      ]
    }

    if (q.includes('top')) {
      const nombreKey =
        findField(first, [(k) => /(nombre|producto|usuario|cliente)/i.test(k)]) || 'nombre'
      const montoKey =
        findField(first, [(k) => /monto|importe|amount|total/i.test(k)]) || 'total'
      const unidadesKey =
        findField(first, [(k) => /unidades|cantidad|qty/i.test(k)]) || 'unidades'
      return [
        { key: nombreKey, label: labelize(nombreKey) },
        { key: montoKey, label: 'Total (S/)', align: 'right' as const },
        { key: unidadesKey, label: 'Unidades', align: 'right' as const },
      ]
    }

    if (q.includes('sin venta')) {
      const keys = Object.keys(first)
      return keys.slice(0, 5).map((k) => ({ key: k, label: labelize(k) }))
    }

    const keys = Object.keys(first)
    return keys.slice(0, 5).map((k) => ({ key: k, label: labelize(k) }))
  }, [resultado])

  const paged = useMemo(() => {
    if (!resultado?.data) return []
    const start = (page - 1) * PAGE_SIZE
    return resultado.data.slice(start, start + PAGE_SIZE)
  }, [resultado, page])

  const totalPages = useMemo(() => {
    if (!resultado?.data) return 0
    return Math.max(1, Math.ceil(resultado.data.length / PAGE_SIZE))
  }, [resultado])

  const resumen = useMemo(() => {
    if (!resultado?.data?.length) return null
    const first = resultado.data[0]
    const montoKey =
      findField(first, [(k) => /monto|importe|amount/i.test(k), (k) => /^total$/i.test(k)]) || ''
    const unidadesKey = findField(first, [(k) => /unidades|cantidad|qty/i.test(k)]) || ''

    const totalMonto = montoKey
      ? resultado.data.reduce((acc, row) => acc + toNumber(row[montoKey]), 0)
      : 0
    const totalUnidades = unidadesKey
      ? resultado.data.reduce((acc, row) => acc + toNumber(row[unidadesKey]), 0)
      : 0

    const serie = montoKey ? resultado.data.map((r) => toNumber(r[montoKey])) : []

    return {
      totalFilas: resultado.data.length,
      totalMonto,
      totalUnidades,
      serie,
    }
  }, [resultado])

  const renderCell = (row: any, key: string, align?: 'right' | 'center') => {
    const val = row[key]
    const style: React.CSSProperties = { textAlign: align || 'left', whiteSpace: 'nowrap' }
    if (typeof val === 'number' && /monto|importe|amount|total/i.test(key)) {
      return <td style={style}>{formatMoney(val)}</td>
    }
    if (typeof val === 'number' && (align === 'right' || /unidades|cantidad|qty/i.test(key))) {
      return <td style={style}>{prettyInt(val)}</td>
    }
    return <td style={style}>{String(val ?? '—')}</td>
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <h2 className="title-xl">Analítica</h2>

        {/* Controles */}
        <section
          className="pv-card p-3 mb-6"
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,.05)', borderRadius: 14 }}
        >
          <h3 style={{ marginTop: 0 }}>Consultas de Datos</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button
              className="btn btn-outline"
              onClick={() => ejecutarConsulta('Ventas Diarias', analiticaService.getVentasDiarias)}
              disabled={loading}
            >
              Ventas Diarias
            </button>
            <button
              className="btn btn-outline"
              onClick={() => ejecutarConsulta('Top 10 Productos', analiticaService.getTop10Productos)}
              disabled={loading}
            >
              Top 10 Productos
            </button>
            <button
              className="btn btn-outline"
              onClick={() => ejecutarConsulta('Top 10 Usuarios', analiticaService.getTop10Usuarios)}
              disabled={loading}
            >
              Top 10 Usuarios
            </button>
            <button
              className="btn btn-outline"
              onClick={() => ejecutarConsulta('Productos Sin Venta', analiticaService.getProductosSinVenta)}
              disabled={loading}
            >
              Productos Sin Venta
            </button>
          </div>

          <hr style={{ margin: '1rem 0' }} />

          <h3 style={{ marginTop: 0 }}>Ingesta de Datos</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button
              className="btn btn-accent"
              onClick={() => ejecutarConsulta('Ingesta MySQL', analiticaService.ingestaMysql)}
              disabled={loading}
            >
              Ingesta MySQL
            </button>
            <button
              className="btn btn-accent"
              onClick={() => ejecutarConsulta('Ingesta PostgreSQL', analiticaService.ingestaPostgresql)}
              disabled={loading}
            >
              Ingesta PostgreSQL
            </button>
            <button
              className="btn btn-accent"
              onClick={() => ejecutarConsulta('Ingesta MongoDB', analiticaService.ingestaMongodb)}
              disabled={loading}
            >
              Ingesta MongoDB
            </button>
          </div>
        </section>

        {/* Resultado */}
        {resultado ? (
          <section
            className="pv-card p-0"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 360px',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,.06)',
            }}
          >
            {/* Columna izquierda */}
            <div style={{ borderRight: '1px solid var(--pv-border,#e5e7eb)' }}>
              <div
                className="p-3"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18 }}>{resultado.nombre}</div>
                {resumen?.serie?.length ? (
                  <div title="Tendencia (monto)" style={{ marginTop: -8 }}>
                    <Sparkline values={resumen.serie} width={440} height={120} />
                  </div>
                ) : null}
              </div>

              <div style={{ padding: '0 12px 12px 12px' }}>
                <div className="pv-table-wrap" style={{ overflowX: 'auto' }}>
                  <table
                    className="pv-table"
                    style={{
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                    }}
                  >
                    <thead>
                      <tr>
                        {columns.map((c) => (
                          <th
                            key={c.key}
                            style={{
                              textAlign: c.align || 'left',
                              position: 'sticky',
                              top: 0,
                              background: '#fff',
                              zIndex: 1,
                            }}
                          >
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                            Sin datos
                          </td>
                        </tr>
                      ) : (
                        paged.map((row, i) => (
                          <tr
                            key={i}
                            style={{
                              background: i % 2 ? 'rgba(0,0,0,.02)' : 'transparent',
                            }}
                          >
                            {columns.map((c) => renderCell(row, c.key, c.align))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div
                  className="pv-card-footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: 'none',
                    paddingTop: 12,
                  }}
                >
                  <span className="hint">
                    Mostrando {(page - 1) * PAGE_SIZE + 1} –{' '}
                    {Math.min(page * PAGE_SIZE, resultado.data.length)} de {resultado.data.length}
                  </span>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <aside className="p-4" aria-label="Resumen" style={{ background: '#fff' }}>
              <h4 style={{ marginTop: 0, marginBottom: 12 }}>Resumen</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <div className="hint">Total filas</div>
                  <strong style={{ fontSize: 18 }}>{resumen?.totalFilas ?? 0}</strong>
                </div>
                <div>
                  <div className="hint">Monto total</div>
                  <strong style={{ fontSize: 18 }}>{formatMoney(resumen?.totalMonto ?? 0)}</strong>
                </div>
                <div>
                  <div className="hint">Unidades totales</div>
                  <strong style={{ fontSize: 18 }}>
                    {prettyInt(resumen?.totalUnidades ?? 0)}
                  </strong>
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section
            className="pv-card p-5"
            style={{ textAlign: 'center', color: '#6b7280', borderRadius: 14 }}
          >
            Ejecuta una consulta para ver resultados en la tabla.
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
