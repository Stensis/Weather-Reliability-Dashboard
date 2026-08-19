import { createWeatherAiHandler } from '../server/createWeatherAiHandler';

const handler = createWeatherAiHandler('/v1/daily');

export default {
  fetch: handler
};
