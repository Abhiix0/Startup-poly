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
      className={`anim-scene-transition min-h-screen w-full flex flex-col ${className}`}
    >
      {children}
    </div>
  );
};
