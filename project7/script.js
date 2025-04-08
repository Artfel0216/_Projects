const input = document.getElementById('cityInput');
const cityElem = document.getElementById('city');
const tempElem = document.getElementById('temperature');
const descElem = document.getElementById('description');
const iconElem = document.getElementById('weatherIcon');

const API_KEY = 'b72c1e4cfbd68f41adda0b66bb775ced'; 

input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const city = input.value.trim();
    if (city !== '') {
      getWeather(city);
    }
    localStorage.setItem('UltimaCidade', city)
     const cidadeSalva = localStorage.getItem('ultimaCidade');
      if (cidadeSalva) {
       getWeather(cidadeSalva); 
    }
  }
});

async function getWeather(city) {
  try {
    const url =`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&lang=pt_br&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      const { name } = data;
      const { description, icon } = data.weather[0];
      const { temp } = data.main;

      cityElem.textContent = name;
      tempElem.textContent = `${Math.round(temp)}°C`;
      descElem.textContent = description.charAt(0).toUpperCase() + description.slice(1);
      iconElem.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      iconElem.style.display = 'block';

      const isDay = icon.includes('d');
      document.body.style.backgroundImage = isDay
        ? "url('https://media.istockphoto.com/id/824800468/pt/foto/sun-on-blue-sky-with-clouds.jpg?s=612x612&w=0&k=20&c=4fLHc5_ArzYG0J4yDGiUzLmwYGVfaE0GsS7zcSzMOe8=')"
        : "url('https://borealisexpedicoes.com.br/wp-content/uploads/lofoten-noruega-noite-polar-1-1536x1108.jpg')";

    } else {
      alert('Cidade não encontrada!');
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao buscar dados do clima.');
  }
};


