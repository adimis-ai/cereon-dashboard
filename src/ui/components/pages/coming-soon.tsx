"use client";

import { cn } from "../../lib";
import { useState, useEffect } from "react";
import { Typography } from "../typography";

interface ComingSoonProps {
  targetDate?: string;
  title?: string;
  message?: string;
  className?: string;
}

export function ComingSoonPage({
  targetDate = "2025-08-31T00:00:00",
  title = "Coming Soon",
  message = "We're working on something amazing. Stay tuned!",
  className = "",
}: ComingSoonProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] h-full flex flex-col items-center justify-center p-4 rounded-md",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10"></div>
      </div>

      <div className="z-10 text-center">
        <h1
          className={`text-5xl md:text-7xl font-bold mb-8 animate-pulse text-primary`}
        >
          {title}
        </h1>
        <div className="text-2xl md:text-4xl font-semibold mb-8">
          <div className="grid grid-cols-4 gap-4">
            {["Days", "Hours", "Minutes", "Seconds"].map((unit, index) => (
              <div key={unit} className="flex flex-col">
                <span className={`text-4xl md:text-6xl text-primary`}>
                  {
                    timeLeft[
                      Object.keys(timeLeft)[index] as keyof typeof timeLeft
                    ]
                  }
                </span>
                <span className="text-sm md:text-base text-muted-foreground">
                  {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Typography
          variant="p"
          className={`text-xl mb-8 text-muted-foreground/60`}
        >
          {message}
        </Typography>
        <div className="">
          <div className="inline-flex items-center justify-center space-x-4">
            <div
              className={`w-3 h-3 bg-primary rounded-full animate-ping`}
            ></div>
            <span className="text-muted-foreground">Launching Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
