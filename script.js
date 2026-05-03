// Config object for API key - move to backend proxy in production.
// In a static app without a build step, browser JavaScript cannot read .env directly.
// For production, replace this with a build-time env injection or server-side proxy.
const config = {
  apiKey: '9d45d98cb907b33b77d59916f1bcfc41',
  baseUrl: 'https://api.openweathermap.org/data/2.5'
};

// DOM elements
const input = document.getElementById("city");
const searchForm = document.querySelector(".content");
const submitBtn = document.getElementById("result");
const getLocationBtn = document.getElementById("getLocation");
const backBtn = document.querySelector("#back");
const unitToggleBtn = document.getElementById("unit-toggle");
const loadingSpinner = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const currentWeatherSection = document.querySelector(".weather");
const forecastSection = document.getElementById("forecast");

// State
let currentUnit = localStorage.getItem('weatherUnit') || 'celsius';
let lastWeatherData = null;     // store last fetched current weather
let lastForecastData = null;   // store last fetched forecast
let lat = "";
let long = "";

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateUnitToggle();
});

// Event listeners
function setupEventListeners() {
  searchForm.addEventListener('submit', handleCitySearch);
  getLocationBtn.addEventListener('click', handleGeolocation);
  backBtn.addEventListener('click', showInput);
  unitToggleBtn.addEventListener('click', toggleUnits);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCitySearch();
    }
  });
}

// API functions
async function getCurrentWeather(query) {
  const url = `${config.baseUrl}/weather?${query}&appid=${config.apiKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  return await response.json();
}

async function getForecast(query) {
  const url = `${config.baseUrl}/forecast?${query}&appid=${config.apiKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`);
  }
  return await response.json();
}

// UI functions
function showLoading() {
  loadingSpinner.style.display = 'block';
  errorMessage.style.display = 'none';
}

function hideLoading() {
  loadingSpinner.style.display = 'none';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  hideLoading();
}

function showInput() {
  document.querySelector(".main").style.display = "block";
  currentWeatherSection.style.display = "none";
  forecastSection.style.display = "none";
  input.value = "";
  input.focus();
  hideLoading();
}

// Render functions that use cached data and currentUnit
function renderAll() {
  if (lastWeatherData) {
    displayCurrentWeather(lastWeatherData);
  }
  if (lastForecastData) {
    displayForecast(lastForecastData);
  }
}

function displayCurrentWeather(data) {
  const { description, id } = data.weather[0];
  const { temp, feels_like, humidity, pressure } = data.main;
  const { speed: windSpeed } = data.wind;
  const { visibility } = data;
  const city = data.name;
  const country = data.sys.country;

  // Update DOM using currentUnit for temperatures
  document.getElementById("temp").textContent = formatTemperature(temp);
  document.getElementById("description").textContent = description;
  document.getElementById("location").textContent = `${city}, ${country}`;
  document.getElementById("feels_like").textContent = formatTemperature(feels_like);
  document.getElementById("humidity").textContent = `${humidity}%`;
  document.getElementById("wind_speed").textContent = `${windSpeed} m/s`;
  document.getElementById("pressure").textContent = `${pressure} hPa`;
  document.getElementById("visibility").textContent = `${(visibility / 1000).toFixed(1)} km`;

  // Set weather icon
  const skyImg = document.getElementById("sky");
  skyImg.src = getWeatherIcon(id);
  skyImg.alt = description;

  // Show sections
  document.querySelector(".main").style.display = "none";
  currentWeatherSection.style.display = "block";
  forecastSection.style.display = "block";
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast-list");
  forecastContainer.innerHTML = "";

  // Group forecast by day
  const dailyForecasts = groupForecastByDay(data.list);

  dailyForecasts.slice(0, 5).forEach(day => {
    const card = createForecastCard(day);
    forecastContainer.appendChild(card);
  });
}

function groupForecastByDay(list) {
  const days = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    if (!days[dayKey]) {
      days[dayKey] = [];
    }
    days[dayKey].push(item);
  });

  return Object.values(days).map(dayItems => {
    const temps = dayItems.map(item => item.main.temp);
    const avgTemp = temps.reduce((a, b) => a + b) / temps.length;
    const weather = dayItems[Math.floor(dayItems.length / 2)].weather[0]; // Midday weather
    return {
      date: new Date(dayItems[0].dt * 1000),
      temp: avgTemp,
      weather: weather
    };
  });
}

function createForecastCard(day) {
  const card = document.createElement('div');
  card.className = 'forecast-card';
  card.innerHTML = `
    <p class="forecast-date">${day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
    <img src="${getWeatherIcon(day.weather.id)}" alt="${day.weather.description}" class="forecast-icon">
    <p class="forecast-temp">${formatTemperature(day.temp)}</p>
  `;
  return card;
}

function getWeatherIcon(id) {
  if (id === 800) return "icons/clear.svg";
  if (id >= 200 && id <= 232) return "icons/storm.svg";
  if (id >= 600 && id <= 622) return "icons/snow.svg";
  if (id >= 701 && id <= 781) return "icons/haze.svg";
  if (id >= 801 && id <= 804) return "icons/cloud.svg";
  if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) return "icons/rain.svg";
  return "icons/clear.svg"; // Default
}

function formatTemperature(temp) {
  if (currentUnit === 'fahrenheit') {
    return `${Math.round(temp * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

function toggleUnits() {
  currentUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
  localStorage.setItem('weatherUnit', currentUnit);
  updateUnitToggle();
  // Re-render with cached data (if any)
  renderAll();
}

function updateUnitToggle() {
  // Button shows the unit you will switch to when clicked
  unitToggleBtn.textContent = currentUnit === 'celsius' ? '°F' : '°C';
}

// Event handlers
async function handleCitySearch(event) {
  if (event) {
    event.preventDefault();
  }

  const city = input.value.trim();
  if (!city) {
    showError('Please enter a city name.');
    return;
  }

  showLoading();
  try {
    const currentData = await getCurrentWeather(`q=${city}`);
    const forecastData = await getForecast(`q=${city}`);
    // Cache the data
    lastWeatherData = currentData;
    lastForecastData = forecastData;
    renderAll();
    hideLoading();
  } catch (error) {
    showError('Failed to fetch weather data. Please check the city name and try again.');
    console.error(error);
  }
}

async function handleGeolocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by this browser.');
    return;
  }

  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      lat = position.coords.latitude;
      long = position.coords.longitude;
      try {
        const currentData = await getCurrentWeather(`lat=${lat}&lon=${long}`);
        const forecastData = await getForecast(`lat=${lat}&lon=${long}`);
        // Cache the data
        lastWeatherData = currentData;
        lastForecastData = forecastData;
        renderAll();
        hideLoading();
      } catch (error) {
        showError('Failed to fetch weather data for your location.');
        console.error(error);
      }
    },
    (error) => {
      showError('Unable to retrieve your location. Please allow location access.');
      console.error("Geolocation error:", error);
    }
  );
}
