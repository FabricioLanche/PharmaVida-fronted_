import { useState } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { ofertasService } from '../services/productos_y_ofertas/ofertasAPI'
import { TIPOS_PRODUCTOS } from '../types/producto.types'

function AdminProductos() {
  const [seccion, setSeccion] = useState<'productos' | 'ofertas'>('productos')

  // Estados para productos
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    tipo: 'Analgesico',
    precio: 0,
    stock: 0,
    requiere_receta: false
  })

  const [actualizarProducto, setActualizarProducto] = useState({
    id: 0,
    stock: 0
  })

  const [eliminarProductoId, setEliminarProductoId] = useState(0)

  // Estados para ofertas
  const [nuevaOferta, setNuevaOferta] = useState({
    fecha_vencimiento: '',
    detalles: [{ producto_id: 0, descuento: 0 }]
  })

  const [actualizarOferta, setActualizarOferta] = useState({
    id: 0,
    fecha_vencimiento: '',
    detalles: [{ producto_id: 0, descuento: 0 }]
  })

  const [eliminarOfertaId, setEliminarOfertaId] = useState(0)

  // Funciones para productos
  const handleCrearProducto = async () => {
    try {
      const response = await productosService.createProducto(nuevoProducto)
      alert(`✅ Producto creado: ${JSON.stringify(response.data)}`)
      setNuevoProducto({
        nombre: '',
        tipo: 'Analgesico',
        precio: 0,
        stock: 0,
        requiere_receta: false
      })
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleActualizarProducto = async () => {
    try {
      const response = await productosService.updateProducto(actualizarProducto.id, {
        stock: actualizarProducto.stock
      })
      alert(`✅ Producto actualizado: ${JSON.stringify(response.data)}`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleEliminarProducto = async () => {
    try {
      await productosService.deleteProducto(eliminarProductoId)
      alert(`✅ Producto eliminado`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Funciones para ofertas
  const handleCrearOferta = async () => {
    try {
      const response = await ofertasService.createOferta(nuevaOferta)
      alert(`✅ Oferta creada: ${JSON.stringify(response.data)}`)
      setNuevaOferta({
        fecha_vencimiento: '',
        detalles: [{ producto_id: 0, descuento: 0 }]
      })
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleActualizarOferta = async () => {
    try {
      const response = await ofertasService.updateOferta(actualizarOferta.id, {
        detalles: actualizarOferta.detalles,
        fecha_vencimiento: actualizarOferta.fecha_vencimiento
      })
      alert(`✅ Oferta actualizada: ${JSON.stringify(response.data)}`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleEliminarOferta = async () => {
    try {
      await ofertasService.deleteOferta(eliminarOfertaId)
      alert(`✅ Oferta eliminada`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const agregarDetalleOferta = (tipo: 'nueva' | 'actualizar') => {
    if (tipo === 'nueva') {
      setNuevaOferta({
        ...nuevaOferta,
        detalles: [...nuevaOferta.detalles, { producto_id: 0, descuento: 0 }]
      })
    } else {
      setActualizarOferta({
        ...actualizarOferta,
        detalles: [...actualizarOferta.detalles, { producto_id: 0, descuento: 0 }]
      })
    }
  }

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1>Panel de Administración</h1>

        {/* Selector de sección */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => setSeccion('productos')}
            style={{ 
              padding: '0.5rem 1rem', 
              marginRight: '1rem',
              backgroundColor: seccion === 'productos' ? '#3498db' : '#ddd',
              color: seccion === 'productos' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Gestionar Productos
          </button>
          <button 
            onClick={() => setSeccion('ofertas')}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: seccion === 'ofertas' ? '#3498db' : '#ddd',
              color: seccion === 'ofertas' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Gestionar Ofertas
          </button>
        </div>

        {/* SECCIÓN PRODUCTOS */}
        {seccion === 'productos' && (
          <div>
            {/* Crear Producto */}
            <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
              <h2>Crear Producto</h2>
              <div>
                <label>Nombre: </label>
                <input 
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <label>Tipo: </label>
                <select 
                  value={nuevoProducto.tipo}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, tipo: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {TIPOS_PRODUCTOS.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>

                <label>Precio: </label>
                <input 
                  type="number"
                  value={nuevoProducto.precio}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, precio: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <label>Stock: </label>
                <input 
                  type="number"
                  value={nuevoProducto.stock}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, stock: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <label>
                  <input 
                    type="checkbox"
                    checked={nuevoProducto.requiere_receta}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, requiere_receta: e.target.checked})}
                  />
                  Requiere Receta
                </label>

                <button 
                  onClick={handleCrearProducto}
                  style={{ display: 'block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Crear Producto
                </button>
              </div>
            </section>

            {/* Actualizar Producto */}
            <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
              <h2>Actualizar Stock de Producto</h2>
              <div>
                <label>ID del Producto: </label>
                <input 
                  type="number"
                  value={actualizarProducto.id}
                  onChange={(e) => setActualizarProducto({...actualizarProducto, id: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <label>Nuevo Stock: </label>
                <input 
                  type="number"
                  value={actualizarProducto.stock}
                  onChange={(e) => setActualizarProducto({...actualizarProducto, stock: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <button 
                  onClick={handleActualizarProducto}
                  style={{ display: 'block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#f39c12', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Actualizar Producto
                </button>
              </div>
            </section>

            {/* Eliminar Producto */}
            <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
              <h2>Eliminar Producto</h2>
              <div>
                <label>ID del Producto: </label>
                <input 
                  type="number"
                  value={eliminarProductoId}
                  onChange={(e) => setEliminarProductoId(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <button 
                  onClick={handleEliminarProducto}
                  style={{ display: 'block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Eliminar Producto
                </button>
              </div>
            </section>
          </div>
        )}

        {/* SECCIÓN OFERTAS */}
        {seccion === 'ofertas' && (
          <div>
            {/* Crear Oferta */}
            <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
              <h2>Crear Oferta</h2>
              <div>
                <label>Fecha de Vencimiento: </label>
                <input 
                  type="datetime-local"
                  value={nuevaOferta.fecha_vencimiento}
                  onChange={(e) => setNuevaOferta({...nuevaOferta, fecha_vencimiento: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                />

                <h4>Productos en Oferta:</h4>
                {nuevaOferta.detalles.map((detalle, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8f9fa' }}>
                    <label>ID Producto: </label>
                    <input 
                      type="number"
                      value={detalle.producto_id}
                      onChange={(e) => {
                        const newDetalles = [...nuevaOferta.detalles]
                        newDetalles[index].producto_id = Number(e.target.value)
                        setNuevaOferta({...nuevaOferta, detalles: newDetalles})
                      }}
                      style={{ padding: '0.3rem', marginRight: '1rem' }}
                    />
                    
                    <label>Descuento (%): </label>
                    <input 
                      type="number"
                      step="0.1"
                      value={detalle.descuento}
                      onChange={(e) => {
                        const newDetalles = [...nuevaOferta.detalles]
                        newDetalles[index].descuento = Number(e.target.value)
                        setNuevaOferta({...nuevaOferta, detalles: newDetalles})
                      }}
                      style={{ padding: '0.3rem' }}
                    />
                  </div>
                ))}

                <button 
                  onClick={() => agregarDetalleOferta('nueva')}
                  style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '0.3rem 0.8rem', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  + Agregar Producto
                </button>

                <button 
                  onClick={handleCrearOferta}
                  style={{ display: 'block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Crear Oferta
                </button>
              </div>
            </section>

            {/* Actualizar Oferta */}
            <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
              <h2>Actualizar Oferta</h2>
              <div>
                <label>ID de la Oferta: </label>
                <input 
                  type="number"
                  value={actualizarOferta.id}
                  onChange={(e) => setActualizarOferta({...actualizarOferta, id: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                />

                <label>Nueva Fecha de Vencimiento: </label>
                <input 
                  type="datetime-local"
                  value={actualizarOferta.fecha_vencimiento}
                  onChange={(e) => setActualizarOferta({...actualizarOferta, fecha_vencimiento: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                />

                <h4>Nuevos Productos en Oferta:</h4>
                {actualizarOferta.detalles.map((detalle, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8f9fa' }}>
                    <label>ID Producto: </label>
                    <input 
                      type="number"
                      value={detalle.producto_id}
                      onChange={(e) => {
                        const newDetalles = [...actualizarOferta.detalles]
                        newDetalles[index].producto_id = Number(e.target.value)
                        setActualizarOferta({...actualizarOferta, detalles: newDetalles})
                      }}
                      style={{ padding: '0.3rem', marginRight: '1rem' }}
                    />
                    
                    <label>Descuento (%): </label>
                    <input 
                      type="number"
                      step="0.1"
                      value={detalle.descuento}
                      onChange={(e) => {
                        const newDetalles = [...actualizarOferta.detalles]
                        newDetalles[index].descuento = Number(e.target.value)
                        setActualizarOferta({...actualizarOferta, detalles: newDetalles})
                      }}
                      style={{ padding: '0.3rem' }}
                    />
                  </div>
                ))}

                <button 
                  onClick={() => agregarDetalleOferta('actualizar')}
                  style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '0.3rem 0.8rem', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  + Agregar Producto
                </button>

                <button 
                  onClick={handleActualizarOferta}
                  style={{ display: 'block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#f39c12', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Actualizar Oferta
                </button>
              </div>
            </section>

            {/* Eliminar Oferta */}
            <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
              <h2>Eliminar Oferta</h2>
              <div>
                <label>ID de la Oferta: </label>
                <input 
                  type="number"
                  value={eliminarOfertaId}
                  onChange={(e) => setEliminarOfertaId(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />

                <button 
                  onClick={handleEliminarOferta}
                  style={{ display: 'block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Eliminar Oferta
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminProductos
