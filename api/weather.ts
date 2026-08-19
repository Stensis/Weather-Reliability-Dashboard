import { createWeatherAiHandler } from '../server/createWeatherAiHandler';

const handler = createWeatherAiHandler('/v1/weather');

export default {
  fetch: handler
};
