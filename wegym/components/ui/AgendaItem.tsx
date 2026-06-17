// src/components/AgendaItem.tsx
"use client";

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { WeeklyClass } from '@/types/personal';

interface AgendaItemProps {
  item: WeeklyClass;
  studentName: string;
  onOpenStudent: () => void;
}

export function AgendaItem({ item, studentName, onOpenStudent }: AgendaItemProps) {
  const statusColors = {
    confirmed: 'bg-emerald-500',
    canceled: 'bg-red-500',
    pending: 'bg-amber-500'
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-orange-500/50 transition-all group cursor-pointer"
      onClick={onOpenStudent}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-zinc-950 w-14 h-14 rounded-xl border border-white/5">
          <span className="text-[10px] font-black text-orange-500 uppercase">{item.day}</span>
          <span className="text-sm font-black text-white">{item.time}</span>
        </div>
        
        <div>
          <h4 className="font-black italic uppercase text-sm text-white">{studentName}</h4>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              {item.type}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors[item.status] || 'bg-zinc-500'}`} />
          </div>
        </div>
      </div>

      <button 
        type="button"
        className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); 
        }}
      >
        <MoreVertical size={18} />
      </button>
    </div>
  );
}