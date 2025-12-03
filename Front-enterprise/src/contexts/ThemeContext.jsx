import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [userTheme, setUserTheme] = useState('system');

  // Función para obtener el tema del sistema
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Función para aplicar el tema al DOM
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    const isDark = newTheme === 'dark' || (newTheme === 'system' && getSystemTheme() === 'dark');

    if (isDark) {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      root.classList.remove('dark');
      setResolvedTheme('light');
    }
  };

  // Efecto para inicializar el tema
  useEffect(() => {
    // Obtener tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    setUserTheme(savedTheme);
    applyTheme(savedTheme);

    // Escuchar cambios en el tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Efecto para aplicar cambios de tema
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Función para cambiar el tema
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    setUserTheme(newTheme);
  };

  // Función para actualizar el tema del usuario en el backend
  const updateUserTheme = async (newTheme) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch('/api/users/theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (response.ok) {
        changeTheme(newTheme);
        return { success: true };
      } else {
        let errorMessage = 'Error al actualizar tema';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          if (errorData.errors) {
            errorMessage += ': ' + Object.values(errorData.errors).flat().join(', ');
          }
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      return { success: false, message: `Error de conexión: ${error.message}` };
    }
  };

  // Función para cargar el tema del usuario desde el backend
  const loadUserTheme = (user) => {
    if (user && user.theme) {
      changeTheme(user.theme);
    }
  };

  const value = {
    theme,
    setTheme: changeTheme,
    resolvedTheme,
    userTheme,
    updateUserTheme,
    loadUserTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
