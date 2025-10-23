import { useEffect, useState } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { TIPOS_PRODUCTOS } from '../types/producto.types'

type ProductoBasic = {
  id: number
  nombre: string
  precio: number
  stock: number
}

const PAGE_SIZE = 25

function AdminProductos() {
  // ---------- Dashboard (listado)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [productos, setProductos] = useState<ProductoBasic[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const cargarProductos = async () => {
    setLoadingList(true)
    try {
      const resp = await productosService.listar({ page, pagesize: PAGE_SIZE })
      const data = resp?.data || {}
      const items: ProductoBasic[] = data.productos || data.items || []
      setProductos(items)
      setTotal(Number(data.total ?? items.length ?? 0))
    } catch (e) {
      console.error(e)
      alert('❌ Error al cargar productos')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => { cargarProductos() }, [page])

  const totalPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE))

  // ---------- Formularios de gestión
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    tipo: 'Analgesico',
    precio: 0,
    stock: 0,
    requiere_receta: false,
  })

  const [actualizarProducto, setActualizarProducto] = useState({
    id: 0,
    stock: 0,
  })

  const [eliminarProductoId, setEliminarProductoId] = useState(0)

  // Crear producto
  const handleCrearProducto = async () => {
    try {
      const response = await productosService.createProducto(nuevoProducto)
      alert(`✅ Producto creado: ${JSON.stringify(response.data)}`)
      setNuevoProducto({
        nombre: '',
        tipo: 'Analgesico',
        precio: 0,
        stock: 0,
        requiere_receta: false,
      })
      // refresca dashboard
      setPage(1)
      cargarProductos()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Actualizar stock
  const handleActualizarProducto = async () => {
    try {
      const response = await productosService.updateProducto(actualizarProducto.id, {
        stock: actualizarProducto.stock,
      })
      alert(`✅ Producto actualizado: ${JSON.stringify(response.data)}`)
      cargarProductos()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Eliminar producto
  const handleEliminarProducto = async () => {
    try {
      await productosService.deleteProducto(eliminarProductoId)
      alert(`✅ Producto eliminado`)
      cargarProductos()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl" style={{ paddingBottom: '2rem' }}>
        {/* DASHBOARD */}
        <section className="pv-card p-4 mb-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <h2 className="title-xl" style={{ margin: 0 }}>Dashboard de Productos</h2>
            <div className="btn-group">
              <button className="btn btn-outline" onClick={() => { setPage(1); cargarProductos() }} disabled={loadingList}>
                Refrescar
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="hint">
              Página {page}{page > 1 && total ? ` / ${totalPages}` : ''} • {total} productos
            </span>
            <div className="btn-group">
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingList}
              >
                Prev
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loadingList}
              >
                Next
              </button>
            </div>
          </div>

          {loadingList ? (
            <p style={{ marginTop: 8 }}>Cargando productos…</p>
          ) : (
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
                    {['ID', 'Nombre', 'Precio (S/)', 'Stock'].map((h) => (
                      <th
                        key={h}
                        style={{
                          position: 'sticky',
                          top: 0,
                          background: '#fff',
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, idx) => (
                    <tr key={p.id} style={{ background: idx % 2 ? 'rgba(2,6,23,.02)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7' }}>{p.id}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7' }}>{p.nombre}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7' }}>
                        {Number(p.precio).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7' }}>{p.stock}</td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 12, color: '#64748b' }}>No hay productos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación al pie también */}
          {total > PAGE_SIZE && (
            <div className="pv-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="hint">Página {page} / {totalPages}</span>
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loadingList}>
                  Prev
                </button>
                <button className="btn btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loadingList}>
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* CREAR */}
        <section className="pv-card p-4 mb-6">
          <h2 className="title-md">Crear Producto</h2>
          <div>
            <label>Nombre</label>
            <input
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              className="form-control mb-2"
            />

            <label>Tipo</label>
            <select
              value={nuevoProducto.tipo}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, tipo: e.target.value })}
              className="form-select mb-2"
            >
              {TIPOS_PRODUCTOS.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>

            <label>Precio</label>
            <input
              type="number"
              value={nuevoProducto.precio}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
              className="form-control mb-2"
            />

            <label>Stock</label>
            <input
              type="number"
              value={nuevoProducto.stock}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: Number(e.target.value) })}
              className="form-control mb-2"
            />

            <label className="mb-2">
              <input
                type="checkbox"
                checked={nuevoProducto.requiere_receta}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, requiere_receta: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Requiere Receta
            </label>

            <button className="btn btn-primary" onClick={handleCrearProducto}>Crear Producto</button>
          </div>
        </section>

        {/* ACTUALIZAR */}
        <section className="pv-card p-4 mb-6">
          <h2 className="title-md">Actualizar Stock de Producto</h2>
          <div>
            <label>ID del Producto</label>
            <input
              type="number"
              value={actualizarProducto.id}
              onChange={(e) => setActualizarProducto({ ...actualizarProducto, id: Number(e.target.value) })}
              className="form-control mb-2"
            />

            <label>Nuevo Stock</label>
            <input
              type="number"
              value={actualizarProducto.stock}
              onChange={(e) => setActualizarProducto({ ...actualizarProducto, stock: Number(e.target.value) })}
              className="form-control mb-2"
            />

            <button className="btn btn-accent" onClick={handleActualizarProducto}>Actualizar Producto</button>
          </div>
        </section>

        {/* ELIMINAR */}
        <section className="pv-card p-4 mb-6">
          <h2 className="title-md">Eliminar Producto</h2>
          <div>
            <label>ID del Producto</label>
            <input
              type="number"
              value={eliminarProductoId}
              onChange={(e) => setEliminarProductoId(Number(e.target.value))}
              className="form-control mb-2"
            />

            <button className="btn btn-danger" onClick={handleEliminarProducto}>Eliminar Producto</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AdminProductos
