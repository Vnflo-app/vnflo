"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Sliders, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Layers,
  Palette,
  ExternalLink
} from 'lucide-react';

// Dynamically import SoftAurora component to ensure it only loads on the client side (WebGL is client-only)
const SoftAurora = dynamic(() => import('../components/SoftAurora'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide">Loading WebGL Canvas...</p>
      </div>
    </div>
  )
});

interface Preset {
  name: string;
  color1: string;
  color2: string;
  speed?: number;
  scale?: number;
  brightness?: number;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
}

const PRESETS: Preset[] = [
  {
    name: "Default (Fairy)",
    color1: "#f7f7f7",
    color2: "#e100ff",
    speed: 0.6,
    scale: 1.5,
    brightness: 1.0,
    noiseFrequency: 2.5,
    noiseAmplitude: 1.0,
    bandHeight: 0.5,
    bandSpread: 1.0,
    octaveDecay: 0.1,
    layerOffset: 0.0,
    colorSpeed: 1.0
  },
  {
    name: "Northern Lights",
    color1: "#0ea5e9",
    color2: "#22c55e",
    speed: 0.5,
    scale: 1.8,
    brightness: 1.2,
    noiseFrequency: 2.0,
    noiseAmplitude: 1.2,
    bandHeight: 0.4,
    bandSpread: 1.2,
    octaveDecay: 0.15,
    layerOffset: 0.8,
    colorSpeed: 0.8
  },
  {
    name: "Cosmic Glow",
    color1: "#ff007f",
    color2: "#7b2cbf",
    speed: 0.7,
    scale: 1.4,
    brightness: 1.1,
    noiseFrequency: 3.0,
    noiseAmplitude: 0.9,
    bandHeight: 0.5,
    bandSpread: 0.8,
    octaveDecay: 0.08,
    layerOffset: 0.5,
    colorSpeed: 1.5
  },
  {
    name: "Solar Flare",
    color1: "#f97316",
    color2: "#e11d48",
    speed: 0.8,
    scale: 1.2,
    brightness: 1.3,
    noiseFrequency: 2.2,
    noiseAmplitude: 1.1,
    bandHeight: 0.6,
    bandSpread: 1.1,
    octaveDecay: 0.12,
    layerOffset: 0.3,
    colorSpeed: 1.2
  },
  {
    name: "Cyberpunk City",
    color1: "#00f0ff",
    color2: "#ff007f",
    speed: 0.9,
    scale: 1.6,
    brightness: 1.0,
    noiseFrequency: 2.8,
    noiseAmplitude: 1.3,
    bandHeight: 0.45,
    bandSpread: 1.3,
    octaveDecay: 0.1,
    layerOffset: 0.6,
    colorSpeed: 1.4
  },
  {
    name: "Deep Ocean",
    color1: "#0284c7",
    color2: "#0f766e",
    speed: 0.3,
    scale: 2.2,
    brightness: 0.9,
    noiseFrequency: 1.8,
    noiseAmplitude: 0.8,
    bandHeight: 0.3,
    bandSpread: 1.5,
    octaveDecay: 0.2,
    layerOffset: 1.2,
    colorSpeed: 0.5
  }
];

