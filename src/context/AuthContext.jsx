import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export const ROLES = {
  technician: {
    id: 'technician',
    name: 'Field Technician',
    shortName: 'Technician',
    badge: 'TECHNICIAN',
    color: '#2E7D5B',
    badgeClass: 'bg-[#2E7D5B]/15 text-[#2E7D5B] border-[#2E7D5B]/30',
    accentBg: 'bg-[#2E7D5B]/10',
    description: 'Field inspection checklists, LOTO safety protocols, physical sensor checks, and work order execution.',
    responsibilities: [
      'Lockout/Tagout (LOTO) safety protocol sign-off',
      'Step-by-step motor bearing greasing & belt tensioning',
      'QR code scanning and physical asset inspection',
      'Execution of dispatched maintenance work orders'
    ],
    defaultUser: {
      name: 'J. Rivera',
      email: 'j.rivera@facility.aegis-open.org',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    }
  },
  manager: {
    id: 'manager',
    name: 'Operations Manager',
    shortName: 'Operations Lead',
    badge: 'OPERATIONS LEAD',
    color: '#2C6E9B',
    badgeClass: 'bg-[#2C6E9B]/15 text-[#2C6E9B] border-[#2C6E9B]/30',
    accentBg: 'bg-[#2C6E9B]/10',
    description: 'Fleet-wide health telemetry, triage queue dispatch, automated PM calendar scheduling, and technician shift coordination.',
    responsibilities: [
      'Real-time SCADA telemetry & subsystem health monitoring',
      'Automated PM calendar scheduling with RFC 5545 sync',
      'Work order triage dispatch & technician assignment',
      'Alarm threshold configuration and facility calibration'
    ],
    defaultUser: {
      name: 'D. Vance',
      email: 'd.vance@facility.aegis-open.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    }
  },
  auditor: {
    id: 'auditor',
    name: 'Reliability Engineer & Auditor',
    shortName: 'Auditor',
    badge: 'RELIABILITY AUDITOR',
    color: '#B07B1C',
    badgeClass: 'bg-[#B07B1C]/15 text-[#B07B1C] border-[#B07B1C]/30',
    accentBg: 'bg-[#B07B1C]/10',
    description: 'ISO 10816 vibration severity compliance, RUL forecast validation, FFT spectral analysis, and raw telemetry export.',
    responsibilities: [
      'ISO 10816-3 vibration severity compliance audit',
      'Multivariate Isolation Forest & ARIMA model validation',
      '7–14 days RUL (Remaining Useful Life) verification',
      'Compliance reporting & raw CSV/JSON audit trails'
    ],
    defaultUser: {
      name: 'Dr. S. Nair',
      email: 's.nair@facility.aegis-open.org',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
    }
  }
};

export const ROLE_PERMISSIONS = {
  technician: {
    canDispatchWorkOrders: true,
    canSignLOTO: true,
    canPrintFieldSheet: true,
    canScanQR: true,
    canManageSchedules: false,
    canEditThresholds: false,
    canClearWorkOrders: false,
    showMacroFinancialMetrics: false,
    showIso10816Compliance: false,
    showModelExplainability: false,
    isReadOnly: false,
    badgeTitle: 'FIELD TECHNICIAN • SAFETY & LOTO ENFORCEMENT',
    bannerText: 'Field Technician Mode Active • Emphasizing physical checklists, LOTO zero-energy verification, and work order execution. Macro financial and energy metrics are hidden.',
    focusArea: 'Checklists & LOTO'
  },
  manager: {
    canDispatchWorkOrders: true,
    canSignLOTO: true,
    canPrintFieldSheet: true,
    canScanQR: true,
    canManageSchedules: true,
    canEditThresholds: true,
    canClearWorkOrders: true,
    showMacroFinancialMetrics: true,
    showIso10816Compliance: false,
    showModelExplainability: true,
    isReadOnly: false,
    badgeTitle: 'OPERATIONS MANAGER • FLEET DISPATCH AUTHORITY',
    bannerText: 'Operations Lead Mode Active • Full access to alert thresholds, automated PM scheduling, fleet-wide equipment status, and maintenance dispatch.',
    focusArea: 'Fleet Telemetry & Dispatch'
  },
  auditor: {
    canDispatchWorkOrders: false,
    canSignLOTO: false,
    canPrintFieldSheet: true,
    canScanQR: true,
    canManageSchedules: false,
    canEditThresholds: false,
    canClearWorkOrders: false,
    showMacroFinancialMetrics: true,
    showIso10816Compliance: true,
    showModelExplainability: true,
    isReadOnly: true,
    badgeTitle: 'RELIABILITY AUDITOR • READ-ONLY COMPLIANCE & ISO 10816',
    bannerText: 'Auditor Compliance Mode Active (Read-Only) • Mutation actions locked. Highlighting ISO 10816 Class II vibration severity zones, model explainability, and raw audit exports.',
    focusArea: 'ISO 10816 Compliance & Audit'
  }
};

const STORAGE_AUTH_KEY = 'aegis_auth_user';
const STORAGE_PENDING_ROLE = 'aegis_pending_oauth_role';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [intendedRoute, setIntendedRoute] = useState('console');
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  // Sync session changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_AUTH_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state', e);
    }
  }, [user]);

  // Listen to Supabase auth session if available
  useEffect(() => {
    let subscription = null;
    try {
      if (supabase?.auth?.onAuthStateChange) {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const pendingRole = window.localStorage.getItem(STORAGE_PENDING_ROLE);
            const role = pendingRole || user?.role || 'manager';
            const roleDef = ROLES[role] || ROLES.manager;
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || roleDef.defaultUser.name,
              email: session.user.email || roleDef.defaultUser.email,
              avatar: session.user.user_metadata?.avatar_url || roleDef.defaultUser.avatar,
              role: role,
              provider: 'google',
              signedInAt: new Date().toISOString()
            });
            window.localStorage.removeItem(STORAGE_PENDING_ROLE);
          }
        });
        subscription = data?.subscription;
      }
    } catch {
      // Standalone mode without live Supabase
    }
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [user?.role]);

  const openSignInModal = useCallback((destinationTab = 'console') => {
    setIntendedRoute(destinationTab);
    setSignInModalOpen(true);
  }, []);

  const closeSignInModal = useCallback(() => {
    setSignInModalOpen(false);
  }, []);

  const signInWithGoogle = useCallback(async (roleId = 'manager', customProfile = null) => {
    const roleDef = ROLES[roleId] || ROLES.manager;

    // Check if live Supabase URL is present for real OAuth redirect
    const hasLiveSupabase = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;

    if (hasLiveSupabase && !customProfile) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_PENDING_ROLE, roleId);
        }
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + window.location.pathname
          }
        });
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase OAuth error, falling back to simulated session:', err);
      }
    }

    // Direct simulated sign-in for preview, local, and GitHub Pages demo environments
    const profile = customProfile || roleDef.defaultUser;
    const authenticatedUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || roleDef.defaultUser.avatar,
      role: roleId,
      provider: 'google',
      signedInAt: new Date().toISOString()
    };

    setUser(authenticatedUser);
    setSignInModalOpen(false);
    return authenticatedUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '#home';
    }
  }, []);

  const switchRole = useCallback((newRoleId) => {
    if (!ROLES[newRoleId]) return;
    setUser(prev => {
      if (!prev) return null;
      const roleDef = ROLES[newRoleId];
      return {
        ...prev,
        role: newRoleId,
        // Also update default avatar/name if it was a default persona
        ...(prev.email?.includes('facility.aegis-open.org') ? {
          name: roleDef.defaultUser.name,
          email: roleDef.defaultUser.email,
          avatar: roleDef.defaultUser.avatar
        } : {})
      };
    });
  }, []);

  const activeRoleConfig = ROLES[user?.role] || ROLES.manager;
  const activePermissions = ROLE_PERMISSIONS[user?.role] || ROLE_PERMISSIONS.manager;

  const hasPermission = useCallback((permKey) => {
    return Boolean(activePermissions[permKey]);
  }, [activePermissions]);

  const value = {
    user,
    role: user?.role || null,
    roleConfig: activeRoleConfig,
    permissions: activePermissions,
    hasPermission,
    isAuthenticated: Boolean(user),
    signInWithGoogle,
    signOut,
    switchRole,
    signInModalOpen,
    openSignInModal,
    closeSignInModal,
    intendedRoute,
    ROLES,
    ROLE_PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
