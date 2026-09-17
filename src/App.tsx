import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { PlayerJoinView } from './components/player/PlayerJoinView';
import { PlayerShell } from './components/player/PlayerShell';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminShell } from './components/admin/AdminShell';
import { MultiViewSimulator } from './components/simulator/MultiViewSimulator';

const AppContent: React.FC = () => {
  const { session, activeView, setSimulatorMode } = useGame();
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || window.location.pathname || '#/play');

  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash || window.location.pathname || '#/play';
      setCurrentHash(h);
      if (h.includes('simulator')) {
        setSimulatorMode(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [setSimulatorMode]);

  // Check if simulator is active via hash, pathname or state
  if (activeView === 'simulator' || currentHash.includes('simulator')) {
    return <MultiViewSimulator />;
  }

  // Admin Route
  const isAdminRoute = currentHash.includes('admin');

  if (session.role === 'admin') {
    return <AdminShell />;
  }

  if (session.role === 'player') {
    return <PlayerShell />;
  }

  // Not logged in: Route to Admin Login or Player Join based on URL
  if (isAdminRoute) {
    return (
      <AdminLogin 
        onBackToPlay={() => {
          window.location.hash = '#/play';
          setCurrentHash('#/play');
        }} 
      />
    );
  }

  return (
    <PlayerJoinView 
      onGoToAdminLogin={() => {
        window.location.hash = '#/admin/login';
        setCurrentHash('#/admin/login');
      }} 
    />
  );
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;

