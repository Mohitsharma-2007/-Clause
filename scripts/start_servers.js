// Simple orchestrator to launch both npm dev server and Python server in parallel
const { spawn } = require('child_process');

function spawnCmd(cmd, args, name) {
  const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });
  proc.on('error', (e) => console.error(`[${name}] failed to start:`, e));
  return proc;
}

console.log('[Clause] Starting servers: npm dev and Python server...');
const npmDev = spawnCmd(process.platform === 'win32' ? 'cmd' : 'bash', [process.platform === 'win32' ? '/c' : '-lc', 'npm run dev'], 'npm-dev');
const pyServer = spawnCmd(process.platform === 'win32' ? 'cmd' : 'bash', [process.platform === 'win32' ? '/c' : '-lc', 'python server/app.py'], 'py-server');

process.on('SIGINT', () => {
  console.log('\n[Clause] Shutting down servers...');
  try { npmDev.kill('SIGINT'); } catch (e) {}
  try { pyServer.kill('SIGINT'); } catch (e) {}
  process.exit(0);
});
