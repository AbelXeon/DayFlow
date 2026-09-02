export type UnitCategory = {
  label: string;
  base: string;
  units: Record<string, number>; 
};

export const unitNames: Record<string, string> = {
  // Length
  mm: "Millimeter (mm)",
  cm: "Centimeter (cm)",
  m: "Meter (m)",
  km: "Kilometer (km)",
  in: "Inch (in)",
  ft: "Foot (ft)",
  yd: "Yard (yd)",
  mi: "Mile (mi)",

  // Mass
  mg: "Milligram (mg)",
  g: "Gram (g)",
  kg: "Kilogram (kg)",
  t: "Metric Ton (t)",
  oz: "Ounce (oz)",
  lb: "Pound (lb)",

  // Volume
  ml: "Milliliter (mL)",
  L: "Liter (L)",
  "m³": "Cubic Meter (m³)",
  gal: "US Gallon (gal)",
  qt: "US Quart (qt)",
  pt: "US Pint (pt)",
  cup: "US Cup (cup)",
  floz: "Fluid Ounce (fl oz)",

  // Area
  "mm²": "Square Millimeter (mm²)",
  "cm²": "Square Centimeter (cm²)",
  "m²": "Square Meter (m²)",
  "km²": "Square Kilometer (km²)",
  ha: "Hectare (ha)",
  acre: "Acre (ac)",
  "ft²": "Square Foot (ft²)",
  "in²": "Square Inch (in²)",

  // Speed
  "m/s": "Meters per second (m/s)",
  "km/h": "Kilometers per hour (km/h)",
  mph: "Miles per hour (mph)",
  knot: "Knot (kn)",
  "ft/s": "Feet per second (ft/s)",

  // Time
  ms: "Millisecond (ms)",
  s: "Second (s)",
  min: "Minute (min)",
  hr: "Hour (hr)",
  day: "Day (d)",
  week: "Week (wk)",

  // Power
  W: "Watt (W)",
  kW: "Kilowatt (kW)",
  MW: "Megawatt (MW)",
  hp: "Horsepower (hp)",

  // Energy
  J: "Joule (J)",
  kJ: "Kilojoule (kJ)",
  cal: "Calorie (cal)",
  kcal: "Kilocalorie (kcal)",
  Wh: "Watt-hour (Wh)",
  kWh: "Kilowatt-hour (kWh)",

  // Data
  bit: "Bit (b)",
  byte: "Byte (B)",
  KB: "Kilobyte (KB)",
  MB: "Megabyte (MB)",
  GB: "Gigabyte (GB)",
  TB: "Terabyte (TB)",

  // Pressure
  Pa: "Pascal (Pa)",
  kPa: "Kilopascal (kPa)",
  bar: "Bar (bar)",
  atm: "Standard Atmosphere (atm)",
  psi: "Pounds per sq inch (psi)",
  mmHg: "Millimeter of mercury (mmHg)",

  // Angle
  deg: "Degree (°)",
  rad: "Radian (rad)",
  grad: "Gradian (grad)",

  // Temperature
  C: "Celsius (°C)",
  F: "Fahrenheit (°F)",
  K: "Kelvin (K)",
};

export const unitCategories: Record<string, UnitCategory> = {
  length: {
    label: "Length",
    base: "m",
    units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
  },
  mass: {
    label: "Weight & Mass",
    base: "kg",
    units: { mg: 1e-6, g: 0.001, kg: 1, t: 1000, oz: 0.0283495, lb: 0.453592 },
  },
  volume: {
    label: "Volume",
    base: "L",
    units: { ml: 0.001, L: 1, "m³": 1000, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.24, floz: 0.0295735 },
  },
  area: {
    label: "Area",
    base: "m²",
    units: { "mm²": 1e-6, "cm²": 1e-4, "m²": 1, "km²": 1e6, ha: 10000, acre: 4046.86, "ft²": 0.092903, "in²": 0.00064516 },
  },
  speed: {
    label: "Speed",
    base: "m/s",
    units: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 },
  },
  time: {
    label: "Time",
    base: "s",
    units: { ms: 0.001, s: 1, min: 60, hr: 3600, day: 86400, week: 604800 },
  },
  power: {
    label: "Power",
    base: "W",
    units: { W: 1, kW: 1000, MW: 1e6, hp: 745.7 },
  },
  energy: {
    label: "Energy",
    base: "J",
    units: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6 },
  },
  data: {
    label: "Data",
    base: "byte",
    units: { bit: 0.125, byte: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 },
  },
  pressure: {
    label: "Pressure",
    base: "Pa",
    units: { Pa: 1, kPa: 1000, bar: 100000, atm: 101325, psi: 6894.76, mmHg: 133.322 },
  },
  angle: {
    label: "Angle",
    base: "deg",
    units: { deg: 1, rad: 57.29577951, grad: 0.9 },
  },
};

export function convertTemperature(value: number, from: string, to: string): number {
  const toCelsius: Record<string, (v: number) => number> = {
    C: (v) => v,
    F: (v) => ((v - 32) * 5) / 9,
    K: (v) => v - 273.15,
  };
  const fromCelsius: Record<string, (v: number) => number> = {
    C: (v) => v,
    F: (v) => (v * 9) / 5 + 32,
    K: (v) => v + 273.15,
  };
  const celsius = toCelsius[from](value);
  return fromCelsius[to](celsius);
}

export function convertLinear(value: number, category: UnitCategory, from: string, to: string): number {
  const base = value * category.units[from];
  return base / category.units[to];
}