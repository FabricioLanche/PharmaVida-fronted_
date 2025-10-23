import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/AuthContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import ProductoCard from '../components/productos/ProductoCard'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { type ProductosResponse, type ProductosFiltros, TIPOS_PRODUCTOS } from '../types/producto.types'

function Home() {
  const { user, isAuthenticated } = useAuth()

  const [productosData, setProductosData] = useState<ProductosResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // Filtros / búsqueda
  const [filtros, setFiltros] = useState<ProductosFiltros>({ page: 1, pagesize: 25 })
  const [busqueda, setBusqueda] = useState('')

  // UI: mostrar filtros cuando el usuario toca el buscador
  const [showFiltros, setShowFiltros] = useState(false)
  const [toggleVisible, setToggleVisible] = useState(false)

  useEffect(() => { cargarProductos() }, [filtros])

  const cargarProductos = async () => {
    setLoading(true)
    try {
      const response = await productosService.listar(filtros)
      setProductosData(response.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  // Solo un filtro activo a la vez
  const handleFiltroChange = (key: keyof ProductosFiltros, value: any) => {
    const nuevos: ProductosFiltros = { page: 1, pagesize: 25 }
    if (value !== undefined && value !== '') nuevos[key] = value
    setFiltros(nuevos)
    setBusqueda('')
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    if (busqueda.trim()) {
      setFiltros({ nombre: busqueda.trim(), page: 1, pagesize: 25 })
    }
  }

  const filtroActivo =
    filtros.nombre ? 'nombre'
      : filtros.tipo ? 'tipo'
      : filtros.requiere_receta !== undefined ? 'receta'
      : filtros.stock_min !== undefined ? 'stock'
      : 'ninguno'

  // Paginación (para barra inferior)
  const totalPages   = productosData ? Math.ceil(productosData.total / productosData.pagesize) : 0
  const paginaActual = productosData?.page ?? filtros.page
  const hasPrev      = (paginaActual ?? 1) > 1
  const hasNext      = totalPages ? (paginaActual ?? 1) < totalPages : true
  const showTotal    = (paginaActual ?? 1) > 1

  const handlePageChange = (page: number) => {
    if (page < 1) return
    setFiltros({ ...filtros, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <section className="pv-card p-4 mb-6">
          <h2 className="title-xl">Productos</h2>

          {/* Buscador */}
          <form onSubmit={handleBuscar} className="mb-3">
            <div className="search-row">
              <input
                type="text"
                placeholder="Buscar por nombre"
                value={busqueda}
                onFocus={() => { setShowFiltros(true); setToggleVisible(true) }}
                onClick={() => { setShowFiltros(true); setToggleVisible(true) }}
                onChange={(e) => setBusqueda(e.target.value)}
                disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'nombre'}
                className="form-control flex-1"
                style={{
                  opacity: (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 0.6 : 1,
                  cursor: (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 'not-allowed' : 'text'
                }}
              />
              <button
                type="submit"
                disabled={!busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre')}
                className="btn btn-primary"
                onClick={() => setToggleVisible(true)}
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => { setFiltros({ page: 1, pagesize: 25 }); setBusqueda('') }}
                className="btn btn-accent"
              >
                Refrescar
              </button>
            </div>
          </form>

          {/* Toggle filtros */}
          {toggleVisible && (
            <button
              type="button"
              className="toggle-filtros"
              onClick={() => setShowFiltros(v => !v)}
            >
              {showFiltros ? 'Ocultar filtros ▲' : 'Más filtros ▼'}
            </button>
          )}

          {/* Banner filtro activo */}
          {filtroActivo !== 'ninguno' && (
            <div className="banner-info mb-3">
              ℹ️ <strong>Filtro activo:</strong>{' '}
              {filtroActivo === 'nombre' ? `Búsqueda: "${filtros.nombre}"` :
                filtroActivo === 'tipo' ? `Tipo: ${filtros.tipo}` :
                filtroActivo === 'receta' ? `Requiere receta: ${filtros.requiere_receta ? 'Sí' : 'No'}` :
                filtroActivo === 'stock' ? `Stock mínimo: ${filtros.stock_min}` : ''}{' '}
              (Solo puedes usar un filtro a la vez)
            </div>
          )}

          {/* Panel filtros */}
          {showFiltros && (
            <div className="filter-panel mb-4">
              <h3 className="m-0">
                Filtros Avanzados
                <span className="hint"> (Solo puedes usar un filtro a la vez)</span>
              </h3>

              <div className="filters-grid">
                <div>
                  <label className="form-label d-block mb-2">
                    Tipo de Producto
                    {filtroActivo !== 'ninguno' && filtroActivo !== 'tipo' && <span className="hint"> (Deshabilitado)</span>}
                  </label>
                  <select
                    className="form-select"
                    value={filtros.tipo || ''}
                    onChange={(e) => handleFiltroChange('tipo', e.target.value || undefined)}
                    disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'tipo'}
                  >
                    <option value="">Todos</option>
                    {TIPOS_PRODUCTOS.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label d-block mb-2">
                    Requiere Receta
                    {filtroActivo !== 'ninguno' && filtroActivo !== 'receta' && <span className="hint"> (Deshabilitado)</span>}
                  </label>
                  <select
                    className="form-select"
                    value={filtros.requiere_receta === undefined ? '' : String(filtros.requiere_receta)}
                    onChange={(e) => handleFiltroChange('requiere_receta', e.target.value === '' ? undefined : e.target.value === 'true')}
                    disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'receta'}
                  >
                    <option value="">Todos</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="form-label d-block mb-2">
                    Stock Mínimo
                    {filtroActivo !== 'ninguno' && filtroActivo !== 'stock' && <span className="hint"> (Deshabilitado)</span>}
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    placeholder="Ej: 10"
                    value={filtros.stock_min || ''}
                    onChange={(e) => handleFiltroChange('stock_min', e.target.value ? Number(e.target.value) : undefined)}
                    disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'stock'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tarjetas de productos */}
          {loading ? (
            <p className="text-center text-lg">Cargando productos...</p>
          ) : productosData ? (
            <>
              <div className="grid-chafa mb-4">
                {productosData.productos.map((p) => (
                  <ProductoCard key={p.id} producto={p} />
                ))}
              </div>

              {/* Paginación ABAJO */}
              {productosData.total > productosData.pagesize && (
                <div
                  className="pv-card-footer"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span className="page-label">
                    Page {paginaActual}{showTotal && totalPages ? ` / ${totalPages}` : ''}
                  </span>

                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={!hasPrev}
                      onClick={() => handlePageChange((paginaActual ?? 1) - 1)}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={!hasNext}
                      onClick={() => handlePageChange((paginaActual ?? 1) + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center">No se encontraron productos</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
