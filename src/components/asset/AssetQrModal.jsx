import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Shield, 
  Download,
  Globe,
  Smartphone,
  ChevronDown,
  Info
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

const DEFAULT_PRODUCTION_BASE = 'https://praneetjena-prog.github.io/idp-aegis';

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
  const [useProductionUrl, setUseProductionUrl] = useState(true);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (assetId && ASSET_REGISTRY[assetId]) {
      setSelectedId(assetId);
    }
  }, [assetId]);

  const asset = ASSET_REGISTRY[selectedId] || ASSET_REGISTRY['ahu-03'];

  // Construct mobile-scannable absolute URL
  const getPassportUrl = (id) => {
    if (customBaseUrl.trim()) {
      const cleanBase = customBaseUrl.trim().replace(/\/$/, '');
      return `${cleanBase}/#asset/${id}`;
    }

    if (typeof window === 'undefined') {
      return `${DEFAULT_PRODUCTION_BASE}/#asset/${id}`;
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // On localhost, default to production URL so phones scanning the QR actually reach the app
    if (useProductionUrl || isLocalhost) {
      return `${DEFAULT_PRODUCTION_BASE}/#asset/${id}`;
    }

    const currentBase = window.location.origin + window.location.pathname.replace(/\/$/, '');
    return `${currentBase}/#asset/${id}`;
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

  const handleDownloadQr = () => {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, passportUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1F2933',
        light: '#FFFFFF'
      }
    }, (err) => {
      if (err) return console.error(err);
      const link = document.createElement('a');
      link.download = `aegis-qr-${asset.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
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
        className="relative z-10 w-full max-w-[580px] bg-[#FFFFFF] dark:bg-[#141B22] border-2 border-[#1F2933] dark:border-[#2C3847] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#1F2933] dark:text-[#FAF8F4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="print:hidden px-5 py-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border-b border-[#D2C9BA] dark:border-[#2C3847] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C6E9B] text-white flex items-center justify-center font-bold shadow-xs">
              <QrCode size={16} />
            </div>
            <div>
              <h2 id="qr-modal-title" className="font-display text-[15px] font-bold uppercase tracking-wide">
                Machine QR Asset Tag
              </h2>
              <p className="font-mono text-[10px] text-[#8A8175]">
                Physical scan label for field technician mobile inspection
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#D2C9BA] dark:border-[#2C3847] bg-white dark:bg-[#141B22] flex items-center justify-center text-[#6E6558] dark:text-[#C5BCAD] hover:text-[#1F2933] dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Machine Selector Pills */}
        <div className="print:hidden px-5 py-2.5 bg-[#FAF8F4] dark:bg-[#141B22] border-b border-[#E6E0D6] dark:border-[#2C3847] flex items-center gap-1.5 overflow-x-auto">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A8175] font-bold mr-1 shrink-0">
            Asset:
          </span>
          {Object.values(ASSET_REGISTRY).map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setSelectedId(a.id);
                if (onSelectAsset) onSelectAsset(a.id);
              }}
              className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
                selectedId === a.id
                  ? 'bg-[#2C6E9B] border-[#2C6E9B] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1A222B] border-[#D2C9BA] dark:border-[#2C3847] text-[#554D42] dark:text-[#C5BCAD] hover:border-[#2C6E9B]'
              }`}
            >
              {a.code}
            </button>
          ))}
        </div>

        {/* 3. Modal Body: Uncluttered 2"x3" Industrial Asset Sticker */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Printable Sticker Tag */}
          <div 
            id="printable-asset-tag"
            className="border-2 border-[#1F2933] rounded-xl p-4 sm:p-5 bg-white text-[#1F2933] shadow-[3px_3px_0_#1F2933] max-w-[420px] mx-auto"
          >
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1F2933] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#1F2933] text-white rounded flex items-center justify-center font-mono font-bold text-[11px]">
                  AE
                </div>
                <div>
                  <div className="font-display text-[12px] font-bold uppercase tracking-wider leading-none">
                    AEGIS FACILITY ASSET TAG
                  </div>
                  <div className="font-mono text-[8px] text-[#554D42] tracking-wider mt-0.5">
                    CENTRAL CAMPUS • UNIT 01
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-[9px] font-bold uppercase text-[#C05043]">
                ISO 10816 MONITORED
              </div>
            </div>

            {/* Middle Section: QR Code + Identifier */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* High Contrast Vector QR */}
              <div className="shrink-0 flex flex-col items-center">
                <div 
                  className="w-32 h-32 p-1.5 border-2 border-[#1F2933] rounded-lg bg-white flex items-center justify-center shadow-xs"
                  dangerouslySetInnerHTML={{ __html: svgQr }}
                />
                <span className="font-mono text-[8px] uppercase tracking-wider text-[#6E6558] font-bold mt-1 text-center">
                  Scan for Live Passport
                </span>
              </div>

              {/* Asset Identity Details (Focused on Identification, not specs) */}
              <div className="space-y-1.5 font-mono text-center sm:text-left min-w-0 flex-1">
                <div>
                  <span className="text-[8px] uppercase font-bold text-[#8A8175] block">Machine ID</span>
                  <div className="font-display text-[20px] font-black text-[#1F2933] leading-none">
                    {asset.code}
                  </div>
                </div>

                <div className="font-sans text-[12px] font-bold text-[#1F2933] leading-tight">
                  {asset.name}
                </div>

                <div className="pt-1.5 border-t border-[#D2C9BA] space-y-1 text-[10px] text-[#3E4650]">
                  <div>
                    <span className="text-[#8A8175] uppercase text-[9px]">Location: </span>
                    <span className="font-semibold">{asset.location}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8175] uppercase text-[9px]">Subsystem: </span>
                    <span className="font-semibold">{asset.subsystem}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8175] uppercase text-[9px]">Serial: </span>
                    <span className="font-semibold">{asset.serial}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom URL strip */}
            <div className="mt-3 pt-2 border-t-2 border-[#1F2933] flex items-center justify-between text-[8px] font-mono text-[#554D42]">
              <span className="flex items-center gap-1">
                <Smartphone size={10} />
                <span>MOBILE FIELD TELEMETRY</span>
              </span>
              <span className="truncate max-w-[200px] text-right font-bold text-[#1F2933]">
                #asset/{asset.id}
              </span>
            </div>
          </div>

          {/* Scannable Link & Copy Action */}
          <div className="print:hidden p-3 bg-[#FAF8F4] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] rounded-lg font-mono text-[10px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#8A8175] uppercase text-[9px] flex items-center gap-1">
                <Globe size={11} className="text-[#2C6E9B]" />
                Target Mobile URL
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(v => !v)}
                className="text-[9px] text-[#2C6E9B] hover:underline flex items-center gap-0.5"
              >
                <span>URL Settings</span>
                <ChevronDown size={10} className={showConfig ? 'rotate-180 transition-transform' : ''} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={passportUrl} 
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded text-[10px] text-[#1F2933] dark:text-[#FAF8F4] font-mono select-all truncate"
              />
              <Button 
                variant="secondary" 
                size="xs" 
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1 font-mono"
              >
                {copied ? <Check size={12} className="text-[#2E7D5B]" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            {/* Configurable Base URL Drawer */}
            {showConfig && (
              <div className="pt-2 border-t border-[#E6E0D6] dark:border-[#2C3847] space-y-2 text-[10px] text-[#6E6558] dark:text-[#A0988A] animate-in fade-in">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use-prod-url"
                    checked={useProductionUrl}
                    onChange={(e) => setUseProductionUrl(e.target.checked)}
                    className="accent-[#2C6E9B] rounded"
                  />
                  <label htmlFor="use-prod-url" className="cursor-pointer">
                    Use production deployed URL (<span className="text-[#2C6E9B]">GitHub Pages</span>) so phone scans work on mobile networks
                  </label>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-[#8A8175] mb-1">
                    Or Enter Custom LAN Host / IP:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. http://192.168.1.100:8080"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded text-[10px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Modal Footer Actions */}
        <div className="print:hidden px-5 py-3.5 bg-[#FAF8F4] dark:bg-[#1A222B] border-t border-[#D2C9BA] dark:border-[#2C3847] flex flex-wrap items-center justify-between gap-3">
          <div>
            {onOpenPassport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onClose();
                  onOpenPassport(asset.id);
                }}
                className="flex items-center gap-1.5 font-mono text-[11px]"
              >
                <ExternalLink size={12} />
                <span>Open Asset Passport</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadQr}
              className="flex items-center gap-1.5 font-mono text-[11px]"
              title="Download QR code image for digital documentation"
            >
              <Download size={13} />
              <span>Download PNG</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handlePrint} 
              className="flex items-center gap-1.5 font-mono text-[11px]"
            >
              <Printer size={13} />
              <span>Print Sticker</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onClose}
              className="font-mono text-[11px]"
            >
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
