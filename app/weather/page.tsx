"use client";

import { useEffect, useState } from "react";
import { CloudSun, Droplets, Wind, Search, AlertTriangle, Sunrise, Sunset } from "lucide-react";

import GlobeSheet from "@/components/globe/GlobeSheet";
import { GlobeCity } from "@/lib/globeCities";


type WeatherData = {
  location: { name: string; region: string };
  current: { temp_c: number; condition: { text: string }; humidity: number; wind_kph: number };
  forecast: {
    forecastday: {
      date: string;
      day: { maxtemp_c: number; mintemp_c: number };
      astro: { sunrise: string; sunset: string };
    }[];
  };
  alerts?: { alert: { headline: string; severity: string; desc: string; event: string }[] };
};

function dayLabel(dateStr: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
}

export default function WeatherPage() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
const [globeOpen, setGlobeOpen] = useState(false);


  function fetchWeather(query: string) {
    setLoading(true);
    setError(null);
    fetch(`/api/weather?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Couldn't load weather"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchWeather("Amsterdam"); // fallback if geolocation isn't available at all
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => fetchWeather("Amsterdam") // user denied permission — fall back instead of dead-ending
    );
  }, []);

  

  if (loading && !data) {
    return <div className="px-5 pt-6 text-muted text-sm">Loading weather…</div>;
  }

  if (error && !data) {
    return (
      <div className="px-5 pt-6">
        <p className="text-muted text-sm">{error}</p>
        <button onClick={() => fetchWeather("Amsterdam")} className="text-accent text-sm mt-2 underline">
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const today = data.forecast.forecastday[0];
  const alerts = data.alerts?.alert || [];

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-3xl tracking-wide">Weather</h1>
        <button
           onClick={() => setGlobeOpen(true)}
          className="rounded-xl border border-border bg-surface p-2.5"
        >
          <Search size={18} className="text-text" />
        </button>
      </div>

      

      <div className="rounded-2xl border border-border bg-surface p-6 mb-4">
        <p className="text-muted text-sm">{data.location.name}, {data.location.region}</p>
        <div className="flex items-end gap-3 mt-2">
          <CloudSun size={40} className="text-accent" strokeWidth={1.6} />
          <p className="font-mono text-data text-5xl">{Math.round(data.current.temp_c)}°</p>
        </div>
        <p className="text-sm mt-1">{data.current.condition.text}</p>

        <div className="flex gap-4 mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Droplets size={16} /> {data.current.humidity}%
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Wind size={16} /> {Math.round(data.current.wind_kph)} km/h
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {data.forecast.forecastday.map((f, i) => (
          <div key={f.date} className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-muted text-xs mb-2">{dayLabel(f.date, i)}</p>
            <p className="font-mono text-sm">{Math.round(f.day.maxtemp_c)}°</p>
            <p className="font-mono text-xs text-muted">{Math.round(f.day.mintemp_c)}°</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 flex justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Sunrise size={16} className="text-accent" /> {today.astro.sunrise}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Sunset size={16} className="text-accent" /> {today.astro.sunset}
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="rounded-xl border border-accent/40 bg-surface p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-accent" />
                <p className="text-sm font-medium">{a.event || a.headline}</p>
              </div>
              <p className="text-muted text-xs leading-relaxed line-clamp-3">{a.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-xs text-center py-4">No active weather alerts for this location.</p>
      )}

<GlobeSheet
  open={globeOpen}
  onClose={() => setGlobeOpen(false)}
  onSelectCity={(city: GlobeCity) => fetchWeather(city.name)}
  onSearch={(query) => fetchWeather(query)}
/>

    </div>
  );
}