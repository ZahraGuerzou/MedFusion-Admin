import { Bell, RefreshCw, Upload, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { RealTimeNotifications } from "../components/RealTimeNotifications";

const notifications = [
  {
    id: 1,
    type: "FL Round",
    icon: RefreshCw,
    title: "Round 15 completed successfully",
    message: "MRI-EFF-v1.4 has completed aggregation with 96.8% global accuracy",
    time: "15 min ago",
    read: false,
    color: "emerald",
  },
  {
    id: 2,
    type: "Upload",
    icon: Upload,
    title: "Hospital uploaded local update",
    message: "CHU Alger submitted model update for Round 15",
    time: "2 hours ago",
    read: false,
    color: "blue",
  },
  {
    id: 3,
    type: "Subscription",
    icon: CreditCard,
    title: "Plan expired warning",
    message: "CHU Constantine subscription expires in 7 days",
    time: "5 hours ago",
    read: true,
    color: "orange",
  },
  {
    id: 4,
    type: "Security",
    icon: Shield,
    title: "Failed validation attempt",
    message: "Model validation failed for CT-DENSE-v1.0 due to integrity check",
    time: "1 day ago",
    read: true,
    color: "red",
  },
  {
    id: 5,
    type: "FL Round",
    icon: CheckCircle2,
    title: "New FL Round started",
    message: "Round 16 initiated with 8 participating hospitals",
    time: "1 day ago",
    read: true,
    color: "green",
  },
  {
    id: 6,
    type: "Upload",
    icon: Upload,
    title: "Multiple uploads received",
    message: "5 hospitals submitted their local updates for Round 14",
    time: "2 days ago",
    read: true,
    color: "blue",
  },
  {
    id: 7,
    type: "Subscription",
    icon: CreditCard,
    title: "Premium subscription renewed",
    message: "CHU Alger renewed Premium plan for 12 months",
    time: "3 days ago",
    read: true,
    color: "purple",
  },
];

const colorClasses = {
  emerald: "bg-emerald-500/10 border-emerald-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
  orange: "bg-orange-500/10 border-orange-500/20",
  red: "bg-red-500/10 border-red-500/20",
  green: "bg-green-500/10 border-green-500/20",
  purple: "bg-purple-500/10 border-purple-500/20",
};

const iconColorClasses = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  blue: "text-blue-600 dark:text-blue-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
};

export function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Centralized alerts and updates</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            {unreadCount} Unread
          </Badge>
          <Button variant="outline">Mark All as Read</Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="fl-round">FL Round</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card 
                  key={notification.id}
                  className={`border ${
                    !notification.read 
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                  } hover:shadow-md transition-all cursor-pointer`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                        colorClasses[notification.color as keyof typeof colorClasses]
                      }`}>
                        <Icon className={`w-6 h-6 ${iconColorClasses[notification.color as keyof typeof iconColorClasses]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {notification.time}
                          </p>
                          {!notification.read && (
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map((notification) => {
              const Icon = notification.icon;
              return (
                <Card 
                  key={notification.id}
                  className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                        colorClasses[notification.color as keyof typeof colorClasses]
                      }`}>
                        <Icon className={`w-6 h-6 ${iconColorClasses[notification.color as keyof typeof iconColorClasses]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {notification.time}
                          </p>
                          <Button variant="ghost" size="sm" className="text-xs h-7">
                            Mark as Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Other filtered views would be similar */}
        <TabsContent value="fl-round" className="mt-6">
          <p className="text-gray-500 dark:text-gray-400">Filtered view for FL Round notifications...</p>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-6">
          <p className="text-gray-500 dark:text-gray-400">Filtered view for Upload notifications...</p>
        </TabsContent>
        
        <TabsContent value="subscription" className="mt-6">
          <p className="text-gray-500 dark:text-gray-400">Filtered view for Subscription notifications...</p>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <p className="text-gray-500 dark:text-gray-400">Filtered view for Security notifications...</p>
        </TabsContent>
      </Tabs>

      {/* Real-Time Notifications Feed */}
      <RealTimeNotifications />
    </div>
  );
}
