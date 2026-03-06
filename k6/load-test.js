import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const leaveRequestDuration = new Trend('leave_request_duration');
const statisticsDuration = new Trend('statistics_duration');

// Load test configuration
// Stages: ramp up → sustained load → ramp down
export const options = {
  stages: [
    { duration: '30s', target: 5 },  // ramp up to 5 VUs
    { duration: '1m', target: 5 },   // hold for 1 minute
    { duration: '20s', target: 0 },  // ramp down
  ],
  thresholds: {
    // 95% of requests must complete below 2s
    http_req_duration: ['p(95)<2000'],
    // Error rate must stay below 5%
    errors: ['rate<0.05'],
    // Specific endpoint thresholds
    leave_request_duration: ['p(95)<2000'],
    statistics_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://worktime-leave-manager-wtlm.onrender.com';

// Sample leave request payload
function makeLeavePayload() {
  const types = ['annual', 'sick', 'maternity', 'paternity', 'unpaid'];
  const type = types[Math.floor(Math.random() * types.length)];
  const start = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);

  return JSON.stringify({
    employeeId: `emp-k6-${__VU}-${__ITER}`,
    leaveType: type,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    reason: `K6 load test - VU ${__VU} iteration ${__ITER}`,
  });
}

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // --- Test 1: Health check ---
  const healthRes = http.get(`${BASE_URL}/health`, { tags: { name: 'health' } });
  const healthOk = check(healthRes, {
    'health: status 200': (r) => r.status === 200,
    'health: status is ok': (r) => {
      try { return JSON.parse(r.body).status === 'ok'; } catch { return false; }
    },
  });
  errorRate.add(!healthOk);

  sleep(0.5);

  // --- Test 2: GET /leave-requests ---
  const startList = Date.now();
  const listRes = http.get(`${BASE_URL}/leave-requests`, { tags: { name: 'list_leave_requests' } });
  leaveRequestDuration.add(Date.now() - startList);
  const listOk = check(listRes, {
    'list: status 200': (r) => r.status === 200,
    'list: returns array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    },
  });
  errorRate.add(!listOk);

  sleep(0.5);

  // --- Test 3: POST /leave-requests ---
  const createRes = http.post(`${BASE_URL}/leave-requests`, makeLeavePayload(), {
    headers,
    tags: { name: 'create_leave_request' },
  });
  const createOk = check(createRes, {
    'create: status 201': (r) => r.status === 201,
    'create: has id': (r) => {
      try { return !!JSON.parse(r.body).id; } catch { return false; }
    },
  });
  errorRate.add(!createOk);

  sleep(0.5);

  // --- Test 4: GET /leave-requests/statistics ---
  const startStats = Date.now();
  const statsRes = http.get(`${BASE_URL}/leave-requests/statistics`, { tags: { name: 'statistics' } });
  statisticsDuration.add(Date.now() - startStats);
  const statsOk = check(statsRes, {
    'statistics: status 200': (r) => r.status === 200,
    'statistics: has total': (r) => {
      try { return JSON.parse(r.body).total !== undefined; } catch { return false; }
    },
  });
  errorRate.add(!statsOk);

  sleep(1);
}

export function handleSummary(data) {
  const passed = data.metrics.errors.values.rate < 0.05
    && data.metrics.http_req_duration.values['p(95)'] < 2000;

  const summary = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `${passed ? '✅' : '❌'} K6 LOAD TEST SUMMARY`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Total requests  : ${data.metrics.http_reqs.values.count}`,
    `Request rate    : ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s`,
    `Error rate      : ${(data.metrics.errors.values.rate * 100).toFixed(2)}%`,
    `p95 latency     : ${data.metrics.http_req_duration.values['p(95)'].toFixed(0)} ms`,
    `p99 latency     : ${data.metrics.http_req_duration.values['p(99)'].toFixed(0)} ms`,
    `Avg latency     : ${data.metrics.http_req_duration.values.avg.toFixed(0)} ms`,
    '',
    'Thresholds:',
    `  p(95) < 2000ms : ${data.metrics.http_req_duration.values['p(95)'] < 2000 ? '✅ PASS' : '❌ FAIL'}`,
    `  error rate < 5%: ${data.metrics.errors.values.rate < 0.05 ? '✅ PASS' : '❌ FAIL'}`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n');

  return { stdout: summary };
}
