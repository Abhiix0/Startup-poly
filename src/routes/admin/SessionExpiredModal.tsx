import React, { useState } from 'react';
import { Modal, PixelButton, TextField } from '../../ui';
import { supabase } from '../../data/client';
import { logger } from '../../lib/logger';

export interface SessionExpiredModalProps {
  isOpen: boolean;
  userEmail?: string;
  onSuccess: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  userEmail = '',
  onSuccess,
}) => {
  const [email, setEmail] = useState<string>(userEmail);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;
      if (!data.session) throw new Error('Failed to restore admin session.');

      logger.info('Auth', 'Admin session successfully restored mid-match.');
      setPassword('');
      onSuccess();
    } catch (err: any) {
      logger.warn('Auth', 'Session restoration failed:', err);
      setError(err?.message || 'Sign in failed. Check password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot dismiss without authenticating
      title="SESSION EXPIRED"
      maxWidth="md"
    >
      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <div className="bg-[#FEF9C3] text-[#854D0E] border-2 border-[#102040] p-3 text-xs font-mono font-bold">
          ⚠ Your admin session timed out. Sign in below to continue without losing your current draft or match progress.
        </div>

        {error && (
          <div className="bg-[#FEE2E2] text-[#991B1B] border-2 border-[#102040] p-2 text-xs font-mono font-bold">
            {error}
          </div>
        )}

        <TextField
          label="Admin Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          disabled={loading}
          autoFocus
          required
        />

        <PixelButton
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          className="w-full justify-center mt-2"
        >
          SIGN IN &amp; RESUME
        </PixelButton>
      </form>
    </Modal>
  );
};
