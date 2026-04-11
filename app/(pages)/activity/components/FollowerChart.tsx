import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { FOLLOWERS_CHART_CONFIG } from '@/lib/constants';
import type { TimeRange } from '@/lib/types';
import { formatChartDate, formatCount, getTickInterval } from '@/lib/utils';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const FollowerChart = ({
  data,
  range,
}: {
  data: { date: string; count: number }[];
  range: TimeRange;
}) => {
  if (!data || data.length === 0) return null;
  const tickInterval = getTickInterval(data.length, range);

  return (
    <ChartContainer
      config={FOLLOWERS_CHART_CONFIG}
      className='h-[180px] w-full'
    >
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
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
          cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              labelFormatter={(l) => formatChartDate(l as string)}
              indicator='line'
            />
          }
        />
        <Line
          type='monotone'
          dataKey='count'
          stroke='#1c8cd2'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#1c8cd2', strokeWidth: 0 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default FollowerChart;
