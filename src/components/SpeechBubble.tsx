interface SpeechBubbleProps {
  x: number;
  y: number;
  text: string;
}

export function SpeechBubble({ x, y, text }: SpeechBubbleProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - 100,
        top: y - 100,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="bg-white text-black px-4 py-2 rounded-lg border-2 border-black font-press-start text-sm whitespace-nowrap">
        {text}
      </div>
      {/* <div className="absolute -bottom-2 left-0 w-full flex justify-center">
        <div className="w-0 h-0 border-t-8 border-t-white border-l-4 border-l-transparent border-r-4 border-r-transparent transform translate-y-8"></div>
      </div> */}
    </div>
  );
}
