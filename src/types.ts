export type ApplicationStatus = '신청' | '대기' | '확정' | '취소';
export type FollowUpType = '전화' | '메일' | '문자' | '대면';
export type FollowUpStatus = '완료' | '진행중' | '대기';

export interface Applicant {
  id: string;
  name: string;
  organization: string;
  department?: string;
  position?: string;
  phone: string;
  email: string;
  status: ApplicationStatus;
  channel: string;
  appliedAt: string;
  inquiry?: string;
  manager: string;
  followUp: {
    type: FollowUpType;
    status: FollowUpStatus;
    notes: string;
    updatedAt: string;
  };
}

export interface ChannelStat {
  id: string;
  name: string;
  badgeColor: string;
  impressions: number; // 노출
  clicks: number;      // 클릭
  applications: number; // 신청/유입
  ctr: number;         // 클릭률 (%)
  conversionRate: number; // 전환율 (%)
  targetAudience: string;
}

export type CalendarCategory = '공지' | '리마인드' | '커리큘럼 소개' | '강사 소개' | '후기' | 'FAQ';
export type ContentStatus = '완료' | '예정' | '작성중';

export interface CalendarPlan {
  id: string;
  dDay: string; // e.g. "D-30", "D-15"
  date: string; // "2026-09-22"
  title: string;
  category: CalendarCategory;
  channel: string;
  status: ContentStatus;
  manager: string;
  copySnippet: string;
  notes?: string;
}

export interface CurriculumItem {
  time: string;
  title: string;
  description: string;
  badge?: string;
  isBreak?: boolean;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface EventInfo {
  title: string;
  dateTimeStr: string;
  eventDate: string; // ISO or YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  targetCount: number;
  targetDescription: string;
  coreMessages: string[];
}
