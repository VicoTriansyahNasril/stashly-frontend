"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function CustomSelect({ value, options, onChange, placeholder = "Pilih...", className = "", icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center truncate mr-2">
          {icon && <div className="mr-2 text-zinc-500">{icon}</div>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-full min-w-full bg-[#111] border border-white/10 rounded-lg shadow-2xl z-[100] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${value === opt.value ? 'bg-white/10 text-white font-medium' : 'text-zinc-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
