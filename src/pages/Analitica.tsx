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
  width = 640,
  height = 140,
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

  // util para leer números aunque lleguen como string
  const asNumber = (v: any) => {
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v.replace(/,/g, ''))
      if (Number.isFinite(n)) return n
    }
    return NaN
  }

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

      // Normalización ligera: coerciona números / deja fecha en YYYY-MM-DD
      const numKeys = /(monto|importe|amount|total|unidades|cantidad|qty|precio|stock)/i
      const dateKeys = /(fecha|date|day)/i
      const normalized = data.map((row) => {
        const out: any = { ...row }
        Object.keys(out).forEach((k) => {
          const v = out[k]
          if (numKeys.test(k)) {
            const n = asNumber(v)
            if (Number.isFinite(n)) out[k] = n
          } else if (dateKeys.test(k)) {
            const s = String(v ?? '')
            out[k] = s.length > 10 ? s.slice(0, 10) : s
          }
        })
        return out
      })

      setResultado({ nombre, data: normalized })
      setPage(1)
    } catch (error: any) {
      alert(`❌ Error en ${nombre}: ${error?.message || 'Desconocido'}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Columnas derivadas (añadimos flag numeric para estilos)
  const columns = useMemo(() => {
    type Col = { key: string; label: string; align?: 'right' | 'center'; numeric?: boolean }
    if (!resultado?.data?.length) return [] as Col[]

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
        { key: montoKey, label: 'Total monto (S/)', align: 'right', numeric: true },
        { key: unidadesKey, label: 'Unidades', align: 'right', numeric: true },
      ] as Col[]
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
        { key: montoKey, label: 'Total (S/)', align: 'right', numeric: true },
        { key: unidadesKey, label: 'Unidades', align: 'right', numeric: true },
      ] as Col[]
    }

    const keys = Object.keys(first)
    return keys.slice(0, 5).map((k) => ({ key: k, label: labelize(k) })) as Col[]
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

  const renderCell = (row: any, key: string, align?: 'right' | 'center', numeric?: boolean) => {
    const val = row[key]
    const style: React.CSSProperties = {
      textAlign: align || 'left',
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    }

    if (/fecha|date|day/i.test(key)) {
      const s = String(val ?? '')
      return <td className={numeric ? 'num' : ''} style={style}>{s.length > 10 ? s.slice(0, 10) : s}</td>
    }

    if (/monto|importe|amount|total/i.test(key)) {
      const n = asNumber(val)
      return (
        <td className="num" style={{ ...style, textAlign: 'right' }}>
          {Number.isFinite(n) ? formatMoney(n) : String(val ?? '—')}
        </td>
      )
    }

    if (/unidades|cantidad|qty/i.test(key)) {
      const n = asNumber(val)
      return (
        <td className="num" style={{ ...style, textAlign: 'right' }}>
          {Number.isFinite(n) ? prettyInt(n) : String(val ?? '—')}
        </td>
      )
    }

    return <td className={numeric ? 'num' : ''} style={style}>{String(val ?? '—')}</td>
  }

  return (
    <div>
      <Navbar />

      {/* Estilos locales para que “se vea como tabla” */}
      <style>{`
        .results-grid{
          display:grid;
          grid-template-columns: 1fr 360px;
          border-radius:14px;
          overflow:hidden;
          box-shadow:0 16px 40px rgba(0,0,0,.06);
        }
        @media (max-width: 1024px){
          .results-grid{ grid-template-columns: 1fr; }
        }
        .pv-table {
          width:100%;
          table-layout:auto;
          border-collapse:separate;
          border-spacing:0;
          border:1px solid #e5e7eb;
          border-radius:10px;
          overflow:hidden;
        }
        .pv-table thead th{
          position:sticky;
          top:0;
          background:#fff;
          z-index:2;
          padding:10px 12px;
          border-bottom:2px solid #e5e7eb;
          text-align:left;
        }
        .pv-table tbody td{
          padding:10px 12px;
          border-bottom:1px solid #eef2f7;
        }
        .pv-table tbody tr:nth-child(odd){
          background:rgba(0,0,0,.02);
        }
        .pv-table tbody tr:hover{
          background:rgba(99,102,241,.06);
        }
        .pv-table th.num,.pv-table td.num{
          text-align:right;
        }
        .spark-wrap {
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:6px;
          padding:18px 12px 8px;
        }
        .spark-title{
          font-weight:700;
          font-size:18px;
          text-align:center;
        }
      `}</style>

      <main className="container-xl">
        <h2 className="title-xl">Analítica</h2>

        {/* Controles */}
        <section className="pv-card p-3 mb-6" style={{ boxShadow: '0 10px 30px rgba(0,0,0,.05)', borderRadius: 14 }}>
          <h3 style={{ marginTop: 0 }}>Consultas de Datos</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="btn btn-outline" onClick={() => ejecutarConsulta('Ventas Diarias', analiticaService.getVentasDiarias)} disabled={loading}>Ventas Diarias</button>
            <button className="btn btn-outline" onClick={() => ejecutarConsulta('Top 10 Productos', analiticaService.getTop10Productos)} disabled={loading}>Top 10 Productos</button>
            <button className="btn btn-outline" onClick={() => ejecutarConsulta('Top 10 Usuarios', analiticaService.getTop10Usuarios)} disabled={loading}>Top 10 Usuarios</button>
            <button className="btn btn-outline" onClick={() => ejecutarConsulta('Productos Sin Venta', analiticaService.getProductosSinVenta)} disabled={loading}>Productos Sin Venta</button>
          </div>

          <hr style={{ margin: '1rem 0' }} />

          <h3 style={{ marginTop: 0 }}>Ingesta de Datos</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="btn btn-accent" onClick={() => ejecutarConsulta('Ingesta MySQL', analiticaService.ingestaMysql)} disabled={loading}>Ingesta MySQL</button>
            <button className="btn btn-accent" onClick={() => ejecutarConsulta('Ingesta PostgreSQL', analiticaService.ingestaPostgresql)} disabled={loading}>Ingesta PostgreSQL</button>
            <button className="btn btn-accent" onClick={() => ejecutarConsulta('Ingesta MongoDB', analiticaService.ingestaMongodb)} disabled={loading}>Ingesta MongoDB</button>
          </div>
        </section>

        {/* Resultado */}
        {resultado ? (
          <section className="pv-card p-0 results-grid">
            {/* Columna izquierda */}
            <div style={{ borderRight: '1px solid var(--pv-border,#e5e7eb)' }}>
              {/* Título + sparkline centrado */}
              <div className="spark-wrap">
                <div className="spark-title">{resultado.nombre}</div>
                {resumen?.serie?.length ? <Sparkline values={resumen.serie} /> : null}
              </div>

              {/* Tabla */}
              <div style={{ padding: '0 12px 12px 12px' }}>
                <div className="pv-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="pv-table">
                    <thead>
                      <tr>
                        {columns.map((c) => (
                          <th key={c.key} className={c.numeric ? 'num' : ''} style={{ textAlign: c.align || 'left' }}>
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} style={{ textAlign: 'center' }}>Sin datos</td>
                        </tr>
                      ) : (
                        paged.map((row, i) => (
                          <tr key={i}>
                            {columns.map((c) => renderCell(row, c.key, c.align, c.numeric))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="pv-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'none', paddingTop: 12 }}>
                  <span className="hint">
                    Mostrando {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, (resultado?.data ?? []).length)} de {(resultado?.data ?? []).length}
                  </span>
                  <div className="btn-group">
                    <button className="btn btn-outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                    <button className="btn btn-outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
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
                  <strong style={{ fontSize: 18 }}>{prettyInt(resumen?.totalUnidades ?? 0)}</strong>
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="pv-card p-5" style={{ textAlign: 'center', color: '#6b7280', borderRadius: 14 }}>
            Ejecuta una consulta para ver resultados en la tabla.
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
