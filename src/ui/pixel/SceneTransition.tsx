import React from 'react';

export interface SceneTransitionProps {
  children: React.ReactNode;
  locationKey?: string;
  className?: string;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  locationKey,
  className = '',
}) => {
  return (
    <div
      key={locationKey}
      className={`anim-scene-transition min-h-screen w-full min-w-0 overflow-x-clip flex flex-col ${className}`}
    >
      {children}
    </div>
  );
};
