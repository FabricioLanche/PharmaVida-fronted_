import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div>
      <h1>404 - Página No Encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}

export default NotFound
