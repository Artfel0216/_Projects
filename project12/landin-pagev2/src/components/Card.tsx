import { useEffect, useState } from 'react';
import axios from 'axios';

interface Testimonial {
  id: number;
  message?: string;
  author_name?: string;
  author_title?: string;
  rating?: number;
  author_avatar?: {
  url?: string;
  };
}

const Card = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    axios
      .get('http://localhost:1337/api/testimonials?populate=author_avatar')
      .then((response) => {
        console.log('Testimonials raw data:', response.data.data);  // Debug para garantir
        const data = response.data.data.map((item: any) => ({
          id: item.id,
          message: item.attributes?.message || 'No message provided.',
          author_name: item.attributes?.author_name || 'Anonymous',
          author_title:
            `${item.attributes?.author_role || ''}${
              item.attributes?.author_company ? ' at ' + item.attributes.author_company : ''
            }`,
          rating: item.attributes?.rating || 0,
          author_avatar: item.attributes?.author_avatar?.data?.attributes
            ? {
                url: item.attributes.author_avatar.data.attributes.url,
              }
            : { url: '' },
        }));
        console.log('Testimonials processed data:', data);
        setTestimonials(data);
      })
      .catch((error) => {
        console.error('Error fetching testimonials:', error);
      });
  }, []);

  const renderStars = (rating: number) => {
    return '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating);
  };

  return (
    <div className="max-w-7xl mx-auto text-center mt-[5rem]">
      <h2 className="text-4xl font-bold mb-10">
        See what our{' '}
        <span className="relative inline-block">
          <span className="bg-yellow-300 absolute bottom-1 left-0 w-full h-2 z-0"></span>
          <span className="relative z-10">trusted users</span>
        </span>{' '}
        Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`${
              index === 0 ? 'bg-white text-gray-800' : index === 1 ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
            } rounded-lg shadow p-6 text-left`}
          >
            <div className="flex items-center mb-4">
              {testimonial.author_avatar?.url ? (
                <img
                  src={`http://localhost:1337${testimonial.author_avatar.url}`}
                  alt={testimonial.author_name}
                  className="w-12 h-12 rounded-full mr-4"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
              )}
              <div>
                <div className="font-semibold">{testimonial.author_name}</div>
                <div
                  className={`text-sm ${
                    index === 0 ? 'text-gray-500' : 'text-blue-100'
                  }`}
                >
                  {testimonial.author_title}
                </div>
              </div>
            </div>
            <p className={`${index === 0 ? 'text-gray-600' : ''} mb-4`}>
              "{testimonial.message}"
            </p>
            <div className="text-yellow-300 text-lg">{renderStars(testimonial.rating || 0)}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
          ←
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
          → 
        </button>
      </div>
    </div>
  );
};

export default Card;
