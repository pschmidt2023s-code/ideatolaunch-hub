import { useState, useEffect } from "react";

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinished, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center">
      {/* Logo with glow */}
      <div className="mb-8 relative">
        <div className="relative w-32 h-32 animate-pulse">
          <img
            src="/icon.png"
            alt="Build Your Brand"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full -z-10 animate-ping" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-white text-4xl font-bold mb-2 tracking-wider">
        Build Your Brand
      </h1>
      <p className="text-white/80 text-lg mb-8 font-light">
        From Idea to Launch — Safe &amp; Smart
      </p>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-white/50 text-xs mt-4">Loading... {progress}%</p>
    </div>
  );
}
