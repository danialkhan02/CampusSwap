import sleep from 'k6';  // Changed this line
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
        { target: 10, duration: '30s' },
        { target: 20, duration: '1m' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
};

export function scenario_1() {
  const userId = '1'; // Based on your mock data
  
  const response = http.get(`http://localhost:6050/api/v1/products/interested`, {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization:
                  'Bearer Add token from network tab to run this',
        'X-Session-ID': 'Add sessionId from network tab to run this',
        'X-Session-Token': 'Add session-token from network tab to run this',
    },
  });

  sleep(1);
}