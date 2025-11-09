import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MoodTracker from './pages/MoodTracker';
import SleepTracker from './pages/SleepTracker';
import StepsTracker from './pages/StepsTracker';
import HydrationTracker from './pages/HydrationTracker';
import HabitsTracker from './pages/HabitsTracker';
import Analytics from './pages/Analytics';


export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'mood':
        return <MoodTracker />;
      case 'sleep':
        return <SleepTracker />;
      case 'steps':
        return <StepsTracker />;
      case 'hydration':
        return <HydrationTracker />;
      case 'habits':
        return <HabitsTracker />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      <div className="pt-24">{renderScreen()}</div>
    </div>
  );
}