import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  CheckCircle2, 
  Loader2, 
  Wrench, 
  BarChart3, 
  Microscope, 
  Building2, 
  AlertCircle,
  ArrowRight,
  Clock,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function RoleAssignmentModal({ open, onClose }) {
  const { user, requestRoleAccess, pendingRequest, cancelRoleRequest, roleConfig } = useAuth();

  const [selectedRole, setSelectedRole] = useState(pendingRequest?.role || 'technician');
  const [facilityId, setFacilityId] = useState(pendingRequest?.facilityId || 'FACILITY-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!open || !user) return null;

  const roleOptions = [
    {
      id: 'technician',
      name: 'Field Technician',
      badge: 'TECHNICIAN',
      icon: Wrench,
      color: '#2E7D5B',
      borderClass: 'border-[#2E7D5B]',
      bgSelected: 'bg-[#2E7D5B]/10',
      tagClass: 'bg-[#2E7D5B]/15 text-[#2E7D5B] border-[#2E7D5B]/30',
      description: 'LOTO zero-energy safety sign-offs, motor greasing checklists, QR asset inspection, and work order execution.'
    },
    {
      id: 'manager',
      name: 'Operations Manager',
      badge: 'OPERATIONS LEAD',
      icon: BarChart3,
      color: '#2C6E9B',
      borderClass: 'border-[#2C6E9B]',
      bgSelected: 'bg-[#2C6E9B]/10',
      tagClass: 'bg-[#2E7D5B]/15 text-[#2C6E9B] border-[#2C6E9B]/30',
      description: 'Fleet-wide SCADA telemetry, automated PM scheduling, alarm thresholds, and work order dispatch.'
    },
    {
      id: 'auditor',
      name: 'Reliability Auditor',
      badge: 'RELIABILITY AUDITOR',
      icon: Microscope,
      color: '#B07B1C',
      borderClass: 'border-[#B07B1C]',
      bgSelected: 'bg-[#B07B1C]/10',
      tagClass: 'bg-[#B07B1C]/15 text-[#B07B1C] border-[#B07B1C]/30',
      description: 'ISO 10816 Class II vibration severity zones, model explainability, FFT spectral analysis, and raw CSV exports (Read-Only).'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await requestRoleAccess({
        email: user.email,
        id: user.id,
        name: user.name,
        role: selectedRole,
        facilityId: facilityId
      });

      setSuccessMessage(res?.message || `Access request for '${selectedRole}' submitted to backend for administrator verification.`);
      setTimeout(() => {
        setLoading(false);
      }, 1200);
    } catch (err) {
      setError(err?.message || 'Failed to submit access request. Please verify the backend connection.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-[#141B22]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[560px] bg-[#FFFFFF] dark:bg-[#1A222B] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-2xl shadow-[6px_6px_0_#1F2933] dark:shadow-[6px_6px_0_#0F151C] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold font-mono text-[13px] shadow-[2px_2px_0_#1F2933] dark:shadow-none">
              <Shield size={16} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8A8175]">
                AEGIS ACCESS GOVERNANCE
              </div>
              <div id="role-modal-title" className="font-display text-[15px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                Request Operational Role Access
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] flex items-center justify-center text-[#8A8175] hover:text-[#1F2933] dark:hover:text-[#FAF8F4] hover:bg-[#E6E0D6] dark:hover:bg-[#2C3847] transition-all disabled:opacity-50 cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Account Identity Header */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-[#D2C9BA] dark:border-[#2C3847] shrink-0" 
              />
              <div className="min-w-0">
                <div className="font-display text-[12px] font-bold text-[#1F2933] dark:text-[#FAF8F4] truncate">
                  {user.name}
                </div>
                <div className="font-mono text-[11px] text-[#2C6E9B] font-semibold truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[9px] uppercase text-[#8A8175]">Current Tier</div>
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${roleConfig?.badgeClass}`}>
                {roleConfig?.shortName}
              </span>
            </div>
          </div>

          {/* Pending Request Status Notice */}
          {pendingRequest && (
            <div className="p-3.5 rounded-xl bg-[#B07B1C]/10 border border-[#B07B1C]/30 flex items-start justify-between gap-3 text-[#B07B1C] animate-in fade-in">
              <div className="flex items-start gap-2.5 text-[12px] leading-relaxed">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pending Administrative Verification: </span>
                  <span>
                    Your request for <strong>{pendingRequest.role.toUpperCase()}</strong> ({pendingRequest.facilityId}) is queued in the backend for administrator review.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelRoleRequest}
                className="text-[10px] font-mono text-[#8A8175] hover:text-[#C05043] underline shrink-0 cursor-pointer"
              >
                Withdraw
              </button>
            </div>
          )}

          {/* Prompt Section */}
          <div>
            <label className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4] block">
              Select which operational role you are requesting:
            </label>
            <p className="text-[11px] text-[#6E6558] dark:text-[#A0988A] mt-0.5">
              Access to higher-level operational roles requires verification from a facility administrator in the backend.
            </p>
          </div>

          {/* Menu-driven Role Options */}
          <div className="grid gap-2">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRole(opt.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected 
                      ? `${opt.borderClass} ${opt.bgSelected} shadow-[2px_2px_0_#1F2933] dark:shadow-[2px_2px_0_#0F151C]` 
                      : 'border-[#E6E0D6] dark:border-[#2C3847] hover:border-[#8A8175] bg-[#FFFFFF] dark:bg-[#1A222B]'
                  }`}
                >
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${opt.color}20`, color: opt.color }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[13px] font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                        {opt.name}
                      </span>
                      <span className={`font-mono text-[8px] px-1.5 py-0.2 rounded border font-bold uppercase ${opt.tagClass}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#554D42] dark:text-[#C5BCAD] mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Facility ID Selector Dropdown */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141B22] border border-[#E6E0D6] dark:border-[#2C3847] space-y-1.5">
            <label className="font-mono text-[10px] uppercase font-bold text-[#8A8175] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 size={12} className="text-[#2C6E9B]" />
                <span>Target Facility Assignment</span>
              </span>
              <span className="text-[#2E7D5B] text-[9px]">Registered Plants</span>
            </label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FFFFFF] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-mono text-[12px] font-bold focus:outline-none focus:border-[#2C6E9B]"
            >
              <option value="FACILITY-01">Central Campus Utilities • Unit 01 (Main Plant)</option>
              <option value="FACILITY-02">North Manufacturing Pavilion • Unit 02 (CNC & Assembly)</option>
              <option value="FACILITY-03">West Energy & Chiller Substation • Vault B</option>
              <option value="FACILITY-DEMO">Aegis Demonstration Facility (Public Sandbox)</option>
            </select>
            <p className="font-mono text-[9px] text-[#8A8175]">
              Target industrial plant for requested telemetry streaming and work-order dispatch.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-[#C05043]/10 border border-[#C05043]/30 flex items-start gap-2 text-[#C05043] text-[12px]">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 flex items-start gap-2 text-[#2E7D5B] text-[12px]">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#6E6558] dark:text-[#A0988A] font-display text-[13px] font-bold hover:bg-[#E6E0D6] dark:hover:bg-[#2C3847] transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#1F2933] dark:border-[#2C3847] bg-[#2C6E9B] hover:bg-[#245b80] text-white font-display text-[13px] font-bold shadow-[3px_3px_0_#1F2933] dark:shadow-[3px_3px_0_#0F151C] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{pendingRequest ? 'Update Request' : 'Submit Access Request'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
