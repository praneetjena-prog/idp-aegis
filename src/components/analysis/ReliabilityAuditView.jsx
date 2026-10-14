import React, { useState } from 'react';
import { 
  Microscope, 
  FileSpreadsheet, 
  FileJson, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Hash, 
  Download, 
  Filter, 
  Layers, 
  ExternalLink,
  Info,
  Check
} from 'lucide-react';
import { AuditorComplianceCard } from './AuditorComplianceCard';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const FACILITY_EQUIPMENT_AUDIT_DATA = [
  {
    assetId: 'ahu-03',
    assetCode: 'AHU-03',
    name: 'Primary Supply Fan Unit',
    subsystem: 'HVAC Air Handlers',
    standard: 'ISO 10816-3 Class II',
    metric: 'Vibration RMS Velocity',
    nominalLimit: '2.80 mm/s',
    criticalLimit: '7.10 mm/s',
    faultReading: '6.80 mm/s',
    nominalReading: '1.45 mm/s',
    unit: 'mm/s',
    faultZone: 'Zone C (Unsatisfactory)',
    nominalZone: 'Zone B (Acceptable)',
    rul: '168h (7 days)',
    auditorSignoff: 'Conditional Run Approved — PM Required Within 7 Days',
    auditor: 'Dr. E. Vance (PE #48912)',
    lastAuditDate: '2026-10-12'
  },
  {
    assetId: 'cw-pump-02',
    assetCode: 'CW-PUMP-02',
    name: 'Chilled Water Circulator Pump',
    subsystem: 'Hydraulic / Water Loops',
    standard: 'HI 9.6.4 Hydraulic Institute',
    metric: 'Suction Differential Pressure',
    nominalLimit: '0.80 bar',
    criticalLimit: '1.40 bar',
    faultReading: '1.18 bar',
    nominalReading: '0.45 bar',
    unit: 'bar',
    faultZone: 'Zone C (Strainer Restriction)',
    nominalZone: 'Zone A (Good)',
    rul: '336h (14 days)',
    auditorSignoff: 'Routine Basket Cleanout Slotted',
    auditor: 'Dr. E. Vance (PE #48912)',
    lastAuditDate: '2026-10-10'
  },
  {
    assetId: 'elec-01',
    assetCode: 'SW-PANEL-01',
    name: 'Main Feeder Switchboard Vault',
    subsystem: 'Electrical Infrastructure',
    standard: 'NFPA 70B & NETA MTS',
    metric: 'Busbar Phase Imbalance & Temp Delta',
    nominalLimit: '5.0°C ΔT',
    criticalLimit: '15.0°C ΔT',
    faultReading: '4.2°C ΔT',
    nominalReading: '2.1°C ΔT',
    unit: '°C ΔT',
    faultZone: 'Zone A (Nominal)',
    nominalZone: 'Zone A (Nominal)',
    rul: '720h+ (Optimal)',
    auditorSignoff: 'Compliant with NFPA 70E Arc Flash Class 2',
    auditor: 'M. Chen (Certified Auditor)',
    lastAuditDate: '2026-10-14'
  },
  {
    assetId: 'vav-4b',
    assetCode: 'VAV-BOX-4B',
    name: 'Variable Air Volume Terminal 4B',
    subsystem: 'HVAC Network',
    standard: 'ASHRAE Guideline 36',
    metric: 'Actuator Hunting Oscillation',
    nominalLimit: '±5% stroke',
    criticalLimit: '±25% stroke',
    faultReading: '±18% stroke',
    nominalReading: '±3% stroke',
    unit: '% stroke',
    faultZone: 'Zone B (Hunting Calibration)',
    nominalZone: 'Zone A (Calibrated)',
    rul: '500h (Non-Critical)',
    auditorSignoff: 'Actuator Re-zeroing Scheduled on Shift 2',
    auditor: 'M. Chen (Certified Auditor)',
    lastAuditDate: '2026-10-09'
  },
  {
    assetId: 'chiller-01',
    assetCode: 'CHILLER-01',
    name: 'Centrifugal Chiller 450 Ton',
    subsystem: 'Chilled Water Plant',
    standard: 'AHRI Standard 550/590',
    metric: 'Condenser Approach Temperature',
    nominalLimit: '1.5°C',
    criticalLimit: '3.5°C',
    faultReading: '1.2°C',
    nominalReading: '1.1°C',
    unit: '°C',
    faultZone: 'Zone A (Optimal Heat Transfer)',
    nominalZone: 'Zone A (Optimal Heat Transfer)',
    rul: '720h+ (Optimal)',
    auditorSignoff: 'Certified Seasonal Performance Factor 6.2 COP',
    auditor: 'Dr. E. Vance (PE #48912)',
    lastAuditDate: '2026-09-30'
  }
];

