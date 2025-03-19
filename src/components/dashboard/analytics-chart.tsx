'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '@/lib/types';

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  colors?: string[];
}

export function AnalyticsChart({
  data,
  type = 'line',
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A349A4'],
}: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Different chart types
  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}`, 'Value']}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickFormatter={(value) => {
              // Format date if it's a date string
              try {
                if (value.includes('-')) {
                  const date = new Date(value);
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }
              } catch (e) {
                // Not a valid date, use the value as is
              }
              return value;
            }}
          />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value}`, 'Value']}
            labelFormatter={(label) => {
              // Format date if it's a date string
              try {
                if (typeof label === 'string' && label.includes('-')) {
                  const date = new Date(label);
                  return date.toLocaleDateString();
                }
              } catch (e) {
                // Not a valid date, use the label as is
              }
              return label;
            }}
          />
          <Bar dataKey="value" fill={colors[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Default to line chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tickFormatter={(value) => {
            // Format date if it's a date string
            try {
              if (value.includes('-')) {
                const date = new Date(value);
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              }
            } catch (e) {
              // Not a valid date, use the value as is
            }
            return value;
          }}
        />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value}`, 'Value']}
          labelFormatter={(label) => {
            // Format date if it's a date string
            try {
              if (typeof label === 'string' && label.includes('-')) {
                const date = new Date(label);
                return date.toLocaleDateString();
              }
            } catch (e) {
              // Not a valid date, use the label as is
            }
            return label;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors[0]}
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}