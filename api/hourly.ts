import { proxyWeather } from './_weatherProxy.js';

export function GET(request: Request) {
  return proxyWeather(request, '/v1/hourly');
}
