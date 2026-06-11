// AUTH CONTEXT - Shares login state across the whole app

import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/api';

// Create a "box" that holds auth data and can be accessed from any component
const AuthContext = createContext();

// Custom hook - shortcut to use auth data in any component
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State: who is logged in?
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // When app first loads, check if there's a saved token
  useEffect(() => {
    const checkLogin = async () => {
      if (token) {
        try {
          // Token exists - ask the server "who am I?"
          const response = await getProfile();
          setUser(response.data);
        } catch (error) {
          // Token is expired or invalid - clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  //LOGIN FUNCTION 
  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const data = response.data;

    // Save token to localStorage (refresh avoid)
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user; // Return user so we know the role
  };

  // REGISTER FUNCTION
  const register = async (name, email, password, phone) => {
    const response = await registerUser({ name, email, password, phone });
    const data = response.data;

    // Save token to localStorage
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  // LOGOUT FUNCTION 
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user, // true if user exists, false if null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
