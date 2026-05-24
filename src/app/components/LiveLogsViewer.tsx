import { useState, useEffect, useRef } from "react";
import { Terminal, Pause, Play, Download } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

export function LiveLogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sampleLogs: LogEntry[] = [
      { timestamp: new Date().toISOString(), level: "info", message: "FL Round 15 initialized" },
      { timestamp: new Date().toISOString(), level: "info", message: "Broadcasting model to 18 hospitals" },
      { timestamp: new Date().toISOString(), level: "success", message: "CHU Alger: Local training started" },
      { timestamp: new Date().toISOString(), level: "success", message: "Hospital Mustapha: Local training started" },
      { timestamp: new Date().toISOString(), level: "info", message: "Waiting for updates from 18 hospitals..." },
    ];

    setLogs(sampleLogs);

    if (!isPaused) {
      const interval = setInterval(() => {
        const newLog: LogEntry = {
          timestamp: new Date().toISOString(),
          level: ["info", "success", "warning"][Math.floor(Math.random() * 3)] as "info" | "success" | "warning",
          message: [
            "Receiving update from CHU Alger...",
            "Hospital Mustapha: Epoch 10/50 completed",
            "Validation accuracy: 94.2%",
            "Aggregating weights from 12/18 hospitals",
            "Computing contribution scores...",
            "SSL divergence check passed",
          ][Math.floor(Math.random() * 6)],
        };

        setLogs((prev) => [...prev.slice(-50), newLog]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPaused]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-emerald-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const downloadLogs = () => {
    const content = logs.map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fl-logs-${new Date().toISOString()}.txt`;
    a.click();
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-white">Live FL Logs</span>
          {!isPaused && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-emerald-400">Live</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-gray-400" />
            ) : (
              <Pause className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button onClick={downloadLogs} className="p-1.5 hover:bg-gray-700 rounded transition-colors">
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-4 mb-1">
            <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className={`${getLevelColor(log.level)} text-xs uppercase`}>[{log.level}]</span>
            <span className="text-gray-300 flex-1">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
