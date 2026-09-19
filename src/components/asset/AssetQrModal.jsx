import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Shield, 
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ASSET_REGISTRY = {
  'ahu-03': {
    id: 'ahu-03',
    code: 'AHU-03',
    name: 'Primary Supply Fan Motor',
    subsystem: 'HVAC Air Handlers',
    location: 'East Wing • Roof Level 3',
    serial: 'SN-TRN-2018-8821',
    voltage: '480V 3Φ • 60 Hz • 15 kW',
    rpm: '1750 RPM',
    bearing: '6205-2RS • SKF (x2)',
    grease: 'NLGI #2 Synthetic Lithium',
    belt: 'B-62 Match Pair (45-55 Hz)',
    lastPm: '2026-08-14 (29d ago)',
    openTicket: 'WO #8821 — Bearing Outer Race Wear (7d window)',
    status: 'Attention Required',
    statusVariant: 'critical'
  },
  'cw-pump-02': {
    id: 'cw-pump-02',
    code: 'CW-PUMP-02',
    name: 'Secondary Chilled Water Pump',
    subsystem: 'Hydraulic / Water Loops',
    location: 'Basement Mechanical Penthouse B2',
    serial: 'SN-GRF-2020-4109',
    voltage: '480V 3Φ • 11 kW',
    rpm: '2900 RPM',
    bearing: '6308-C3 • NSK',
    grease: 'Polyurea Grease #2',
    belt: 'Direct Drive Flexible Coupling',
    lastPm: '2026-08-28 (15d ago)',
    openTicket: 'Advisory — Strainer Clog Check (84% prob)',
    status: 'Advisory',
    statusVariant: 'attention'
  },
  'elec-01': {
    id: 'elec-01',
    code: 'SW-PANEL-01',
    name: 'Main Distribution Switchboard',
    subsystem: 'Electrical Infrastructure',
    location: 'Electrical Vault West',
    serial: 'SN-SQD-2019-0092',
    voltage: '480V / 277V • 2000A Main',
    rpm: 'Static Distribution',
    bearing: 'N/A',
    grease: 'Dielectric Contact Grease',
    belt: 'Busway Feeders',
    lastPm: '2026-07-10 (64d ago)',
    openTicket: 'None • 94.1% Phase Balance Nominal',
    status: 'Nominal',
    statusVariant: 'nominal'
  },
  'chiller-01': {
    id: 'chiller-01',
    code: 'CHILLER-01',
    name: 'Centrifugal Water Chiller 01',
    subsystem: 'Chilled Water Plant',
    location: 'Central Plant Room A',
    serial: 'SN-YRK-2017-5531',
    voltage: '4160V Medium Voltage • 450 Tons',
    rpm: 'Variable Speed Drive',
    bearing: 'Ceramic Hybrid Sleeve',
    grease: 'Synthetic Ester Oil',
    belt: 'Direct Hermetic',
    lastPm: '2026-09-01 (11d ago)',
    openTicket: 'None • Constant 4.2 bar Head',
    status: 'Nominal',
    statusVariant: 'nominal'
  },
  'vav-4b': {
    id: 'vav-4b',
    code: 'VAV-BOX-4B',
    name: 'Variable Air Volume Terminal 4B',
    subsystem: 'Energy Optimization',
    location: 'Building B • 4th Floor Ceiling Plen.',
    serial: 'SN-JCI-2021-9981',
    voltage: '24VAC Low Voltage Actuator',
    rpm: 'Modulating 0-90°',
    bearing: 'Nylon Bushing',
    grease: 'Maintenance-Free',
    belt: 'Direct Shaft Clamp',
    lastPm: '2026-06-15 (89d ago)',
    openTicket: 'Optimization — Actuator Hunting Drift',
    status: 'Optimization',
    statusVariant: 'info'
  }
};

