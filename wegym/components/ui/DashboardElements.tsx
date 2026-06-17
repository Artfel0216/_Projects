"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string | number;
}

export const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
  <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-orange-600/10 rounded-xl">
        <Icon className="text-orange-500" size={20} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
          +{trend}%
        </span>
      )}
    </div>
    <p className="text-zinc-500 text-[10px] font-black uppercase italic">{title}</p>
    <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
  </div>
);

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field = ({ label, required = false, className = '', children }: FieldProps) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
    {children}
  </label>
);