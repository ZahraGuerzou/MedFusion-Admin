import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, Activity, Hospital, Brain, Users, Settings, Bell, BarChart3, CreditCard } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commands = [
  { id: "dashboard", label: "Dashboard", icon: Activity, path: "/dashboard", category: "Navigation" },
  { id: "hospitals", label: "Hospitals", icon: Hospital, path: "/hospitals", category: "Navigation" },
  { id: "add-hospital", label: "Add Hospital", icon: Users, path: "/hospitals/add", category: "Quick Action" },
  { id: "model-distribution", label: "FL Training & Distribution", icon: Activity, path: "/model-distribution", category: "Navigation" },
  { id: "fl-rounds", label: "FL Rounds", icon: Activity, path: "/fl-rounds", category: "Navigation" },
  { id: "aggregation", label: "Aggregation Engine", icon: BarChart3, path: "/aggregation", category: "Navigation" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, path: "/subscriptions", category: "Navigation" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications", category: "Navigation" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings", category: "Navigation" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].path);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for pages, hospitals, models..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">No results found</div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                        index === selectedIndex
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                      onClick={() => {
                        navigate(cmd.path);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="flex-1 text-left text-gray-900 dark:text-white">{cmd.label}</span>
                      <span className="text-xs text-gray-400">{cmd.category}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
