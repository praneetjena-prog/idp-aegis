import React, { useState } from 'react';
import { Shield, Wrench, BarChart3, Microscope, CheckCircle2, X, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';

// Google "G" multi-color SVG icon per Google brand standards
export const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export function GoogleSignInModal({ open, onClose, onSuccess }) {
  const { signInWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState('manager');
  const [loading, setLoading] = useState(false);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!open) return null;

  const handleSignIn = async () => {
    setLoading(true);
    try {
      let customProfile = null;
      if (useCustomAccount && customEmail.trim()) {
        customProfile = {
          name: customName.trim() || customEmail.split('@')[0],
          email: customEmail.trim(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || customEmail)}`
        };
      }
      await signInWithGoogle(selectedRole, customProfile);
      if (onSuccess) onSuccess(selectedRole);
    } catch (e) {
      console.error('Sign in failed', e);
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    technician: Wrench,
    manager: BarChart3,
    auditor: Microscope
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#141B22]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[520px] bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-2xl shadow-[6px_6px_0_#1F2933] dark:shadow-[6px_6px_0_#0F151C] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold font-mono text-[13px] shadow-[2px_2px_0_#1F2933] dark:shadow-none">
              <Shield size={16} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8A8175]">AEGIS SECURITY GATEWAY</div>
              <div className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Sign in to Console</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] flex items-center justify-center text-[#8A8175] hover:text-[#1F2933] dark:hover:text-[#FAF8F4] hover:bg-[#E6E0D6] dark:hover:bg-[#2C3847] transition-all"
            title="Close and return to Home"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-center max-w-[420px] mx-auto">
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              Access Aegis Operations Cockpit
            </h3>
            <p className="mt-1 text-[12px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
              Authenticate with your Google account to access real-time facility telemetry, anomaly triaging, and equipment controls.
            </p>
          </div>

          {/* Role Selection Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8A8175]">
                Select Console Role (RBAC)
              </label>
              <span className="font-mono text-[10px] text-[#2C6E9B]">Role-based telemetry view</span>
            </div>

            <div className="grid gap-2.5">
              {Object.values(ROLES).map((r) => {
                const IconComponent = roleIcons[r.id] || Shield;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#2C6E9B] bg-[#2C6E9B]/5 dark:bg-[#2C6E9B]/10 shadow-sm'
                        : 'border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] hover:border-[#D2C9BA]'
                    }`}
                  >
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#2C6E9B] text-white' : 'bg-[#E6E0D6] dark:bg-[#2C3847] text-[#6E6558] dark:text-[#C5BCAD]'
                    }`}>
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                          {r.name}
                        </span>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${r.badgeClass}`}>
                          {r.badge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#6E6558] dark:text-[#A0988A] leading-normal">
                        {r.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-[#8A8175]">
                        <span>Default: {r.defaultUser.name}</span>
                        <span>•</span>
                        <span>{r.defaultUser.email}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-[#2C6E9B] shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Custom Google Account Input for Testing */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setUseCustomAccount(!useCustomAccount)}
              className="text-[11px] font-mono text-[#2C6E9B] hover:underline flex items-center gap-1"
            >
              <KeyRound size={12} />
              <span>{useCustomAccount ? '− Use default role persona' : '+ Use custom Google email/name'}</span>
            </button>

            {useCustomAccount && (
              <div className="mt-2.5 p-3 rounded-lg bg-[#F1EDE6] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] space-y-2 animate-in fade-in">
                <div>
                  <label className="block font-mono text-[10px] text-[#8A8175] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded focus:outline-none focus:border-[#2C6E9B] text-[#1F2933] dark:text-[#FAF8F4]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#8A8175] mb-1">Google / Facility Email</label>
                  <input
                    type="email"
                    placeholder="e.g. alex.morgan@facility.org"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] bg-white dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded focus:outline-none focus:border-[#2C6E9B] text-[#1F2933] dark:text-[#FAF8F4]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button: Sign in with Google */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] hover:bg-[#FAF8F4] dark:hover:bg-[#202B37] text-[#1F2933] dark:text-[#FAF8F4] font-display text-[14px] font-bold shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon size={18} />
              <span>
                {loading 
                  ? 'Connecting to Google OAuth...' 
                  : `Sign in with Google as ${ROLES[selectedRole]?.shortName || 'User'}`}
              </span>
              <ArrowRight size={16} className="text-[#8A8175]" />
            </button>

            <p className="text-center font-mono text-[10px] text-[#8A8175] flex items-center justify-center gap-1.5">
              <Lock size={10} />
              <span>AES-256 session token • ISO 27001 & NIST 800-82 RBAC policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
