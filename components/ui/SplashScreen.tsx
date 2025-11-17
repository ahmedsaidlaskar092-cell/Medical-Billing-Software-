import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const SplashScreen: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
      <div className="text-center">
        <h1 
          className="text-5xl font-poppins font-bold bg-clip-text text-transparent mb-4 animate-fadeIn"
          style={{ backgroundImage: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`}}
        >
          Smart Bill Ultimate
        </h1>
        <p className="text-text-secondary animate-pulse">Loading Your Workspace...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
