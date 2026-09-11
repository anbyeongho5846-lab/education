import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  Edit3, 
  Plus, 
  Copy, 
  Check, 
  Filter, 
  Sparkles, 
  Send, 
  ListOrdered, 
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { CalendarPlan, CalendarCategory, ContentStatus } from '../types';

interface ContentCalendarViewProps {
  plans: CalendarPlan[];
  onUpdatePlanStatus: (id: string, newStatus: ContentStatus) => void;
  onAddPlan: (newPlan: Omit<CalendarPlan, 'id'>) => void;
}

export const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({
  plans,
  onUpdatePlanStatus,
  onAddPlan,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New plan form state
  const [newPlan, setNewPlan] = useState({
    dDay: 'D-5',
    date: '2026-10-17',
    title: '',
    category: '리마인드' as CalendarCategory,
    channel: '카카오 / 문자',
    status: '작성중' as ContentStatus,
    manager: '김인재 주무관',
    copySnippet: '',
    notes: '',
  });

  const categories: CalendarCategory[] = ['공지', '리마인드', '커리큘럼 소개', '강사 소개', '후기', 'FAQ'];

  const filteredPlans = plans.filter(plan => {
    const matchCategory = selectedCategory === 'all' || plan.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    return matchCategory && matchStatus;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title) return;
    onAddPlan(newPlan);
    setIsAddModalOpen(false);
    setNewPlan({
      dDay: 'D-5',
      date: '2026-10-17',
      title: '',
      category: '리마인드',
      channel: '카카오 / 문자',
      status: '작성중',
      manager: '김인재 주무관',
      copySnippet: '',
      notes: '',
    });
  };

  const getCategoryBadgeClass = (category: CalendarCategory) => {
    switch (category) {
      case '공지': return 'bg-blue-50 text-blue-700 border-blue-200';
      case '리마인드': return 'bg-rose-50 text-rose-700 border-rose-200';
      case '커리큘럼 소개': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '강사 소개': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '후기': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAQ': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case '완료':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            발행 완료
          </span>
        );
      case '예정':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 text-blue-600" />
            게시 예정
          </span>
        );
      case '작성중':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Hourglass className="w-3 h-3 text-amber-600" />
            원고 작성중
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              홍보 콘텐츠 캘린더 (D-30 ~ D-1)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            D-30 개시부터 D-1 전일 최종 안내까지 단계별 홍보 메시지 발행 계획 및 원고 관리
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              타임라인 뷰
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              카드 그리드 뷰
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            콘텐츠 계획 추가
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> 분류:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 ({plans.length})
          </button>
          {categories.map(cat => {
            const count = plans.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">상태:</span>
          {(['all', '완료', '예정', '작성중'] as const).map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? '전체' : st}
            </button>
          ))}
        </div>
      </div>

      {/* View: Timeline Mode */}
      {viewMode === 'timeline' ? (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-8 pb-4">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="relative pl-6 sm:pl-8 group">
                {/* D-Day Node Circle */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs font-black text-[11px] text-blue-700">
                  {plan.dDay.replace('D-', '')}
                </div>

                <div className="bg-slate-50/70 hover:bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 hover:border-blue-200 hover:shadow-xs transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {plan.dDay}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {plan.date}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getCategoryBadgeClass(plan.category)}`}>
                        {plan.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        채널: <strong className="text-slate-700">{plan.channel}</strong>
                      </span>
                    </div>

                    {/* Quick status dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        value={plan.status}
                        onChange={(e) => onUpdatePlanStatus(plan.id, e.target.value as ContentStatus)}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="완료">발행 완료</option>
                        <option value="예정">게시 예정</option>
                        <option value="작성중">원고 작성중</option>
                      </select>
                      {getStatusBadge(plan.status)}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {plan.title}
                  </h3>

                  {/* Copy snippet box with quick copy button */}
                  {plan.copySnippet && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs relative group/snippet">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          홍보 추천 카피 문구
                        </span>
                        <button
                          onClick={() => handleCopy(plan.id, plan.copySnippet)}
                          className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {copiedId === plan.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">복사됨!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>문구 복사</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed italic">
                        "{plan.copySnippet}"
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/50">
                    <span>담당자: <strong className="text-slate-700">{plan.manager}</strong></span>
                    {plan.notes && (
                      <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        비고: {plan.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* View: Card Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map(plan => (
            <div 
              key={plan.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                    {plan.dDay}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${getCategoryBadgeClass(plan.category)}`}>
                    {plan.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5">
                  {plan.title}
                </h3>

                <div className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{plan.date}</span>
                  <span>•</span>
                  <span>{plan.channel}</span>
                </div>

                {plan.copySnippet && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 mb-3 line-clamp-3 italic">
                    "{plan.copySnippet}"
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <select
                    value={plan.status}
                    onChange={(e) => onUpdatePlanStatus(plan.id, e.target.value as ContentStatus)}
                    className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700"
                  >
                    <option value="완료">완료</option>
                    <option value="예정">예정</option>
                    <option value="작성중">작성중</option>
                  </select>
                  {getStatusBadge(plan.status)}
                </div>

                <span className="text-[11px] text-slate-400">
                  {plan.manager}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                신규 홍보 콘텐츠 일정 등록
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewPlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">D-Day 구분</label>
                  <input
                    type="text"
                    required
                    placeholder="예: D-5"
                    value={newPlan.dDay}
                    onChange={e => setNewPlan({...newPlan, dDay: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">발행 예정일</label>
                  <input
                    type="date"
                    required
                    value={newPlan.date}
                    onChange={e => setNewPlan({...newPlan, date: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">콘텐츠 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 잔여 좌석 5석 안내 및 현장 실습 환경 공지"
                  value={newPlan.title}
                  onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">분류</label>
                  <select
                    value={newPlan.category}
                    onChange={e => setNewPlan({...newPlan, category: e.target.value as CalendarCategory})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">발행 채널</label>
                  <input
                    type="text"
                    value={newPlan.channel}
                    onChange={e => setNewPlan({...newPlan, channel: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">홍보 추천 카피 문구</label>
                <textarea
                  rows={3}
                  placeholder="실제 발송할 매력적인 헤드라인 및 본문 요약"
                  value={newPlan.copySnippet}
                  onChange={e => setNewPlan({...newPlan, copySnippet: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">담당자</label>
                  <input
                    type="text"
                    value={newPlan.manager}
                    onChange={e => setNewPlan({...newPlan, manager: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">상태</label>
                  <select
                    value={newPlan.status}
                    onChange={e => setNewPlan({...newPlan, status: e.target.value as ContentStatus})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="작성중">원고 작성중</option>
                    <option value="예정">게시 예정</option>
                    <option value="완료">발행 완료</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  일정 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
