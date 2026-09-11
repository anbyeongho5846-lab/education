import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Plus, 
  MoreHorizontal,
  ChevronDown,
  Building,
  UserCheck,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';
import { Applicant, ApplicationStatus, FollowUpType, FollowUpStatus } from '../types';

interface ApplicantManagementProps {
  applicants: Applicant[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateFollowUp: (
    id: string, 
    followUp: { type: FollowUpType; status: FollowUpStatus; notes: string; updatedAt: string }
  ) => void;
  onAddApplicant: (newApplicant: Omit<Applicant, 'id' | 'appliedAt'>) => void;
}

export const ApplicantManagement: React.FC<ApplicantManagementProps> = ({
  applicants,
  onUpdateStatus,
  onUpdateFollowUp,
  onAddApplicant,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');

  // Follow-up editing modal
  const [editingFollowUpApplicant, setEditingFollowUpApplicant] = useState<Applicant | null>(null);
  const [followUpForm, setFollowUpForm] = useState<{
    type: FollowUpType;
    status: FollowUpStatus;
    notes: string;
  }>({
    type: '전화',
    status: '완료',
    notes: '',
  });

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newApplicantForm, setNewApplicantForm] = useState({
    name: '',
    organization: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    status: '신청' as ApplicationStatus,
    channel: '사내게시판 / 인트라넷',
    inquiry: '',
    manager: '김인재 주무관',
  });

  // Unique list of managers and channels
  const managers = Array.from(new Set(applicants.map(a => a.manager).filter(Boolean)));
  const channels = Array.from(new Set(applicants.map(a => a.channel).filter(Boolean)));

  // Filtered applicants
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.inquiry && app.inquiry.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || app.channel === channelFilter;
    const matchesManager = managerFilter === 'all' || app.manager === managerFilter;

    return matchesSearch && matchesStatus && matchesChannel && matchesManager;
  });

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['이름', '소속기관', '부서', '직급', '연락처', '이메일', '신청상태', '신청일시', '유입채널', '담당자', '문의내용', '후속조치구분', '후속조치상태', '후속조치기록'];
    const rows = filteredApplicants.map(a => [
      `"${a.name}"`,
      `"${a.organization}"`,
      `"${a.department || ''}"`,
      `"${a.position || ''}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      `"${a.status}"`,
      `"${a.appliedAt}"`,
      `"${a.channel}"`,
      `"${a.manager}"`,
      `"${(a.inquiry || '').replace(/"/g, '""')}"`,
      `"${a.followUp?.type || ''}"`,
      `"${a.followUp?.status || ''}"`,
      `"${(a.followUp?.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `공공기관_AI교육_신청자명단_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFollowUpModal = (applicant: Applicant) => {
    setEditingFollowUpApplicant(applicant);
    setFollowUpForm({
      type: applicant.followUp?.type || '전화',
      status: applicant.followUp?.status || '완료',
      notes: applicant.followUp?.notes || '',
    });
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFollowUpApplicant) return;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    onUpdateFollowUp(editingFollowUpApplicant.id, {
      ...followUpForm,
      updatedAt: nowStr,
    });
    setEditingFollowUpApplicant(null);
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicantForm.name || !newApplicantForm.organization || !newApplicantForm.phone || !newApplicantForm.email) {
      alert('이름, 소속기관, 연락처, 이메일은 필수 입력사항입니다.');
      return;
    }

    onAddApplicant({
      ...newApplicantForm,
      followUp: {
        type: '전화',
        status: '대기',
        notes: '신규 수동 등록 참가자. 참석 확인 전화 예정',
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
    });

    setIsAddModalOpen(false);
    setNewApplicantForm({
      name: '',
      organization: '',
      department: '',
      position: '',
      phone: '',
      email: '',
      status: '신청',
      channel: '사내게시판 / 인트라넷',
      inquiry: '',
      manager: '김인재 주무관',
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case '확정':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">확정</span>;
      case '신청':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">신청</span>;
      case '대기':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">대기</span>;
      case '취소':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">취소</span>;
    }
  };

  const getFollowUpIcon = (type: FollowUpType) => {
    switch (type) {
      case '전화': return <Phone className="w-3 h-3 text-emerald-600" />;
      case '메일': return <Mail className="w-3 h-3 text-blue-600" />;
      case '문자': return <MessageSquare className="w-3 h-3 text-purple-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              신청자 & 잠재 리드 실시간 관리
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            접수된 교육 신청 인원 확인, 참석 상태(확정/대기/취소) 변경 및 전화·메일·문자 후속 조치 이력 관리
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            엑셀(CSV) 다운로드
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            신청자 수동 추가
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="이름, 소속기관, 연락처 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="all">신청 상태 전체</option>
              <option value="신청">신청 (심사중)</option>
              <option value="확정">확정 (승인 완료)</option>
              <option value="대기">대기 (정원 초과 대기)</option>
              <option value="취소">취소</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div>
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="all">유입 채널 전체</option>
              {channels.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          {/* Manager Filter */}
          <div>
            <select
              value={managerFilter}
              onChange={e => setManagerFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="all">담당자 전체</option>
              {managers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>검색 결과: <strong className="text-slate-900">{filteredApplicants.length}명</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">확정: {applicants.filter(a => a.status === '확정').length}명</span>
            <span>•</span>
            <span className="text-blue-700 font-semibold">신청: {applicants.filter(a => a.status === '신청').length}명</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">대기: {applicants.filter(a => a.status === '대기').length}명</span>
            <span>•</span>
            <span className="text-slate-600 font-semibold">취소: {applicants.filter(a => a.status === '취소').length}명</span>
          </div>

          {(searchTerm || statusFilter !== 'all' || channelFilter !== 'all' || managerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setChannelFilter('all');
                setManagerFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">신청자 / 소속</th>
                <th className="py-3 px-4 font-semibold">연락처 / 이메일</th>
                <th className="py-3 px-4 font-semibold">신청 상태 변경</th>
                <th className="py-3 px-4 font-semibold">유입 채널</th>
                <th className="py-3 px-4 font-semibold">문의 내용</th>
                <th className="py-3 px-4 font-semibold">담당자</th>
                <th className="py-3 px-4 font-semibold">후속 조치 이력 (전화/메일/문자)</th>
                <th className="py-3 px-4 font-semibold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    조건에 일치하는 신청자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map(applicant => (
                  <tr key={applicant.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Org */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {applicant.name}
                        {applicant.position && (
                          <span className="text-xs font-normal text-slate-500">
                            {applicant.position}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{applicant.organization}</span>
                        {applicant.department && (
                          <span className="text-slate-400">({applicant.department})</span>
                        )}
                      </div>
                    </td>

                    {/* Phone & Email */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-800 font-medium">{applicant.phone}</div>
                      <div className="text-[11px] text-slate-500">{applicant.email}</div>
                    </td>

                    {/* Quick Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={applicant.status}
                        onChange={e => onUpdateStatus(applicant.id, e.target.value as ApplicationStatus)}
                        className={`text-xs rounded-lg px-2.5 py-1 font-bold border focus:outline-hidden cursor-pointer ${
                          applicant.status === '확정' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          applicant.status === '신청' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          applicant.status === '대기' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="신청">신청 (심사중)</option>
                        <option value="확정">확정 (승인)</option>
                        <option value="대기">대기 (예비)</option>
                        <option value="취소">취소 (불참)</option>
                      </select>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {applicant.channel}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{applicant.appliedAt}</div>
                    </td>

                    {/* Inquiry */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {applicant.inquiry ? (
                        <p className="text-[11px] text-slate-700 bg-amber-50/60 p-1.5 rounded border border-amber-100 line-clamp-2">
                          {applicant.inquiry}
                        </p>
                      ) : (
                        <span className="text-slate-300 text-[11px]">- 없음 -</span>
                      )}
                    </td>

                    {/* Manager */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {applicant.manager}
                    </td>

                    {/* Follow-up action */}
                    <td className="py-3.5 px-4">
                      <div 
                        onClick={() => openFollowUpModal(applicant)}
                        className="cursor-pointer group/fu p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                          <span className="flex items-center gap-1">
                            {getFollowUpIcon(applicant.followUp.type)}
                            <span>{applicant.followUp.type} 안내</span>
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                            applicant.followUp.status === '완료' ? 'bg-emerald-100 text-emerald-800' :
                            applicant.followUp.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {applicant.followUp.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 group-hover/fu:text-blue-900">
                          {applicant.followUp.notes || '기록 없음 (클릭하여 등록)'}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openFollowUpModal(applicant)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                        title="후속 조치 기록 및 편집"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up Edit Modal */}
      {editingFollowUpApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  후속 조치(전화/메일/문자) 기록
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  대상: <strong className="text-slate-800">{editingFollowUpApplicant.name}</strong> ({editingFollowUpApplicant.organization})
                </p>
              </div>
              <button
                onClick={() => setEditingFollowUpApplicant(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">후속 조치 수단</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['전화', '메일', '문자'] as FollowUpType[]).map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFollowUpForm({...followUpForm, type: t})}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border font-semibold transition-colors ${
                        followUpForm.type === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {getFollowUpIcon(t)}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">조치 상태</label>
                <select
                  value={followUpForm.status}
                  onChange={e => setFollowUpForm({...followUpForm, status: e.target.value as FollowUpStatus})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="완료">완료 (안내 및 피드백 접수 완료)</option>
                  <option value="진행중">진행중 (부재중/추가 확인 필요)</option>
                  <option value="대기">대기 (조치 예정)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">조치 상세 내용 및 통화/발송 메모</label>
                <textarea
                  rows={4}
                  required
                  placeholder="예: 교육 실습 계정 안내 전화 완료. 교육 당일 기관 노트북 지참 요청 및 주차권 발송 완료 안내함."
                  value={followUpForm.notes}
                  onChange={e => setFollowUpForm({...followUpForm, notes: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFollowUpApplicant(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Applicant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                신청자 수동 등록 (유선/공문 접수자)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">신청자 성명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={newApplicantForm.name}
                    onChange={e => setNewApplicantForm({...newApplicantForm, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">소속기관 *</label>
                  <input
                    type="text"
                    required
                    placeholder="한국전력공사, 서울시청 등"
                    value={newApplicantForm.organization}
                    onChange={e => setNewApplicantForm({...newApplicantForm, organization: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">부서명</label>
                  <input
                    type="text"
                    placeholder="디지털혁신처"
                    value={newApplicantForm.department}
                    onChange={e => setNewApplicantForm({...newApplicantForm, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">직급</label>
                  <input
                    type="text"
                    placeholder="주무관, 과장, 차장 등"
                    value={newApplicantForm.position}
                    onChange={e => setNewApplicantForm({...newApplicantForm, position: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">휴대전화번호 *</label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={newApplicantForm.phone}
                    onChange={e => setNewApplicantForm({...newApplicantForm, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">공식 이메일 *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@agency.go.kr"
                    value={newApplicantForm.email}
                    onChange={e => setNewApplicantForm({...newApplicantForm, email: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">신청 상태</label>
                  <select
                    value={newApplicantForm.status}
                    onChange={e => setNewApplicantForm({...newApplicantForm, status: e.target.value as ApplicationStatus})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="신청">신청</option>
                    <option value="확정">확정</option>
                    <option value="대기">대기</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">접수 채널</label>
                  <select
                    value={newApplicantForm.channel}
                    onChange={e => setNewApplicantForm({...newApplicantForm, channel: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="사내게시판 / 인트라넷">사내게시판</option>
                    <option value="이메일 (공문/뉴스레터)">이메일 공문</option>
                    <option value="공공기관 공식 홈페이지">홈페이지</option>
                    <option value="카카오 알림톡">카카오</option>
                    <option value="문자(SMS/LMS)">문자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">배정 담당자</label>
                  <select
                    value={newApplicantForm.manager}
                    onChange={e => setNewApplicantForm({...newApplicantForm, manager: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="김인재 주무관">김인재 주무관</option>
                    <option value="이혁신 사무관">이혁신 사무관</option>
                    <option value="박디지털 책임">박디지털 책임</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">문의 및 사전 요청사항</label>
                <textarea
                  rows={2}
                  placeholder="노트북 대여 필요, 상시학습 공문 요청 등"
                  value={newApplicantForm.inquiry}
                  onChange={e => setNewApplicantForm({...newApplicantForm, inquiry: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
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
                  참가자 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
