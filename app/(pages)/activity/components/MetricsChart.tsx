import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { IMPRESSIONS_CHART_CONFIG, VIEWS_CHART_CONFIG } from '@/lib/constants';
import { MetricsChartProps } from '@/lib/types';
import { cn, formatChartDate, formatCount, getTickInterval } from '@/lib/utils';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const MetricsChart = ({
  data,
  chartTab,
  onTabChange,
  range,
}: MetricsChartProps) => {
  if (!data || data.length === 0) return null;
  const tickInterval = getTickInterval(data.length, range);
  const isViews = chartTab === 'views';
  const config = isViews ? VIEWS_CHART_CONFIG : IMPRESSIONS_CHART_CONFIG;
  const dataKey = isViews ? 'views' : 'impressions';

  return (
    <div>
      <div className='flex items-center gap-1 mb-4'>
        {(['views', 'impressions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
              chartTab === tab
                ? 'bg-white/[0.08] text-white'
                : 'text-white/35 hover:text-white/55',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <ChartContainer config={config} className='h-[200px] w-full'>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id='metricsGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#1c8cd2' stopOpacity={0.2} />
              <stop offset='100%' stopColor='#1c8cd2' stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke='rgba(255,255,255,0.04)' />
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(d) => formatChartDate(d, range)}
            interval={tickInterval}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            width={44}
            allowDecimals={false}
            tickFormatter={(v) => formatCount(v)}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
          />
          <ChartTooltip
            cursor={{
              stroke: 'rgba(255,255,255,0.08)',
              strokeDasharray: '4 4',
            }}
            content={
              <ChartTooltipContent
                labelFormatter={(l) => formatChartDate(l as string)}
                indicator='line'
              />
            }
          />
          <Area
            type='monotone'
            dataKey={dataKey}
            stroke='#1c8cd2'
            strokeWidth={2}
            fill='url(#metricsGrad)'
            dot={false}
            activeDot={{ r: 4, fill: '#1c8cd2', strokeWidth: 0 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default MetricsChart;
