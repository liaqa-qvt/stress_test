import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { generateReport } from './report-template.js';

const errorRate     = new Rate('error_rate');
const loginDuration = new Trend('login_duration', true);
const totalLogins   = new Counter('total_logins');
const totalErrors   = new Counter('total_errors');

const BASE_URL       = __ENV.BASE_URL;
const USER1_EMAIL    = __ENV.USER1_EMAIL;
const USER1_PASSWORD = __ENV.USER1_PASSWORD;
const USER2_EMAIL    = __ENV.USER2_EMAIL;
const USER2_PASSWORD = __ENV.USER2_PASSWORD;

const USERS = [
  { email: USER1_EMAIL, password: USER1_PASSWORD },
  { email: USER2_EMAIL, password: USER2_PASSWORD },
];

let firstFailureVU   = null;
let firstFailureIter = null;
let firstFailureTime = null;

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      tags: { fase: 'smoke' },
      gracefulStop: '10s',
    },
    load: {
      executor: 'ramping-vus',
      startTime: '1m30s',
      startVUs: 0,
      stages: [
        { duration: '1m',  target: 50  },
        { duration: '5m',  target: 50  },
        { duration: '1m',  target: 200 },
        { duration: '30s', target: 0   },
      ],
      tags: { fase: 'load' },
      gracefulStop: '30s',
    },
    stress: {
      executor: 'ramping-vus',
      startTime: '11m',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200  },
        { duration: '2m', target: 500  },
        { duration: '2m', target: 1000 },
        { duration: '2m', target: 1000 },
        { duration: '2m', target: 0    },
      ],
      tags: { fase: 'stress' },
      gracefulStop: '30s',
    },
  },

  thresholds: {
    'http_req_duration{fase:smoke}':  ['p(95)<1000'],
    'error_rate{fase:smoke}':         ['rate<0.01'],
    'http_req_duration{fase:load}':   ['p(95)<2000'],
    'error_rate{fase:load}':          ['rate<0.05'],
    'http_req_duration{fase:stress}': ['p(95)<5000'],
    'error_rate{fase:stress}':        ['rate<0.20'],
    http_req_failed:                  ['rate<0.10'],
  },
};

export default function () {
  const user = USERS[__VU % USERS.length];

  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
  );

  loginDuration.add(res.timings.duration);
  totalLogins.add(1);

  const ok = check(res, {
    'status 200 ou 201': (r) => r.status === 200 || r.status === 201,
    'tem accessToken':  (r) => r.json('accessToken')  !== undefined,
    'tem refreshToken': (r) => r.json('refreshToken') !== undefined,
    'resposta < 5s':    (r) => r.timings.duration < 5000,
  });

  if (!ok) {
    totalErrors.add(1);
    if (firstFailureVU === null) {
      firstFailureVU   = __VU;
      firstFailureIter = __ITER;
      firstFailureTime = new Date().toISOString();
    }
    console.error(`[VU ${__VU} | Iter ${__ITER}] Falha — status: ${res.status} | tempo: ${res.timings.duration}ms | body: ${res.body}`);
  }

  errorRate.add(!ok);
  sleep(1);
}

export function handleSummary(data) {
  const m = data.metrics;

  const totalReqs = m.http_reqs?.values?.count       || 0;
  const errRate   = ((m.error_rate?.values?.rate || 0) * 100).toFixed(2);
  const p50  = m.login_duration?.values?.['p(50)']?.toFixed(0)  || 'N/A';
  const p90  = m.login_duration?.values?.['p(90)']?.toFixed(0)  || 'N/A';
  const p95  = m.login_duration?.values?.['p(95)']?.toFixed(0)  || 'N/A';
  const p99  = m.login_duration?.values?.['p(99)']?.toFixed(0)  || 'N/A';
  const avg  = m.login_duration?.values?.avg?.toFixed(0)         || 'N/A';
  const max  = m.login_duration?.values?.max?.toFixed(0)         || 'N/A';
  const rps  = m.http_reqs?.values?.rate?.toFixed(2)             || 'N/A';

  const thresholds = Object.entries(m)
    .filter(([, v]) => v.thresholds)
    .map(([name, v]) => ({ name, passed: Object.values(v.thresholds).every(t => t.ok) }));

  const allPassed   = thresholds.every(t => t.passed);
  const verdict     = allPassed ? '✅ APROVADO' : '❌ REPROVADO';
  const verdictNote = allPassed
    ? 'O endpoint de login suportou todas as fases do teste dentro dos limites aceitáveis.'
    : 'O endpoint de login apresentou degradação ou falhas acima do limite aceitável em uma ou mais fases.';

  const now = new Date().toISOString();

  const html = generateReport({
    allPassed, verdict, verdictNote, now,
    totalReqs, errRate, rps, avg, max,
    p50, p90, p95, p99,
    thresholds,
    firstFailureVU, firstFailureIter, firstFailureTime,
  });

  return {
    'stdout':                   JSON.stringify(data, null, 2),
    './reports/report.html':   html,
    'summary.json': JSON.stringify({
      timestamp:     now,
      verdict:       allPassed ? 'APROVADO' : 'REPROVADO',
      total_reqs:    totalReqs,
      error_rate:    errRate + '%',
      rps,
      latency:       { p50, p90, p95, p99, avg, max },
      first_failure: firstFailureTime
        ? { vu: firstFailureVU, iter: firstFailureIter, time: firstFailureTime }
        : null,
    }, null, 2),
  };
}