export const AssetQrModal = ({ 
  open, 
  onClose, 
  assetId = 'ahu-03', 
  onSelectAsset, 
  onOpenPassport 
}) => {
  const [selectedId, setSelectedId] = useState(assetId);
  const [svgQr, setSvgQr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (assetId && ASSET_REGISTRY[assetId]) {
      setSelectedId(assetId);
    }
  }, [assetId]);

  const asset = ASSET_REGISTRY[selectedId] || ASSET_REGISTRY['ahu-03'];

  // Construct absolute URL for the QR code target
  const getPassportUrl = (id) => {
    if (typeof window === 'undefined') return `https://praneetjena-prog.github.io/idp-aegis/#asset/${id}`;
    const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
    return `${base}#asset/${id}`;
  };

  const passportUrl = getPassportUrl(asset.id);

  // Generate crisp vector SVG QR code
  useEffect(() => {
    let isCurrent = true;
    QRCode.toString(passportUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#1F2933',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then(svg => {
      if (isCurrent) setSvgQr(svg);
    }).catch(console.error);

    return () => { isCurrent = false; };
  }, [passportUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div 
        className="relative z-10 w-full max-w-[680px] bg-[#FFFFFF] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#1F2933] dark:text-[#FAF8F4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="print:hidden px-5 py-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border-b-2 border-[#1F2933] dark:border-[#2C3847] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center shadow-[2px_2px_0_#1F2933]">
              <QrCode size={16} />
            </div>
            <div>
              <h2 id="qr-modal-title" className="font-display text-[15px] font-bold uppercase tracking-wide">
                Machine QR Asset Tag & Field Passport
              </h2>
              <p className="font-mono text-[10px] text-[#8A8175]">
                Physical sticker label for field technician scanning
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded border border-[#D2C9BA] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] flex items-center justify-center text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] dark:hover:text-white"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Machine Selector Tabs */}
        <div className="print:hidden px-5 py-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center gap-1.5 overflow-x-auto">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] font-bold mr-1 shrink-0">
            Select Asset:
          </span>
          {Object.values(ASSET_REGISTRY).map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setSelectedId(a.id);
                if (onSelectAsset) onSelectAsset(a.id);
              }}
              className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
                selectedId === a.id
                  ? 'bg-[#2C6E9B] border-[#2C6E9B] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
              }`}
            >
              {a.code}
            </button>
          ))}
        </div>

        {/* Modal Body / Printable Tag Area */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">

          {/* Printable 2"x3" Industrial Asset Sticker Card */}
          <div 
            id="printable-asset-tag"
            className="border-2 border-[#1F2933] dark:border-[#D2C9BA] rounded-xl p-4 sm:p-5 bg-white text-[#1F2933] shadow-[4px_4px_0_#1F2933] max-w-[480px] mx-auto"
          >
            {/* Tag Top Header: Danger/Industrial Stripe */}
            <div className="flex items-center justify-between border-b-2 border-[#1F2933] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#1F2933] text-white rounded flex items-center justify-center font-mono font-bold text-[11px]">
                  AE
                </div>
                <div>
                  <div className="font-display text-[13px] font-bold uppercase tracking-wider leading-none">
                    AEGIS FACILITY ASSET TAG
                  </div>
                  <div className="font-mono text-[8px] text-[#554D42] tracking-widest mt-0.5">
                    PROPERTY OF CENTRAL CAMPUS UTILITIES
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-[9px] font-bold uppercase text-[#C05043]">
                ISO 10816 MONITORED
              </div>
            </div>

            {/* Middle Section: QR Code & Machine Identity */}
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Crisp Vector QR Code Container */}
              <div className="col-span-5 flex flex-col items-center">
                <div 
                  className="w-32 h-32 p-1 border-2 border-[#1F2933] rounded-lg bg-white flex items-center justify-center shadow-inner"
                  dangerouslySetInnerHTML={{ __html: svgQr }}
                />
                <span className="font-mono text-[8px] uppercase tracking-wider text-[#6E6558] font-bold mt-1 text-center">
                  Scan for Live Vitals
                </span>
              </div>

              {/* Asset Technical Specifications */}
              <div className="col-span-7 space-y-1 font-mono text-[10px]">
                <div>
                  <span className="text-[8px] uppercase text-[#8A8175] block">Equipment Tag ID</span>
                  <div className="font-display text-[16px] font-black text-[#1F2933] leading-tight">
                    {asset.code}
                  </div>
                  <div className="text-[10px] font-semibold text-[#554D42] leading-tight">
                    {asset.name}
                  </div>
                </div>

                <div className="pt-1 border-t border-[#D2C9BA] space-y-0.5 text-[9px] text-[#3E4650]">
                  <div><strong>Loc:</strong> {asset.location}</div>
                  <div><strong>Rating:</strong> {asset.voltage}</div>
                  <div><strong>Bearing:</strong> {asset.bearing}</div>
                  <div><strong>Grease:</strong> {asset.grease}</div>
                  <div><strong>Belt:</strong> {asset.belt}</div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Barcode aesthetic & Scan URL */}
            <div className="mt-3 pt-2 border-t-2 border-[#1F2933] flex items-center justify-between text-[8px] font-mono text-[#554D42]">
              <span>SERIAL: {asset.serial}</span>
              <span className="truncate max-w-[240px] text-right font-semibold text-[#1F2933]">
                aegis://asset/{asset.id}
              </span>
            </div>
          </div>

          {/* Quick Deep Link Box */}
          <div className="print:hidden p-3 bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg font-mono text-[10px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#8A8175] uppercase text-[9px]">
                Direct Scanned URL (Encapsulated in QR)
              </span>
              <span className="text-[9px] text-[#2E7D5B]">✓ Mobile Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={passportUrl} 
                className="flex-1 px-2 py-1 bg-white dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded text-[10px] text-[#1F2933] dark:text-[#FAF8F4] font-mono select-all"
              />
              <Button 
                variant="secondary" 
                size="xs" 
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-[#2E7D5B]" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="print:hidden px-5 py-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border-t-2 border-[#1F2933] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenPassport && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  onClose();
                  onOpenPassport(asset.id);
                }}
                className="flex items-center gap-1.5"
              >
                <ExternalLink size={12} />
                <span>Open Mobile Passport View</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer size={13} />
              <span>Print 2×3 Asset Tag</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
