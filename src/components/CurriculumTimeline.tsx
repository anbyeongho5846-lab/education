import React from 'react';
import { 
  Clock, 
  Sparkles, 
  FileText, 
  BarChart2, 
  Globe2, 
  Presentation, 
  CheckCircle, 
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { CURRICULUM_LIST, EVENT_INFO } from '../data/mockData';

export const CurriculumTimeline: React.FC = () => {
  const getSessionIcon = (title: string) => {
    if (title.includes('등록')) return <Clock className="w-4 h-4 text-slate-500" />;
    if (title.includes('동향')) return <Sparkles className="w-4 h-4 text-blue-600" />;
    if (title.includes('문서')) return <FileText className="w-4 h-4 text-emerald-600" />;
    if (title.includes('데이터')) return <BarChart2 className="w-4 h-4 text-indigo-600" />;
    if (title.includes('웹앱')) return <Globe2 className="w-4 h-4 text-purple-600" />;
    if (title.includes('발표')) return <Presentation className="w-4 h-4 text-amber-600" />;
    if (title.includes('점심')) return <Coffee className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Core Copy Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            핵심 교육 가치 & 차별화 포인트
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            실무자가 주도하는 공공행정 생성형 AI 대전환
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            단순 이론 교육을 탈피하고, 현업 기획서 작성부터 대민 행정 웹앱 프로토타입 구축까지 1일 7시간 몰입형 실습으로 완성합니다.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EVENT_INFO.coreMessages.map((msg, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs font-semibold text-white leading-snug">
                  {msg}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curriculum Schedule Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-2 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              교육 세부 커리큘럼 (09:00 ~ 17:30)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              공공기관 실무에 최적화된 모듈형 7개 세션 타임라인
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
              상시학습 7시간 인정
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
              노트북 1인 1실습
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {CURRICULUM_LIST.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all ${
                item.isBreak
                  ? 'bg-amber-50/50 border-amber-200/60'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-blue-200 hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isBreak ? 'bg-amber-100' : 'bg-white border border-slate-200 shadow-2xs'
                  }`}>
                    {getSessionIcon(item.title)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {item.time}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
