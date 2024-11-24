import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Timer, AlertTriangle, Loader2, ShowerHead, XCircle } from "lucide-react"

export function Home() {
  const [selectedDialog, setSelectedDialog] = useState<string | null>(null)
  const { toast } = useToast()

  // Detailed mock data for each indicator
  const qualityIssues = [
    {
      id: "QI-001",
      orderId: "ORD-2024-001",
      customer: "Michael Chen",
      sku: "LVC-501-32-001",
      location: "Right Pocket Stitching",
      timestamp: "2024-03-10T10:30:00",
      severity: "high",
      status: "pending"
    },
    {
      id: "QI-002",
      orderId: "ORD-2024-003",
      customer: "James Rodriguez",
      sku: "RRL-SLIM-001",
      location: "Hem Length",
      timestamp: "2024-03-10T11:15:00",
      severity: "medium",
      status: "pending"
    },
    // Add more quality issues...
  ]

  const completedOrders = [
    {
      orderId: "ORD-2024-002",
      customer: "Sarah Johnson",
      sku: "IW-BARTON-001",
      completedAt: "2024-03-10T09:45:00",
      washType: "Dark Indigo",
      qualityScore: 98
    },
    // Add more completed orders...
  ]

  const washQueue = [
    {
      orderId: "ORD-2024-004",
      customer: "Emma Thompson",
      sku: "LVC-501-30-001",
      washType: "Medium Wash",
      startTime: "2024-03-10T10:00:00",
      estimatedCompletion: "2024-03-10T11:30:00",
      machine: "W2"
    },
    // Add more wash queue items...
  ]

  const reviewItems = [
    {
      orderId: "ORD-2024-005",
      customer: "David Kim",
      sku: "RRL-SLIM-002",
      issue: "Size Verification",
      flaggedBy: "Production Team",
      timestamp: "2024-03-10T09:30:00",
      priority: "urgent"
    },
    // Add more review items...
  ]

  const processingItems = [
    {
      orderId: "ORD-2024-006",
      stage: "Cutting",
      startTime: "2024-03-10T08:00:00",
      estimatedCompletion: "2024-03-10T12:00:00",
      progress: 65
    },
    // Add more processing items...
  ]

  const handleResolveIssue = (id: string) => {
    toast({
      title: "Issue Resolved",
      description: `Quality issue ${id} has been marked as resolved.`,
    })
    // Here you would typically update the state/data
  }

  const handleConfirmReview = (orderId: string) => {
    toast({
      title: "Review Completed",
      description: `Order ${orderId} has been reviewed and confirmed.`,
    })
    // Here you would typically update the state/data
  }

  const getDialogContent = () => {
    switch (selectedDialog) {
      case 'quality':
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quality Issues</DialogTitle>
              <DialogDescription>
                Current quality issues requiring attention
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {qualityIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/30">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {issue.severity}
                        </Badge>
                        <span className="font-medium">{issue.orderId}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.customer}</p>
                      <p className="text-sm">Location: {issue.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(issue.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleResolveIssue(issue.id)}
                    >
                      Resolve Issue
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        )

      case 'completed':
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Completed Orders</DialogTitle>
              <DialogDescription>
                Orders completed today
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <div key={order.orderId} className="p-4 rounded-lg border bg-card/30">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-medium">{order.orderId}</p>
                        <p className="text-sm">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">SKU: {order.sku}</p>
                        <p className="text-sm">Wash Type: {order.washType}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        Score: {order.qualityScore}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        )

      case 'wash':
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Wash Queue</DialogTitle>
              <DialogDescription>
                Current items in wash process
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {washQueue.map((item) => (
                  <div key={item.orderId} className="p-4 rounded-lg border bg-card/30">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.orderId}</p>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                          Machine {item.machine}
                        </Badge>
                      </div>
                      <p className="text-sm">{item.customer}</p>
                      <p className="text-sm">Wash Type: {item.washType}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Started: {new Date(item.startTime).toLocaleTimeString()}</p>
                        <p>Est. Completion: {new Date(item.estimatedCompletion).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        )

      case 'finishing':
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Finishing Stage</DialogTitle>
              <DialogDescription>
                Units in finishing process
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {finishingItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border bg-card/30">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.unit}</span>
                          <Badge variant="outline" className={
                            item.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {item.stage}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Operator: {item.operator}</p>
                        <div className="text-sm">
                          <p>Started: {new Date(item.startTime).toLocaleTimeString()}</p>
                          <p>Est. Completion: {new Date(item.estimatedCompletion).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        )

      case 'fulfillment':
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fulfillment Queue</DialogTitle>
              <DialogDescription>
                Units ready for shipping
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {fulfillmentItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border bg-card/30">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.unit}</span>
                          <Badge variant="outline" className={
                            item.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm">{item.customer}</p>
                        <p className="text-sm text-muted-foreground">{item.destination}</p>
                        <div className="flex justify-between text-sm">
                          <span>{item.shipMethod}</span>
                          <span className="text-muted-foreground">{item.packingStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        )

      default:
        return null
    }
  }

  // Update your attentionIndicators to include onClick handlers
  const attentionIndicators = [
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Quality Issues",
      value: qualityIssues.length,
      status: "critical",
      change: "+2 from yesterday",
      onClick: () => setSelectedDialog('quality')
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Completed Today",
      value: completedOrders.length,
      status: "success",
      change: "+25 since morning",
      onClick: () => setSelectedDialog('completed')
    },
    {
      icon: <ShowerHead className="h-5 w-5" />,
      label: "In Wash",
      value: washQueue.length,
      status: "info",
      change: "15 pending",
      onClick: () => setSelectedDialog('wash')
    },
    {
      icon: <Timer className="h-5 w-5" />,
      label: "Finishing",
      value: 34,
      status: "info",
      change: "8 pressing, 26 QC",
      onClick: () => setSelectedDialog('finishing')
    },
    {
      icon: <Loader2 className="h-5 w-5" />,
      label: "Fulfillment",
      value: 52,
      status: "warning",
      change: "12 urgent ship",
      onClick: () => setSelectedDialog('fulfillment')
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      processing: "bg-blue-500/20 text-blue-400",
      completed: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
    }
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400"
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      alert: "bg-red-500/20 text-red-400",
      success: "bg-green-500/20 text-green-400",
      info: "bg-blue-500/20 text-blue-400",
      warning: "bg-yellow-500/20 text-yellow-400",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-400"
  }

  const getIndicatorStyles = (status: string) => {
    const styles = {
      critical: "bg-red-950/50 text-red-400 border border-red-900/50",
      success: "bg-green-950/50 text-green-400 border border-green-900/50",
      warning: "bg-yellow-950/50 text-yellow-400 border border-yellow-900/50",
      info: "bg-blue-950/50 text-blue-400 border border-blue-900/50"
    }
    return styles[status as keyof typeof styles] || "bg-gray-950/50 text-gray-400 border border-gray-900/50"
  }

  // Add mock data for the main cards
  const recentOrders = [
    {
      id: "ORD-2024-007",
      customer: "Alex Rivera",
      status: "processing",
      items: 1,
      sku: "LVC-501-34-001",
      total: "$99.00",
      date: "2024-03-10T11:30:00",
    },
    {
      id: "ORD-2024-008",
      customer: "Sophie Chen",
      status: "completed",
      items: 2,
      sku: "RRL-SLIM-003",
      total: "$198.00",
      date: "2024-03-10T11:15:00",
    },
    {
      id: "ORD-2024-009",
      customer: "Marcus Johnson",
      status: "pending",
      items: 1,
      sku: "LVC-501-30-002",
      total: "$99.00",
      date: "2024-03-10T11:00:00",
    },
  ]

  const productionStages = [
    {
      stage: "Intake & Sort",
      count: 45,
      percentage: 25,
      details: "Processing new arrivals",
      status: "on-track"
    },
    {
      stage: "Wash & Process",
      count: 72,
      percentage: 40,
      details: "Multiple wash types in progress",
      status: "busy"
    },
    {
      stage: "Quality Check",
      count: 38,
      percentage: 21,
      details: "Detailed inspection phase",
      status: "attention"
    },
    {
      stage: "Finishing & Pack",
      count: 25,
      percentage: 14,
      details: "Final processing stage",
      status: "normal"
    },
  ]

  const recentEvents = [
    {
      id: 1,
      type: "info",
      message: "Unit LVC-501-32-001-A scanned into wash",
      timestamp: "2 minutes ago",
      details: "Machine W2 - Dark Indigo Process",
      location: "Wash Station"
    },
    {
      id: 2,
      type: "success",
      message: "Unit RRL-SLIM-003-B fulfilled to Sarah Johnson",
      timestamp: "5 minutes ago",
      details: "Shipping to Portland, Oregon",
      location: "Fulfillment"
    },
    {
      id: 3,
      type: "info",
      message: "Unit IW-BARTON-001-C scanned into quality check",
      timestamp: "10 minutes ago",
      details: "Post-wash inspection required",
      location: "QC Station"
    },
    {
      id: 4,
      type: "info",
      message: "Unit LVC-501-30-002-D scanned into finishing",
      timestamp: "15 minutes ago",
      details: "Steam & Press process",
      location: "Finishing Station"
    },
    {
      id: 5,
      type: "success",
      message: "Unit RRL-SLIM-002-E fulfilled to Michael Chen",
      timestamp: "20 minutes ago",
      details: "Shipping to Fairbanks, Alaska",
      location: "Fulfillment"
    },
    {
      id: 6,
      type: "warning",
      message: "Unit LVC-501-34-001-F quality check failed",
      timestamp: "25 minutes ago",
      details: "Hem measurement out of spec",
      location: "QC Station"
    },
    {
      id: 7,
      type: "info",
      message: "Unit IW-BARTON-002-G scanned into intake",
      timestamp: "30 minutes ago",
      details: "Initial processing started",
      location: "Intake Station"
    },
    {
      id: 8,
      type: "success",
      message: "Unit RRL-SLIM-001-H completed wash cycle",
      timestamp: "35 minutes ago",
      details: "Ready for quality inspection",
      location: "Wash Station"
    },
    {
      id: 9,
      type: "info",
      message: "Unit LVC-501-32-002-I scanned for packaging",
      timestamp: "40 minutes ago",
      details: "Final inspection passed",
      location: "Packaging Station"
    },
    {
      id: 10,
      type: "success",
      message: "Unit IW-BARTON-003-J fulfilled to Emma Thompson",
      timestamp: "45 minutes ago",
      details: "Shipping to Seattle, Washington",
      location: "Fulfillment"
    }
  ]

  // Add mock data for the new sections
  const finishingItems = [
    {
      id: "FIN-001",
      unit: "LVC-501-32-001-K",
      stage: "Steam Press",
      startTime: "2024-03-10T10:45:00",
      estimatedCompletion: "2024-03-10T11:15:00",
      operator: "Station 3",
      priority: "normal"
    },
    {
      id: "FIN-002",
      unit: "RRL-SLIM-003-L",
      stage: "Quality Check",
      startTime: "2024-03-10T10:30:00",
      estimatedCompletion: "2024-03-10T11:00:00",
      operator: "Station 2",
      priority: "high"
    },
    {
      id: "FIN-003",
      unit: "IW-BARTON-002-M",
      stage: "Final Inspection",
      startTime: "2024-03-10T10:15:00",
      estimatedCompletion: "2024-03-10T10:45:00",
      operator: "Station 1",
      priority: "normal"
    }
  ]

  const fulfillmentItems = [
    {
      id: "FUL-001",
      unit: "LVC-501-30-002-N",
      customer: "Ryan Thompson",
      destination: "Chicago, Illinois",
      shipMethod: "Express",
      packingStatus: "Ready",
      priority: "urgent"
    },
    {
      id: "FUL-002",
      unit: "RRL-SLIM-001-O",
      customer: "Lisa Chen",
      destination: "San Francisco, California",
      shipMethod: "Standard",
      packingStatus: "In Progress",
      priority: "normal"
    },
    {
      id: "FUL-003",
      unit: "IW-BARTON-003-P",
      customer: "Mark Davis",
      destination: "Austin, Texas",
      shipMethod: "Express",
      packingStatus: "Pending",
      priority: "urgent"
    }
  ]

  return (
    <div className="container mx-auto p-8 bg-background">
      {/* Greeting Card */}
      <Card className="mb-6 border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">Hello, Kristian</h1>
                <p className="text-muted-foreground">Here's what needs your attention today</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-card/50">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {attentionIndicators.map((indicator) => (
                <div
                  key={indicator.label}
                  className={`p-4 rounded-lg ${getIndicatorStyles(indicator.status)} transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/10 cursor-pointer`}
                  onClick={indicator.onClick}
                >
                  <div className="flex items-center space-x-2">
                    {indicator.icon}
                    <span className="font-medium">{indicator.label}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{indicator.value}</span>
                    <p className="text-sm opacity-80">{indicator.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Orders Summary Card */}
        <Card className="col-span-1 border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Orders</CardTitle>
            <CardDescription className="flex justify-between items-center">
              <span>Last 24 hours</span>
              <span className="text-2xl font-bold text-primary">127</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{order.customer}</span>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.id}</p>
                      <p className="text-sm">SKU: {order.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{order.total}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Production Stages Card */}
        <Card className="col-span-1 border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Production</CardTitle>
            <CardDescription>Current stage distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {productionStages.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-primary">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.count} units</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-primary/50"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {stage.details}
                    </span>
                    <Badge variant="outline" className={
                      stage.status === 'attention' ? 'bg-yellow-500/20 text-yellow-400' :
                      stage.status === 'busy' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }>
                      {stage.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Log Card */}
        <Card className="col-span-1 border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Scan Log</CardTitle>
            <CardDescription>Unit tracking and movement</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.location}
                      </Badge>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm text-primary">{event.message}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{event.details}</p>
                          <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dialog component */}
      <Dialog open={selectedDialog !== null} onOpenChange={() => setSelectedDialog(null)}>
        {getDialogContent()}
      </Dialog>
    </div>
  )
}