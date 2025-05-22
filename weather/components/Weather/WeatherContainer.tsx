'use client';

import { useState } from 'react';
import SearchBox from './SearchBox';
import WeatherInfo from './Weatherinfo';

export default function WeatherContainer() {
  const [city, setCity] = useState('Cidade');
  const [temperature, setTemperature] = useState('--°C');
  const [description, setDescription] = useState('--');
  const [iconUrl, setIconUrl] = useState('');
  const [showIcon, setShowIcon] = useState(false);

  const handleSearch = async (cityName: string) => {
    // Substitua por chamada real a uma API de clima
    setCity(cityName);
    setTemperature('25°C');
    setDescription('Ensolarado');
    setIconUrl('https://openweathermap.org/img/wn/01d.png');
    setShowIcon(true);
  };

  return (
    <div className="weather-container bg-white p-6 rounded-xl shadow-md max-w-md mx-auto text-center space-y-4">
      <SearchBox onSearch={handleSearch} />
      <WeatherInfo
        city={city}
        temperature={temperature}
        description={description}
        iconUrl={iconUrl}
        showIcon={showIcon}
      />
    </div>
  );
}
