import React from 'react';

interface AALogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-sm rounded-lg',
  md: 'h-9 w-9 text-base rounded-xl',
  lg: 'h-12 w-12 text-xl rounded-2xl',
  xl: 'h-16 w-16 text-3xl rounded-3xl',
};

export function AALogo({ className = '', size = 'md' }: AALogoProps) {
  return (
    <div
      className={`flex items-center justify-center bg-[#1E40AF] font-black text-white shadow-sm flex-shrink-0 select-none tracking-tight ${SIZE_CLASSES[size]} ${className}`}
      aria-label="AA Logo"
    >
      <span>AA</span>
    </div>
  );
}