export default function SoftAuroraPage() {
  // Setup state for each parameter of the SoftAurora component
  const [speed, setSpeed] = useState<number>(0.6);
  const [scale, setScale] = useState<number>(1.5);
  const [brightness, setBrightness] = useState<number>(1.0);
  const [color1, setColor1] = useState<string>("#f7f7f7");
  const [color2, setColor2] = useState<string>("#e100ff");
  const [noiseFrequency, setNoiseFrequency] = useState<number>(2.5);
  const [noiseAmplitude, setNoiseAmplitude] = useState<number>(1.0);
  const [bandHeight, setBandHeight] = useState<number>(0.5);
  const [bandSpread, setBandSpread] = useState<number>(1.0);
  const [octaveDecay, setOctaveDecay] = useState<number>(0.1);
  const [layerOffset, setLayerOffset] = useState<number>(0);
  const [colorSpeed, setColorSpeed] = useState<number>(1.0);
  const [enableMouseInteraction, setEnableMouseInteraction] = useState<boolean>(true);
  const [mouseInfluence, setMouseInfluence] = useState<number>(0.25);

  const [copied, setCopied] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'controls' | 'code'>('controls');

  const applyPreset = (preset: Preset) => {
    setColor1(preset.color1);
    setColor2(preset.color2);
    if (preset.speed !== undefined) setSpeed(preset.speed);
    if (preset.scale !== undefined) setScale(preset.scale);
    if (preset.brightness !== undefined) setBrightness(preset.brightness);
    if (preset.noiseFrequency !== undefined) setNoiseFrequency(preset.noiseFrequency);
    if (preset.noiseAmplitude !== undefined) setNoiseAmplitude(preset.noiseAmplitude);
    if (preset.bandHeight !== undefined) setBandHeight(preset.bandHeight);
    if (preset.bandSpread !== undefined) setBandSpread(preset.bandSpread);
    if (preset.octaveDecay !== undefined) setOctaveDecay(preset.octaveDecay);
    if (preset.layerOffset !== undefined) setLayerOffset(preset.layerOffset);
    if (preset.colorSpeed !== undefined) setColorSpeed(preset.colorSpeed);
  };

  const resetToDefault = () => {
    applyPreset(PRESETS[0]);
    setEnableMouseInteraction(true);
    setMouseInfluence(0.25);
  };

  const getCodeSnippet = () => {
    return `import SoftAurora from './SoftAurora';

// Render the component with configured properties
<SoftAurora
  speed={${speed}}
  scale={${scale}}
  brightness={${brightness}}
  color1="${color1}"
  color2="${color2}"
  noiseFrequency={${noiseFrequency}}
  noiseAmplitude={${noiseAmplitude}}
  bandHeight={${bandHeight}}
  bandSpread={${bandSpread}}
  octaveDecay={${octaveDecay}}
  layerOffset={${layerOffset}}
  colorSpeed={${colorSpeed}}
  enableMouseInteraction={${enableMouseInteraction}}
  mouseInfluence={${mouseInfluence}}
/>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCodeSnippet());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-slate-100 flex flex-col md:flex-row" style={{ background: 'transparent' }}>
      {/* Dynamic Background Aurora component */}
      <div className="fixed inset-0 z-0 bg-slate-950">
        <SoftAurora
          speed={speed}
          scale={scale}
          brightness={brightness}
          color1={color1}
          color2={color2}
          noiseFrequency={noiseFrequency}
          noiseAmplitude={noiseAmplitude}
          bandHeight={bandHeight}
          bandSpread={bandSpread}
          octaveDecay={octaveDecay}
          layerOffset={layerOffset}
          colorSpeed={colorSpeed}
          enableMouseInteraction={enableMouseInteraction}
          mouseInfluence={mouseInfluence}
        />
      </div>

      {/* Floating Toggle Controls Button (for distraction-free viewing) */}
      <button
        onClick={() => setControlsVisible(!controlsVisible)}
        className="fixed top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-lg transition-all hover:bg-slate-800 hover:border-slate-500 focus:outline-none"
        title={controlsVisible ? "Hide Controls" : "Show Controls"}
      >
        {controlsVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

      {/* Main content Area */}
      <div className="flex-1 flex flex-col p-6 md:p-12 justify-between pointer-events-none min-h-[30vh] md:min-h-screen relative z-10">
        <div className="pointer-events-auto">
          {/* Header */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          
          <div className="max-w-xl font-sans">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-sm select-none">
              Soft Aurora
            </h1>
            <p className="mt-3 text-base md:text-lg text-slate-300 leading-relaxed font-normal select-none">
              A high-performance WebGL dynamic aurora shader background with custom noise frequency, octave decay, and interactive mouse gravity fields.
            </p>
          </div>
        </div>

        <div className="mt-auto pointer-events-auto max-w-md select-none bg-slate-950/20 backdrop-blur-sm p-4 rounded-xl border border-white/5 hidden md:block">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Drag sliders or move cursor to manipulate the particle flow matrix.
          </p>
        </div>
      </div>

      {/* Sidebar Control Panel */}
      {controlsVisible && (
        /* Sidebar panel sits above aurora */
        <div className="w-full md:max-w-md bg-slate-900/85 backdrop-blur-xl border-t md:border-t-0 md:border-l border-slate-800/80 shadow-2xl z-40 relative flex flex-col h-[70vh] md:h-screen transition-all duration-300 ease-out select-none">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'controls' 
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Sliders size={16} />
              Controls
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'code' 
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Copy size={16} />
              Get Code
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'controls' ? (
              <>
                {/* Reset Buttons */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Palette size={14} className="text-purple-400" /> Customizer Settings
                  </span>
                  <button 
                    onClick={resetToDefault}
                    className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} /> Reset to defaults
                  </button>
                </div>

                {/* Color Theme Presets */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" /> Preset Palettes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyPreset(preset)}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-16 group"
                      >
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate w-full">
                          {preset.name}
                        </span>
                        <div className="flex gap-1.5 items-center mt-1">
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: preset.color1 }}></span>
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: preset.color2 }}></span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Properties */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300 block">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors">
                          <input
                            type="color"
                            value={color1}
                            onChange={(e) => setColor1(e.target.value)}
                            className="absolute -inset-1 cursor-pointer w-10 h-10 border-none p-0 bg-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          value={color1}
                          onChange={(e) => setColor1(e.target.value)}
                          className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300 block">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors">
                          <input
                            type="color"
                            value={color2}
                            onChange={(e) => setColor2(e.target.value)}
                            className="absolute -inset-1 cursor-pointer w-10 h-10 border-none p-0 bg-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="w-full text-xs font-mono uppercase bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Slider Properties */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Shader Parameters</h3>
                  
                  {/* Speed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Animation Speed</span>
                      <span className="font-mono text-slate-400">{speed.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2.5"
                      step="0.05"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Scale */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Zoom Scale</span>
                      <span className="font-mono text-slate-400">{scale.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="4.0"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Glow Brightness</span>
                      <span className="font-mono text-slate-400">{brightness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={brightness}
                      onChange={(e) => setBrightness(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Color Speed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Color Shift Cycle Speed</span>
                      <span className="font-mono text-slate-400">{colorSpeed.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3.0"
                      step="0.1"
                      value={colorSpeed}
                      onChange={(e) => setColorSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>

                {/* Noise & Layer Properties */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-1">
                    <Layers size={13} className="text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wave & Noise Geometry</h3>
                  </div>
                  
                  {/* Noise Frequency */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Noise Frequency (Details)</span>
                      <span className="font-mono text-slate-400">{noiseFrequency.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="6.0"
                      step="0.1"
                      value={noiseFrequency}
                      onChange={(e) => setNoiseFrequency(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Noise Amplitude */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Noise Amplitude (Height variations)</span>
                      <span className="font-mono text-slate-400">{noiseAmplitude.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={noiseAmplitude}
                      onChange={(e) => setNoiseAmplitude(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Band Height */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Vertical Position (Band Height)</span>
                      <span className="font-mono text-slate-400">{bandHeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-0.5"
                      max="1.5"
                      step="0.05"
                      value={bandHeight}
                      onChange={(e) => setBandHeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Band Spread */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Aurora Band Thickness</span>
                      <span className="font-mono text-slate-400">{bandSpread.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={bandSpread}
                      onChange={(e) => setBandSpread(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Octave Decay */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Octave Decay (Roughness)</span>
                      <span className="font-mono text-slate-400">{octaveDecay.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={octaveDecay}
                      onChange={(e) => setOctaveDecay(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Layer Offset */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">Dual Layer Separation Offset</span>
                      <span className="font-mono text-slate-400">{layerOffset.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={layerOffset}
                      onChange={(e) => setLayerOffset(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>

                {/* Mouse Interaction Controls */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mouse Attraction</h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-xs font-medium text-slate-300">Enable Cursor Influence</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={enableMouseInteraction} 
                        onChange={(e) => setEnableMouseInteraction(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  {enableMouseInteraction && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-300">Attraction Strength</span>
                        <span className="font-mono text-slate-400">{mouseInfluence.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.05"
                        value={mouseInfluence}
                        onChange={(e) => setMouseInfluence(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 flex flex-col h-full font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Component Code</span>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-xs font-semibold flex items-center gap-1.5 transition-all text-white active:scale-95 shadow-md shadow-purple-900/30"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copy' : 'Copy Code'}
                  </button>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed select-none">
                  Use this generated code block in your Next.js project. You can copy the code directly and replace the imports or place it inside your pages.
                </p>

                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-auto text-purple-300 shadow-inner h-[50vh] md:h-auto">
                  <pre className="whitespace-pre">{getCodeSnippet()}</pre>
                </div>

                <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-800/30 text-purple-300 space-y-2 text-xs select-none">
                  <p className="font-bold flex items-center gap-1">
                    <Layers size={12} /> Integration steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                    <li>Copy and paste <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-400">SoftAurora.tsx</code> and <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-400">SoftAurora.css</code> into your components folder.</li>
                    <li>Ensure <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-400">ogl</code> package is installed (<code className="bg-slate-950 px-1 py-0.5 rounded text-purple-400">npm install ogl</code>).</li>
                    <li>Import it dynamically in Next.js using <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-300">ssr: false</code> to prevent server-side WebGL compilation errors.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer of the panel */}
          <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 text-center flex justify-between items-center px-6">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Visual Node Flow System</span>
            <a 
              href="/" 
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 font-medium"
            >
              Back Home <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
