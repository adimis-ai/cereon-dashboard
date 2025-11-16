"use client";

import { FC, useState, useEffect } from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface NotFoundProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  glitchInterval?: number;
  linkHref?: string;
}

export const NotFound: FC<NotFoundProps> = ({
  title = "404",
  subtitle = "Page Not Found",
  description = "The page you are looking for does not exist.",
  buttonText = "Return Home",
  glitchInterval = 3000,
  linkHref = "/",
}) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [glitchInterval]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background">
      <div className="text-center">
        <h1
          className={`text-8xl font-bold text-foreground mb-4 transition-all ${
            glitch ? "glitch" : ""
          }`}
        >
          {title}
        </h1>
        <h2 className="text-3xl font-semibold text-foreground/80 mb-6">
          {subtitle}
        </h2>
        <p className="text-xl text-foreground/70 mb-8">{description}</p>
        <a
          href={linkHref}
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all transform hover:scale-105"
        >
          <Home className="w-5 h-5 mr-2" />
          {buttonText}
        </a>
      </div>
      <style>{`
        .glitch {
          position: relative;
          animation: glitch 0.5s infinite;
        }
        .glitch::before,
        .glitch::after {
          content: "${title}";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 hsl(var(--primary));
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 hsl(var(--destructive)), 2px 2px hsl(var(--primary));
          animation: glitch-anim2 1s infinite linear alternate-reverse;
        }
        @keyframes glitch {
          0% {
            text-shadow: 1px 0 hsl(var(--primary)), -1px 0 hsl(var(--destructive));
          }
          100% {
            text-shadow: -1px 0 hsl(var(--primary)), 1px 0 hsl(var(--destructive));
          }
        }
        @keyframes glitch-anim {
          0% {
            clip: rect(31px, 9999px, 94px, 0);
          }
          100% {
            clip: rect(43px, 9999px, 78px, 0);
          }
        }
        @keyframes glitch-anim2 {
          0% {
            clip: rect(65px, 9999px, 119px, 0);
          }
          100% {
            clip: rect(79px, 9999px, 86px, 0);
          }
        }
      `}</style>
    </div>
  );
};
