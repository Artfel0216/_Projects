interface SpeedControlProps {
  speed: number;
  onChange: (value: number) => void;
}

export default function SpeedControl({ speed, onChange }: SpeedControlProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <label htmlFor="speedRange" className="text-lg font-medium">
        Velocidade:
      </label>
      <input
        id="speedRange"
        type="range"
        min={200}
        max={1500}
        step={100}
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-[200px] mt-2"
      />
    </div>
  );
}
