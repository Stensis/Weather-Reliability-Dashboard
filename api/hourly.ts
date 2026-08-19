import { createWeatherAiHandler } from '../server/createWeatherAiHandler';

const handler = createWeatherAiHandler('/v1/hourly');

export default {
  fetch: handler
};
