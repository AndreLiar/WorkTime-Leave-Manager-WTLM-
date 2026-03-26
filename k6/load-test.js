import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const leaveRequestDuration = new Trend('leave_request_duration');
const statisticsDuration = new Trend('statistics_duration');
const cacheDuration = new Trend('cache_hit_duration'); // Redis cache hit latency

// Load test configuration
// Stages: ramp up → sustained load → ramp down
// NOTE: Free tier Render has ~3 DB connections and limited CPU.
//       2 VUs keeps the connection pool from saturating.
export const options = {
  stages: [
    { duration: '30s', target: 2 },  // ramp up to 2 VUs (stay within free tier DB pool)
    { duration: '1m', target: 2 },   // hold for 1 minute
    { duration: '20s', target: 0 },  // ramp down
  ],
  thresholds: {
    // 95% of requests must complete below 3s (free tier cold-start headroom)
    http_req_duration: ['p(95)<3000'],
    // Error rate must stay below 10%
    errors: ['rate<0.10'],
    // Endpoint-specific thresholds
    leave_request_duration: ['p(95)<3000'],
    statistics_duration: ['p(95)<3000'],
    // Redis cache hits — free tier Node.js is CPU-bound so 2000ms is realistic
    cache_hit_duration: ['p(95)<2000'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const BASE_URL = __ENV.BASE_URL || 'https://worktime-leave-manager-wtlm.onrender.com';

// Each VU+iteration gets a unique employeeId → no overlap conflicts
function makeLeavePayload() {
  const types = ['vacation', 'sick', 'personal', 'unpaid'];
  const type = types[Math.floor(Math.random() * types.length)];

  // Use far-future dates (90–150 days) to avoid any overlap with seed data
  const daysAhead = 90 + Math.floor(Math.random() * 60);
  const start = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);

  return JSON.stringify({
    employeeId: `k6-vu${__VU}-iter${__ITER}`,
    leaveType: type,
    startDate: start.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    endDate:   end.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    reason: `K6 load test — VU ${__VU} iteration ${__ITER}`,
  });
}

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 1 — Health Check
  // Given the service is deployed
  // When  I call GET /health
  // Then  the response status is 200 and body.status === "ok"
  // ─────────────────────────────────────────────────────────────────────────
  const healthRes = http.get(`${BASE_URL}/health`, { tags: { name: 'health' } });
  const healthOk = check(healthRes, {
    'Given service is deployed | When GET /health | Then status 200':
      (r) => r.status === 200,
    'Given service is deployed | When GET /health | Then body.status is ok':
      (r) => { try { return JSON.parse(r.body).status === 'ok'; } catch { return false; } },
  });
  errorRate.add(!healthOk);

  sleep(0.5);

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 2 — List Leave Requests (DB query — cold / cache miss)
  // Given leave requests exist in the database
  // When  I call GET /leave-requests for the first time in this TTL window
  // Then  the server fetches from DB, caches in Redis, and returns an array
  // ─────────────────────────────────────────────────────────────────────────
  const t0 = Date.now();
  const listRes = http.get(`${BASE_URL}/leave-requests`, { tags: { name: 'list_leave_requests' } });
  leaveRequestDuration.add(Date.now() - t0);
  const listOk = check(listRes, {
    'Given DB has records | When GET /leave-requests (DB) | Then status 200':
      (r) => r.status === 200,
    'Given DB has records | When GET /leave-requests (DB) | Then body is an array':
      (r) => { try { return Array.isArray(JSON.parse(r.body)); } catch { return false; } },
  });
  errorRate.add(!listOk);

  sleep(0.3);

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 3 — Redis Cache Hit (same endpoint, within 60 s TTL)
  // Given the previous call warmed the Redis cache
  // When  I call GET /leave-requests again within the 60 s TTL
  // Then  Redis serves the response (faster than the DB call above)
  // ─────────────────────────────────────────────────────────────────────────
  const t1 = Date.now();
  const cachedRes = http.get(`${BASE_URL}/leave-requests`, { tags: { name: 'list_cached' } });
  cacheDuration.add(Date.now() - t1);
  const cacheOk = check(cachedRes, {
    'Given cache is warm | When GET /leave-requests (Redis) | Then status 200':
      (r) => r.status === 200,
    'Given cache is warm | When GET /leave-requests (Redis) | Then body is an array':
      (r) => { try { return Array.isArray(JSON.parse(r.body)); } catch { return false; } },
  });
  errorRate.add(!cacheOk);

  sleep(0.5);

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 4 — Create Leave Request (write path — invalidates cache)
  // Given a valid future-dated payload with a unique employeeId
  // When  I POST to /leave-requests
  // Then  a new record is created (201), has an id, and defaults to "pending"
  // Note  This write also clears the Redis cache so the next list call re-queries the DB
  // ─────────────────────────────────────────────────────────────────────────
  const createRes = http.post(`${BASE_URL}/leave-requests`, makeLeavePayload(), {
    headers,
    tags: { name: 'create_leave_request' },
  });
  const createOk = check(createRes, {
    'Given valid payload | When POST /leave-requests | Then status 201':
      (r) => r.status === 201,
    'Given valid payload | When POST /leave-requests | Then response has id':
      (r) => { try { return !!JSON.parse(r.body).id; } catch { return false; } },
    'Given valid payload | When POST /leave-requests | Then status is pending':
      (r) => { try { return JSON.parse(r.body).status === 'pending'; } catch { return false; } },
  });
  errorRate.add(!createOk);

  sleep(0.5);

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 5 — Statistics (aggregate query, cached after first call)
  // Given leave requests have been created
  // When  I call GET /leave-requests/statistics
  // Then  the response contains numeric totals that are internally consistent
  // ─────────────────────────────────────────────────────────────────────────
  const t2 = Date.now();
  const statsRes = http.get(`${BASE_URL}/leave-requests/statistics`, { tags: { name: 'statistics' } });
  statisticsDuration.add(Date.now() - t2);
  const statsOk = check(statsRes, {
    'Given data exists | When GET /statistics | Then status 200':
      (r) => r.status === 200,
    'Given data exists | When GET /statistics | Then total is a number':
      (r) => { try { return typeof JSON.parse(r.body).total === 'number'; } catch { return false; } },
    'Given data exists | When GET /statistics | Then pending+approved+rejected equals total':
      (r) => {
        try {
          const b = JSON.parse(r.body);
          return b.pending + b.approved + b.rejected === b.total;
        } catch { return false; }
      },
  });
  errorRate.add(!statsOk);

  sleep(1);
}

export function handleSummary(data) {
  const errRate  = data.metrics.errors.values.rate;
  const p95      = data.metrics.http_req_duration.values['p(95)'];
  const p99      = data.metrics.http_req_duration.values['p(99)'];
  const avg      = data.metrics.http_req_duration.values.avg;
  const p95cache = data.metrics.cache_hit_duration
    ? data.metrics.cache_hit_duration.values['p(95)']
    : null;
  const passed = errRate < 0.10 && p95 < 3000;

  // ── Plain-English interpretation helpers ──────────────────────────────────
  function interpretErrorRate(rate) {
    if (rate === 0)   return 'Perfect — no errors at all';
    if (rate < 0.01)  return 'Excellent — less than 1 user in 100 saw an error';
    if (rate < 0.05)  return 'Good — less than 5 users in 100 saw an error';
    if (rate < 0.10)  return 'Acceptable — under 10% errors (at threshold limit)';
    if (rate < 0.25)  return 'Degraded — 1 in 4 requests is failing';
    return                   'Critical — more than 25% of requests are failing';
  }

  function interpretLatency(ms) {
    if (ms < 300)   return 'Excellent — users barely notice the wait';
    if (ms < 800)   return 'Good — feels fast to most users';
    if (ms < 1500)  return 'Acceptable — slightly slow but usable';
    if (ms < 3000)  return 'Slow — users may get frustrated';
    return                 'Very slow — likely to cause user drop-off';
  }

  function interpretP99(ms) {
    if (ms < 1000)   return 'Great — even the slowest 1% of users wait under 1s';
    if (ms < 3000)   return 'OK — worst-case users wait a few seconds';
    if (ms < 10000)  return 'Concerning — some users wait over 3s (DB saturation likely)';
    return                  'Critical — some requests took ' + (ms / 1000).toFixed(0) + 's (DB/network overload)';
  }

  function interpretCache(ms) {
    if (ms === null) return 'n/a';
    if (ms < 100)    return ms.toFixed(0) + ' ms — Redis is serving cached data instantly';
    if (ms < 500)    return ms.toFixed(0) + ' ms — Cache is working well';
    if (ms < 2000)   return ms.toFixed(0) + ' ms — Cache responding but server is under load';
    return                  ms.toFixed(0) + ' ms — Cache not helping: server CPU is saturated';
  }

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `${passed ? '✅' : '❌'} K6 LOAD TEST SUMMARY`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '📊 RAW NUMBERS',
    `  Total requests : ${data.metrics.http_reqs.values.count}`,
    `  Request rate   : ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s`,
    `  Error rate     : ${(errRate * 100).toFixed(2)}%`,
    `  Avg latency    : ${avg.toFixed(0)} ms`,
    `  p95 latency    : ${p95.toFixed(0)} ms`,
    `  p99 latency    : ${p99.toFixed(0)} ms`,
    `  Cache p95      : ${p95cache !== null ? p95cache.toFixed(0) + ' ms' : 'n/a'}`,
    '',
    '💬 WHAT THIS MEANS IN PLAIN ENGLISH',
    `  Errors   → ${interpretErrorRate(errRate)}`,
    `  Speed    → ${interpretLatency(avg)} (avg ${avg.toFixed(0)}ms)`,
    `  Worst 5% → ${interpretLatency(p95)} (p95 ${p95.toFixed(0)}ms)`,
    `  Worst 1% → ${interpretP99(p99)}`,
    `  Redis    → ${interpretCache(p95cache)}`,
    '',
    '🎯 THRESHOLDS (pass = system is healthy under load)',
    `  p(95) < 3000ms       : ${p95 < 3000 ? '✅ PASS' : '❌ FAIL'}  → 95% of users wait under 3s`,
    `  error rate < 10%     : ${errRate < 0.10 ? '✅ PASS' : '❌ FAIL'}  → fewer than 1 in 10 requests fail`,
    `  cache p(95) < 2000ms : ${p95cache !== null ? (p95cache < 2000 ? '✅ PASS' : '❌ FAIL') : 'n/a '}  → Redis cache responding within 2s`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  return { stdout: lines.join('\n') };
}
