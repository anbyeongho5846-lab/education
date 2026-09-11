import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Laptop, 
  MapPin, 
  PhoneCall, 
  Users, 
  Award, 
  RefreshCw 
} from 'lucide-react';
import { FAQ_LIST } from '../data/mockData';

export const FaqSection: React.FC = () => {
  // State for which FAQs are expanded (default: open first two)
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': true,
    'faq-3': true,
  });

  const toggleFaq = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getFaqIcon = (category: string) => {
    if (category.includes('대상')) return <Users className="w-4 h-4 text-blue-600" />;
    if (category.includes('준비물') || category.includes('노트북')) return <Laptop className="w-4 h-4 text-emerald-600" />;
    if (category.includes('장소') || category.includes('주차')) return <MapPin className="w-4 h-4 text-rose-600" />;
    if (category.includes('상시학습')) return <Award className="w-4 h-4 text-indigo-600" />;
    if (category.includes('취소')) return <RefreshCw className="w-4 h-4 text-amber-600" />;
    return <PhoneCall className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              자주 묻는 질문 & 참가 안내 (FAQ)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            교육 대상, 실습 노트북 준비, 주차 및 대중교통, 상시학습 인정 기준 등 상세 안내
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allOpen = Object.keys(openIds).length === FAQ_LIST.length && Object.values(openIds).every(Boolean);
              if (allOpen) {
                setOpenIds({});
              } else {
                const newAll: Record<string, boolean> = {};
                FAQ_LIST.forEach(f => newAll[f.id] = true);
                setOpenIds(newAll);
              }
            }}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            {Object.keys(openIds).length === FAQ_LIST.length && Object.values(openIds).every(Boolean)
              ? '모두 접기'
              : '모두 펼치기'}
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQ_LIST.map(faq => {
          const isOpen = !!openIds[faq.id];

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen 
                  ? 'border-blue-200 bg-blue-50/20 shadow-xs' 
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                    {getFaqIcon(faq.category)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50 inline-block mb-1">
                      {faq.category}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      Q. {faq.question}
                    </h4>
                  </div>
                </div>

                <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 bg-blue-100 text-blue-700' : ''
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100/80">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                    <p className="text-slate-800 whitespace-pre-line font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Notice Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">가온인재개발원 공공교육운영사무국</div>
            <div className="text-slate-500 mt-0.5">평일 09:00 ~ 18:00 (점심시간 12:00~13:00 제외)</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-700 font-mono">
          <span className="font-bold text-blue-700 text-sm">02-588-4920</span>
          <span>•</span>
          <span className="font-medium text-slate-600">edu@gaon-hrd.go.kr</span>
        </div>
      </div>
    </div>
  );
};
