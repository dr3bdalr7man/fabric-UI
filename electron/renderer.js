const patternList = document.getElementById('patternList');
const strategyList = document.getElementById('strategyList');
const tabContent = document.getElementById('tabContent');
const tabs = document.querySelectorAll('.tab');
const search = document.getElementById('search');
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

function filterList() {
  const q = search.value.toLowerCase();
  Array.from(patternList.children).forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
  Array.from(strategyList.children).forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
if (search) search.addEventListener('input', filterList);
renderTab('run');

window.fabricAPI.patterns.forEach(p => {
  const li = document.createElement('li');
  li.textContent = p.name;
  if (p.description) li.title = p.description;
  li.addEventListener('click', () => openPattern(p));
  patternList.appendChild(li);
});

window.fabricAPI.strategies.forEach(s => {
  const li = document.createElement('li');
  li.textContent = s.name;
  if (s.description) li.title = s.description;
  li.addEventListener('click', () => openStrategy(s));
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
    const ts = new Date().toLocaleString();
    history.push(`[${ts}] PATTERN ${p.name}\n` + JSON.stringify(vars) + '\n' + res);
    if (document.querySelector('[data-tab="history"]').classList.contains('active')) {
      renderTab('history');
    }
  });
}

function openStrategy(s) {
  switchTab('run');
  const form = '<label>Input<textarea id="str_input"></textarea></label>' +
    `<button id="runStr">Run ${s.name}</button><pre id="output"></pre>`;
  const desc = s.description ? `<p>${s.description}</p>` : '';
  tabContent.innerHTML = `<h3>${s.name}</h3>${desc}${form}`;
  document.getElementById('runStr').addEventListener('click', () => runStrategy(s));
}

function runStrategy(s) {
  const input = document.getElementById('str_input').value;
  window.fabricAPI.runStrategy(s.name, input).then(res => {
    document.getElementById('output').textContent = res;
    const ts = new Date().toLocaleString();
    history.push(`[${ts}] STRATEGY ${s.name}\nInput: ${input}\n${res}`);
    if (document.querySelector('[data-tab="history"]').classList.contains('active')) {
      renderTab('history');
    }
  });
}
