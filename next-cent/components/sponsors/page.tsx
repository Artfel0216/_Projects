'use client';

import { useEffect, useState } from 'react';

interface Logo {
  id: number;
  url?: string;
}

interface Sponsor {
  id: number;
  name?: string;
  websiteUrl?: string;
  logo?: Logo[];
}

const API_URL = 'http://localhost:1337';
const API_ENDPOINT = `${API_URL}/api/sponsors?populate=logo&pagination[page]=1&pagination[pageSize]=10&sort=documentId:asc`;
const AUTH_TOKEN = 'Bearer c8e2f2568614e5337d277cda160b66a226f62b434130f3d2c6464cc5d8efc648c40960efc57075d98b093be49b3d620365c4991c0f7098bffedd46e72b0108dbdfa874b66984959cb4bc122df738b9d671815044ec6498d16044f168d8d3185fb9e35320c42ef3e3575b49220f28c42130ad018aca27880ccebe02851717ab5c';

const fetchSponsors = async (): Promise<Sponsor[]> => {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: AUTH_TOKEN,
      },
    });

    const data = await res.json();

    if (!Array.isArray(data.data)) return [];

    return data.data.map((item: any) => ({
      id: item.id,
      name: item.attributes?.name || 'Sponsor',
      websiteUrl: item.attributes?.websiteUrl || '#',
      logo:
        item.attributes?.logo?.data?.map((logoItem: any) => ({
          id: logoItem.id,
          url: logoItem.attributes?.url,
        })) || [],
    }));
  } catch (error) {
    console.error('Erro ao buscar sponsors:', error);
    return [];
  }
};

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    fetchSponsors().then(setSponsors);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="flex flex-col items-center justify-center py-20 bg-[#F9F9F9] px-4">
      <h2 className="text-3xl font-bold mb-8 text-[3rem]">
        Our <span className="relative z-10">sponsors</span>
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-12 mt-12 w-full max-w-6xl">
        {sponsors.map(({ id, name, websiteUrl, logo }) => {
          const logoUrl = logo?.[0]?.url;
          if (!logoUrl) return null;

          const fullLogoUrl = new URL(logoUrl, API_URL).toString();

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
                src={fullLogoUrl}
                alt={name}
                className="h-20 w-auto cursor-pointer object-contain transition-transform duration-300 hover:scale-110 filter grayscale contrast-0 brightness-0"
              />
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default Sponsors;
