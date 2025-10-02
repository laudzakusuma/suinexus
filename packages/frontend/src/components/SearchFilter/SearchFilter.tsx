import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './SearchFilter.module.css'

interface FilterOption {
  label: string
  value: string
}

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, string>) => void
  filterOptions?: {
    [key: string]: FilterOption[]
  }
  placeholder?: string
}

const SearchFilter = ({ 
  onSearch, 
  onFilter, 
  filterOptions = {}, 
  placeholder = 'Search...' 
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters }
    if (value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    setActiveFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    onFilter({})
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => handleSearch('')}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <button
        className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter size={18} />
        Filters
        {activeFilterCount > 0 && (
          <span className={styles.filterBadge}>{activeFilterCount}</span>
        )}
      </button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filterPanel}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.filterHeader}>
              <h3>Filter Options</h3>
              {activeFilterCount > 0 && (
                <button className={styles.clearFiltersButton} onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>

            <div className={styles.filterOptions}>
              {Object.entries(filterOptions).map(([key, options]) => (
                <div key={key} className={styles.filterGroup}>
                  <label className={styles.filterLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <select
                    value={activeFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchFilter