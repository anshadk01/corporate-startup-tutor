import React, { useState, useEffect } from "react";
import { useMotionSafe } from "../../hooks/useMotionSafe.ts";

interface StreamingRevealProps {
  text: string;
  speedMs?: number;
}

export const StreamingReveal: React.FC<StreamingRevealProps> = ({ text, speedMs = 12 }) => {
  const isMotionSafe = useMotionSafe();
  const [displayedText, setDisplayedText] = useState(isMotionSafe ? "" : text);

  useEffect(() => {
    if (!isMotionSafe) {
      setDisplayedText(text);
      return;
    }

    let currentIndex = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      currentIndex += 2;
      if (currentIndex >= text.length) {
        setDisplayedText(text);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, currentIndex));
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, isMotionSafe, speedMs]);

  return <span className="transition-opacity duration-150">{displayedText}</span>;
};
