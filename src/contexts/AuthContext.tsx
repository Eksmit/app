import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Предустановленные аккаунты
const VALID_USERS = [
  { username: 'admin', password: 'admin123', name: 'Администратор' },
  { username: 'operator', password: 'operator123', name: 'Оператор' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('3d-print-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username: string, password: string): boolean => {
    const validUser = VALID_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (validUser) {
      const userInfo = { username: validUser.username, name: validUser.name };
      setUser(userInfo);
      sessionStorage.setItem('3d-print-user', JSON.stringify(userInfo));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('3d-print-user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
