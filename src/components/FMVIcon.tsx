import React from 'react';

interface FMVIconProps {
  className?: string;
}

const FMVIcon: React.FC<FMVIconProps> = ({ className }) => {
  return (
    <svg
      className={`fmv-icon ${className || ''}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield background */}
      <path
        d="M12 2L3 7V12C3 16.97 7.02 21.5 12 22C16.98 21.5 21 16.97 21 12V7L12 2Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      {/* Dollar sign */}
      <path
        d="M12 6V7M12 7V18M12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default FMVIcon; 