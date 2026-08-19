export const weatherFixture = {
  latitude: -1.2921,
  longitude: 36.8219,
  current: {
    time: "2026-08-19T14:00",
    temperature_2m: 21.4,
    apparent_temperature: 21.9,
    relative_humidity_2m: 68,
    precipitation: 0,
    weather_code: 2,
    wind_speed_10m: 12.2,
  },
  hourly: {
    time: [
      "2026-08-19T14:00",
      "2026-08-19T15:00",
      "2026-08-19T16:00",
      "2026-08-19T17:00",
      "2026-08-19T18:00",
      "2026-08-19T19:00",
      "2026-08-19T20:00",
      "2026-08-19T21:00",
    ],
    temperature_2m: [21.4, 21.1, 20.7, 20.1, 19.6, 19.1, 18.8, 18.5],
    relative_humidity_2m: [68, 69, 70, 72, 74, 76, 77, 79],
    precipitation_probability: [35, 38, 42, 48, 44, 37, 31, 28],
    weather_code: [2, 2, 61, 61, 3, 3, 2, 2],
    wind_speed_10m: [12.2, 11.8, 11.1, 10.4, 9.7, 9.2, 8.6, 8.2],
  },
  daily: {
    time: [
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
    ],
    weather_code: [61, 1, 63, 3, 0, 2, 61],
    temperature_2m_max: [22, 24, 21, 23, 25, 24, 22],
    temperature_2m_min: [15, 14, 15, 16, 15, 14, 15],
    precipitation_probability_max: [55, 10, 67, 35, 5, 20, 61],
  },
};

export const geocodeFixture = {
  results: [
    {
      id: 184745,
      name: "Nairobi",
      latitude: -1.28333,
      longitude: 36.81667,
      country: "Kenya",
      admin1: "Nairobi County",
    },
  ],
};
