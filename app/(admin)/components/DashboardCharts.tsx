'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DashboardChartsProps } from '@/lib/types';
import { tickFormatter, tooltipLabelFormatter } from '@/lib/utils';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

const usersConfig = {
  value: { label: 'Users', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const postsConfig = {
  value: { label: 'Posts', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const DashboardCharts = ({
  usersChartData,
  postsChartData,
}: DashboardChartsProps) => {
  const monthlyTicks = useMemo(() => {
    if (usersChartData.length === 0) return [];
    const interval = Math.max(1, Math.floor(usersChartData.length / 6));
    return usersChartData
      .filter((_, i) => i % interval === 0)
      .map((d) => d.date);
  }, [usersChartData]);

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <ChartContainer
            config={usersConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <AreaChart data={usersChartData}>
              <defs>
                <linearGradient id='fillUsers' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-value)'
                    stopOpacity={0.9}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-value)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                ticks={monthlyTicks}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={tickFormatter}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={tooltipLabelFormatter}
                    indicator='dot'
                  />
                }
              />
              <Area
                dataKey='value'
                type='natural'
                fill='url(#fillUsers)'
                stroke='var(--color-value)'
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Total Posts</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <ChartContainer
            config={postsConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart data={postsChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                ticks={monthlyTicks}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={tickFormatter}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent labelFormatter={tooltipLabelFormatter} />
                }
              />
              <Bar
                dataKey='value'
                fill='var(--color-value)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
