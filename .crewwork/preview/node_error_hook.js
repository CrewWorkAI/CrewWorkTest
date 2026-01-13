(function(){
'use strict';
const ingestUrl = process.env.CREWWORK_PREVIEW_INGEST_URL;
const projectId = process.env.CREWWORK_PREVIEW_PROJECT_ID;
const token = process.env.CREWWORK_PREVIEW_TOKEN;
if (!ingestUrl || !projectId || !token) { return; }
function send(payload){
  const body = JSON.stringify({ project_id: projectId, token: token, errors: [payload] });
  try {
    if (typeof fetch === 'function') {
      fetch(ingestUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true });
      return;
    }
  } catch (e) {}
  try {
    const http = require(ingestUrl.startsWith('https') ? 'https' : 'http');
    const url = new URL(ingestUrl);
    const req = http.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'text/plain', 'Content-Length': Buffer.byteLength(body) }
    });
    req.on('error', () => {});
    req.write(body);
    req.end();
  } catch (e) {}
}
function capture(type, err){
  if (!err) { err = new Error('Unknown error'); }
  const payload = {
    timestamp: Date.now(),
    timestampIso: new Date().toISOString(),
    level: 'error',
    message: String(err.message || err.toString()),
    pathname: process.argv[1] || 'node',
    url: '',
    userAgent: 'node',
    stackTrace: err.stack || '',
    errorType: type,
    metadata: { runtime: 'node', pid: process.pid }
  };
  send(payload);
}
process.on('uncaughtException', (err) => capture('uncaughtException', err));
process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  capture('unhandledRejection', err);
});
})();