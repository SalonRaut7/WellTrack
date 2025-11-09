import React from "react";
import { Heart, Moon, Footprints, Droplets, CheckCircle2, BarChart3, LogOut } from "lucide-react";

interface NavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Heart },
    { id: "mood", label: "Mood", icon: Heart },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "steps", label: "Steps", icon: Footprints },
    { id: "hydration", label: "Hydration", icon: Droplets },
    { id: "habits", label: "Habits", icon: CheckCircle2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b shadow z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            W
          </div>
          <h1 className="text-2xl font-bold">WellTrack</h1>
        </div>
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => onNavigate("login")}
            className="ml-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
