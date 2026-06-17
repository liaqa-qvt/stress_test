// @ts-nocheck
export const css = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0f1117;
  color: #e2e8f0;
  padding: 40px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.header p {
  color: #94a3b8;
  margin-top: 8px;
  font-size: 14px;
}

.verdict {
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  font-size: 22px;
  font-weight: 700;
}

.verdict p {
  font-size: 14px;
  font-weight: 400;
  margin-top: 8px;
  color: #cbd5e1;
}

.verdict.aprovado {
  background: #052e16;
  border: 2px solid #22c55e;
  color: #22c55e;
}

.verdict.reprovado {
  background: #2d0a0a;
  border: 2px solid #ef4444;
  color: #ef4444;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 8px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.card {
  background: #1e293b;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.card .label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.card .value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
}

.card .unit {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  text-align: left;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #1e293b;
  font-size: 14px;
  color: #cbd5e1;
}

tr:last-child td {
  border-bottom: none;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-ok {
  background: #052e16;
  color: #22c55e;
}

.badge-fail {
  background: #2d0a0a;
  color: #ef4444;
}

.phases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.phase-card {
  background: #1e293b;
  border-radius: 10px;
  padding: 20px;
}

.phase-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 12px;
}

.phase-card .row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.phase-card .row span:last-child {
  color: #f1f5f9;
  font-weight: 500;
}

.first-fail {
  background: #2d1a00;
  border: 1px solid #f59e0b;
  border-radius: 10px;
  padding: 20px;
}

.first-fail h3 {
  color: #f59e0b;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.first-fail p {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
}

.first-fail code {
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.no-fail {
  background: #052e16;
  border: 1px solid #22c55e;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.no-fail p {
  color: #22c55e;
  font-size: 14px;
}

.footer {
  text-align: center;
  margin-top: 48px;
  font-size: 12px;
  color: #334155;
}
`;

export function generateReport({ allPassed, verdict, verdictNote, now, totalReqs, errRate, rps, avg, max, p50, p90, p95, p99, thresholds, firstFailureVU, firstFailureIter, firstFailureTime }) {
  const verdictClass = allPassed ? 'aprovado' : 'reprovado';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Relatório de Stress Test — Login</title>
  <style>${css}</style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1>Relatório de Stress Test</h1>
    <p>Endpoint: <strong>POST /api/v1/auth/login</strong> &nbsp;|&nbsp; Gerado em: ${now}</p>
  </div>

  <div class="verdict ${verdictClass}">
    ${verdict}
    <p>${verdictNote}</p>
  </div>

  <div class="section">
    <h2>Visão Geral</h2>
    <div class="cards">
      <div class="card">
        <div class="label">Total de Requisições</div>
        <div class="value">${String(totalReqs).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
        <div class="unit">requests</div>
      </div>
      <div class="card">
        <div class="label">Taxa de Erro</div>
        <div class="value" style="color:${parseFloat(errRate) < 5 ? '#22c55e' : '#ef4444'}">${errRate}%</div>
        <div class="unit">meta: &lt; 5%</div>
      </div>
      <div class="card">
        <div class="label">Req/s (média)</div>
        <div class="value">${rps}</div>
        <div class="unit">requests/segundo</div>
      </div>
      <div class="card">
        <div class="label">Tempo Médio</div>
        <div class="value">${avg}</div>
        <div class="unit">ms</div>
      </div>
      <div class="card">
        <div class="label">Tempo Máximo</div>
        <div class="value" style="color:${parseInt(max) > 5000 ? '#ef4444' : '#f1f5f9'}">${max}</div>
        <div class="unit">ms</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Latência por Percentil</h2>
    <table>
      <thead>
        <tr><th>Percentil</th><th>Tempo (ms)</th><th>Significado</th></tr>
      </thead>
      <tbody>
        <tr><td>p50</td><td>${p50} ms</td><td>Metade dos usuários tiveram resposta abaixo desse tempo</td></tr>
        <tr><td>p90</td><td>${p90} ms</td><td>90% dos usuários tiveram resposta abaixo desse tempo</td></tr>
        <tr><td>p95</td><td>${p95} ms</td><td>95% dos usuários tiveram resposta abaixo desse tempo</td></tr>
        <tr><td>p99</td><td>${p99} ms</td><td>99% dos usuários tiveram resposta abaixo desse tempo</td></tr>
        <tr><td>max</td><td>${max} ms</td><td>Pior tempo registrado durante todo o teste</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Fases do Teste</h2>
    <div class="phases">
      <div class="phase-card">
        <h3>🟢 Fase 1 — Smoke Test</h3>
        <div class="row"><span>Objetivo</span><span>Verificar funcionamento básico</span></div>
        <div class="row"><span>Usuários simultâneos</span><span>5 VUs</span></div>
        <div class="row"><span>Duração</span><span>1 minuto</span></div>
        <div class="row"><span>Threshold p95</span><span>&lt; 1.000ms</span></div>
        <div class="row"><span>Threshold erro</span><span>&lt; 1%</span></div>
      </div>
      <div class="phase-card">
        <h3>🟡 Fase 2 — Load Test</h3>
        <div class="row"><span>Objetivo</span><span>Simular pico de lançamento</span></div>
        <div class="row"><span>Usuários simultâneos</span><span>até 200 VUs</span></div>
        <div class="row"><span>Duração</span><span>~8 minutos</span></div>
        <div class="row"><span>Threshold p95</span><span>&lt; 2.000ms</span></div>
        <div class="row"><span>Threshold erro</span><span>&lt; 5%</span></div>
      </div>
      <div class="phase-card">
        <h3>🔴 Fase 3 — Stress Test</h3>
        <div class="row"><span>Objetivo</span><span>Encontrar ponto de quebra</span></div>
        <div class="row"><span>Usuários simultâneos</span><span>até 1.000 VUs</span></div>
        <div class="row"><span>Duração</span><span>~10 minutos</span></div>
        <div class="row"><span>Threshold p95</span><span>&lt; 5.000ms</span></div>
        <div class="row"><span>Threshold erro</span><span>&lt; 20%</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Thresholds</h2>
    <table>
      <thead>
        <tr><th>Métrica</th><th>Resultado</th></tr>
      </thead>
      <tbody>
        ${thresholds.map(t => `
        <tr>
          <td>${t.name}</td>
          <td><span class="badge ${t.passed ? 'badge-ok' : 'badge-fail'}">${t.passed ? '✅ Passou' : '❌ Falhou'}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Ponto de Falha</h2>
    ${firstFailureTime
      ? `<div class="first-fail">
          <h3>⚠️ Primeira falha detectada</h3>
          <p>
            O sistema começou a falhar no <strong>VU ${firstFailureVU}</strong>,
            iteração <strong>${firstFailureIter}</strong>,
            às <code>${firstFailureTime}</code>.<br/><br/>
            Recomenda-se investigar os logs do servidor nesse horário para identificar a causa raiz
            (ex: saturação de conexões com banco, timeout de pool, CPU/memória no limite).
          </p>
        </div>`
      : `<div class="no-fail">
          <p>✅ Nenhuma falha detectada durante todo o teste. O servidor se manteve estável em todas as fases.</p>
        </div>`
    }
  </div>

  <div class="footer">
    Relatório gerado automaticamente pelo script de stress test K6 &nbsp;|&nbsp; ${now}
  </div>

</div>
</body>
</html>`;
}
