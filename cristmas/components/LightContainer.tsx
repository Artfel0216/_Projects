import Light from './light';

interface LightContainerProps {
  activeIndex: number;
}

const colors = [
  'bg-red-600',
  'bg-orange-500',
  'bg-yellow-400',
  'bg-green-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
];

export default function LightContainer({ activeIndex }: LightContainerProps) {
  return (
    <div className="flex justify-center gap-[15px] mt-[50px]">
      {colors.map((color, index) => (
        <Light key={index} isOn={index === activeIndex} color={color} />
      ))}
    </div>
  );
}
