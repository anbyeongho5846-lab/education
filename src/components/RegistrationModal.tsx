import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserPlus, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  FileText, 
  X,
  Send
} from 'lucide-react';
import { EVENT_INFO } from '../data/mockData';
import { Applicant } from '../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newApplicant: Omit<Applicant, 'id' | 'appliedAt'>) => void;
  remainingSeats: number;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  remainingSeats,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    channel: '공공기관 공식 홈페이지',
    inquiry: '',
    agreeTerms: true,
  });

  const [receiptNumber, setReceiptNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.organization.trim() || !formData.phone.trim() || !formData.email.trim()) {
      alert('이름, 소속기관, 연락처, 이메일은 필수 입력 사항입니다.');
      return;
    }

    if (!formData.agreeTerms) {
      alert('개인정보 수집 및 이용에 동의해 주셔야 신청이 가능합니다.');
      return;
    }

    // Generate receipt number
    const code = `GAON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReceiptNumber(code);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Register applicant
    onRegisterSuccess({
      name: formData.name.trim(),
      organization: formData.organization.trim(),
      department: formData.department.trim(),
      position: formData.position.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      status: '신청',
      channel: formData.channel,
      inquiry: formData.inquiry.trim(),
      manager: '김인재 주무관',
      followUp: {
        type: '문자',
        status: '진행중',
        notes: `신청서 실시간 온라인 접수 완료 (접수번호: ${code}). 참가 확정 문자 발송 대기 중`,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
    });

    setStep('success');
  };

  const handleResetAndClose = () => {
    setStep('form');
    setFormData({
      name: '',
      organization: '',
      department: '',
      position: '',
      phone: '',
      email: '',
      channel: '공공기관 공식 홈페이지',
      inquiry: '',
      agreeTerms: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {step === 'form' ? (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                  선착순 {EVENT_INFO.targetCount}명 한정 (잔여 {remainingSeats > 0 ? remainingSeats : 0}석)
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  교육 참가 신청서
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {EVENT_INFO.title} • {EVENT_INFO.dateTimeStr}
                </p>
              </div>
              <button
                onClick={handleResetAndClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    신청자 성명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
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
                    placeholder="예: 행정안전부, 한국전력공사 등"
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
                    placeholder="예: 디지털혁신과, 기획팀"
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
                    placeholder="예: 주무관, 사무관, 과장, 팀장"
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
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">안내 문자 및 입교증이 전송됩니다.</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    업무용 이메일 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@agency.go.kr"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">교재 및 사전 실습 계정이 발송됩니다.</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  유입 경로 (홍보 매체)
                </label>
                <select
                  value={formData.channel}
                  onChange={e => setFormData({...formData, channel: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="사내게시판 / 인트라넷">사내게시판 / 인트라넷 공지</option>
                  <option value="이메일 (공문/뉴스레터)">이메일 공문 / 교육훈련 협조 안내</option>
                  <option value="공공기관 공식 홈페이지">가온인재개발원 공식 홈페이지 배너</option>
                  <option value="카카오 알림톡">카카오 알림톡</option>
                  <option value="문자(SMS/LMS)">문자 메시지</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  문의 사항 또는 이번 교육에서 해결하고 싶은 업무 애로사항
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 보고서 요약 프롬프트 추천, 보도자료 작성법, 파이썬 없이 데이터 분석하는 법 등"
                  value={formData.inquiry}
                  onChange={e => setFormData({...formData, inquiry: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Terms Agreement */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={e => setFormData({...formData, agreeTerms: e.target.checked})}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">[필수] 개인정보 수집 및 이용 동의</strong>
                    <p className="text-slate-500 mt-0.5">
                      수집 항목: 성명, 소속기관, 부서, 직급, 연락처, 이메일<br />
                      이용 목적: 교육생 선발 및 명단 관리, 상시학습 수료증 발급, 사전 안내문 발송<br />
                      보유 기간: 교육 종료 후 1년간 보관 후 지체 없이 파기
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>지금 참가 신청 제출하기</span>
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  접수 즉시 교육운영사무국 담당자에게 실시간 등록되며 접수 확인 문자가 발송됩니다.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Submission Feedback Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              정상 접수 완료
            </span>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              신청이 접수되었습니다!
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              <strong>{formData.name}</strong> 님의 교육 참가 신청이 성공적으로 등록되었습니다.<br />
              담당자 검토 후 24시간 내 기재하신 연락처(<strong>{formData.phone}</strong>)로 최종 확정 통지서 및 교재 안내문이 발송됩니다.
            </p>

            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs max-w-md mx-auto space-y-2 font-mono">
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-sans">접수 번호</span>
                <span className="font-bold text-blue-700">{receiptNumber}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-sans">신청자명</span>
                <span className="text-slate-800 font-bold">{formData.name} ({formData.organization})</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-sans">교육 일시</span>
                <span className="text-slate-800">2026.10.22(목) 09:30 ~ 17:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">교육 장소</span>
                <span className="text-slate-800 font-sans">가온인재개발원 3층 AI교육실</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                대시보드에서 신청 현황 확인하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
