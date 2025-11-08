import React from 'react';

const BuildingIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`building-icon ${className}`}
      {...props}
    >
      <path
        d="M3 21H21V19L9 7L3 13V21Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V9L21 21"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BuildingIcon;
