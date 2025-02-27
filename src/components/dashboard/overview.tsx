"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Server, Activity } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  // In a real app, this data would come from an API
  const stats = [
    {
      title: "Total Projects",
      value: 3,
      description: "+1 from last month",
      icon: <Server className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Active Users",
      value: 120,
      description: "+12% from last month",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "API Requests",
      value: "24.3k",
      description: "+19% from last week",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Data Usage",
      value: "512 MB",
      description: "32% of monthly quota",
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
