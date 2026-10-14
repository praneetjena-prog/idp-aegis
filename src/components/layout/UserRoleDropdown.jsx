import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  LogOut, 
  Wrench, 
  BarChart3, 
  Microscope, 
  Shield, 
  Building2,
  Lock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon } from '../auth/GoogleSignInModal';

export function UserRoleDropdown() {
  const { 
    user, 
    isAuthenticated, 
    authLoading, 
    signOut, 
    roleConfig, 
    openSignInModal,
    openRoleModal,
    pendingRequest
  } = useAuth();
  
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#8A8175] font-mono text-[10px]">
        <Loader2 size={12} className="animate-spin text-[#2C6E9B]" />
        <span>Verifying auth...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => openSignInModal('console')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[11px] font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:border-[#2C6E9B] transition-all cursor-pointer"
      >
        <GoogleIcon size={14} />
        <span>Sign In with Google</span>
      </button>
    );
  }

  const roleIcons = {
    technician: Wrench,
    manager: BarChart3,
    auditor: Microscope,
    feature_user: Shield
  };

  const CurrentRoleIcon = roleIcons[user.role] || Shield;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:border-[#2C6E9B] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
        title="Account & Facility Information"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-6 h-6 rounded-full object-cover border border-[#D2C9BA] dark:border-[#2C3847]"
        />
        <div className="text-left hidden sm:block min-w-0">
          <div className="font-display text-[11px] font-bold leading-none max-w-[110px] truncate">{user.name}</div>
          <div className="font-mono text-[8px] text-[#8A8175] uppercase">{roleConfig?.shortName}</div>
        </div>
        <ChevronDown size={12} className={`text-[#8A8175] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] z-[100] py-2 animate-in fade-in zoom-in-95 duration-100 font-sans">
          
          {/* User Profile Header */}
          <div className="px-4 py-2.5 border-b border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-[#D2C9BA]"
              />
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13px] font-bold truncate text-[#1F2933] dark:text-[#FAF8F4]">
                  {user.name}
                </div>
                <div className="font-mono text-[10px] text-[#8A8175] truncate">
                  {user.email}
                </div>
              </div>
            </div>
            
            {/* Database Assigned Role */}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Assigned Role</span>
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${roleConfig?.badgeClass}`}>
                {roleConfig?.badge}
              </span>
            </div>

            {/* Facility Binding */}
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Facility ID</span>
              {user.facility_id ? (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#2E7D5B]/15 text-[#2E7D5B] border border-[#2E7D5B]/30 font-bold uppercase flex items-center gap-1">
                  <Building2 size={10} />
                  <span>{user.facility_id}</span>
                </span>
              ) : (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#B07B1C]/15 text-[#B07B1C] border border-[#B07B1C]/30 font-bold uppercase">
                  Unassigned
                </span>
              )}
            </div>
          </div>

          {/* Access Policy Summary */}
          <div className="p-3 border-b border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4]/50 dark:bg-[#141B22]/50">
            <div className="flex items-start gap-2">
              <Lock size={12} className="text-[#8A8175] mt-0.5 shrink-0" />
              <p className="font-mono text-[9px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
                {user.hasFacilityAccess ? (
                  <span>Operational telemetry authorized for facility <strong>{user.facility_id}</strong>.</span>
                ) : (
                  <span>Feature-only explorer access. Contact facility administrator for SCADA telemetry authorization.</span>
                )}
              </p>
            </div>
          </div>

          {/* Role Provisioning / Access Request Action */}
          <div className="p-1.5 border-b border-[#E6E0D6] dark:border-[#2C3847]">
            <button
              type="button"
              onClick={() => {
                openRoleModal();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-[11px] font-mono text-[#2C6E9B] hover:bg-[#2C6E9B]/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield size={13} />
                <span>{pendingRequest ? 'Role Request Status...' : 'Request Role Access...'}</span>
              </div>
              {pendingRequest && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B07B1C]/15 text-[#B07B1C] font-bold border border-[#B07B1C]/30">
                  Pending
                </span>
              )}
            </button>
          </div>

          {/* Account Actions: Sign Out */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-[11px] font-mono text-[#C05043] hover:bg-[#C05043]/10 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
