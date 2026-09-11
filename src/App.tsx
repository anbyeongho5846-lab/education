import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CalendarDays, 
  Users, 
  Globe, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  EVENT_INFO, 
  INITIAL_CHANNEL_STATS, 
  INITIAL_CALENDAR_PLANS, 
  INITIAL_APPLICANTS 
} from './data/mockData';
import { Applicant, ApplicationStatus, CalendarPlan, ContentStatus, ChannelStat, FollowUpType, FollowUpStatus } from './types';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { ChannelPerformance } from './components/ChannelPerformance';
import { ContentCalendarView } from './components/ContentCalendarView';
import { ApplicantManagement } from './components/ApplicantManagement';
import { CurriculumTimeline } from './components/CurriculumTimeline';
import { FaqSection } from './components/FaqSection';
import { RegistrationModal } from './components/RegistrationModal';
import { PublicLandingView } from './components/PublicLandingView';

export default function App() {
  // Navigation tabs: 'overview' (종합 대시보드), 'channels' (채널·캘린더), 'applicants' (신청자 관리), 'landing' (홍보 페이지 뷰)
  const [currentTab, setCurrentTab] = useState<'overview' | 'channels' | 'applicants' | 'landing'>('overview');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Core state with localStorage persistence
  const [applicants, setApplicants] = useState<Applicant[]>(() => {
    try {
      const saved = localStorage.getItem('gaon_ai_applicants');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_APPLICANTS;
  });

  const [channelStats, setChannelStats] = useState<ChannelStat[]>(() => {
    try {
      const saved = localStorage.getItem('gaon_ai_channels');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CHANNEL_STATS;
  });

  const [calendarPlans, setCalendarPlans] = useState<CalendarPlan[]>(() => {
    try {
      const saved = localStorage.getItem('gaon_ai_plans');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CALENDAR_PLANS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gaon_ai_applicants', JSON.stringify(applicants));
    } catch {
      // ignore
    }
  }, [applicants]);

  useEffect(() => {
    try {
      localStorage.setItem('gaon_ai_channels', JSON.stringify(channelStats));
    } catch {
      // ignore
    }
  }, [channelStats]);

  useEffect(() => {
    try {
      localStorage.setItem('gaon_ai_plans', JSON.stringify(calendarPlans));
    } catch {
      // ignore
    }
  }, [calendarPlans]);

  // Calculate D-Day dynamically to 2026-10-22
  const targetDate = new Date('2026-10-22T09:30:00');
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const dDayNumber = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Derived Metrics
  const nonCancelledApplicants = applicants.filter(a => a.status !== '취소');
  const totalApplicantsCount = nonCancelledApplicants.length;
  const confirmedCount = applicants.filter(a => a.status === '확정').length;
  const remainingSeats = Math.max(0, EVENT_INFO.targetCount - totalApplicantsCount);

  const totalVisitors = channelStats.reduce((acc, c) => acc + c.clicks, 0);
  const conversionRate = totalVisitors > 0 ? (totalApplicantsCount / totalVisitors) * 100 : 0;
  
  const inquiryCount = applicants.filter(a => a.inquiry && a.inquiry.trim().length > 0).length + 4;
  const pendingInquiries = applicants.filter(a => a.followUp && a.followUp.status !== '완료').length;

  // Actions
  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplicants(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  const handleUpdateFollowUp = (
    id: string,
    followUp: { type: FollowUpType; status: FollowUpStatus; notes: string; updatedAt: string }
  ) => {
    setApplicants(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, followUp };
      }
      return app;
    }));
  };

  const handleAddApplicant = (newApplicantData: Omit<Applicant, 'id' | 'appliedAt'>) => {
    const newId = `app-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newApp: Applicant = {
      ...newApplicantData,
      id: newId,
      appliedAt: nowStr,
    };

    setApplicants(prev => [newApp, ...prev]);

    // Also update channel stats
    setChannelStats(prev => prev.map(ch => {
      if (ch.name === newApplicantData.channel) {
        const newApps = ch.applications + 1;
        const newClicks = ch.clicks + 1;
        return {
          ...ch,
          applications: newApps,
          clicks: newClicks,
          conversionRate: Number(((newApps / newClicks) * 100).toFixed(2)),
        };
      }
      return ch;
    }));
  };

  const handleUpdatePlanStatus = (id: string, newStatus: ContentStatus) => {
    setCalendarPlans(prev => prev.map(plan => {
      if (plan.id === id) {
        return { ...plan, status: newStatus };
      }
      return plan;
    }));
  };

  const handleAddPlan = (newPlanData: Omit<CalendarPlan, 'id'>) => {
    const newId = `plan-${Date.now().toString().slice(-4)}`;
    setCalendarPlans(prev => [...prev, { ...newPlanData, id: newId }]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header with Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        dDayNumber={dDayNumber}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Tab 1: 종합 대시보드 (Overview) */}
        {currentTab === 'overview' && (
          <div className="space-y-8">
            {/* Top KPI Cards */}
            <KpiCards
              dDay={dDayNumber}
              targetCount={EVENT_INFO.targetCount}
              totalApplicants={totalApplicantsCount}
              confirmedCount={confirmedCount}
              remainingSeats={remainingSeats}
              conversionRate={conversionRate}
              totalVisitors={totalVisitors}
              inquiryCount={inquiryCount}
              pendingInquiries={pendingInquiries}
            />

            {/* Quick Section: Channel Performance */}
            <ChannelPerformance
              channels={channelStats}
              onChannelSelect={() => setCurrentTab('channels')}
            />

            {/* Content Calendar Quick Glance */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    홍보 일정 진행 현황 (D-30 ~ D-1)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    전체 8개 홍보 계획 중 발행 완료 {calendarPlans.filter(p => p.status === '완료').length}건, 작성중/예정 {calendarPlans.filter(p => p.status !== '완료').length}건
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('channels')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  캘린더 전체 보기 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {calendarPlans.slice(0, 4).map(plan => (
                  <div key={plan.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                        {plan.dDay}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        plan.status === '완료' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 line-clamp-1">{plan.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{plan.channel}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Curriculum & Core Copy Highlights */}
            <CurriculumTimeline />

            {/* Recent Applicants Quick View */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    최근 접수된 교육 신청자 목록
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    실시간 온라인 및 유선 접수 인원 (총 {applicants.length}명 등록)
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('applicants')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  신청자 전체 관리 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                      <th className="py-2.5 px-3 font-semibold">이름</th>
                      <th className="py-2.5 px-3 font-semibold">소속기관</th>
                      <th className="py-2.5 px-3 font-semibold">연락처</th>
                      <th className="py-2.5 px-3 font-semibold">상태</th>
                      <th className="py-2.5 px-3 font-semibold">담당자</th>
                      <th className="py-2.5 px-3 font-semibold">신청일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants.slice(0, 5).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{app.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">{app.organization} {app.position ? `(${app.position})` : ''}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{app.phone}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            app.status === '확정' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === '신청' ? 'bg-blue-100 text-blue-800' :
                            app.status === '대기' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{app.manager}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{app.appliedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Accordion FAQ Section */}
            <FaqSection />
          </div>
        )}

        {/* Tab 2: 채널·콘텐츠 성과 (Channels & Content Calendar) */}
        {currentTab === 'channels' && (
          <div className="space-y-8">
            <ChannelPerformance channels={channelStats} />
            <ContentCalendarView
              plans={calendarPlans}
              onUpdatePlanStatus={handleUpdatePlanStatus}
              onAddPlan={handleAddPlan}
            />
          </div>
        )}

        {/* Tab 3: 신청자·리드 관리 (Applicant Management) */}
        {currentTab === 'applicants' && (
          <div className="space-y-8">
            <ApplicantManagement
              applicants={applicants}
              onUpdateStatus={handleUpdateStatus}
              onUpdateFollowUp={handleUpdateFollowUp}
              onAddApplicant={handleAddApplicant}
            />
          </div>
        )}

        {/* Tab 4: 공공기관 공식 홍보 페이지 뷰 (Public Landing Preview) */}
        {currentTab === 'landing' && (
          <div className="space-y-8">
            <PublicLandingView
              onRegisterApplicant={handleAddApplicant}
              remainingSeats={remainingSeats}
              totalApplicants={totalApplicantsCount}
              dDay={dDayNumber}
            />
            <FaqSection />
          </div>
        )}
      </main>

      {/* Floating Bottom CTA on non-landing tabs for fast application */}
      {currentTab !== 'landing' && (
        <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>교육 신청 접수하기 (잔여 {remainingSeats}석)</span>
          </button>
        </div>
      )}

      {/* Direct Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleAddApplicant}
        remainingSeats={remainingSeats}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">가온인재개발원 공공HRD 혁신센터</span>
            <span className="text-slate-600">|</span>
            <span>공공기관 생성형 AI 업무혁신 실무교육 운영사무국</span>
          </div>
          <div className="text-slate-400 text-center md:text-right">
            <span>서울특별시 서초구 반포대로 124 • 02-588-4920 • edu@gaon-hrd.go.kr</span>
            <div className="text-slate-500 text-[11px] mt-0.5">© 2026 Gaon HRD Center. All Rights Reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
