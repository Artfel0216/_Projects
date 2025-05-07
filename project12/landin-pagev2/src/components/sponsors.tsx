import { useEffect, useState } from 'react';

interface Sponsor {
  id: number;
  name?: string;
  websiteUrl?: string;
  logo?: {
    id: number;
    url?: string;
  }[];
}

const Sponsors = () => {
   const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    fetch('http://localhost:1337/api/sponsors?populate=logo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer f473e46646c03fb595ba431ac31bd3b5bac1a65dd6bf30b5ee3796b8e862fba3eba9ddb068e93b30fa8dae5d83effd01138f0ed70f39debc1583e1c350a7c81ab069b0cb38084cc67678588d35b0bdb73141f26c42811ef44f1f94dd64adb264a185275503a5166f6295f3f64757643e87775dde9bd092062f4a6d092b935229',
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.data);
        setSponsors(data.data);
      })
      .catch(error => {
        console.error('Erro ao buscar os sponsors:', error);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[#F9F9F9] px-4">
      <h2 className="text-3xl font-bold mb-8 text-[3rem]">
        Our <span className="relative z-10">sponsors</span>
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-12 mt-12 w-full max-w-6xl">
        {sponsors.map(sponsor => {
          const id = sponsor.id;
          const name = sponsor.name ?? 'Sponsor';
          const websiteUrl = sponsor.websiteUrl ?? '#';
          const logoUrl = sponsor.logo?.[0]?.url;

          console.log(logoUrl)

          if (!logoUrl) return null; 

          return (
            <a
              key={id}
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="flex items-center justify-center"
            >
              <img
                src={`http://localhost:1337${logoUrl}`} 
                alt={name}
                className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
              />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default Sponsors;
