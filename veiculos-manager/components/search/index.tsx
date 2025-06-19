'use client';

import { useState } from 'react';
import { SearchIcon } from 'lucide-react';

export default function Search() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [cars, setCars] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!make.trim()) {
      setError('Informe pelo menos a marca do carro.');
      return;
    }

    try {
      setError('');
      setCars([]);
      setImages([]);

      
      const endpoint = model.trim()
        ? `https://api.api-ninjas.com/v1/cars?make=${make}&model=${model}`
        : `https://api.api-ninjas.com/v1/cars?make=${make}`;

      const resCar = await fetch(endpoint, {
        headers: {
          'X-Api-Key': 'GE5ZCj4OqgfP0d2EvhTnZg==LJ1sB9H87WJOox8T',
        },
      });

      if (!resCar.ok) throw new Error('Marca ou modelo inválido ou não encontrado.');
      const carData = await resCar.json();
      setCars(carData);

      
      const imgQuery = `${make} ${model}`.trim();

      const resImg = await fetch(
        `https://api.unsplash.com/search/photos?query=${imgQuery}&per_page=4&client_id=_FxLN8LfYyEbopp2uVdcDhi7k9erG8RYfDEb9P8qLTQ`
      );

      if (!resImg.ok) throw new Error('Erro ao buscar imagens.');
      const imgData = await resImg.json();
      const urls = imgData.results.map((img: any) => img.urls.small);
      setImages(urls);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-start ml-12 mt-8 gap-4">
      
      <div className="flex gap-4 mt-[3rem]">
        <input
          type="text"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Marca (ex: Toyota)"
          className="w-64 h-8 bg-[#DAA520] rounded px-2 font-semibold border-none text-black"
        />
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Modelo (opcional)"
          className="w-64 h-8 bg-[#DAA520] rounded px-2 font-semibold border-none text-black"
        />
        <button
          onClick={handleSearch}
          className="w-16 h-8 bg-[#DAA520] font-semibold rounded flex items-center justify-center hover:bg-yellow-600 transition"
        >
          <SearchIcon />
        </button>
      </div>

     
      {error && <p className="text-red-600 font-semibold">{error}</p>}

     
      {cars.length > 0 && (
        <ul className="space-y-2 gap-2 w-[20rem] mt-[3rem]">
          {cars.map((car, idx) => (
            <li key={idx} className="bg-[#DAA520] font-semibold gap-2 text-black p-4 rounded">
              <p className='font-semibold  '>
                <strong>
                    Marca:
                </strong> 
                {car.make}

                </p>

              <p className='font-semibold '>
                <strong>Modelo:</strong>
                 {car.model}</p>
              <p className='font-semibold '>
                <strong>Ano:</strong>
                 {car.year}</p>
              <p className='font-semibold'>
                <strong>Combustível:</strong>
                 {car.fuel_type}</p>
            </li>
          ))}
        </ul>
      )}

      
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Imagem de ${make} ${model}`}
              className="w-full h-40 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
