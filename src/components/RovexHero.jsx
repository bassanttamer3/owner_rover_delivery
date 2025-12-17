import React, { useState } from "react";

const RovexHero = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-background pt-0">

      {/* Background cityscape */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-rovex-dark" />
        
        {/* City silhouette */}
        <div className="absolute bottom-20 left-0 right-0 h-64 opacity-25 ">

          <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            {/* Buildings */}
            <rect x="50" y="80" width="60" height="120" fill="hsl(220 15% 25%)" className="animate-city-glow" />
            <rect x="55" y="90" width="15" height="8" fill="hsl(178 72% 48%)" opacity="0.3" />
            <rect x="55" y="110" width="15" height="8" fill="hsl(178 72% 48%)" opacity="0.5" />
            
            <rect x="130" y="40" width="80" height="160" fill="hsl(220 15% 22%)" />
            <rect x="140" y="50" width="20" height="12" fill="hsl(178 72% 48%)" opacity="0.4" />
            <rect x="170" y="50" width="20" height="12" fill="hsl(178 72% 48%)" opacity="0.2" />
            <rect x="140" y="80" width="20" height="12" fill="hsl(178 72% 48%)" opacity="0.5" />
            
            <rect x="240" y="100" width="50" height="100" fill="hsl(220 15% 28%)" className="animate-city-glow" style={{ animationDelay: '1s' }} />
            
            <rect x="320" y="20" width="100" height="180" fill="hsl(220 15% 20%)" />
            <rect x="335" y="30" width="25" height="15" fill="hsl(178 72% 48%)" opacity="0.3" />
            <rect x="375" y="30" width="25" height="15" fill="hsl(178 72% 48%)" opacity="0.6" />
            <rect x="335" y="60" width="25" height="15" fill="hsl(178 72% 48%)" opacity="0.4" />
            <rect x="375" y="90" width="25" height="15" fill="hsl(178 72% 48%)" opacity="0.5" />
            
            <rect x="450" y="70" width="70" height="130" fill="hsl(220 15% 24%)" />
            <rect x="550" y="50" width="90" height="150" fill="hsl(220 15% 18%)" className="animate-city-glow" style={{ animationDelay: '2s' }} />
            <rect x="565" y="65" width="20" height="10" fill="hsl(178 72% 48%)" opacity="0.4" />
            <rect x="600" y="65" width="20" height="10" fill="hsl(178 72% 48%)" opacity="0.3" />
            
            <rect x="680" y="90" width="55" height="110" fill="hsl(220 15% 26%)" />
            <rect x="760" y="30" width="120" height="170" fill="hsl(220 15% 19%)" />
            <rect x="780" y="45" width="30" height="15" fill="hsl(178 72% 48%)" opacity="0.5" />
            <rect x="830" y="45" width="30" height="15" fill="hsl(178 72% 48%)" opacity="0.3" />
            <rect x="780" y="80" width="30" height="15" fill="hsl(178 72% 48%)" opacity="0.4" />
            
            <rect x="910" y="60" width="80" height="140" fill="hsl(220 15% 23%)" className="animate-city-glow" style={{ animationDelay: '0.5s' }} />
            <rect x="1020" y="100" width="60" height="100" fill="hsl(220 15% 27%)" />
            <rect x="1100" y="70" width="100" height="130" fill="hsl(220 15% 21%)" />
          </svg>
        </div>
        
        {/* Ambient glow at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-radial opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-12 lg:pt-0">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left side - Text content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm tracking-widest uppercase">
                <span className="w-8 h-px bg-primary" />
                Autonomous Delivery System
              </span>

              <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Welcome to{" "}
                <span className="text-primary text-glow-cyan">ROVEX</span>
              </h1>
            </div>

            <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-lg">
              Experience the future of autonomous delivery. Our intelligent rovers
              navigate urban environments with precision, delivering packages
              safely and efficiently 24/7.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <FeatureIndicator label="Real-time Tracking" delay="0s" />
              <FeatureIndicator label="AI Navigation" delay="0.2s" />
              <FeatureIndicator label="24/7 Operation" delay="0.4s" />
            </div>

            
          </div>

          {/* Right side - Rover animation */}
          <div 
            className="relative h-[400px] lg:h-[500px] flex items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Road surface */}
            <div className="absolute bottom-16 left-0 right-0 h-24 bg-gradient-to-t from-rovex-surface to-transparent rounded-lg" />
            
            {/* Road markings */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-6 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-1.5 bg-primary/30 rounded-full animate-road-line"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            {/* Rover SVG */}
            <svg
              className={`relative z-10 w-[350px] lg:w-[450px] h-[280px] lg:h-[350px] transition-all duration-500 ${
                isHovered ? "animate-rover-hover" : "animate-rover-float"
              }`}
              viewBox="0 0 320 220"
              fill="none"
            >
              {/* Glow under rover */}
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2ec8cf" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2ec8cf" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Shadow */}
              <ellipse cx="160" cy="200" rx="100" ry="15" fill="black" opacity="0.3">
                <animate attributeName="rx" values="100;95;100" dur="3s" repeatCount="indefinite" />
              </ellipse>

              {/* Wheels */}
              <g>
                {/* Back wheel */}
                <ellipse cx="85" cy="175" rx="28" ry="18" fill="#1e293b" />
                <ellipse cx="85" cy="175" rx="20" ry="12" fill="#334155" />
                <ellipse cx="85" cy="175" rx="8" ry="5" fill="#2ec8cf" opacity="0.5" />
                
                {/* Front wheel */}
                <ellipse cx="235" cy="175" rx="28" ry="18" fill="#1e293b" />
                <ellipse cx="235" cy="175" rx="20" ry="12" fill="#334155" />
                <ellipse cx="235" cy="175" rx="8" ry="5" fill="#2ec8cf" opacity="0.5" />
              </g>

              {/* Main body */}
              <rect x="55" y="100" width="210" height="65" rx="16" fill="url(#bodyGradient)" />
              
              {/* Cyan accent strip */}
              <rect x="55" y="140" width="210" height="8" rx="4" fill="url(#cyanGradient)">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
              </rect>

              {/* Front sensor housing */}
              <rect x="40" y="110" width="30" height="45" rx="8" fill="#1e293b" />
              
              {/* Front sensors with glow */}
              <rect x="45" y="118" width="20" height="12" rx="4" fill="#2ec8cf" filter="url(#glow)">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <rect x="45" y="135" width="20" height="12" rx="4" fill="#2ec8cf" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
              </rect>

              {/* Sensor sweep beam */}
              <path 
                d="M40 130 L10 100 L10 160 Z" 
                fill="#2ec8cf" 
                opacity="0.15"
                className="animate-sensor-sweep origin-[40px_130px]"
              />

              {/* Top cabin */}
              <rect x="135" y="60" width="100" height="45" rx="12" fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1" />
              
              {/* Cabin window/display */}
              <rect x="145" y="70" width="80" height="25" rx="6" fill="#0f172a" />
              <rect x="150" y="75" width="70" height="15" rx="4" fill="#2ec8cf" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
              </rect>
              
              {/* Scan line in display */}
              <rect x="150" y="80" width="70" height="2" rx="1" fill="#2ec8cf" opacity="0.8" className="animate-scan-line" />

              {/* ROVEX Logo */}
              <text x="105" y="128" fill="#2ec8cf" fontSize="18" fontWeight="bold" fontFamily="system-ui">
                ROVEX
              </text>

              {/* Side details */}
              <rect x="180" y="115" width="60" height="4" rx="2" fill="#cbd5e1" />
              <rect x="180" y="123" width="40" height="4" rx="2" fill="#cbd5e1" />

              {/* Antenna */}
              <line x1="220" y1="60" x2="235" y2="30" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
              <circle cx="235" cy="28" r="6" fill="#2ec8cf" filter="url(#glow)" className="animate-antenna-pulse" />
              
              {/* Antenna signal rings */}
              <circle cx="235" cy="28" r="12" stroke="#2ec8cf" strokeWidth="1" fill="none" opacity="0.3">
                <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Status lights */}
              <circle cx="250" cy="115" r="5" fill="#22c55e" filter="url(#glow)">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="250" cy="130" r="5" fill="#2ec8cf" filter="url(#glow)">
                <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Top sensor array */}
              <rect x="155" y="55" width="50" height="8" rx="4" fill="#475569" />
              <circle cx="165" cy="59" r="3" fill="#2ec8cf" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="180" cy="59" r="3" fill="#2ec8cf" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
              </circle>
              <circle cx="195" cy="59" r="3" fill="#2ec8cf" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" begin="0.6s" />
              </circle>
            </svg>

            {/* Floating holographic particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary animate-float-particle"
                style={{
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                  top: `${15 + Math.random() * 50}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  opacity: 0.4 + Math.random() * 0.4,
                }}
              />
            ))}

            {/* Hover glow effect */}
            <div 
              className={`absolute inset-0 bg-primary/5 rounded-3xl transition-opacity duration-500 pointer-events-none ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-rovex-dark to-transparent" />
    </section>
  );
};

const FeatureIndicator = ({ label, delay }) => (
  <div className="flex items-center gap-3 text-sm text-muted-foreground">
    <div 
      className="w-2.5 h-2.5 rounded-full bg-primary glow-cyan-sm animate-pulse-bright"
      style={{ animationDelay: delay }}
    />
    <span>{label}</span>
  </div>
);

export default RovexHero;
