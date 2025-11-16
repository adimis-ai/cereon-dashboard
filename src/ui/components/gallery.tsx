"use client";

import type React from "react";
import { useState, useEffect, useCallback, forwardRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
} from "lucide-react";
import { cn, formatToTitleCase } from "../lib/index";
import { Button } from "./button";

export interface GalleryItem {
  id: string | number;
  image: string;
  title: string;
  description: string;
  [key: string]: any; // Allow additional custom properties
}

export interface GalleryCarouselProps {
  items: GalleryItem[];
  theme?: "light" | "dark";
  autoPlayInterval?: number;
  initialIndex?: number;
  className?: string;
  containerClassName?: string;
  showControls?: boolean;
  showPagination?: boolean;
  showFullscreen?: boolean;
  allowKeyboardNavigation?: boolean;
  allowSwipe?: boolean;
  renderItem?: (item: GalleryItem) => React.ReactNode;
  onChange?: (currentIndex: number) => void;
  name?: string;
  value?: number;
  onBlur?: () => void;
  disabled?: boolean;
}

const GalleryCarousel = forwardRef<HTMLDivElement, GalleryCarouselProps>(
  (
    {
      items,
      theme = "light",
      autoPlayInterval = 5000,
      initialIndex = 0,
      className = "",
      containerClassName = "",
      showControls = true,
      showPagination = true,
      showFullscreen = true,
      allowKeyboardNavigation = true,
      allowSwipe = true,
      renderItem,
      onChange,
      name,
      value,
      onBlur,
      disabled = false,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(value ?? initialIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
      if (value !== undefined && value !== currentIndex) {
        setCurrentIndex(value);
      }
    }, [value]);

    useEffect(() => {
      onChange?.(currentIndex);
    }, [currentIndex, onChange]);

    const goToNext = useCallback(() => {
      if (disabled) return;
      setCurrentIndex((prevIndex) =>
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, [items.length, disabled]);

    const goToPrevious = useCallback(() => {
      if (disabled) return;
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? items.length - 1 : prevIndex - 1
      );
    }, [items.length, disabled]);

    const goToSlide = (index: number) => {
      if (disabled) return;
      setCurrentIndex(index);
    };

    const togglePlay = () => {
      if (disabled) return;
      setIsPlaying(!isPlaying);
    };

    const toggleFullscreen = () => {
      if (disabled) return;
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
          console.error(`Error attempting to enable fullscreen: ${e.message}`);
        });
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      if (!allowSwipe || disabled) return;
      if (e.targetTouches[0]) setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!allowSwipe || disabled) return;
      if (e.targetTouches[0]) setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!allowSwipe || disabled) return;
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
        goToNext();
      }
      if (isRightSwipe) {
        goToPrevious();
      }

      setTouchStart(null);
      setTouchEnd(null);
    };

    // Keyboard navigation
    useEffect(() => {
      if (!allowKeyboardNavigation) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "ArrowLeft") {
          goToPrevious();
        } else if (e.key === "ArrowRight") {
          goToNext();
        } else if (e.key === " ") {
          togglePlay();
        } else if (e.key === "f") {
          toggleFullscreen();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [allowKeyboardNavigation, goToNext, goToPrevious, disabled]);

    // Auto-play
    useEffect(() => {
      let interval: ReturnType<typeof setInterval>;

      if (isPlaying && !disabled && autoPlayInterval > 0) {
        interval = setInterval(goToNext, autoPlayInterval);
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [isPlaying, goToNext, autoPlayInterval, disabled]);

    const defaultRenderItem = (item: GalleryItem) => (
      <div className="relative flex-1 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="object-cover w-full h-full transition-transform duration-700 ease-in-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-20 mb-3">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{formatToTitleCase(item.title)}</h2>
          <p className="text-sm md:text-base opacity-90 max-w-4xl">
            {item.description}
          </p>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-xl transition-all duration-500",
          isFullscreen
            ? "h-screen fixed inset-0 z-50 max-w-none rounded-none"
            : "h-[500px] md:h-[600px]",
          theme === "dark" ? "bg-gray-900" : "bg-gray-50",
          containerClassName
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <input type="hidden" name={name} value={currentIndex} />

        <div className={cn("relative h-full", className)}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "absolute inset-0 flex flex-col transition-opacity duration-700 ease-in-out",
                currentIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {renderItem ? renderItem(item) : defaultRenderItem(item)}
            </div>
          ))}
        </div>

        {showControls && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all"
              onClick={goToPrevious}
              aria-label="Previous slide"
              disabled={disabled}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all"
              onClick={goToNext}
              aria-label="Next slide"
              disabled={disabled}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between mx-8 mb-4">
          {showPagination && (
            <div className="flex items-center space-x-2 mt-8">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    currentIndex === index
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                  disabled={disabled}
                />
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              disabled={disabled}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {showFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
                disabled={disabled}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

GalleryCarousel.displayName = "GalleryCarousel";

export { GalleryCarousel };
