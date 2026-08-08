import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rakshai_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null; // No default user — unauthenticated users see the Auth page
  });

  const [token, setToken] = useState(() => localStorage.getItem('rakshai_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rakshai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rakshai_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('rakshai_token', token);
    } else {
      localStorage.removeItem('rakshai_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch (err) {
      // Fallback local demo login matching role emails
      let demoRole = 'Citizen';
      let verification_status = 'Approved';
      if (email.includes('rescue')) { demoRole = 'Rescue Team'; }
      if (email.includes('admin')) { demoRole = 'Government Admin'; }
      if (email.includes('volunteer') || email.includes('ngo')) { demoRole = 'NGO / Volunteer'; }

      const demoUser = {
        id: `u-${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase() || 'Emergency User',
        email: email,
        role: demoRole,
        phone: '+91 98765 43210',
        location: 'New Delhi, India',
        verification_status
      };
      setUser(demoUser);
      setToken('demo-jwt-token-' + Date.now());
      return { success: true, user: demoUser, message: 'Logged in as demo user' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch (err) {
      // Fallback demo signup
      let verification_status = 'Approved';
      if (userData.role === 'Rescue Team') verification_status = 'Pending';
      if (userData.role === 'Government Admin' && !userData.email.toLowerCase().endsWith('@gov.in')) verification_status = 'Pending';

      const newUser = {
        id: `u-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || '+91 98000 00000',
        location: userData.location || 'India',
        organization: userData.organization || null,
        department: userData.department || null,
        id_proof: userData.id_proof || null,
        verification_status
      };
      setUser(newUser);
      setToken('demo-jwt-token-' + Date.now());
      return { success: true, user: newUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rakshai_user');
    localStorage.removeItem('rakshai_token');
  };

  // Switch role on the fly for demo review
  const setRole = (role) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
  };

  // Update user data (e.g. after admin approves verification)
  const updateUser = (updates) => {
    if (!user) return;
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
