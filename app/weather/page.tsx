import { CloudSun, Droplets, Wind } from "lucide-react";

const mockWeather = {
  city: "Amsterdam",
  tempC: 18,
  condition: "Partly cloudy",
  humidity: 64,
  windKph: 14,
  forecast: [
    { day: "Tomorrow", high: 19, low: 12 },
    { day: "Wed", high: 21, low: 13 },
    { day: "Thu", high: 17, low: 11 },
  ],
};

export default function WeatherPage() {
  const w = mockWeather;
  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold mb-5">Weather</h1>

      <div className="rounded-2xl border border-border bg-surface p-6 mb-4">
        <p className="text-muted text-sm">{w.city}</p>
        <div className="flex items-end gap-3 mt-2">
          <CloudSun size={40} className="text-accent" strokeWidth={1.6} />
          <p className="font-mono text-data text-5xl">{w.tempC}°</p>
        </div>
        <p className="text-sm mt-1">{w.condition}</p>

        <div className="flex gap-4 mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Droplets size={16} /> {w.humidity}%
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Wind size={16} /> {w.windKph} km/h
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {w.forecast.map((f) => (
          <div key={f.day} className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-muted text-xs mb-2">{f.day}</p>
            <p className="font-mono text-sm">{f.high}°</p>
            <p className="font-mono text-xs text-muted">{f.low}°</p>
          </div>
        ))}
      </div>

      <p className="text-muted text-xs mt-4 text-center">
        Mock data — plug in your weather API in app/weather/page.tsx
      </p>
    </div>
  );
}