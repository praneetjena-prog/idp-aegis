import React, { useState } from 'react';
import { Waves, Zap, Thermometer, Radio, Shield, CheckCircle2 } from 'lucide-react';

export function AegisSchematicIllustration({ liveValues, feedMode = 'fault' }) {
  const [activeHotspot, setActiveHotspot] = useState(null);

  const isFault = feedMode === 'fault';
  const vibValue = liveValues?.vib || (isFault ? '6.8' : '2.1');
  const curValue = liveValues?.cur || (isFault ? '17.6' : '14.2');
  const tempValue = liveValues?.temp || (isFault ? '71.8' : '52.4');

  return (
    <div className="relative w-full rounded-2xl border-2 border-[#1F2933] dark:border-[#304346] bg-[#FFFFFF] dark:bg-[#141B22] p-4 sm:p-6 shadow-[6px_6px_0_#1F2933] dark:shadow-[6px_6px_0_#0F151C] overflow-hidden">
      
      {/* Top Editorial Spec Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#1F2933]/15 dark:border-[#304346] font-mono text-[10px] text-[#8A8175]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C05043] animate-pulse" />
          <span className="font-bold text-[#1F2933] dark:text-[#FAF8F4] uppercase">FIG 1.0 — CAD TRANSDUCER MAPPING</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">AHU-03 CENTRIFUGAL SUPPLY FAN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded border border-[#1F2933] dark:border-[#304346] bg-[#FAF8F4] dark:bg-[#1A222B] text-[#1F2933] dark:text-[#FAF8F4] font-bold">
            SCALE 1:12
          </span>
          <span className="text-[#2C6E9B] font-bold hidden md:inline">ISO 10816-3 CLASS II</span>
        </div>
      </div>

      {/* SVG Technical Geometric Illustration */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[380px] flex items-center justify-center">
        <svg
          viewBox="0 0 800 460"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Technical Drafting Grid Pattern */}
            <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#1F2933]/10 dark:text-white/10" />
            </pattern>
            {/* Diagonal Hatch for Vibration Zone */}
            <pattern id="diagHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#C05043" strokeWidth="1.5" strokeOpacity="0.4" />
            </pattern>
            {/* Arrow Marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2C6E9B" />
            </marker>
          </defs>

          {/* Background drafting grid */}
          <rect width="100%" height="100%" fill="url(#cadGrid)" />

          {/* Machine Mounting Base Plate (Pastel Warm Sand) */}
          <rect
            x="80"
            y="340"
            width="640"
            height="32"
            rx="4"
            fill="#F4EFEA"
            stroke="#1F2933"
            strokeWidth="2.5"
            className="dark:fill-[#202C33]"
          />
          {/* Base Bolt Anchors */}
          <circle cx="120" cy="356" r="5" fill="#1F2933" />
          <circle cx="280" cy="356" r="5" fill="#1F2933" />
          <circle cx="480" cy="356" r="5" fill="#1F2933" />
          <circle cx="680" cy="356" r="5" fill="#1F2933" />

          {/* 1. THREE-PHASE INDUCTION MOTOR (Pastel Sage Green #EAF5EE) */}
          <g id="motorAssembly">
            {/* Motor Feet */}
            <rect x="130" y="316" width="36" height="24" fill="#1F2933" rx="2" />
            <rect x="250" y="316" width="36" height="24" fill="#1F2933" rx="2" />

            {/* Motor Stator Body */}
            <rect
              x="110"
              y="180"
              width="190"
              height="140"
              rx="8"
              fill="#EAF5EE"
              stroke="#1F2933"
              strokeWidth="2.5"
              className="dark:fill-[#1B382B]"
            />

            {/* Motor Stator Cooling Fins (Geometric stripes) */}
            <line x1="145" y1="180" x2="145" y2="320" stroke="#1F2933" strokeWidth="2" strokeDasharray="6,4" />
            <line x1="175" y1="180" x2="175" y2="320" stroke="#1F2933" strokeWidth="2" strokeDasharray="6,4" />
            <line x1="205" y1="180" x2="205" y2="320" stroke="#1F2933" strokeWidth="2" strokeDasharray="6,4" />
            <line x1="235" y1="180" x2="235" y2="320" stroke="#1F2933" strokeWidth="2" strokeDasharray="6,4" />
            <line x1="265" y1="180" x2="265" y2="320" stroke="#1F2933" strokeWidth="2" strokeDasharray="6,4" />

            {/* Terminal Box (Pastel Ice Blue #E8F2F8) */}
            <rect
              x="150"
              y="142"
              width="70"
              height="38"
              rx="4"
              fill="#E8F2F8"
              stroke="#1F2933"
              strokeWidth="2.5"
              className="dark:fill-[#1E3B4D]"
            />
            {/* Terminal Box Label */}
            <text x="185" y="166" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#1F2933" className="dark:fill-white">
              415V 3Ø
            </text>

            {/* Drive End Flange */}
            <rect x="300" y="210" width="18" height="80" rx="3" fill="#D8CFBE" stroke="#1F2933" strokeWidth="2" />
          </g>

          {/* 2. TRANSMISSION SHAFT & FLEXIBLE COUPLING */}
          <g id="driveShaft">
            {/* Rotating Shaft */}
            <rect x="318" y="238" width="130" height="24" fill="#D2C9BA" stroke="#1F2933" strokeWidth="2" />
            
            {/* Flexible Lovejoy Coupling (Pastel Warning Amber #FEF6E6) */}
            <rect
              x="355"
              y="222"
              width="55"
              height="56"
              rx="6"
              fill="#FEF6E6"
              stroke="#1F2933"
              strokeWidth="2.5"
              className="dark:fill-[#4A3B18]"
            />
            <line x1="382" y1="222" x2="382" y2="278" stroke="#1F2933" strokeWidth="2" strokeDasharray="4,3" />

            {/* Rotation Vector Arc */}
            <path d="M 370 206 A 22 22 0 0 1 396 206" fill="none" stroke="#2C6E9B" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="383" y="198" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#2C6E9B">
              1,750 RPM ↻
            </text>
          </g>

          {/* 3. BEARING PILLOW BLOCK (FAULTER LOCATION) */}
          <g id="bearingHousing">
            {/* Bearing Support Block */}
            <path
              d="M 430 340 L 440 270 L 485 270 L 495 340 Z"
              fill="#FDECE9"
              stroke="#1F2933"
              strokeWidth="2.5"
              className="dark:fill-[#481E19]"
            />

            {/* Outer Race Halo (Pulsing Red Hatch if in fault) */}
            <circle
              cx="462"
              cy="250"
              r="34"
              fill={isFault ? "url(#diagHatch)" : "#EAF5EE"}
              stroke={isFault ? "#C05043" : "#2E7D5B"}
              strokeWidth="2.5"
              strokeDasharray={isFault ? "4,2" : "none"}
            />
            {/* Inner Rolling Elements */}
            <circle cx="462" cy="250" r="18" fill="#FFFFFF" stroke="#1F2933" strokeWidth="2" className="dark:fill-[#1A222B]" />
            <circle cx="462" cy="236" r="3.5" fill="#1F2933" />
            <circle cx="476" cy="250" r="3.5" fill="#1F2933" />
            <circle cx="462" cy="264" r="3.5" fill="#1F2933" />
            <circle cx="448" cy="250" r="3.5" fill="#1F2933" />
          </g>

          {/* 4. CENTRIFUGAL BLOWER HOUSING (Pastel Blueprint Ice #E8F2F8) */}
          <g id="blowerHousing">
            {/* Involute Scroll Body */}
            <path
              d="M 510 250 C 510 160 570 120 640 120 L 710 120 L 710 230 C 710 320 640 340 560 340 L 510 340 Z"
              fill="#E8F2F8"
              stroke="#1F2933"
              strokeWidth="2.5"
              className="dark:fill-[#142B3B]"
            />

            {/* Discharge Air Duct Neck */}
            <rect
              x="640"
              y="60"
              width="70"
              height="60"
              fill="#FFFFFF"
              stroke="#1F2933"
              strokeWidth="2.5"
              className="dark:fill-[#1A222B]"
            />
            {/* Air Flow Direction Vectors */}
            <line x1="660" y1="100" x2="660" y2="70" stroke="#2C6E9B" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="675" y1="100" x2="675" y2="70" stroke="#2C6E9B" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="690" y1="100" x2="690" y2="70" stroke="#2C6E9B" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="675" y="50" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#2C6E9B">
              AIR SUPPLY OUT
            </text>

            {/* Fan Intake Center Bell */}
            <circle cx="610" cy="235" r="42" fill="#FAF8F4" stroke="#1F2933" strokeWidth="2" className="dark:fill-[#141B22]" />
            <circle cx="610" cy="235" r="14" fill="#D8CFBE" stroke="#1F2933" strokeWidth="2" />
          </g>

          {/* 5. SENSOR TRANSDUCER CALLOUTS (Geometric Neo-Brutalist Tags) */}

          {/* SENSOR 1: MPU-6050 (VIBRATION ON BEARING HOUSING) */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setActiveHotspot('vib')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            {/* Target Reticle Pin */}
            <line x1="462" y1="216" x2="462" y2="130" stroke="#C05043" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="462" cy="216" r="5" fill="#C05043" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Callout Card */}
            <rect
              x="392"
              y="90"
              width="140"
              height="40"
              rx="4"
              fill="#FDECE9"
              stroke="#C05043"
              strokeWidth="2"
              className="shadow-sm transition-transform group-hover:scale-105"
            />
            <text x="402" y="106" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#8C2E24" textTransform="uppercase">
              [S1] MPU-6050 VIB
            </text>
            <text x="402" y="122" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#C05043">
              {vibValue} mm/s RMS
            </text>
          </g>

          {/* SENSOR 2: ACS712 (MOTOR CURRENT DRAW) */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setActiveHotspot('cur')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <line x1="185" y1="142" x2="185" y2="80" stroke="#B07B1C" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="185" cy="142" r="5" fill="#B07B1C" stroke="#FFFFFF" strokeWidth="1.5" />

            <rect
              x="120"
              y="40"
              width="130"
              height="40"
              rx="4"
              fill="#FEF6E6"
              stroke="#B07B1C"
              strokeWidth="2"
              className="shadow-sm transition-transform group-hover:scale-105"
            />
            <text x="130" y="56" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#7A530F" textTransform="uppercase">
              [S2] ACS712 PHASE CT
            </text>
            <text x="130" y="72" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#B07B1C">
              {curValue} AMPS DRAW
            </text>
          </g>

          {/* SENSOR 3: DS18B20 (BEARING SURFACE TEMP) */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setActiveHotspot('temp')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <line x1="495" y1="285" x2="570" y2="385" stroke="#2C6E9B" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="495" cy="285" r="5" fill="#2C6E9B" stroke="#FFFFFF" strokeWidth="1.5" />

            <rect
              x="570"
              y="370"
              width="145"
              height="40"
              rx="4"
              fill="#E8F2F8"
              stroke="#2C6E9B"
              strokeWidth="2"
              className="shadow-sm transition-transform group-hover:scale-105"
            />
            <text x="580" y="386" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1D5174" textTransform="uppercase">
              [S3] DS18B20 1-WIRE
            </text>
            <text x="580" y="402" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#2C6E9B">
              {tempValue} °C BEARING
            </text>
          </g>

          {/* Dimension Lines (Editorial Swiss Precision) */}
          <line x1="110" y1="390" x2="300" y2="390" stroke="#1F2933" strokeWidth="1.5" />
          <line x1="110" y1="384" x2="110" y2="396" stroke="#1F2933" strokeWidth="1.5" />
          <line x1="300" y1="384" x2="300" y2="396" stroke="#1F2933" strokeWidth="1.5" />
          <text x="205" y="404" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#8A8175">
            L1 = 480 mm (MOTOR)
          </text>

          <line x1="430" y1="390" x2="710" y2="390" stroke="#1F2933" strokeWidth="1.5" />
          <line x1="430" y1="384" x2="430" y2="396" stroke="#1F2933" strokeWidth="1.5" />
          <line x1="710" y1="384" x2="710" y2="396" stroke="#1F2933" strokeWidth="1.5" />
          <text x="570" y="404" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#8A8175">
            L2 = 620 mm (FAN HOUSING)
          </text>
        </svg>
      </div>

      {/* Bottom Editorial Footnote Strip */}
      <div className="mt-4 pt-3 border-t-2 border-[#1F2933]/15 dark:border-[#304346] flex flex-wrap items-center justify-between gap-3 font-mono text-[10px]">
        <div className="flex items-center gap-4 text-[#554D42] dark:text-[#C5BCAD]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EAF5EE] border border-[#2E7D5B]" />
            <span>Motor Stator</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FEF6E6] border border-[#B07B1C]" />
            <span>Coupling</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FDECE9] border border-[#C05043]" />
            <span>Bearing Seat</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E8F2F8] border border-[#2C6E9B]" />
            <span>Centrifugal Fan</span>
          </span>
        </div>

        <div className="font-bold text-[#1F2933] dark:text-[#FAF8F4] flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-[#2E7D5B]" />
          <span>Real-Time Sensor Bus Active</span>
        </div>
      </div>
    </div>
  );
}
