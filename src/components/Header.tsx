import React from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  UserPlus, 
  BarChart3, 
  CalendarDays, 
  Users, 
  Globe 
} from 'lucide-react';
import { EVENT_INFO } from '../data/mockData';

interface HeaderProps {
  currentTab: 'overview' | 'channels' | 'applicants' | 'landing';
  setCurrentTab: (tab: 'overview' | 'channels' | 'applicants' | 'landing') => void;
  onOpenRegister: () => void;
  dDayNumber: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRegister,
  dDayNumber,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner with Public Agency Info */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-semibold tracking-wide">
              대한민국 공공기관 실무역량 강화
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              가온인재개발원 공공HRD 혁신센터
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              2026. 10. 22 (목)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              09:30 ~ 17:30
            </span>
            <span className="flex items-center gap-1 hidden md:flex">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              가온인재개발원 3층
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold text-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {EVENT_INFO.title}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                dDayNumber > 0 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {dDayNumber > 0 ? `D-${dDayNumber}` : dDayNumber === 0 ? 'D-Day 오늘!' : '교육 종료'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              홍보·모집 성과 대시보드 & 참가자 관리 시스템
            </p>
          </div>
        </div>

        {/* Navigation Tabs & CTA */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-between md:justify-end">
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'overview'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>종합 대시보드</span>
            </button>
            <button
              onClick={() => setCurrentTab('channels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'channels'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>채널·콘텐츠 성과</span>
            </button>
            <button
              onClick={() => setCurrentTab('applicants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'applicants'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>신청자·리드 관리</span>
            </button>
            <button
              onClick={() => setCurrentTab('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'landing'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>홍보 페이지 뷰</span>
            </button>
          </nav>

          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>지금 신청하기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
