function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      <div>
        <p>&copy; {currentYear} PharmaVida. Todos los derechos reservados.</p>
        <p>Email: contacto@pharmavida.com | Teléfono: (01) 123-4567</p>
      </div>
    </footer>
  )
}

export default Footer
