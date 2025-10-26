const { spawn } = require('child_process');
const path = require('path');

describe('Integration tests', () => {
  test('task server starts without errors', (done) => {
    const serverPath = path.join(__dirname, '..', 'task-server.js');
    const child = spawn('node', [serverPath], { stdio: 'pipe' });
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      // Ждем пока сервер запустится
      if (output.includes('Task Manager API running')) {
        child.kill();
      }
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      expect(output).toContain('Task Manager API running');
      done();
    });
    
    // Таймаут для теста
    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill();
        done();
      }
    }, 3000);
  }, 5000);
});