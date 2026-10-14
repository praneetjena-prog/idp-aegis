import React, { useState } from 'react';
import { Shield, X, ArrowRight, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Google "G" multi-color SVG icon per Google brand standards
export const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export function GoogleSignInModal({ open, onClose }) {
  const { signInWithGoogle, isSupabaseConfigured, authError: contextAuthError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (!open) return null;

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setLocalError(null);

    try {
      await signInWithGoogle();
      // Browser redirects to Google OAuth endpoint
    } catch (err) {
      setLocalError(err?.message || 'Google authentication could not be completed.');
      setLoading(false);
    }
  };

  const activeError = localError || (isSupabaseConfigured ? null : contextAuthError);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#141B22]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[480px] bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-2xl shadow-[6px_6px_0_#1F2933] dark:shadow-[6px_6px_0_#0F151C] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold font-mono text-[13px] shadow-[2px_2px_0_#1F2933] dark:shadow-none">
              <Shield size={16} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8A8175]">AEGIS SECURITY GATEWAY</div>
              <div id="modal-title" className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">Sign in with Google</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] flex items-center justify-center text-[#8A8175] hover:text-[#1F2933] dark:hover:text-[#FAF8F4] hover:bg-[#E6E0D6] dark:hover:bg-[#2C3847] transition-all disabled:opacity-50"
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-center max-w-[400px] mx-auto">
            <h3 className="font-display text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              Access Aegis Industrial Platform
            </h3>
            <p className="mt-2 text-[12px] text-[#6E6558] dark:text-[#A0988A] leading-relaxed">
              Sign in with your verified Google account. Access permissions and operational facility roles are governed exclusively by your database profile in Supabase.
            </p>
          </div>

          {/* Configuration / OAuth Error Display */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-[#C05043]/10 border border-[#C05043]/30 flex items-start gap-2.5 text-[#C05043] animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                <span className="font-bold">Authentication Notice: </span>
                <span>{activeError}</span>
              </div>
            </div>
          )}


          {/* Primary Action Button: Real Continue with Google */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading || !isSupabaseConfigured}
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] hover:bg-[#FAF8F4] dark:hover:bg-[#202B37] text-[#1F2933] dark:text-[#FAF8F4] font-display text-[14px] font-bold shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#2C6E9B]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon size={18} />
                  <span>Continue with Google</span>
                  <ArrowRight size={16} className="text-[#8A8175]" />
                </>
              )}
            </button>

            <p className="text-center font-mono text-[10px] text-[#8A8175] flex items-center justify-center gap-1.5">
              <Lock size={10} />
              <span>Verified Google OAuth • ISO 27001 & NIST 800-82 Compliant</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
