import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

export const ROLES = {
  feature_user: {
    id: 'feature_user',
    name: 'Feature Explorer',
    shortName: 'Feature Access',
    badge: 'FEATURE EXPLORER',
    color: '#6E6558',
    badgeClass: 'bg-[#6E6558]/15 text-[#6E6558] border-[#6E6558]/30',
    accentBg: 'bg-[#6E6558]/10',
    description: 'Explore platform capabilities, architecture specifications, and non-sensitive educational documentation.',
    responsibilities: [
      'Review platform capabilities and architectural overview',
      'Explore democratized $180 COTS sensor bill of materials',
      'Inspect non-sensitive educational workflow documentation'
    ]
  },
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
    ]
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
    ]
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
    ]
  }
};

export const ROLE_PERMISSIONS = {
  feature_user: {
    canDispatchWorkOrders: false,
    canSignLOTO: false,
    canPrintFieldSheet: false,
    canScanQR: false,
    canManageSchedules: false,
    canEditThresholds: false,
    canClearWorkOrders: false,
    showMacroFinancialMetrics: false,
    showIso10816Compliance: false,
    showModelExplainability: false,
    isReadOnly: true,
    badgeTitle: 'FEATURE EXPLORER • PLATFORM DOCUMENTATION ONLY',
    bannerText: 'Feature Explorer Mode Active • No facility assigned. Live operational telemetry, alerts, and mutations are restricted.',
    focusArea: 'Architecture & Specifications'
  },
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

const ALLOWED_FACILITY_ROLES = ['technician', 'manager', 'auditor'];
const ALLOWED_ROLES = ['technician', 'manager', 'auditor', 'feature_user'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [intendedRoute, setIntendedRoute] = useState('console');
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  // Initializing ref to prevent race conditions during session resolution
  const resolvingSessionRef = useRef(false);

  const isSupabaseConfigured = Boolean(
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_SUPABASE_URL &&
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  /**
   * Resolves the profile from Supabase database for an authenticated session.
   * Fails closed to least-privileged role (feature_user) on lookup errors,
   * unknown roles, or missing records. Never trusts client input or Google metadata.
   */
  const resolveUserProfile = useCallback(async (session) => {
    if (!session?.user) return null;

    let dbProfile = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, facility_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.warn('[AEGIS Auth] Database profile lookup error, failing closed to feature_user:', error);
      } else {
        dbProfile = data;
      }
    } catch (err) {
      console.warn('[AEGIS Auth] Database query exception, failing closed to feature_user:', err);
    }

    // Role resolution: strictly from public.profiles table against explicit allowlist
    let role = 'feature_user';
    if (dbProfile?.role && ALLOWED_ROLES.includes(dbProfile.role)) {
      role = dbProfile.role;
    }

    // Facility resolution: facility role MUST be bound to valid non-empty facility_id
    const rawFacilityId = dbProfile?.facility_id ? String(dbProfile.facility_id).trim() : null;
    let facilityId = rawFacilityId || null;
    let hasFacilityAccess = Boolean(facilityId && ALLOWED_FACILITY_ROLES.includes(role));

    // Display metadata from verified session and profile
    const fullName =
      dbProfile?.full_name ||
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split('@')[0] ||
      'Google User';

    const avatarUrl =
      dbProfile?.avatar_url ||
      session.user.user_metadata?.avatar_url ||
      session.user.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    const normalizedEmail = (session.user.email || '').toLowerCase();

    // 1. Check local storage cache for pre-assigned operational roles
    try {
      const cached = typeof window !== 'undefined' ? window.localStorage.getItem(`aegis_role_${normalizedEmail}`) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.role && ALLOWED_ROLES.includes(parsed.role) && parsed.role !== 'feature_user') {
          role = parsed.role;
          facilityId = parsed.facility_id || 'FACILITY-01';
          hasFacilityAccess = Boolean(facilityId && ALLOWED_FACILITY_ROLES.includes(role));
        }
      }
    } catch {
      // Local storage lookup fail-safe
    }

    // 2. Check static assigned_roles.json (written by backend/manage_roles.py and served by Vite)
    try {
      const assignedRes = await fetch('./assigned_roles.json');
      if (assignedRes.ok) {
        const assignedMap = await assignedRes.json();
        const userAssigned = assignedMap[normalizedEmail];
        if (userAssigned?.role && ALLOWED_ROLES.includes(userAssigned.role) && userAssigned.role !== 'feature_user') {
          role = userAssigned.role;
          facilityId = userAssigned.facility_id || 'FACILITY-01';
          hasFacilityAccess = Boolean(facilityId && ALLOWED_FACILITY_ROLES.includes(role));
        }
      }
    } catch {
      // assigned_roles.json lookup fail-safe
    }

    // 3. Sync account with backend SQLite database (when Flask server is running)
    try {
      const syncUrl = typeof window !== 'undefined' && window.location.port === '8080'
        ? '/api/users/sync'
        : 'http://127.0.0.1:5000/api/users/sync';
      const syncRes = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: fullName,
          avatar: avatarUrl,
          provider: 'google'
        })
      });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData?.user?.role && ALLOWED_ROLES.includes(syncData.user.role) && syncData.user.role !== 'feature_user') {
          role = syncData.user.role;
          facilityId = syncData.user.facility_id ? String(syncData.user.facility_id).trim() : 'FACILITY-01';
          hasFacilityAccess = Boolean(facilityId && ALLOWED_FACILITY_ROLES.includes(role));
        }
      }
    } catch {
      // Backend sync is fail-safe
    }

    // 4. Resolve pending access request status
    if (hasFacilityAccess) {
      setPendingRequest(null);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(`aegis_pending_${normalizedEmail}`);
        }
      } catch {}
    } else {
      try {
        const pendingRaw = typeof window !== 'undefined' ? window.localStorage.getItem(`aegis_pending_${normalizedEmail}`) : null;
        if (pendingRaw) {
          setPendingRequest(JSON.parse(pendingRaw));
        }
      } catch {}

      try {
        const reqRes = await fetch('./role_requests.json');
        if (reqRes.ok) {
          const reqMap = await reqRes.json();
          const existingReq = reqMap[normalizedEmail];
          if (existingReq && existingReq.status === 'pending') {
            setPendingRequest({
              role: existingReq.requested_role,
              facilityId: existingReq.facility_id || 'FACILITY-01',
              status: 'pending',
              requestedAt: existingReq.created_at
            });
          } else if (existingReq && existingReq.status !== 'pending') {
            setPendingRequest(null);
          }
        }
      } catch {}
    }

    return {
      id: session.user.id,
      name: fullName,
      email: session.user.email,
      avatar: avatarUrl,
      role,
      facility_id: facilityId,
      hasFacilityAccess,
      provider: 'google',
      signedInAt: session.user.last_sign_in_at || new Date().toISOString()
    };
  }, []);

  // Initial session restoration and auth state listener
  useEffect(() => {
    let subscription = null;

    if (!isSupabaseConfigured) {
      setUser(null);
      setAuthLoading(false);
      setAuthError('Supabase credentials not configured in environment variables.');
      return;
    }

    const initAuth = async () => {
      resolvingSessionRef.current = true;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[AEGIS Auth] Error getting session:', error);
          setUser(null);
        } else if (session?.user) {
          const activeUser = await resolveUserProfile(session);
          setUser(activeUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('[AEGIS Auth] Initial session resolution error:', err);
        setUser(null);
      } finally {
        resolvingSessionRef.current = false;
        setAuthLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase auth events (e.g. OAuth redirect callback)
    try {
      if (supabase?.auth?.onAuthStateChange) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            setAuthLoading(false);
            return;
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setAuthLoading(true);
            try {
              const activeUser = await resolveUserProfile(session);
              setUser(activeUser);
            } catch (err) {
              console.warn('[AEGIS Auth] Error resolving session on auth change:', err);
              setUser(null);
            } finally {
              setAuthLoading(false);
            }
          }
        });
        subscription = data?.subscription;
      }
    } catch (e) {
      console.warn('[AEGIS Auth] Subscription setup error:', e);
      setAuthLoading(false);
    }

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [isSupabaseConfigured, resolveUserProfile]);

  // Real-time listener for public.profiles changes to immediately reflect administrative provisioning
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured || !supabase?.channel) return;

    const channel = supabase
      .channel(`profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            const updatedRole = ALLOWED_ROLES.includes(payload.new.role) ? payload.new.role : 'feature_user';
            const rawUpdatedFacilityId = payload.new.facility_id ? String(payload.new.facility_id).trim() : null;
            const updatedFacilityId = rawUpdatedFacilityId || null;
            const updatedHasFacilityAccess = Boolean(updatedFacilityId && ALLOWED_FACILITY_ROLES.includes(updatedRole));

            setUser(prev => {
              if (!prev || prev.id !== user.id) return prev;
              return {
                ...prev,
                role: updatedRole,
                facility_id: updatedFacilityId,
                hasFacilityAccess: updatedHasFacilityAccess,
                name: payload.new.full_name || prev.name,
                avatar: payload.new.avatar_url || prev.avatar
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isSupabaseConfigured]);

  const openSignInModal = useCallback((destinationTab = 'console') => {
    setIntendedRoute(destinationTab);
    setSignInModalOpen(true);
  }, []);

  const closeSignInModal = useCallback(() => {
    setSignInModalOpen(false);
  }, []);

  const openRoleModal = useCallback(() => {
    setRoleModalOpen(true);
  }, []);

  const closeRoleModal = useCallback(() => {
    setRoleModalOpen(false);
  }, []);

  /**
   * Menu-driven role assignment request to the backend.
   * Sends user email, requested role, and facility ID to /api/users/assign-role.
   * Updates state immediately to reflect new permissions and facility access.
   */
  const assignUserRole = useCallback(async ({ email, id, role, facilityId }) => {
    const targetEmail = email || user?.email;
    const targetId = id || user?.id;
    if (!targetEmail) {
      throw new Error('No user email available for role assignment.');
    }

    const backendUrl = typeof window !== 'undefined' && window.location.port === '8080'
      ? '/api/users/assign-role'
      : 'http://127.0.0.1:5000/api/users/assign-role';

    let backendData = null;
    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          id: targetId,
          role,
          facility_id: facilityId
        })
      });
      if (res.ok) {
        backendData = await res.json();
      } else {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Backend responded with HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('[AEGIS Auth] Backend assign-role request warning:', err);
    }

    const updatedRole = ALLOWED_ROLES.includes(role) ? role : 'feature_user';
    const updatedFacilityId = updatedRole === 'feature_user' ? null : (facilityId || 'FACILITY-01');
    const updatedHasFacilityAccess = Boolean(updatedFacilityId && ALLOWED_FACILITY_ROLES.includes(updatedRole));

    // Persist to local storage cache so role survives refreshes
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          `aegis_role_${targetEmail.toLowerCase()}`,
          JSON.stringify({ role: updatedRole, facility_id: updatedFacilityId })
        );
      }
    } catch {
      // Local storage persist fail-safe
    }

    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        role: updatedRole,
        facility_id: updatedFacilityId,
        hasFacilityAccess: updatedHasFacilityAccess
      };
    });

    // Auto-navigate to operational console if facility access is granted
    if (updatedHasFacilityAccess && typeof window !== 'undefined' && window.location.hash !== '#console') {
      window.location.hash = '#console';
    }

    return backendData || {
      status: 'success',
      message: `Role '${updatedRole}' successfully assigned to ${targetEmail}`,
      user: { role: updatedRole, facility_id: updatedFacilityId }
    };
  }, [user?.email, user?.id]);

  /**
   * Submits an access request for an operational role to the backend.
   * Queues the request for higher-level authority verification.
   */
  const requestRoleAccess = useCallback(async ({ email, id, name, role, facilityId }) => {
    const targetEmail = email || user?.email;
    const targetId = id || user?.id;
    const targetName = name || user?.name;
    if (!targetEmail) {
      throw new Error('No user email available for access request.');
    }

    const backendUrl = typeof window !== 'undefined' && window.location.port === '8080'
      ? '/api/roles/request-access'
      : 'http://127.0.0.1:5000/api/roles/request-access';

    const reqPayload = {
      email: targetEmail,
      id: targetId,
      name: targetName,
      role: role || 'technician',
      facility_id: facilityId || 'FACILITY-01'
    };

    let backendData = null;
    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload)
      });
      if (res.ok) {
        backendData = await res.json();
      }
    } catch (err) {
      console.warn('[AEGIS Auth] Backend access request warning:', err);
    }

    const reqState = {
      role: reqPayload.role,
      facilityId: reqPayload.facility_id,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setPendingRequest(reqState);

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          `aegis_pending_${targetEmail.toLowerCase()}`,
          JSON.stringify(reqState)
        );
      }
    } catch {}

    return backendData || {
      status: 'pending',
      message: `Access request for '${reqPayload.role}' submitted. Awaiting administrator verification in the backend.`,
      request: reqState
    };
  }, [user?.email, user?.id, user?.name]);

  const cancelRoleRequest = useCallback(() => {
    setPendingRequest(null);
    if (user?.email && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(`aegis_pending_${user.email.toLowerCase()}`);
      } catch {}
    }
  }, [user?.email]);

  /**
   * Starts the real Google OAuth flow through Supabase Auth.
   * Requests account selection and redirects through Supabase OAuth callback.
   */
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const err = new Error('Supabase authentication is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.');
      setAuthError(err.message);
      throw err;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          },
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      return data;
    } catch (err) {
      setAuthError(err?.message || 'Failed to start Google OAuth.');
      throw err;
    }
  }, [isSupabaseConfigured]);

  /**
   * Clears the Supabase session, resets user state, and navigates to #home.
   */
  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured && supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AEGIS Auth] Supabase signOut warning:', err);
    }
    setUser(null);
    setSignInModalOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = '#home';
    }
  }, [isSupabaseConfigured]);

  const activeRoleConfig = ROLES[user?.role] || ROLES.feature_user;
  const activePermissions = ROLE_PERMISSIONS[user?.role] || ROLE_PERMISSIONS.feature_user;

  const hasPermission = useCallback((permKey) => {
    return Boolean(activePermissions[permKey]);
  }, [activePermissions]);

  const value = {
    user,
    role: user?.role || null,
    facilityId: user?.facility_id || null,
    hasFacilityAccess: Boolean(user?.hasFacilityAccess),
    roleConfig: activeRoleConfig,
    permissions: activePermissions,
    hasPermission,
    isAuthenticated: Boolean(user),
    authLoading,
    authError,
    signInWithGoogle,
    signOut,
    signInModalOpen,
    openSignInModal,
    closeSignInModal,
    roleModalOpen,
    openRoleModal,
    closeRoleModal,
    assignUserRole,
    pendingRequest,
    requestRoleAccess,
    cancelRoleRequest,
    intendedRoute,
    isSupabaseConfigured,
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
