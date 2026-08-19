import { createWeatherAiHandler } from '../server/createWeatherAiHandler';

const handler = createWeatherAiHandler('/v1/usage');

export default {
  fetch: handler
};
