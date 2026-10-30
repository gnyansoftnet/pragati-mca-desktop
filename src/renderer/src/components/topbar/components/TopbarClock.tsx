import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const TopbarClock: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-slate-50/80 border border-slate-200/80 px-3.5 py-1.5 rounded-2xl shadow-2xs select-none">
      {/* Time Display */}
      <div className="flex items-center gap-1.5 text-slate-800">
        <Clock className="w-3.5 h-3.5 text-primary shrink-0 stroke-[2.2]" />
        <span className="font-mono text-xs sm:text-sm font-bold tracking-tight">
          {formattedTime}
        </span>
      </div>

      <div className="hidden sm:block h-3.5 w-px bg-slate-200" />

      {/* Date Display */}
      <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-xs font-medium">{formattedDate}</span>
      </div>
    </div>
  );
};

export default TopbarClock;
