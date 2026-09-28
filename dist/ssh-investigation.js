(() => {
  const tabsContainer = document.querySelector('.case-tabs');
  const tabs = [...tabsContainer.querySelectorAll('button')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const previous = document.getElementById('previous-stage');
  const next = document.getElementById('next-stage');
  const status = document.getElementById('stage-status');
  let current = 0;
  tabsContainer.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); select(target); tabs[target].focus(); }
    });
  });
  function select(index) {
    current = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    previous.disabled = index === 0;
    next.disabled = index === tabs.length - 1;
    status.textContent = `Stage ${index + 1} of ${tabs.length}`;
  }
  function advance(delta) {
    select(Math.max(0, Math.min(tabs.length - 1, current + delta)));
    tabs[current].focus();
  }
  previous.addEventListener('click', () => advance(-1));
  next.addEventListener('click', () => advance(1));
  select(0);
  tabsContainer.hidden = false;
  document.querySelector('.step-navigation').hidden = false;
  const copy = document.getElementById('copy-query');
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    const code = document.getElementById('spl-query');
    const feedback = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(code.textContent);
      feedback.textContent = 'SPL copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      feedback.textContent = 'Select Copy from your browser menu to copy the highlighted SPL.';
    }
  });
})();
