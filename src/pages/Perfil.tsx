// src/pages/Perfil.tsx
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { useAuth } from '../hooks/AuthContext'
import { usuariosService, type UpdateUserData } from '../services/usuarios_y_compras/usuariosAPI'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'

interface ProductoDetalle {
  producto_id: number
  cantidad: number
  nombre: string
  precio: number
  tipo: string
  stock: number
}
interface Compra {
  id: number
  fechaCompra: string
  usuarioId: number
  productos: number[]
  cantidades: number[]
  productos_detalle: ProductoDetalle[]
}

export default function Perfil() {
  const { user, login } = useAuth()

  // ---- perfil
  const [formData, setFormData] = useState<UpdateUserData>({
    nombre: '',
    apellido: '',
    email: '',
    distrito: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string>('') 
  const [ok, setOk] = useState<string>('')

  // ---- compras + paginación
  const [compras, setCompras] = useState<Compra[]>([])
  const [loadingCompras, setLoadingCompras] = useState(true)
  const [openCompraIds, setOpenCompraIds] = useState<Set<number>>(new Set())
  const pageSize = 3
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        distrito: user.distrito || '',
      })
    }
  }, [user])

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingCompras(true)
        const res = await orquestadorService.listarMisComprasDetalladas()
        const list: Compra[] = res.data?.compras ?? []
        setCompras(list)
        setPage(1)
      } finally {
        setLoadingCompras(false)
      }
    }
    fetch()
  }, [])

  // cuando cambia de página, abrir la primera compra visible
  useEffect(() => {
    const firstVisible = paginatedCompras[0]?.id
    if (firstVisible) {
      setOpenCompraIds((prev) => {
        const n = new Set(prev)
        n.add(firstVisible)
        return n
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, compras.length])

  const totalPages = Math.max(1, Math.ceil(compras.length / pageSize))
  const paginatedCompras = useMemo(
    () => compras.slice((page - 1) * pageSize, page * pageSize),
    [compras, page]
  )
  const goPrev = () => setPage((p) => (p > 1 ? p - 1 : p))
  const goNext = () => setPage((p) => (p < totalPages ? p + 1 : p))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setErr('')
    setOk('')
    setSaving(true)
    try {
      const toUpdate: UpdateUserData = {}
      if (formData.nombre !== user.nombre) toUpdate.nombre = formData.nombre
      if (formData.apellido !== user.apellido) toUpdate.apellido = formData.apellido
      if (formData.email !== user.email) toUpdate.email = formData.email
      if ((formData.distrito || '') !== (user.distrito || '')) toUpdate.distrito = formData.distrito

      if (Object.keys(toUpdate).length === 0) {
        setErr('No se detectaron cambios.')
        setSaving(false)
        return
      }

      await usuariosService.updateMyUser(toUpdate)

      // refrescar user en contexto
      const info = await usuariosService.getMyInfo()
      const token = localStorage.getItem('token') || ''
      login(token, {
        nombre: info.data.nombre,
        apellido: info.data.apellido,
        email: info.data.email,
        dni: info.data.dni,
        role: info.data.role,
        distrito: info.data.distrito,
      } as any)

      setOk('Información actualizada correctamente.')
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Error al actualizar información')
    } finally {
      setSaving(false)
    }
  }

  const toggleCompra = (id: number) => {
    setOpenCompraIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const totalCompra = (p: ProductoDetalle[]) =>
    p.reduce((acc, it) => acc + it.precio * it.cantidad, 0)

  const currency = (n: number) => `S/ ${n.toFixed(2)}`
  const roleLabel = user?.role || '—'

  if (!user) {
    return (
      <div>
        <Navbar />
        <main className="container-xl"><p>Cargando…</p></main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <h1 className="title-xl" style={{ marginBottom: '1rem' }}>Perfil de usuario</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* --- Mis datos --- */}
          <section className="pv-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0 }}>Mis datos</h2>
            <div style={{ color: '#6b7280', marginBottom: '.75rem' }}>
              Rol: <strong>{roleLabel}</strong>
            </div>

            {err && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '.75rem', borderRadius: 8, marginBottom: '.75rem' }}>
                {err}
              </div>
            )}
            {ok && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: '.75rem', borderRadius: 8, marginBottom: '.75rem' }}>
                {ok}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.75rem' }}>
              <div>
                <label className="form-label">DNI</label>
                <input className="form-control" value={user.dni} disabled />
              </div>

              <div>
                <label className="form-label">Nombre</label>
                <input className="form-control" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
              </div>

              <div>
                <label className="form-label">Apellido</label>
                <input className="form-control" name="apellido" value={formData.apellido || ''} onChange={handleChange} required />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input className="form-control" type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
              </div>

              <div>
                <label className="form-label">Distrito</label>
                <input className="form-control" name="distrito" value={formData.distrito || ''} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setFormData({
                      nombre: user.nombre,
                      apellido: user.apellido,
                      email: user.email,
                      distrito: user.distrito || '',
                    })
                    setErr('')
                    setOk('')
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>

          {/* --- Historial de compras --- */}
          <section className="pv-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0 }}>Historial de compras</h2>

            {loadingCompras ? (
              <p>Cargando compras…</p>
            ) : compras.length === 0 ? (
              <p>No tienes compras registradas.</p>
            ) : (
              <>
                <div style={{ display: 'grid', gap: '12px', marginBottom: '0.75rem' }}>
                  {paginatedCompras.map((c) => {
                    const isOpen = openCompraIds.has(c.id)
                    return (
                      <div key={c.id} style={{ borderRadius: 12, overflow: 'hidden' }}>
                        {/* Encabezado verde */}
                        <div
                          style={{
                            background: '#15803d',
                            color: 'white',
                            padding: '.6rem .9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 12,
                          }}
                        >
                          <strong>Compra #{c.id}</strong>
                          <button
                            type="button"
                            onClick={() => toggleCompra(c.id)}
                            style={{
                              color: '#fff',
                              background: 'transparent',
                              border: '1px solid rgba(255,255,255,.7)',
                              borderRadius: 8,
                              padding: '.2rem .6rem',
                              fontSize: '.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            {isOpen ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>

                        {isOpen && (
                          <div className="pv-card" style={{ marginTop: '.5rem', padding: '.75rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--pv-border)' }}>
                                  <th style={{ textAlign: 'left', padding: '.5rem' }}>Producto</th>
                                  <th style={{ textAlign: 'center', padding: '.5rem' }}>Cant.</th>
                                  <th style={{ textAlign: 'right', padding: '.5rem' }}>P. Unit</th>
                                  <th style={{ textAlign: 'right', padding: '.5rem' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.productos_detalle.map((p, i) => (
                                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '.5rem' }}>{p.nombre}</td>
                                    <td style={{ padding: '.5rem', textAlign: 'center' }}>{p.cantidad}</td>
                                    <td style={{ padding: '.5rem', textAlign: 'right' }}>{currency(p.precio)}</td>
                                    <td style={{ padding: '.5rem', textAlign: 'right' }}>{currency(p.precio * p.cantidad)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3} style={{ padding: '.5rem', textAlign: 'right', fontWeight: 700 }}>
                                    Total:
                                  </td>
                                  <td style={{ padding: '.5rem', textAlign: 'right', fontWeight: 700 }}>
                                    {currency(totalCompra(c.productos_detalle))}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Paginación */}
                <div
                  className="pv-card-footer"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span className="page-label">Page {page} / {totalPages}</span>
                  <div className="btn-group">
                    <button type="button" className="btn btn-outline" disabled={page <= 1} onClick={goPrev}>
                      Prev
                    </button>
                    <button type="button" className="btn btn-outline" disabled={page >= totalPages} onClick={goNext}>
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
