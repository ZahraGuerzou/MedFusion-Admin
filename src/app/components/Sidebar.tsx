import { useState } from "react";
import { Link, useLocation } from "react-router";
import logo from "./logo.png";
import {
  LayoutDashboard,
  Building2,
  Brain,
  RefreshCw,
  GitMerge,
  CreditCard,
  Bell,
  Settings,
  Send,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "./ui/utils";
import { motion } from "motion/react";

const navItems = [
  { path: "/dashboard",          label: "Dashboard",                  icon: LayoutDashboard },
  { path: "/hospitals",          label: "Hospitals",                  icon: Building2 },
  { path: "/model-distribution", label: "FL Training & Distribution", icon: Send },
  { path: "/fl-rounds",          label: "FL Rounds",                  icon: RefreshCw },
  { path: "/aggregation",        label: "Aggregation Engine",         icon: GitMerge },
  { path: "/subscriptions",      label: "Subscriptions",              icon: CreditCard },
  { path: "/notifications",      label: "Notifications",              icon: Bell },
  { path: "/settings",           label: "Settings",                   icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? "72px" : "240px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 flex flex-col border-r border-gray-100 dark:border-gray-800 relative shadow-sm"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md z-10 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        {isCollapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          : <ChevronLeft  className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
      </button>

      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
  <img
    src={logo}
    alt="MF Logo"
    className="w-9 h-9 object-contain rounded-xl"
  />
</div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">MedFusion AI</p>
              <p className="text-xs text-violet-500 dark:text-violet-400 font-medium">Admin Platform</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group",
                isActive
                  ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-gray-200"
              )}
            >
              <Icon
                className={cn("flex-shrink-0", isActive ? "text-violet-600 dark:text-violet-400" : "")}
                style={{ width: "18px", height: "18px" }}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              )}
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Admin badge */}
      <div className="px-3 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className={cn(
          "rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/40 transition-all",
          isCollapsed ? "p-2.5 flex justify-center" : "p-3"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 leading-tight">Admin Access</p>
                <p className="text-xs text-violet-400 dark:text-violet-500">All systems live</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}