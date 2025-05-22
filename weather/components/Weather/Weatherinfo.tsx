interface Props {
  city: string;
  temperature: string;
  description: string;
  iconUrl: string;
  showIcon: boolean;
}

export default function WeatherInfo({ city, temperature, description, iconUrl, showIcon }: Props) {
  return (
    <>
      <h1 className="text-2xl font-bold">{city}</h1>
      {showIcon && (
        <img
          src={iconUrl}
          alt="Ícone do clima"
          className="mx-auto h-20"
        />
      )}
      <div className="temperature text-xl font-semibold">{temperature}</div>
      <div className="description text-gray-600">{description}</div>
    </>
  );
}
