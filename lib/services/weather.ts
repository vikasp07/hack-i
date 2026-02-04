/**
 * Weather Service - OpenWeatherMap API
 * REAL DATA ONLY - No fallbacks
 */

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  wind: number;
  conditions: string;
  pressure: number;
  visibility: number;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured. Please add it to .env file.');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenWeather API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
      wind: Math.round(data.wind.speed * 10) / 10,
      conditions: data.weather[0]?.description || 'unknown',
      pressure: data.main.pressure,
      visibility: data.visibility / 1000 // Convert to km
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
    throw new Error('Failed to fetch weather data: Unknown error');
  }
}
