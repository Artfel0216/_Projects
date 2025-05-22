interface LightProps {
  isOn: boolean;
  color: string;
}

export default function Light({ isOn, color }: LightProps) {
  return (
    <div
      className={`w-[50px] h-[50px] rounded-full transition-all duration-300 ${color} ${
        isOn ? 'opacity-100 shadow-[0_0_20px_white]' : 'opacity-30'
      }`}
    />
  );
}
