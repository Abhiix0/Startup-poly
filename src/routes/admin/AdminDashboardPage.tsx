import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { supabase } from '../../data/client';
import { PixelButton } from '../../ui';
import { CreateRoomView } from './CreateRoomView';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [checkingActiveRoom, setCheckingActiveRoom] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkCurrentRoom() {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('id, status')
          .neq('status', 'FINALIZED')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data?.id && isMounted) {
          setActiveRoomId(data.id);
        }
      } catch (err) {
        console.warn('Failed to check active room:', err);
      } finally {
        if (isMounted) {
          setCheckingActiveRoom(false);
        }
      }
    }

    checkCurrentRoom();
    return () => {
      isMounted = false;
    };
  }, []);

  if (checkingActiveRoom) {
    return (
      <div className="min-h-screen bg-[#5C94FC] flex items-center justify-center p-4">
        <div className="bg-[#FAF8F5] border-4 border-[#102040] shadow-[6px_6px_0px_#102040] p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-[#FFCC00] border-3 border-[#102040] mx-auto mb-4 flex items-center justify-center font-pixel text-lg animate-spin">
            ★
          </div>
          <h2 className="font-pixel text-xs uppercase tracking-wider text-[#102040] mb-2">
            CHECKING MATCH STATE...
          </h2>
          <p className="font-mono text-xs text-[#64748B]">Locating any active room in progress</p>
        </div>
      </div>
    );
  }

  // If a non-finalized room already exists, redirect directly to its control console
  if (activeRoomId) {
    return <Navigate to={`/admin/room/${activeRoomId}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Admin Top Navigation */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-sm text-[#FFCC00]">STARTUPOLY</span>
          <span className="hidden sm:inline font-mono text-xs text-[#E2E8F0] border-l-2 border-white/20 pl-3">
            ADMIN CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline font-mono text-xs text-[#94A3B8]">
            {user?.email}
          </span>
          <Link to="/admin/history">
            <PixelButton variant="ghost" size="sm">
              HISTORY
            </PixelButton>
          </Link>
          <PixelButton variant="danger" size="sm" onClick={() => logout()}>
            LOGOUT
          </PixelButton>
        </div>
      </header>

      {/* Main Container: Create Room View */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <CreateRoomView />
      </main>

      {/* Brick Ground Base */}
      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
