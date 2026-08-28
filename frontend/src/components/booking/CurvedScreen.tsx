import React from 'react';
import { Monitor } from 'lucide-react';

interface CurvedScreenProps {
  screenType?: string;
  roomName?: string;
}

export const CurvedScreen: React.FC<CurvedScreenProps> = ({
  screenType = 'STANDARD_2D',
  roomName = 'Phòng Chiếu 1',
}) => {
  const isImax = screenType === 'IMAX';

  return (
    <div className="relative w-full max-w-3xl mx-auto pt-4 pb-12 overflow-hidden flex flex-col items-center">
      {/* Light Projection Cone shining down from screen */}
      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 w-4/5 h-28 opacity-20 pointer-events-none blur-xl transition-all duration-700 ${
          isImax
            ? 'bg-gradient-to-b from-yellow-400 via-yellow-600/30 to-transparent'
            : 'bg-gradient-to-b from-red-500 via-blue-500/20 to-transparent'
        }`}
      />

      {/* 3D Curved Screen Bar */}
      <div className="relative w-full flex flex-col items-center z-10 px-4">
        <div
          className={`w-full h-3.5 rounded-[100%] shadow-2xl transition-all duration-500 border-t-2 ${
            isImax
              ? 'bg-gradient-to-r from-yellow-600/30 via-yellow-300 to-yellow-600/30 border-yellow-300 shadow-[0_0_35px_rgba(234,179,8,0.5)]'
              : 'bg-gradient-to-r from-red-600/30 via-white to-red-600/30 border-red-500 shadow-[0_0_30px_rgba(229,9,20,0.4)]'
          }`}
          style={{
            transform: 'perspective(400px) rotateX(-12deg)',
          }}
        />

        {/* Screen Label & Room badge */}
        <div className="mt-3 flex items-center space-x-2 text-[11px] font-bold tracking-widest uppercase text-slate-400">
          <Monitor className={`w-3.5 h-3.5 ${isImax ? 'text-yellow-400' : 'text-red-500'}`} />
          <span>MÀN HÌNH CHÍNH &middot; {roomName}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
              isImax
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                : 'bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            {isImax ? 'IMAX LASER 4K' : 'DIGITAL 2D'}
          </span>
        </div>
      </div>
    </div>
  );
};
