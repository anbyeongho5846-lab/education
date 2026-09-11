import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  BarChart2, 
  Globe2, 
  ShieldCheck, 
  Laptop, 
  Send, 
  Award, 
  ArrowRight,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { EVENT_INFO, CURRICULUM_LIST, FAQ_LIST } from '../data/mockData';
import { Applicant } from '../types';

interface PublicLandingViewProps {
  onRegisterApplicant: (newApplicant: Omit<Applicant, 'id' | 'appliedAt'>) => void;
  remainingSeats: number;
  totalApplicants: number;
  dDay: number;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onRegisterApplicant,
  remainingSeats,
  totalApplicants,
  dDay,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    inquiry: '',
    agreeTerms: true,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');

  const handleLandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.organization.trim() || !formData.phone.trim() || !formData.email.trim()) {
      alert('이름, 소속기관, 연락처, 이메일은 필수 입력 사항입니다.');
      return;
    }

    if (!formData.agreeTerms) {
      alert('개인정보 수집 및 이용에 동의해 주시기 바랍니다.');
      return;
    }

    const code = `GAON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReceiptCode(code);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onRegisterApplicant({
      name: formData.name.trim(),
      organization: formData.organization.trim(),
      department: formData.department.trim(),
      position: formData.position.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      status: '신청',
      channel: '공공기관 공식 홈페이지',
      inquiry: formData.inquiry.trim(),
      manager: '김인재 주무관',
      followUp: {
        type: '문자',
        status: '진행중',
        notes: `홍보 랜딩페이지 온라인 직접 접수 (접수번호: ${code}).`,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
    });

    setIsSubmitted(true);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Notice Tag for Agency Users */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded text-[11px]">
            공식 안내
          </span>
          <span>이 페이지는 공공기관 재직자 배포용 공식 교육 홍보·신청 안내 페이지입니다.</span>
        </div>
        <span className="font-semibold text-blue-700 hidden sm:inline">상시학습 7시간 인정</span>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              가온인재개발원 공공HRD 혁신과정
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold">
              {dDay > 0 ? `접수마감 D-${dDay}` : '오늘 진행'}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              선착순 48명 한정 (잔여 {remainingSeats > 0 ? remainingSeats : 0}석)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-snug">
            {EVENT_INFO.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            공공기관 업무에 최적화된 프롬프트 작성부터 보고서 자동화, 대용량 행정 데이터 분석, 노코드 대민 웹앱 제작까지! 현장 적용 가능한 실습 중심 1일 완성 집중 교육에 귀 기관의 실무 인재를 초대합니다.
          </p>

          {/* Quick Info Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/30 text-blue-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">교육 일시</div>
                <div className="font-bold text-white">2026. 10. 22 (목)</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/30 text-blue-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">교육 시간</div>
                <div className="font-bold text-white">09:30 ~ 17:30 (7시간)</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/30 text-blue-300">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">교육 장소</div>
                <div className="font-bold text-white">가온인재개발원 3층</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/30 text-blue-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">모집 정원</div>
                <div className="font-bold text-emerald-400">선착순 48명 (실습)</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#apply-form"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>지금 온라인 참가 신청하기</span>
            </a>
            <div className="text-xs text-slate-400">
              * 정원 초과 시 예비 대기자로 자동 등록됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Messages / Why Attend */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-blue-600 font-extrabold text-xs tracking-wider uppercase">
            핵심 교육 차별화
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            왜 이번 공공기관 AI 실무교육인가요?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            행정 현장의 페인포인트를 해결하기 위해 설계된 세 가지 핵심 가치
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-black">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              핵심 가치 01
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              실무에 바로 쓰는 생성형 AI 문서/데이터 분석 실습 중심
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              강사의 일방적인 데모 시연이 아닙니다. 1인 1노트북 환경에서 보도자료, 기획보고서, 민원 답변서 초안을 직접 작성하고 검증합니다.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              핵심 가치 02
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              공공기관 업무혁신 사례와 프롬프트 템플릿 제공
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              중앙부처 및 지자체 우수 혁신 사례를 기반으로, 복사해서 업무에 바로 붙여넣는 직무별 공공 프롬프트 모음집을 전자책으로 전원 증정합니다.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black">
              <Globe2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              핵심 가치 03
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              팀별 결과물 발표로 현장 적용까지
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              배운 내용을 바탕으로 실제 소속 기관의 민원 대응 챗봇 또는 행정 보조 웹앱을 팀별로 완성하고 상호 피드백을 통해 현장 도입 가능성을 점검합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Curriculum Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              세부 교육 일정표 (09:00 ~ 17:30)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              하루 동안 집중적으로 진행되는 실전 커리큘럼
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            점심 식사 및 교재 무료 제공
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CURRICULUM_LIST.map((c, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-blue-700 bg-white border border-blue-200 px-2 py-1 rounded shrink-0">
                {c.time}
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{c.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Application Form CTA Section */}
      <div id="apply-form" className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-blue-600/30 shadow-lg relative scroll-mt-24">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              참가비 전액 무료 (공공지원)
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              실무교육 온라인 참가 신청
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              선착순 접수 순서에 따라 참석 승인 공문 및 확정 문자가 발송됩니다.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleLandingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    신청자 성명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    소속기관명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="한국전력공사, 서울시청 등"
                    value={formData.organization}
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    부서명
                  </label>
                  <input
                    type="text"
                    placeholder="디지털혁신과, 기획팀 등"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    직급 / 직책
                  </label>
                  <input
                    type="text"
                    placeholder="주무관, 과장, 차장 등"
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    휴대전화번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    업무용 이메일 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="id@agency.go.kr"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  사전 문의사항 및 교육 희망 분야
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 우리 기관 망분리 환경에서 활용 가능한 팁, 엑셀 대량 데이터 요약 실습 희망 등"
                  value={formData.inquiry}
                  onChange={e => setFormData({...formData, inquiry: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={e => setFormData({...formData, agreeTerms: e.target.checked})}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-600">
                    <strong>[필수] 개인정보 수집·이용 동의</strong>: 교육 참가자 확인, 입교 통지서 및 수료증 발급 목적으로 정보를 수집하며 교육 종료 후 파기됩니다.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>참가 신청서 제출하기</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">신청이 접수되었습니다!</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                접수 번호: <strong className="text-blue-600 font-mono">{receiptCode}</strong><br />
                기재해주신 연락처로 24시간 이내 참석 확정 알림이 발송됩니다.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    organization: '',
                    department: '',
                    position: '',
                    phone: '',
                    email: '',
                    inquiry: '',
                    agreeTerms: true,
                  });
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                추가 신청서 작성하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Location & Transport Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          교육장 오시는 길 & 주차 안내
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">📍 주소</span>
              <span>서울특별시 서초구 반포대로 124 가온인재개발원 3층 AI교육실</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">🚇 대중교통 이용</span>
              <span>지하철 2호선 서초역 3번 출구 도보 5분 / 3호선 교대역 9번 출구 도보 10분</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">🚗 무료 주차 지원</span>
              <span>건물 지하 1~2층 주차장 <strong>8시간 전액 무료</strong> (교육 안내 데스크에서 차량번호 등록)</span>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl text-white flex flex-col justify-between">
            <div>
              <span className="text-xs text-blue-300 font-bold block mb-1">문의 및 지원 데스크</span>
              <div className="text-xl font-bold">가온인재개발원 교육운영사무국</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                공문 발송 협조, 상시학습 시간 인정 문의, 단체 신청 등은 유선으로 문의 주시면 신속하게 지원해 드립니다.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="font-mono text-base font-bold text-blue-200">02-588-4920</span>
              <span className="text-slate-300 font-mono">edu@gaon-hrd.go.kr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
