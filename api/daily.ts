import { proxyWeather } from './_weatherProxy';

export function GET(request: Request) {
  return proxyWeather(request, '/v1/daily');
}
