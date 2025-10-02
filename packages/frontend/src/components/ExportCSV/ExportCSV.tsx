import { Download } from 'lucide-react'
import styles from './ExportCSV.module.css'

interface ExportCSVProps {
  data: any[]
  filename?: string
  headers?: string[]
}

const ExportCSV = ({ data, filename = 'export', headers }: ExportCSVProps) => {
  const convertToCSV = (data: any[], headers?: string[]) => {
    if (!data || data.length === 0) return ''

    const keys = headers || Object.keys(data[0])
    const csvHeaders = keys.join(',')
    
    const csvRows = data.map(row => {
      return keys.map(key => {
        const cell = row[key]
        if (cell === null || cell === undefined) return ''
        
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    })

    return [csvHeaders, ...csvRows].join('\n')
  }

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    const csv = convertToCSV(data, headers)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button className={styles.exportButton} onClick={handleExport}>
      <Download size={18} />
      Export to CSV
    </button>
  )
}

export default ExportCSV