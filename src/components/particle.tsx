import React, { useRef, useEffect, useState } from "react";
import classNames from "~/lib/classNames";

interface ProgressCanvasButtonProps {
  emote: string;
  color: string;
  curCount: number;
  addToCurCount: () => void;
  sendEmoji?: (type: number, cat: boolean) => Promise<void>;
}

const ProgressCanvasButton: React.FC<ProgressCanvasButtonProps> = ({
  emote,
  color,
  curCount,
  addToCurCount,
  sendEmoji,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const addParticle = () => {
    addToCurCount();
    drawLine();
    if (!sendEmoji) return;
    console.log("emote", emote);
    if (emote === "👍") {
      sendEmoji(1, true).catch(() => console.log("Suck it."));
    }
    if (emote === "heart") {
      console.log("HELLO????");
      sendEmoji(2, true).catch(() => console.log("Suck it."));
    }
    if (emote === "🤣") {
      console.log("HELLO????");
      sendEmoji(3, true).catch(() => console.log("Suck it."));
    }
    if (emote === "😯") {
      console.log("HELLO????");
      sendEmoji(4, true).catch(() => console.log("Suck it."));
    }
    if (emote === "🔥") {
      console.log("HELLO????");
      sendEmoji(5, true).catch(() => console.log("Suck it."));
    }
    if (emote === "👏") {
      console.log("HELLO????");
      sendEmoji(6, true).catch(() => console.log("Suck it."));
    }
  };

  const drawLine = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas not initialized");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Canvas context not initialized");
      return;
    }

    ctx.fillStyle = `#${color}`; // Set the color of the line
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillRect(0, canvas.height - curCount, canvas.width, curCount); // Draw the progress bar
  };

  useEffect(() => {
    drawLine(); // Initial drawing of the progress bar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [hoverState, setHoverState] = useState(false);

  return (
    <button
      className={classNames(
        "relative min-h-[3rem] max-w-[5rem] overflow-hidden rounded-xl border-4 border-[#343434] text-2xl shadow-lg",
        color === "147bd1" ? "hover:border-[#147bd1]" : "",
        color === "d1156b" ? "hover:border-[#d1156b]" : "",
        color === "f7ea48" ? "hover:border-[#f7ea48]" : "",
        color === "ff7f41" ? "hover:border-[#ff7f41]" : "",
        color === "e03c31" ? "hover:border-[#e03c31]" : "",
        color === "753bbd" ? "hover:border-[#753bbd]" : "",
      )}
      onMouseOver={() => setHoverState(true)}
      onMouseOut={() => setHoverState(false)}
      onClick={addParticle}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="grid grid-cols-1">
          <span className="col-span-1">
            {emote !== "heart" ? emote : "\u2764\uFE0F"}
          </span>
          <span className="text-white">{hoverState ? curCount : ""}</span>
        </span>
      </span>
    </button>
  );
};

export default ProgressCanvasButton;
