import React, { useState } from 'react';
import { 
  BarChart, 
  MousePointerClick, 
  Eye, 
  Send, 
  Percent, 
  Layers, 
  ArrowUpDown, 
  Info, 
  ExternalLink 
} from 'lucide-react';
import { ChannelStat } from '../types';

interface ChannelPerformanceProps {
  channels: ChannelStat[];
  onChannelSelect?: (channelName: string) => void;
}

export const ChannelPerformance: React.FC<ChannelPerformanceProps> = ({
  channels,
  onChannelSelect,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [sortField, setSortField] = useState<'applications' | 'clicks' | 'impressions' | 'conversionRate'>('applications');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  const totalImpressions = channels.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = channels.reduce((acc, c) => acc + c.clicks, 0);
  const totalApps = channels.reduce((acc, c) => acc + c.applications, 0);
  const avgCtr = totalClicks > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';
  const overallConv = totalClicks > 0 ? ((totalApps / totalClicks) * 100).toFixed(2) : '0';

  const sortedChannels = [...channels].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortDirection === 'desc' ? valB - valA : valA - valB;
  });

  const maxApps = Math.max(...channels.map(c => c.applications), 1);
  const maxClicks = Math.max(...channels.map(c => c.clicks), 1);

  const toggleSort = (field: 'applications' | 'clicks' | 'impressions' | 'conversionRate') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <BarChart className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              홍보 채널별 유입·신청 성과 분석
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            이메일, 사내게시판, 문자, 카카오, 홈페이지 등 채널별 노출, 클릭 및 실제 신청 전환 현황
          </p>
        </div>

        {/* Aggregate Quick Stats Pills */}
        <div className="flex items-center gap-2 text-xs bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <div className="px-2 py-1 bg-white rounded-lg shadow-2xs">
            <span className="text-slate-500 text-[11px]">총 노출</span>{' '}
            <strong className="text-slate-800">{totalImpressions.toLocaleString()}회</strong>
          </div>
          <div className="px-2 py-1 bg-white rounded-lg shadow-2xs">
            <span className="text-slate-500 text-[11px]">총 클릭</span>{' '}
            <strong className="text-slate-800">{totalClicks.toLocaleString()}회</strong>
          </div>
          <div className="px-2 py-1 bg-blue-50 text-blue-800 rounded-lg shadow-2xs border border-blue-200/50">
            <span className="text-blue-600 text-[11px]">총 신청</span>{' '}
            <strong className="text-blue-900">{totalApps}명</strong>
          </div>
        </div>
      </div>

      {/* Visual Chart & Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Channel Comparison Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>채널별 신청자 유치 현황</span>
              <span className="text-xs font-normal text-slate-400">(단위: 명 / 점유율)</span>
            </h3>
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              목표 48명 중 {totalApps}명 달성
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4">
            {channels.map(channel => {
              const appShare = totalApps > 0 ? ((channel.applications / totalApps) * 100).toFixed(1) : '0';
              const isSelected = selectedChannelId === channel.id;

              return (
                <div 
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannelId(channel.id);
                    onChannelSelect?.(channel.name);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        channel.id.includes('board') ? 'bg-emerald-500' :
                        channel.id.includes('email') ? 'bg-blue-500' :
                        channel.id.includes('home') ? 'bg-indigo-500' :
                        channel.id.includes('kakao') ? 'bg-amber-500' : 'bg-purple-500'
                      }`} />
                      <span className="font-bold text-slate-800">{channel.name}</span>
                      <span className="text-[11px] text-slate-400">클릭 {channel.clicks.toLocaleString()}건</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{channel.applications}명 신청</span>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                        {appShare}%
                      </span>
                    </div>
                  </div>

                  {/* Relative bar comparison */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        channel.id.includes('board') ? 'bg-emerald-500' :
                        channel.id.includes('email') ? 'bg-blue-600' :
                        channel.id.includes('home') ? 'bg-indigo-500' :
                        channel.id.includes('kakao') ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${(channel.applications / maxApps) * 100}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex justify-between items-center text-[11px] text-slate-500">
                    <span>전환율(클릭→신청): <strong className="text-slate-700">{channel.conversionRate}%</strong></span>
                    <span>노출 {channel.impressions.toLocaleString()}회 (CTR {channel.ctr}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Insight note */}
          <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>성과 인사이트:</strong> <strong>사내게시판(인트라넷)</strong>과 <strong>이메일 공문</strong>이 전체 신청의 <strong>70% 이상</strong>을 견인하고 있습니다. 카카오 알림톡은 클릭률(CTR 34.4%)이 가장 높아 D-15 리마인드 메시지 발송 시 집중 활용을 권장합니다.
            </p>
          </div>
        </div>

        {/* Right: Selected Channel Deep Dive & Funnel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-slate-100 text-slate-700">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedChannel.name} 퍼널 분석
                </h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${selectedChannel.badgeColor}`}>
                선택 채널
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              타겟: <span className="text-slate-800 font-medium">{selectedChannel.targetAudience}</span>
            </p>

            {/* 3-Step Funnel Visual */}
            <div className="mt-4 space-y-3">
              {/* Step 1: Impressions */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    1단계: 채널 노출 (Impressions)
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedChannel.impressions.toLocaleString()}회
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  잠재 공공기관 담당자 대상 홍보 도달률
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center -my-1">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  클릭률 (CTR) {selectedChannel.ctr}%
                </span>
              </div>

              {/* Step 2: Clicks */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-blue-900">
                    <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                    2단계: 상세 페이지 유입 (Clicks)
                  </span>
                  <span className="font-mono font-bold text-blue-950">
                    {selectedChannel.clicks.toLocaleString()}건
                  </span>
                </div>
                <div className="text-[11px] text-blue-700/80 mt-1">
                  홍보 링크 클릭 후 대시보드/신청 안내 유입
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center -my-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  전환율 (CVR) {selectedChannel.conversionRate}%
                </span>
              </div>

              {/* Step 3: Applications */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    3단계: 최종 신청 접수 (Applications)
                  </span>
                  <span className="font-mono font-black text-emerald-950 text-sm">
                    {selectedChannel.applications}명 등록
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800/80 mt-1">
                  공식 신청 양식 작성 및 기관 참가 신청 접수
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>채널 전환 효율</span>
            <span className="font-semibold text-slate-700">
              {((selectedChannel.applications / selectedChannel.clicks) * 100).toFixed(2)}% (클릭당 접수율)
            </span>
          </div>
        </div>
      </div>

      {/* Performance Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">채널별 세부 지표 총괄표</h3>
            <p className="text-xs text-slate-500 mt-0.5">컬럼명을 클릭하여 오름차순/내림차순 정렬할 수 있습니다.</p>
          </div>
          <div className="text-xs text-slate-500">
            전체 5개 공식 홍보 채널 활성화 중
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">채널명</th>
                <th className="py-3 px-4 font-semibold">주요 타겟 대상</th>
                <th 
                  onClick={() => toggleSort('impressions')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>노출수</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('clicks')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>클릭수 (유입)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">CTR (클릭률)</th>
                <th 
                  onClick={() => toggleSort('applications')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1 text-blue-700">
                    <span>신청 접수인원</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-500" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('conversionRate')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>신청 전환율</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedChannels.map(channel => (
                <tr 
                  key={channel.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    selectedChannelId === channel.id ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        channel.id.includes('board') ? 'bg-emerald-500' :
                        channel.id.includes('email') ? 'bg-blue-500' :
                        channel.id.includes('home') ? 'bg-indigo-500' :
                        channel.id.includes('kakao') ? 'bg-amber-500' : 'bg-purple-500'
                      }`} />
                      {channel.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {channel.targetAudience}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {channel.impressions.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {channel.clicks.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {channel.ctr}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {channel.applications}명
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {channel.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedChannelId(channel.id);
                        onChannelSelect?.(channel.name);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors text-[11px] font-medium"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
