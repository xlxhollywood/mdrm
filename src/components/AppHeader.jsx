'use client';

import { useState, useEffect } from 'react';
import { imgLogo, imgIconUser, imgIconNoti, imgIconSet } from '@/lib/assets';

const NAV_MENUS = ['대시보드', '시스템', '워크플로우', '점검작업', '리포트'];

export default function AppHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hh = String(h % 12 || 12).padStart(2, '0');
      return `${ampm} ${hh}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-10 shrink-0">
      {/* 로고 */}
      <div className="w-[245px] shrink-0 bg-nav border-y border-[#525151] flex items-center justify-center overflow-hidden">
        <img src={imgLogo} alt="logo" className="w-[154px] h-[30px] object-contain pointer-events-none" />
      </div>

      {/* 네비바 */}
      <div className="flex-1 bg-nav flex items-center relative">
        <div className="flex items-center h-full pl-[5px]">
          {NAV_MENUS.map(menu => {
            const isActive = menu === '리포트';
            return (
              <div
                key={menu}
                className={`h-8 min-w-[78px] px-5 flex items-center justify-center mt-1 rounded-sm
                  ${isActive ? 'bg-nav-active cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`text-[14px] whitespace-nowrap
                  ${isActive ? 'font-bold text-white' : 'font-normal text-[#b8cbf3] opacity-60'}`}>
                  {menu}
                </span>
              </div>
            );
          })}
        </div>

        {/* 우측 아이콘 */}
        <div className="ml-auto flex items-center gap-1 pr-4">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <img src={imgIconUser} alt="user" className="w-7 h-7" />
          </div>
          <div className="relative w-7 h-7 flex items-center justify-center">
            <img src={imgIconNoti} alt="noti" className="w-7 h-7" />
            <div className="absolute top-[2px] right-0 bg-[#ec1d46] rounded-[10px] min-w-4 h-[14px] px-[3px] flex items-center justify-center text-[9px] font-bold text-white">
              9+
            </div>
          </div>
          <div className="w-7 h-7 flex items-center justify-center">
            <img src={imgIconSet} alt="settings" className="w-7 h-7" />
          </div>
          <div className="w-px h-[22px] bg-[#4874ce] mx-2" />
          <span className="text-[13px] text-white/80 whitespace-nowrap">{time}</span>
        </div>
      </div>
    </div>
  );
}
