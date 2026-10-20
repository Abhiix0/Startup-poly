import React, { useState } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { sounds } from '../../../lib/sound';

export interface WildcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName?: string;
}

const WILDCARD_TASKS = [
  '⚡ High-Energy Pitch: Pitch your company in 20 seconds while doing high knees!',
  '🎙️ Elevator Broken: Do 10 jumping jacks before pitching why your startup won’t fail.',
  '🤐 Stealth Mode: Explain your business idea using ONLY silent hand gestures / charades in 30 seconds.',
  '🤖 AI Glitch: Speak like a robotic AI chatbot for your next 2 turns or until someone else lands on a Wildcard.',
  '🏃 Pivot Sprint: Run to the opposite end line of the Kabaddi court and back before your turn ends!',
  '👔 Investor Meeting: Form a human pyramid with 3 team members or strike an epic Forbes 30-Under-30 magazine pose for 10 seconds.',
  '📣 Slogan Shoutout: Invent a catchy 4-word company jingle and have the whole court chant it once.',
  '🥊 Founder Defense: Defend your startup idea while another team heckles you with "That won\'t scale!".',
  '☕ Coffee Run: Carry an imaginary tray of 5 coffees across the court without spilling a single drop.',
  '📉 Server Down: Freeze in your current pose for 20 seconds like a crashed AWS server.',
  '🎉 Unicorn Dance: Perform a 15-second celebratory victory dance as if you just closed a $10M seed round.',
  '🤝 Strategic Partnership: High-five every referee and opposing team captain on the field right now!',
  '🎤 Jargon Buster: Pitch your business using at least 5 buzzwords: "Synergy", "Disruptive", "Web3", "Flywheel", and "Paradigm Shift".',
  '🧘 Burnout Prevention: Lead the whole court in 3 deep meditative breathing cycles right now.',
  '🔍 Bug Hunt: Find one piece of litter or stray gear on the court and hand it to the organizer table.',
];

export const WildcardModal: React.FC<WildcardModalProps> = ({
  isOpen,
  onClose,
  teamName,
}) => {
  const [currentTask, setCurrentTask] = useState<string>(WILDCARD_TASKS[0]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const handleDraw = () => {
    setIsDrawing(true);
    sounds.playCoin();
    let count = 0;
    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * WILDCARD_TASKS.length);
      setCurrentTask(WILDCARD_TASKS[rand]);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setIsDrawing(false);
        sounds.playUpgrade();
      }
    }, 80);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎲 WILDCARD CHIT DECK" maxWidth="lg">
      <div className="flex flex-col items-center gap-4 py-3 text-center select-none">
        {teamName && (
          <div className="bg-brand-navy text-brand-gold px-3 py-1 border-2 border-brand-navy shadow-pixel-sm font-pixel text-xs">
            LANDED ON WILDCARD: {teamName.toUpperCase()}
          </div>
        )}

        {/* Chit Card Display */}
        <div className="w-full bg-brand-gold/20 border-4 border-brand-navy p-5 shadow-pixel min-h-[160px] flex flex-col items-center justify-center relative">
          <span className="font-pixel text-[10px] text-brand-navy/60 absolute top-2 right-3">
            CHIT #{Math.abs(currentTask.length * 7) % 99 + 1}
          </span>

          <p
            className={`font-sans font-extrabold text-lg sm:text-xl text-brand-navy leading-relaxed transition-transform ${
              isDrawing ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
            }`}
          >
            {currentTask}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full justify-center">
          <PixelButton
            variant="primary"
            onClick={handleDraw}
            disabled={isDrawing}
            className="flex-1 max-w-[200px]"
          >
            {isDrawing ? 'DRAWING...' : '🎲 DRAW CHIT'}
          </PixelButton>

          <PixelButton variant="secondary" onClick={onClose} className="min-w-[100px]">
            DONE ✓
          </PixelButton>
        </div>

        <p className="font-mono text-[11px] text-neutral-500">
          Rule: One team member must perform the task immediately. No Cash or CV is gained or lost.
        </p>
      </div>
    </Modal>
  );
};
