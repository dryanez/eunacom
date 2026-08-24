import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
})

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('eunacom_theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      // fallback
    }
    return 'dark'
  })

  useEffect(() => {
    try {
      localStorage.setItem('eunacom_theme', theme)
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e)
    }
    
    // Apply attribute to document root & body class
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'light') {
      document.body.classList.add('light-theme')
      document.body.classList.remove('dark-theme')
    } else {
      document.body.classList.add('dark-theme')
      document.body.classList.remove('light-theme')
    }
  }, [theme])

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      toggleTheme,
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
