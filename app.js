const weatherApiKey = 'INSERT-YOU-OWN-API-KEY';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';

let retryDelay = 1000; // Initial retry delay in milliseconds
let retryTimeout = null; // Variable to hold retry timeout ID

document.getElementById('weatherForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const city = document.getElementById('city').value;
  getWeather(city);
});

async function getWeather(city) {
  const apiUrl = `${weatherApiUrl}?q=${city}&units=metric&appid=${weatherApiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Weather data not available');
    }
    const data = await response.json();
    displayWeather(data);
    showBackground();
    showMap(data.coord.lat, data.coord.lon);
    generateRecommendation(data.main.temp, data.main.humidity, data.weather[0].main, data.main.pressure);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    displayError();
    scheduleRetry(city); // Schedule retry after a delay
  }
}

function scheduleRetry(city) {
  clearTimeout(retryTimeout); // Clear any existing retry timeout
  retryTimeout = setTimeout(() => {
    getWeather(city); // Retry fetching weather data after a delay
  }, retryDelay);
  retryDelay *= 2; // Exponential backoff for retry delay
}

function displayWeather(data) {
  clearTimeout(retryTimeout); // Clear retry timeout upon successful data display

  document.getElementById('weatherInfo').classList.remove('hidden');
  document.getElementById('errorMessage').classList.add('hidden');

  document.getElementById('temperature').textContent = data.main.temp;
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('windSpeed').textContent = data.wind.speed;
  document.getElementById('visibility').textContent = data.visibility;
  document.getElementById('pressure').textContent = data.main.pressure;
  document.getElementById('rain').textContent = data.rain ? `${data.rain['1h']} mm` : 'No rain';
  document.getElementById('weatherEmoji').textContent = getWeatherEmoji(data.main.temp);
}

function getWeatherEmoji(temp) {
  if (temp <= 0) return '❄️'; // Snow
  if (temp <= 10) return '🥶'; // Cold face
  if (temp <= 20) return '🧥'; // Coat
  if (temp <= 30) return '😎'; // Cool face
  return '🥵'; // Hot face
}

function showBackground() {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const body = document.body;

  if (hours > 6 && hours < 18) {
    body.classList.remove('bg-night');
    body.classList.add('bg-day');
  } else {
    body.classList.remove('bg-day');
    body.classList.add('bg-night');
  }
}

function showMap(lat, lon) {
  const mapContainer = document.getElementById('map');
  mapContainer.innerHTML = ''; // Clear previous map if any

  const map = L.map(mapContainer).setView([lat, lon], 10);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileUrl, { attribution });
  tiles.addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup('Weather Location')
    .openPopup();
}

function generateRecommendation(temp, humidity, weatherMain, pressure) {
  const recommendationTemp = document.getElementById('recommendationTemp');
  const recommendationHumidity = document.getElementById('recommendationHumidity');
  const recommendationWeather = document.getElementById('recommendationWeather');
  const recommendationPressure = document.getElementById('recommendationPressure');

  // Temperature recommendation
  if (temp <= 0) {
    recommendationTemp.innerHTML = `<strong>Temperature:</strong> It's very cold! Bundle up warmly. ❄️`;
  } else if (temp <= 10) {
    recommendationTemp.innerHTML = `<strong>Temperature:</strong> It's chilly. Wear a coat. 🥶`;
  } else if (temp <= 20) {
    recommendationTemp.innerHTML = `<strong>Temperature:</strong> Nice weather. Enjoy your day. 🧥`;
  } else if (temp <= 30) {
    recommendationTemp.innerHTML = `<strong>Temperature:</strong> It's warm. Stay hydrated. 😎`;
  } else {
    recommendationTemp.innerHTML = `<strong>Temperature:</strong> Hot day! Seek shade and stay cool. 🥵`;
  }

  // Humidity recommendation
  if (humidity >= 70) {
    recommendationHumidity.innerHTML = `<strong>Humidity:</strong> High humidity. Stay comfortable indoors. 😓`;
  } else if (humidity >= 50) {
    recommendationHumidity.innerHTML = `<strong>Humidity:</strong> Moderate humidity. Enjoy the weather. 😊`;
  } else {
    recommendationHumidity.innerHTML = `<strong>Humidity:</strong> Low humidity. Keep hydrated. 💧`;
  }

  // Pressure recommendation
  if (pressure < 1000) {
    recommendationPressure.innerHTML = `<strong>Pressure:</strong> Low atmospheric pressure. Weather might change. 🌦️`;
  } else if (pressure > 1020) {
    recommendationPressure.innerHTML = `<strong>Pressure:</strong> High atmospheric pressure. Generally stable weather. ☀️`;
  } else {
    recommendationPressure.innerHTML = `<strong>Pressure:</strong> Normal atmospheric pressure. Typical weather conditions. 🌤️`;
  }

  // Weather condition recommendation
  switch (weatherMain.toLowerCase()) {
    case 'thunderstorm':
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Thunderstorm warning! Stay indoors and away from windows. ⛈️`;
      break;
    case 'drizzle':
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Light rain expected. Bring an umbrella or raincoat. 🌧️`;
      break;
    case 'rain':
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Rainy day ahead. Don't forget your rain gear. 🌧️`;
      break;
    case 'snow':
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Snowing! Be cautious while driving and keep warm. ❄️`;
      break;
    case 'clear':
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Clear skies. Enjoy the sunshine! ☀️`;
      break;
    case 'clouds':
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Partly cloudy. A nice day for outdoor activities. ⛅`;
      break;
    default:
      recommendationWeather.innerHTML = `<strong>Weather:</strong> Check local weather updates for more information. 🌍`;
  }
}

function displayError() {
  clearTimeout(retryTimeout); // Clear retry timeout upon displaying error
  document.getElementById('weatherInfo').classList.add('hidden');
  document.getElementById('errorMessage').classList.remove('hidden');
}
