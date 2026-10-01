/* Small, explicit SPL-style filter for public portfolio records. No eval or remote execution. */
function parseExperienceQuery(query) {
  const text = query.trim();
  if (!text) throw new Error('Paste a listed query, then select Search.');
  const fields = {};
  const token = /\s*([a-z_]+)\s*=\s*(?:"([^"\n]*)"|([^\s"|=]+))/iy;
  let position = 0;
  while (position < text.length) {
    token.lastIndex = position;
    const match = token.exec(text);
    if (!match) throw new Error('Use field=value filters from the listed queries. Pipes and other SPL commands are not supported in this demo.');
    const key = match[1].toLowerCase();
    if (!['index', 'company', 'start_year', 'end_year', 'current'].includes(key)) throw new Error(`Supported fields: index, company, start_year, end_year, current. Unknown field: ${key}.`);
    if (Object.hasOwn(fields, key)) throw new Error(`Use ${key} only once.`);
    fields[key] = match[2] ?? match[3];
    position = token.lastIndex;
    if (position < text.length && !/\s/.test(text[position])) throw new Error('Separate each field filter with a space.');
  }
  if (fields.index !== 'experience') throw new Error('Start with index=experience.');
  for (const field of ['start_year', 'end_year']) {
    if (fields[field] !== undefined && !/^\d{4}$/.test(fields[field])) throw new Error(`${field} must be a four-digit year.`);
  }
  if (fields.current !== undefined && !/^(true|false)$/i.test(fields.current)) throw new Error('Use current=true or current=false.');
  return fields;
}
function experienceMatches(record, fields) {
  return Object.entries(fields).every(([key, value]) => key === 'index' || String(record[key]).toLowerCase() === value.toLowerCase());
}
if (typeof module !== 'undefined' && module.exports) module.exports = { parseExperienceQuery, experienceMatches };
if (typeof document !== 'undefined') (() => {
  const section = document.getElementById('experience');
  const list = section?.querySelector('.career-timeline');
  const panel = section?.querySelector('.experience-search-panel');
  if (!list || !panel) return;
  const entries = [...list.querySelectorAll('.career-entry')];
  const records = entries.map(card => {
    const company = card.querySelector('h3').textContent.trim();
    const date = card.querySelector('.career-meta').textContent;
    const years = date.match(/\b\d{4}\b/g) || [];
    const current = /Present/i.test(date);
    return { company, start_year: years[0], end_year: current ? undefined : years[1], current };
  });
  const input = panel.querySelector('#experience-query');
  const form = panel.querySelector('form');
  const status = panel.querySelector('#experience-query-status');
  const feedback = panel.querySelector('#experience-copy-status');
  const empty = section.querySelector('.experience-empty');
  const shortcuts = [];
  panel.querySelectorAll('.query-example').forEach((example, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = records[index].company;
    button.setAttribute('aria-label', `Search ${example.querySelector('strong').textContent}`);
    button.addEventListener('click', () => {
      input.value = example.querySelector('code').textContent;
      feedback.textContent = '';
      run();
    });
    panel.querySelector('.query-shortcuts').append(button);
    shortcuts.push(button);
  });
  function run() {
    let fields;
    try { fields = parseExperienceQuery(input.value); }
    catch (error) { input.setAttribute('aria-invalid', 'true'); status.textContent = error.message; status.classList.add('query-error'); return; }
    input.removeAttribute('aria-invalid'); status.classList.remove('query-error');
    shortcuts.forEach((button, index) => button.setAttribute('aria-pressed', String(fields.company?.toLowerCase() === records[index].company.toLowerCase())));
    let count = 0;
    entries.forEach((card, i) => { const match = experienceMatches(records[i], fields); card.hidden = !match; if (match) count++; });
    status.textContent = `${count} ${count === 1 ? 'experience result' : 'experience results'}`;
    empty.hidden = count !== 0;
  }
  form.addEventListener('submit', event => { event.preventDefault(); run(); });
  input.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); }
  });
  panel.querySelector('.experience-show-all').addEventListener('click', () => { input.value = 'index=experience'; run(); });
  panel.querySelectorAll('.query-example').forEach(example => {
    const code = example.querySelector('code');
    example.querySelector('.query-use').addEventListener('click', () => {
      input.value = code.textContent; feedback.textContent = 'Query loaded. Select Search to see the result.';
      input.focus(); input.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    });
    example.querySelector('.query-copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.textContent); feedback.textContent = 'Query copied. Paste it in the search box and select Search.'; }
      catch {
        const range = document.createRange(); range.selectNodeContents(code);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        feedback.textContent = 'Copy the highlighted query with your browser, or select Use query.';
      }
    });
  });
  section.classList.add('experience-search-ready');
  panel.hidden = false;
  run();
})();
