const cityInput = document.getElementById("cityInput");
const searchBtn  = document.getElementById("searchBtn");
const locBtn     = document.getElementById("locBtn");
const statusEl   = document.getElementById("status");

const placeEl = document.getElementById("place");
const tempEl  = document.getElementById("temp");
const windEl  = document.getElementById("wind");
const humEl   = document.getElementById("hum");
const codeEl  = document.getElementById("code");

function setStatus(msg){ statusEl.textContent = msg || ""; }

function weatherText(code){
  // simple mapping (optional)
  const map = {
    0:"Clear", 1:"Mainly clear", 2:"Partly cloudy", 3:"Overcast",
    45:"Fog", 48:"Depositing rime fog",
    51:"Drizzle", 61:"Rain", 71:"Snow", 80:"Rain showers", 95:"Thunderstorm"
  };
  return map[code] || `Code ${code}`;
}

async function geocodeCity(city){
  // Open-Meteo Geocoding API
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if(!data.results || data.results.length === 0) return null;
  return data.results[0]; // {name, latitude, longitude, country, ...}
}

async function getWeather(lat, lon){
  // Open-Meteo Forecast API with current weather + humidity + wind
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("Weather fetch failed");
  return await res.json();
}

async function showCityWeather(city){
  try{
    setStatus("Searching...");
    const loc = await geocodeCity(city);
    if(!loc){
      setStatus("City not found. Try another name.");
      return;
    }

    const w = await getWeather(loc.latitude, loc.longitude);

    placeEl.textContent = `${loc.name}, ${loc.country}`;
    tempEl.textContent  = `${Math.round(w.current.temperature_2m)}°C`;
    windEl.textContent  = `${w.current.wind_speed_10m} km/h`;
    humEl.textContent   = `${w.current.relative_humidity_2m}%`;
    codeEl.textContent  = weatherText(w.current.weather_code);

    setStatus("");
  }catch(e){
    setStatus("Something went wrong. Check internet or try again.");
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if(city) showCityWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    const city = cityInput.value.trim();
    if(city) showCityWeather(city);
  }
});

locBtn.addEventListener("click", () => {
  if(!navigator.geolocation){
    setStatus("Geolocation not supported.");
    return;
  }
  setStatus("Getting your location...");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const w = await getWeather(lat, lon);

      placeEl.textContent = `Your Location`;
      tempEl.textContent  = `${Math.round(w.current.temperature_2m)}°C`;
      windEl.textContent  = `${w.current.wind_speed_10m} km/h`;
      humEl.textContent   = `${w.current.relative_humidity_2m}%`;
      codeEl.textContent  = weatherText(w.current.weather_code);
      setStatus("");
    }catch(e){
      setStatus("Could not load weather.");
    }
  }, () => setStatus("Location permission denied."));
});

// default
showCityWeather("Delhi");