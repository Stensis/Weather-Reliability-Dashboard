import { createWeatherAiHandler } from '../server/createWeatherAiHandler';

const handler = createWeatherAiHandler('/v1/current');

export default {
  fetch: handler
};
