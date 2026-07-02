import './ThemeToggle.css'
import { useTheme } from '../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()
  const buttonClassName = className ? `theme-toggle ${className}` : 'theme-toggle'

  return (
    <button
      type="button"
      className={buttonClassName}
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__label">Theme</span>
      <span className="theme-toggle__value">{theme}</span>
    </button>
  )
}
