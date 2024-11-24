import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StageSummaryCards() {
  const summaryData = [
    {
      title: "Total Projects",
      value: "24",
      description: "Active projects in pipeline",
    },
    {
      title: "In Progress",
      value: "12",
      description: "Projects being processed",
    },
    {
      title: "Completed",
      value: "8",
      description: "Successfully completed",
    },
    {
      title: "Pending Review",
      value: "4",
      description: "Awaiting verification",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 