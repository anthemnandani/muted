'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RANGE_OPTIONS } from '@/lib/constants';
import type { ChartTab, ContentTab, TimeRange } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import { api } from '@/trpc/react';
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import EngagementRow from './EngagementRow';
import FollowerChart from './FollowerChart';
import MetricsChart from './MetricsChart';
import KPICard from './KPICard';
import ContentTable from './ContentTable';

const KPIBoxSkeleton = () => (
  <Card className='bg-white/[0.02] border-white/[0.06] p-4'>
    <Skeleton className='h-full w-full min-h-[72px] rounded-lg bg-white/[0.03]' />
  </Card>
);

const ChartSkeleton = ({ height = 'h-[200px]' }: { height?: string }) => (
  <Skeleton className={cn(height, 'w-full rounded-lg bg-white/[0.02]')} />
);

const EngagementSkeleton = () => (
  <div className='grid grid-cols-2 gap-3'>
    {[1, 2, 3, 4].map((i) => (
      <Skeleton
        key={i}
        className='h-[72px] w-full rounded-lg bg-white/[0.03]'
      />
    ))}
  </div>
);

const StatsContent = () => {
  const [range, setRange] = useState<TimeRange>('7d');
  const [contentTab, setContentTab] = useState<ContentTab>('posts');
  const [chartTab, setChartTab] = useState<ChartTab>('views');

  const isPostsTab = contentTab === 'posts';

  const { data: postOverview, isFetching: postLoading } =
    api.activity.getPostOverview.useQuery(
      { range },
      {
        enabled: isPostsTab,
        retry: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const { data: threadOverview, isFetching: threadLoading } =
    api.activity.getThreadOverview.useQuery(
      { range },
      {
        enabled: !isPostsTab,
        retry: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const { data: followerGrowth, isFetching: followerLoading } =
    api.activity.getFollowerGrowth.useQuery(
      { range },
      {
        retry: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const { data: topPosts, isFetching: topPostsLoading } =
    api.activity.getTopPosts.useQuery(
      { range },
      {
        enabled: isPostsTab,
        retry: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const { data: topThreads, isFetching: topThreadsLoading } =
    api.activity.getTopThreads.useQuery(
      { range },
      {
        enabled: !isPostsTab,
        retry: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const overview = isPostsTab ? postOverview : threadOverview;
  const overviewLoading = isPostsTab ? postLoading : threadLoading;
  const engagement = overview?.engagement;

  return (
    <div>
      <div className='flex-between mb-6 flex-wrap gap-3'>
        <div className='flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-[3px]'>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                range === opt.value
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className='flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-[3px]'>
          {(['posts', 'threads'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setContentTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                contentTab === tab
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 mb-5'>
        {overviewLoading ? (
          <>
            <KPIBoxSkeleton />
            <KPIBoxSkeleton />
          </>
        ) : (
          <>
            <KPICard
              icon={Eye}
              label='Total Views'
              value={overview?.totalViews ?? 0}
              delta={overview?.deltas.views}
            />
            <KPICard
              icon={TrendingUp}
              label='Engagement Rate'
              value={`${overview?.engagementRate ?? 0}%`}
            />
          </>
        )}
      </div>

      <Card className='bg-white/[0.02] border-white/[0.06] p-5 mb-5'>
        <h2 className='text-[14px] font-semibold text-white mb-2'>
          {isPostsTab ? 'Post' : 'Thread'} performance
        </h2>
        {overviewLoading ? (
          <ChartSkeleton />
        ) : (
          <MetricsChart
            data={overview?.dailyChart ?? []}
            chartTab={chartTab}
            onTabChange={setChartTab}
            range={range}
          />
        )}
      </Card>

      <Card className='bg-white/[0.02] border-white/[0.06] p-5 mb-5'>
        <h2 className='text-[14px] font-semibold text-white mb-3'>
          Engagement
        </h2>
        {overviewLoading ? (
          <EngagementSkeleton />
        ) : (
          <div className='grid grid-cols-2 gap-3'>
            <EngagementRow
              icon={Heart}
              label='Likes'
              value={engagement?.likes ?? 0}
            />
            <EngagementRow
              icon={MessageCircle}
              label='Comments'
              value={engagement?.comments ?? 0}
            />
            <EngagementRow
              icon={Repeat2}
              label='Reposts'
              value={engagement?.reposts ?? 0}
            />
            <EngagementRow
              icon={Bookmark}
              label='Saves'
              value={engagement?.saves ?? 0}
            />
          </div>
        )}
      </Card>

      <Card className='bg-white/[0.02] border-white/[0.06] p-5 mb-5'>
        <div className='flex-between mb-4'>
          <h2 className='text-[14px] font-semibold text-white'>
            Follower growth
          </h2>
          {!followerLoading && followerGrowth && (
            <div className='flex items-center gap-5'>
              <div className='text-right'>
                <span className='text-lg font-bold text-white'>
                  +{followerGrowth.gained}
                </span>
                <p className='text-[10px] text-white/30'>New</p>
              </div>
              {followerGrowth.snapshots.length > 0 && (
                <div className='text-right'>
                  <span className='text-lg font-bold text-white'>
                    {formatCount(
                      followerGrowth.snapshots[
                        followerGrowth.snapshots.length - 1
                      ].count,
                    )}
                  </span>
                  <p className='text-[10px] text-white/30'>Total</p>
                </div>
              )}
            </div>
          )}
        </div>
        {followerLoading ? (
          <ChartSkeleton height='h-[180px]' />
        ) : (
          <FollowerChart data={followerGrowth?.snapshots ?? []} range={range} />
        )}
      </Card>

      <Card className='bg-white/[0.02] border-white/[0.06] p-5'>
        <h2 className='text-[14px] font-semibold text-white mb-5'>
          Top {isPostsTab ? 'posts' : 'threads'}
        </h2>
        <ContentTable
          items={isPostsTab ? topPosts : topThreads}
          type={isPostsTab ? 'post' : 'thread'}
          isLoading={isPostsTab ? topPostsLoading : topThreadsLoading}
        />
      </Card>
    </div>
  );
};

export default StatsContent;
