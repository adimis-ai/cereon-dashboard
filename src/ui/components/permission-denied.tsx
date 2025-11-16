"use client";

import type React from "react";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/index";

export const PermissionDenied: React.FC<{
  navigateTo?: () => void | Promise<void>;
  resourceName?: string;
  heading?: string;
  message?: string;
  alertMessage?: string;
  buttonText?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({
  navigateTo,
  resourceName,
  heading = "Access Denied",
  message = "You don't have the necessary permissions to access this resource.",
  buttonText = "Back to home screen",
  children,
  className
}) => {
  return (
    <div className={cn("h-screen bg-gradient-to-br from-background to-muted text-foreground flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <motion.div
          className="bg-card rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <ShieldX className="w-16 h-16 text-destructive" />
              </motion.div>
            </div>

            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-center mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {heading}
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message} {resourceName && `(${resourceName})`}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <Button
                variant="outline"
                className="w-full bg-muted hover:bg-muted-foreground text-foreground border-border"
                onClick={navigateTo}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {buttonText}
              </Button>

              {children && (
                <div className="pt-4 border-t border-border">
                  {children}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

