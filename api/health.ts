export function GET() {
  return Response.json(
    {
      ok: true,
      runtime: 'vercel-node-web-standard',
      node: process.version,
      weatherApiConfigured: Boolean(process.env.WEATHER_AI_API_KEY),
      weatherApiBaseUrlConfigured: Boolean(process.env.WEATHER_AI_BASE_URL)
    },
    {
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
}
