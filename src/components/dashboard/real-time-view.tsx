import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RealTimeView() {
  const stageData = [
    {
      stage: "Data Collection",
      progress: 75,
      status: "Active",
      lastUpdated: "2 mins ago",
    },
    {
      stage: "Processing",
      progress: 45,
      status: "In Progress",
      lastUpdated: "5 mins ago",
    },
    {
      stage: "Validation",
      progress: 20,
      status: "Pending",
      lastUpdated: "10 mins ago",
    },
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Real-Time Stage Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {stageData.map((stage) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {stage.stage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stage.status} - Last updated {stage.lastUpdated}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stage.progress}%
                </div>
              </div>
              <Progress value={stage.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 