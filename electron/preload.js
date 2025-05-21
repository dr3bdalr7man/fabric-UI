const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

function scanVariables(content) {
  const regex = /\{\{([^{}]+)\}\}/g;
  const vars = new Set();
  let match;
  while ((match = regex.exec(content))) {
    const name = match[1].trim();
    if (!name.startsWith('plugin:') && name !== 'input') {
      vars.add(name);
    }
  }
  return Array.from(vars);
}

function getPatterns() {
  const pDir = path.join(__dirname, '..', 'patterns');
  const names = fs.readdirSync(pDir).filter((p) => fs.statSync(path.join(pDir, p)).isDirectory());
  return names.map((name) => {
    const files = ['system.md', 'user.md'];
    let content = '';
    for (const f of files) {
      const fp = path.join(pDir, name, f);
      if (fs.existsSync(fp)) {
        content += fs.readFileSync(fp, 'utf8');
      }
    }
    const vars = scanVariables(content);
    return { name, vars };
  });
}

function getStrategies() {
  const sDir = path.join(__dirname, '..', 'strategies');
  return fs.readdirSync(sDir).filter((f) => f.endsWith('.json'));
}

contextBridge.exposeInMainWorld('fabricAPI', {
  patterns: getPatterns(),
  strategies: getStrategies(),
  runPattern: (name, vars) => ipcRenderer.invoke('run-pattern', { name, vars })
});
