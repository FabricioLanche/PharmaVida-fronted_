import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { recetasService } from '../services/recetas_y_medicos/recetasAPI'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'
import type { Receta } from '../types/receta.types'

function MisRecetas() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(true)
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [accionando, setAccionando] = useState<string | null>(null)

  useEffect(() => {
    cargarMisRecetas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.dni])

  const cargarMisRecetas = async () => {
    setLoading(true)
    try {
      const res = await recetasService.listarRecetas({ page: 1, pagesize: 200 })
      const mias = (res.data.items || []).filter((r: Receta) => r.pacienteDNI === user?.dni)
      setRecetas(mias)
    } catch (err) {
      console.error('Error al cargar recetas:', err)
      alert('Error al cargar recetas')
    } finally {
      setLoading(false)
    }
  }

  // S3 helper (para copiar link)
  const s3Base =
    import.meta.env.VITE_RECETAS_S3_BASE ||
    'https://pharmavida-recetas-01.s3.us-east-1.amazonaws.com'

  const buildPdfUrl = (archivo?: string | null) => {
    if (!archivo) return ''
    // Si llega key "recetas/xxx.pdf" o solo "xxx.pdf" o URL completa, normalizamos
    try {
      const u = new URL(archivo) // si es URL completa
      return u.href
    } catch {
      const cleaned = archivo.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '')
      const key = cleaned.includes('/') ? cleaned : `recetas/${cleaned}`
      return `${s3Base}/${key}`
    }
  }

  // Barra superior
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF')
      e.currentTarget.value = ''
      return
    }
    setArchivoPDF(f)
  }

  const subirRecetaAhora = async () => {
    if (!archivoPDF) {
      alert('Primero selecciona un archivo PDF para subir.')
      return
    }
    try {
      setSubiendo(true)
      const form = new FormData()
      form.append('archivoPDF', archivoPDF)
      await recetasService.subirReceta(form)
      alert('✅ Receta subida exitosamente')
      setArchivoPDF(null)
      const input = document.getElementById('file-receta') as HTMLInputElement | null
      if (input) input.value = ''
      await cargarMisRecetas()
    } catch (err: any) {
      alert(`❌ Error al subir receta: ${err?.message || 'Desconocido'}`)
    } finally {
      setSubiendo(false)
    }
  }

  const resetBarra = () => {
    setArchivoPDF(null)
    const input = document.getElementById('file-receta') as HTMLInputElement | null
    if (input) input.value = ''
  }

  // Acciones
  const copiarEnlacePDF = async (r: Receta, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const url = buildPdfUrl(r.archivoPDF)
    if (!url) return alert('Esta receta no tiene archivo PDF asociado.')
    try {
      await navigator.clipboard.writeText(url)
      alert('🔗 Enlace del PDF copiado al portapapeles. Pégalo en tu navegador para abrirlo.')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      alert('🔗 Enlace del PDF copiado al portapapeles. Pégalo en tu navegador para abrirlo.')
    }
  }

  const toggleEstado = async (r: Receta, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      setAccionando(r._id)
      await orquestadorService.validarReceta(r._id)
      await cargarMisRecetas()
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.details?.error ||
        err?.message
      alert(`❌ Error al validar/actualizar estado: ${msg}`)
    } finally {
      setAccionando(null)
    }
  }

  // ❗Eliminar SIEMPRE con el _id de la receta (el endpoint lo requiere)
  const eliminarReceta = async (r: Receta, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm('¿Estás seguro de que deseas eliminar esta receta?')) return
    try {
      setAccionando(r._id)
      await recetasService.eliminarReceta(r._id) // <— ESTE es el cambio clave
      alert('✅ Receta eliminada exitosamente')
      await cargarMisRecetas()
    } catch (err: any) {
      alert(`❌ Error al eliminar receta: ${err?.response?.data?.error || err?.message || 'desconocido'}`)
    } finally {
      setAccionando(null)
    }
  }

  const irAlDetalle = (id: string) => navigate(`/receta/${id}`)

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <section className="pv-card p-4 mb-6">
          <h2 className="title-xl">Recetas</h2>

          {/* barra superior */}
          <div className="pv-card-footer" style={{ borderTop: 'none', paddingTop: 0, paddingBottom: '.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                Seleccionar archivo
                <input
                  id="file-receta"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              <button type="button" className="btn btn-primary" disabled={subiendo} onClick={subirRecetaAhora}>
                {subiendo ? 'Subiendo…' : 'Subir receta'}
              </button>

              <button type="button" className="btn btn-outline" onClick={resetBarra}>
                Cancelar selección
              </button>

              {archivoPDF && <span className="hint">Archivo: {archivoPDF.name}</span>}
            </div>
          </div>

          {/* listado */}
          {loading ? (
            <p className="text-center text-lg">Cargando recetas…</p>
          ) : recetas.length === 0 ? (
            <p>No tienes recetas registradas.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {recetas.map((r) => (
                <div
                  key={r._id}
                  className="pv-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => irAlDetalle(r._id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && irAlDetalle(r._id)}
                  style={{
                    padding: '1rem',
                    borderRadius: 12,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label={`Ver detalle de receta ${r._id}`}
                >
                  <div>
                    <p style={{ margin: 0 }}><strong>Paciente:</strong> {r.pacienteDNI}</p>
                    <p style={{ margin: 0 }}><strong>Médico:</strong> {r.medicoCMP?.startsWith('CMP') ? '' : 'CMP '}{r.medicoCMP}</p>
                    <p style={{ margin: 0 }}>
                      <strong>Fecha:</strong> {r.fechaEmision ? new Date(r.fechaEmision).toLocaleString('es-PE') : '—'}
                    </p>
                    <p style={{ margin: '4px 0 8px 0' }}>
                      <strong>Estado:</strong>{' '}
                      <span style={{ color: r.estadoValidacion === 'validada' ? '#15803d' : '#b45309' }}>
                        {r.estadoValidacion || 'pendiente'}
                      </span>
                    </p>
                    <div>
                      <strong>Productos:</strong>
                      <ul style={{ margin: '6px 0 0 1rem' }}>
                        {r.productos?.map((p, idx) => (
                          <li key={idx}>{p.nombre} x{p.cantidad}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '8px', minWidth: 160 }}>
                    <button className="btn btn-outline" onClick={(e) => copiarEnlacePDF(r, e)} disabled={accionando === r._id}>
                      Descargar
                    </button>
                    <button className="btn btn-accent" onClick={(e) => toggleEstado(r, e)} disabled={accionando === r._id}>
                      Toggle Estado
                    </button>
                    <button
                      className="btn"
                      style={{ background: '#ef4444', color: '#fff' }}
                      onClick={(e) => eliminarReceta(r, e)}
                      disabled={accionando === r._id}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default MisRecetas
