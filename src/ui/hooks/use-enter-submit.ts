import { useEffect } from "react";

/**
 * Custom hook that triggers a callback function when the Ctrl+Enter keys are pressed.
 *
 * @param callback The callback function to be executed on Ctrl+Enter key press.
 */
export const useCtrlEnterSubmit = (callback: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.keyCode === 13 || event.key === "Enter") && event.ctrlKey) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [callback]);

  return null;
};
