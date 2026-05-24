import { useState, useEffect } from "react";
import { Bell, Upload, GitMerge, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const notificationIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const notificationColors = {
  success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
  warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
};

const notificationIconColors = {
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-orange-600 dark:text-orange-400",
  error: "text-red-600 dark:text-red-400",
};

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Model Upload Complete",
      message: "MRI-EFF-v1.5 has been successfully uploaded and validated",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "FL Round Started",
      message: "Round 16 has been initiated with 18 hospitals",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: true,
    },
    {
      id: "3",
      type: "warning",
      title: "Subscription Expiring",
      message: "CHU Constantine subscription expires in 3 days",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ["success", "info"][Math.floor(Math.random() * 2)] as "success" | "info",
        title: [
          "Model Aggregation Complete",
          "New Hospital Registered",
          "FL Round Progress Update",
          "Model Deployed Successfully",
        ][Math.floor(Math.random() * 4)],
        message: [
          "Round 15 aggregation completed successfully",
          "CHU Rabat has joined the network",
          "15/18 hospitals have uploaded their updates",
          "CXR-RES-v2.2 deployed to 12 hospitals",
        ][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Notifications</h3>
        </div>
        <button
          onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-lg border ${notificationColors[notification.type]} ${
                  !notification.read ? "ring-2 ring-blue-500/20" : ""
                } cursor-pointer transition-all`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${notificationIconColors[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {notification.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
