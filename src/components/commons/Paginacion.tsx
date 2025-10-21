interface PaginacionProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Paginacion({ currentPage, totalPages, onPageChange }: PaginacionProps) {
  const maxPagesToShow = 5
  
  const getPageNumbers = () => {
    const pages: number[] = []
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: currentPage === 1 ? '#ccc' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        Anterior
      </button>

      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: page === currentPage ? '#2c3e50' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: page === currentPage ? 'bold' : 'normal'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: currentPage === totalPages ? '#ccc' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        Siguiente
      </button>

      <span style={{ marginLeft: '1rem', color: '#666' }}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  )
}

export default Paginacion
