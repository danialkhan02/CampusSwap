import sleep from 'k6';
import http from 'k6/http';


export const options = {
  cloud: {
    projectID: '3723206',
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '30s' }, // Ramp up to 20 users in 30s
        { target: 50, duration: '30s' }, // Ramp up to 50 users in next 30s
        { target: 100, duration: '1m' }, // Ramp up to 100 users in 1m
        { target: 100, duration: '3m' }, // Stay at 100 users for 3m
        { target: 0, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
};

// eslint-disable-next-line camelcase
export function scenario_1() {
    // Product Search
    const searchQuery = 'Sneakers';
    const response = http.get(`http://localhost:6050/api/v1/products/search?query=${searchQuery}`, {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization:
                    'Bearer Add token from network tab to run this',
        'X-Session-ID': 'Add sessionId from network tab to run this',
        'X-Session-Token': 'Add session-token from network tab to run this',
        },
  });

  // Automatically added sleep
  sleep(1);
}
