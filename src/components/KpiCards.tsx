import React from 'react';
import { 
  CalendarClock, 
  Users2, 
  Armchair, 
  TrendingUp, 
  HelpCircle, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface KpiCardsProps {
  dDay: number;
  targetCount: number;
  totalApplicants: number;
  confirmedCount: number;
  remainingSeats: number;
  conversionRate: number;
  totalVisitors: number;
  inquiryCount: number;
  pendingInquiries: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  dDay,
  targetCount,
  totalApplicants,
  confirmedCount,
  remainingSeats,
  conversionRate,
  totalVisitors,
  inquiryCount,
  pendingInquiries,
}) => {
  const progressPercent = Math.min(100, Math.round((totalApplicants / targetCount) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. 행사일 D-Day */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">행사 카운트다운</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day' : '종료'}
          </span>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
            {dDay > 0 ? `${dDay}일 남음` : '오늘 진행'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>행사일: 2026.10.22 (목)</span>
          <span className="text-slate-400 font-mono">09:30 시작</span>
        </div>
      </div>

      {/* 2. 목표 대비 신청 인원 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">목표 대비 신청 현황</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {totalApplicants}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ {targetCount}명</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-auto">
            {progressPercent}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between items-center text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              참가확정 {confirmedCount}명
            </span>
            <span>정원 {targetCount}명 기준</span>
          </div>
        </div>
      </div>

      {/* 3. 잔여 좌석 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">잔여 좌석</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Armchair className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
            remainingSeats <= 10 ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {remainingSeats > 0 ? remainingSeats : 0}
          </span>
          <span className="text-sm font-semibold text-slate-500">석 남음</span>
          {remainingSeats <= 10 && remainingSeats > 0 && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded ml-auto animate-pulse">
              마감임박
            </span>
          )}
          {remainingSeats <= 0 && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded ml-auto">
              정원마감
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>실습 좌석 48석</span>
          <span className="text-emerald-600 font-medium">선착순 승인 중</span>
        </div>
      </div>

      {/* 4. 신청 전환율 (방문 -> 신청) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">신청 전환율</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
            {conversionRate.toFixed(2)}%
          </span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
            <ArrowUpRight className="w-3 h-3" />
            +0.4%p
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>누적 유입</span>
          <span className="font-semibold text-slate-700">{totalVisitors.toLocaleString()}명 방문</span>
        </div>
      </div>

      {/* 5. 문의 건수 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">문의 / 후속 조치</span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {inquiryCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">건 접수</span>
          {pendingInquiries > 0 ? (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded ml-auto">
              미처리 {pendingInquiries}건
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> 처리완료
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>평균 응답시간</span>
          <span className="text-slate-700 font-medium">1.4시간 이내</span>
        </div>
      </div>
    </div>
  );
};
