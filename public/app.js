const statusLine = document.querySelector('#status');
const temperatureValue = document.querySelector('#temperature-value');
const rainValue = document.querySelector('#rain-value');
const windSpeedValue = document.querySelector('#wind-speed');
const windDirectionValue = document.querySelector('#wind-direction');
const lastUpdated = document.querySelector('#last-updated');
const refreshButton = document.querySelector('#refresh');

const ENDPOINT =
  'https://api.open-meteo.com/v1/forecast?latitude=52.33&longitude=5.54&current=temperature_2m,precipitation,rain,wind_speed_10m,wind_direction_10m&timezone=auto';

init();

function init() {
  refreshButton?.addEventListener('click', fetchWeather);
  fetchWeather();
}

async function fetchWeather() {
  setStatus('Gegevens ophalen...', 'info');
  toggleLoading(true);

  try {
    const response = await fetch(ENDPOINT);
    if (!response.ok) {
      throw new Error('Kon de weergegevens niet ophalen.');
    }

    const data = await response.json();
    if (!data?.current) {
      throw new Error('Onverwacht antwoord van de weerdienst.');
    }

    renderWeather(data.current, data.timezone_abbreviation);
    setStatus('Gegevens bijgewerkt.');
  } catch (error) {
    console.error('Weer ophalen mislukt:', error);
    setStatus(error.message || 'Er ging iets mis bij het laden van het weer.', 'error');
  } finally {
    toggleLoading(false);
  }
}

function renderWeather(current, timezoneAbbreviation) {
  const temperature = formatNumber(current.temperature_2m, '°C');
  const rain = formatNumber(current.rain ?? current.precipitation, 'mm');
  const windSpeed = formatNumber(current.wind_speed_10m, 'km/u');
  const windDirection = formatDirection(current.wind_direction_10m);

  temperatureValue.textContent = temperature;
  rainValue.textContent = rain;
  windSpeedValue.textContent = windSpeed;
  windDirectionValue.textContent = windDirection;

  const timestamp = current.time ? new Date(current.time) : new Date();
  const formatter = new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    timeZone: dataTimeZone(timezoneAbbreviation),
  });
  lastUpdated.textContent = `Laatste update: ${formatter.format(timestamp)}`;
}

function dataTimeZone(abbreviation) {
  if (!abbreviation) return undefined;
  return ['CEST', 'CET'].includes(abbreviation) ? 'Europe/Amsterdam' : undefined;
}

function formatNumber(value, unit) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return `-- ${unit}`;
  }
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}

function formatDirection(degrees) {
  if (typeof degrees !== 'number' || Number.isNaN(degrees)) {
    return '--';
  }

  const directions = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % directions.length;
  const label = directions[index];
  return `${label} (${Math.round(degrees)}°)`;
}

function setStatus(message, type = 'info') {
  statusLine.textContent = message;
  statusLine.dataset.type = type;
}

function toggleLoading(isLoading) {
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? 'Laden...' : 'Vernieuw';
}
