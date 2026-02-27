import React from 'react';

const ThreatSenseLogo = ({ size = 120 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="radarBeam" x1="50%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="blur" in2="SourceGraphic" operator="over" result="comp"/>
        </filter>
        <path id="textCurve" d="M 100,250 A 150,150 0 0,1 400,250" />
      </defs>

      <g transform="translate(250, 250)">
        <g filter="url(#glow)">
          <path
            d="M -200,-12 A 200,200 0 0,1 200,-12"
            stroke="url(#arcGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M -200,12 A 200,200 0 0,0 200,12"
            stroke="url(#arcGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>

        <path
          d="M 0,-155 L 95,135 L 95,150 L -95,150 L -95,135 Z"
          stroke="#22d3ee"
          strokeWidth="7"
          fill="none"
          strokeLinejoin="miter"
        />

        <line
          x1="0"
          y1="-155"
          x2="0"
          y2="150"
          stroke="#22d3ee"
          strokeWidth="5"
          opacity="0.6"
        />

        <g transform="translate(-47, 0)">
          <line x1="-28" y1="-85" x2="28" y2="-85" stroke="#22d3ee" strokeWidth="5" />
          <line x1="28" y1="-85" x2="28" y2="-35" stroke="#22d3ee" strokeWidth="5" />
          <circle cx="-28" cy="-85" r="6" fill="#22d3ee" />
          <circle cx="28" cy="-35" r="6" fill="#22d3ee" />

          <line x1="-22" y1="15" x2="22" y2="15" stroke="#22d3ee" strokeWidth="5" />
          <line x1="22" y1="15" x2="22" y2="65" stroke="#22d3ee" strokeWidth="5" />
          <circle cx="-22" cy="15" r="6" fill="#22d3ee" />
          <circle cx="22" cy="65" r="6" fill="#22d3ee" />

          <line x1="-18" y1="100" x2="18" y2="100" stroke="#22d3ee" strokeWidth="5" />
          <circle cx="-18" cy="100" r="6" fill="#22d3ee" />
          <circle cx="18" cy="100" r="6" fill="#22d3ee" />
        </g>

        <g transform="translate(47, 15)">
          <circle cx="0" cy="0" r="5" fill="#22d3ee" />

          <path
            d="M -65,0 A 65,65 0 0,1 65,0"
            stroke="#22d3ee"
            strokeWidth="4"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M -48,0 A 48,48 0 0,1 48,0"
            stroke="#22d3ee"
            strokeWidth="4"
            fill="none"
            opacity="0.55"
          />
          <path
            d="M -32,0 A 32,32 0 0,1 32,0"
            stroke="#22d3ee"
            strokeWidth="4"
            fill="none"
            opacity="0.35"
          />

          <path
            d="M 0,0 L 58,-33.5 A 67,67 0 0,1 58,33.5 Z"
            fill="url(#radarBeam)"
          />

          <g transform="translate(40, 24)">
            <path
              d="M 0,-14 L 11,14 L -11,14 Z"
              fill="#dc2626"
              stroke="#dc2626"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="-6"
              x2="0"
              y2="6"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="0" cy="10" r="2.5" fill="#ffffff" />
          </g>
        </g>
      </g>

      <text
        fontSize="42"
        fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="600"
        letterSpacing="2"
      >
        <textPath href="#textCurve" startOffset="50%" textAnchor="middle">
          <tspan fill="#ffffff">Threat</tspan>
          <tspan fill="#22d3ee">Sense</tspan>
        </textPath>
      </text>
    </svg>
  );
};

export default ThreatSenseLogo;