export function ReliabilityAuditView({
  liveValues,
  feedMode = 'fault',
  onExport,
  onSelectAsset
}) {
  const [filterZone, setFilterZone] = useState('all');
  const isFault = feedMode === 'fault';
  const liveVib = parseFloat(liveValues?.vib) || (isFault ? 6.8 : 1.45);

  const filteredEquipment = FACILITY_EQUIPMENT_AUDIT_DATA.filter(item => {
    if (filterZone === 'all') return true;
    const currentZone = isFault && item.assetId === 'ahu-03' ? item.faultZone : item.nominalZone;
    return currentZone.toLowerCase().includes(filterZone.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* 1. Audit Page Header */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A222B] border border-[#D2C9BA] dark:border-[#2C3847] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B07B1C]/15 text-[#B07B1C] flex items-center justify-center font-bold">
              <Microscope size={18} />
            </div>
            <div>
              <h1 className="font-display text-[18px] sm:text-[20px] font-bold text-[#1F2933] dark:text-[#FAF8F4] tracking-tight uppercase">
                Reliability & Regulatory Compliance Audit
              </h1>
              <p className="font-mono text-[11px] text-[#8A8175]">
                Facility Central Campus Unit 01 &bull; ISO 10816-3 Class II &bull; Statutory Audit Trail
              </p>
            </div>
          </div>
        </div>

        {/* Audit Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onExport?.('csv')}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet size={13} className="text-[#2E7D5B]" />
            <span>Export ISO Audit CSV</span>
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onExport?.('json')}
            className="flex items-center gap-1.5"
          >
            <FileJson size={13} className="text-[#2C6E9B]" />
            <span>Export Full Audit JSON</span>
          </Button>
        </div>
      </div>

      {/* 2. Interactive ISO 10816-3 Compliance Card */}
      <AuditorComplianceCard 
        liveVibration={liveVib}
        onExport={onExport}
      />

      {/* 3. Facility Equipment Reliability Assessment Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Equipment Reliability Assessments & Audit Log</CardTitle>
            <p className="font-mono text-[10px] text-[#8A8175] mt-0.5">
              Verified operating boundaries across all monitored facility rotating and electrical machinery.
            </p>
          </div>

          {/* Zone Filter */}
          <div className="flex items-center gap-1.5 p-0.5 bg-[#FAF8F4] dark:bg-[#141B22] border border-[#D2C9BA] dark:border-[#2C3847] rounded-md font-mono text-[10px]">
            <Filter size={11} className="text-[#8A8175] ml-1.5" />
            {['all', 'zone a', 'zone b', 'zone c'].map(z => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className={`px-2 py-0.5 rounded transition-colors uppercase ${
                  filterZone === z 
                    ? 'bg-[#2C6E9B] text-white font-bold' 
                    : 'text-[#8A8175] hover:text-[#1F2933]'
                }`}
              >
                {z === 'all' ? 'All Machines' : z}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-[#E6E0D6] dark:border-[#2C3847] bg-[#FAF8F4] dark:bg-[#141B22] text-[#8A8175] uppercase text-[9px] font-bold tracking-wider">
                <th className="py-2.5 px-3">Asset Code</th>
                <th className="py-2.5 px-3">Equipment Name</th>
                <th className="py-2.5 px-3">Standard / Protocol</th>
                <th className="py-2.5 px-3">Measured Reading</th>
                <th className="py-2.5 px-3">Compliance Zone</th>
                <th className="py-2.5 px-3">Remaining Useful Life</th>
                <th className="py-2.5 px-3">Auditor Evaluation</th>
                <th className="py-2.5 px-3 text-right">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6] dark:divide-[#2C3847]">
              {filteredEquipment.map((eq) => {
                const reading = isFault && eq.assetId === 'ahu-03' ? `${liveVib} ${eq.unit}` : (isFault ? eq.faultReading : eq.nominalReading);
                const zone = isFault && eq.assetId === 'ahu-03' 
                  ? (liveVib > 7.1 ? 'Zone D' : liveVib >= 2.8 ? 'Zone C' : 'Zone B') 
                  : (isFault ? eq.faultZone : eq.nominalZone);

                const isWarning = zone.includes('Zone C') || zone.includes('Zone D');

                return (
                  <tr key={eq.assetId} className="hover:bg-[#FAF8F4]/80 dark:hover:bg-[#1E2733]/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1F2933] dark:text-[#FAF8F4]">
                      {onSelectAsset ? (
                        <button 
                          onClick={() => onSelectAsset(eq.assetId)}
                          className="text-[#2C6E9B] dark:text-[#58A6FF] hover:underline"
                        >
                          {eq.assetCode}
                        </button>
                      ) : eq.assetCode}
                    </td>
                    <td className="py-2.5 px-3 text-[#554D42] dark:text-[#C5BCAD]">
                      <div>{eq.name}</div>
                      <div className="text-[9px] text-[#8A8175]">{eq.subsystem}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#6E6558] dark:text-[#8A8175]">
                      {eq.standard}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={isWarning ? 'text-[#C05043]' : 'text-[#2E7D5B]'}>
                        {reading}
                      </span>
                      <span className="text-[9px] text-[#8A8175] ml-1">/ max {eq.criticalLimit}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        zone.includes('Zone C') || zone.includes('Zone D')
                          ? 'bg-[#C05043]/15 text-[#C05043] border border-[#C05043]/30'
                          : zone.includes('Zone B')
                          ? 'bg-[#2C6E9B]/15 text-[#2C6E9B] border border-[#2C6E9B]/30'
                          : 'bg-[#2E7D5B]/15 text-[#2E7D5B] border border-[#2E7D5B]/30'
                      }`}>
                        {zone}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#1F2933] dark:text-[#FAF8F4]">
                      {isFault && eq.assetId === 'ahu-03' ? '168h ±24h' : eq.rul}
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-[#6E6558] dark:text-[#A0988A] max-w-xs truncate" title={eq.auditorSignoff}>
                      {eq.auditorSignoff}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[10px] text-[#8A8175]">
                      {eq.lastAuditDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Audit Methodologies & Standards Reference Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#2C6E9B]" />
            <span className="font-display text-[12px] uppercase font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              ISO 10816-3 Class II Standard
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
            Applies to medium industrial rotating machines (15 kW to 300 kW) mounted on rigid foundations. Classifies vibration severity into four standardized zones (A to D) based on broadband RMS velocity.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#B07B1C]" />
            <span className="font-display text-[12px] uppercase font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              Cryptographic Audit Trail
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
            Every telemetry record and work order dispatch is stamped with a SHA-256 hash. Ensures compliance records cannot be altered or fabricated after machine faults occur.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#2E7D5B]" />
            <span className="font-display text-[12px] uppercase font-bold text-[#1F2933] dark:text-[#FAF8F4]">
              Open Scientific Explainability
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#554D42] dark:text-[#C5BCAD] leading-relaxed">
            Zero proprietary black-box algorithms. Anomaly detection uses transparent statistical models: Multivariate Isolation Forest, Seasonal ARIMA residuals, and Fast Fourier Transform (FFT) ball-pass outer race harmonics.
          </p>
        </Card>
      </div>
    </div>
  );
}
