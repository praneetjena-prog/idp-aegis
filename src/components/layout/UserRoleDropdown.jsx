import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  LogOut, 
  Wrench, 
  BarChart3, 
  Microscope, 
  Check, 
  Home, 
  Shield, 
  UserCheck 
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { GoogleIcon } from '../auth/GoogleSignInModal';

export function UserRoleDropdown({ onGoHome }) {
  const { user, isAuthenticated, signOut, switchRole, roleConfig, openSignInModal } = useAuth();
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

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => openSignInModal('console')}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[10px] font-bold shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:border-[#2C6E9B] transition-all cursor-pointer"
      >
        <GoogleIcon size={14} />
        <span>Sign In</span>
      </button>
    );
  }

  const roleIcons = {
    technician: Wrench,
    manager: BarChart3,
    auditor: Microscope
  };

  const CurrentRoleIcon = roleIcons[user.role] || Shield;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C] hover:border-[#2C6E9B] active:translate-x-[1px] active:translate-y-[1px] transition-all"
        title="Account & Role Switcher"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-6 h-6 rounded-full object-cover border border-[#D2C9BA] dark:border-[#2C3847]"
        />
        <div className="text-left hidden sm:block">
          <div className="font-display text-[11px] font-bold leading-none">{user.name}</div>
          <div className="font-mono text-[8px] text-[#8A8175] uppercase">{roleConfig?.shortName}</div>
        </div>
        <span className={`hidden md:inline-block font-mono text-[8px] px-1 py-0.2 rounded border font-bold uppercase ${roleConfig?.badgeClass}`}>
          {roleConfig?.badge}
        </span>
        <ChevronDown size={12} className={`text-[#8A8175] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] shadow-[4px_4px_0_#1F2933] dark:shadow-[4px_4px_0_#0F151C] z-[100] py-2 animate-in fade-in zoom-in-95 duration-100 font-sans">
          
          {/* User Header */}
          <div className="px-4 py-2 border-b border-[#E6E0D6] dark:border-[#2C3847]">
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
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175]">Active Role</span>
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${roleConfig?.badgeClass}`}>
                {roleConfig?.badge}
              </span>
            </div>
          </div>

          {/* Switch Role Section */}
          <div className="p-2 border-b border-[#E6E0D6] dark:border-[#2C3847]">
            <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-wider font-bold text-[#8A8175]">
              Switch Role (RBAC Simulation)
            </div>
            <div className="space-y-1 mt-1">
              {Object.values(ROLES).map((r) => {
                const Icon = roleIcons[r.id] || Shield;
                const isCurrent = user.role === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      switchRole(r.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] transition-colors ${
                      isCurrent
                        ? 'bg-[#2C6E9B]/10 text-[#2C6E9B] font-bold'
                        : 'text-[#554D42] dark:text-[#C5BCAD] hover:bg-[#F1EDE6] dark:hover:bg-[#141B22]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={isCurrent ? 'text-[#2C6E9B]' : 'text-[#8A8175]'} />
                      <span>{r.name}</span>
                    </div>
                    {isCurrent && <Check size={13} className="text-[#2C6E9B]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-1">
            {onGoHome && (
              <button
                type="button"
                onClick={() => {
                  onGoHome();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-[11px] font-mono text-[#554D42] dark:text-[#C5BCAD] hover:bg-[#F1EDE6] dark:hover:bg-[#141B22] transition-colors"
              >
                <Home size={13} className="text-[#2C6E9B]" />
                <span>Return to Home Portal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-[11px] font-mono text-[#C05043] hover:bg-[#C05043]/10 transition-colors"
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
