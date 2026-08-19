type ServerResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
};

export default function handler(
  _request: unknown,
  response: ServerResponse
): void {
  response.statusCode = 200;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.end(
    JSON.stringify({
      ok: true,
      runtime: 'vercel-node',
      weatherApiConfigured: Boolean(process.env.WEATHER_AI_API_KEY)
    })
  );
}
