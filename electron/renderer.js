const patternList = document.getElementById('patternList');
const strategyList = document.getElementById('strategyList');
const tabContent = document.getElementById('tabContent');
const tabs = document.querySelectorAll('.tab');
let history = [];

function switchTab(tab) {
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  renderTab(tab);
}

function renderTab(tab) {
  if (tab === 'run') {
    tabContent.innerHTML = '<p>Select a pattern or strategy.</p>';
  } else if (tab === 'settings') {
    tabContent.innerHTML = '<h3>Settings</h3><p>Configure API keys and options here.</p>';
  } else if (tab === 'history') {
    tabContent.innerHTML = history.map(h => `<pre>${h}</pre>`).join('');
  }
}

tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
renderTab('run');

window.fabricAPI.patterns.forEach(p => {
  const li = document.createElement('li');
  li.textContent = p.name;
  li.addEventListener('click', () => openPattern(p));
  patternList.appendChild(li);
});

window.fabricAPI.strategies.forEach(s => {
  const li = document.createElement('li');
  li.textContent = s.replace('.json', '');
  strategyList.appendChild(li);
});

function openPattern(p) {
  switchTab('run');
  let form = '';
  p.vars.forEach(v => {
    form += `<label>${v}<input id="var_${v}" /></label>`;
  });
  form += '<label>Input<textarea id="var_input"></textarea></label>';
  form += `<button id="runBtn">Run ${p.name}</button><pre id="output"></pre>`;
  tabContent.innerHTML = `<h3>${p.name}</h3>${form}`;
  document.getElementById('runBtn').addEventListener('click', () => runPattern(p));
}

function runPattern(p) {
  const vars = {};
  p.vars.forEach(v => {
    vars[v] = document.getElementById('var_' + v).value;
  });
  vars['input'] = document.getElementById('var_input').value;
  window.fabricAPI.runPattern(p.name, vars).then(res => {
    document.getElementById('output').textContent = res;
    history.push(`PATTERN ${p.name}\n` + JSON.stringify(vars) + '\n' + res);
  });
}
