(() => {
  const section = document.getElementById('experience');
  const list = section?.querySelector('.career-timeline');
  if (!list || section.querySelector('.deck-controls')) return;
  const cards = Array.from(list.children).filter(card => card.classList.contains('career-entry'));
  if (cards.length < 2) return;
  let selected = 0;
  let showAll = false;
  const controls = document.createElement('div');
  controls.className = 'deck-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Browse professional experience');
  const selectors = document.createElement('div');
  selectors.className = 'deck-selectors';
  const names = cards.map((card, index) => card.querySelector('h3')?.textContent.trim() || `Role ${index + 1}`);
  const buttons = names.map((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    cards[index].id ||= `experience-card-${index + 1}`;
    button.setAttribute('aria-controls', cards[index].id);
    button.addEventListener('click', () => { selected = index; showAll = false; render(); });
    selectors.append(button);
    return button;
  });
  const arrows = document.createElement('div');
  arrows.className = 'deck-arrows';
  function makeButton(text, label, handler) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = text;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', handler);
    return button;
  }
  function move(delta) { selected = (selected + delta + cards.length) % cards.length; showAll = false; render(); }
  const previous = makeButton('← Previous', 'Previous company', () => move(-1));
  const next = makeButton('Next →', 'Next company', () => move(1));
  const status = document.createElement('span');
  status.className = 'deck-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const allButton = makeButton('View all', 'Show all experience cards', () => { showAll = !showAll; render(); });
  arrows.append(previous, status, next, allButton);
  controls.append(selectors, arrows);
  list.before(controls);
  const hint = document.createElement('p');
  hint.className = 'deck-hint';
  hint.textContent = 'Select a company or use the arrows to explore each role.';
  list.after(hint);
  function render() {
    list.classList.toggle('deck-ready', !showAll);
    cards.forEach((card, index) => {
      const active = index === selected;
      const depth = (index - selected + cards.length) % cards.length;
      card.classList.toggle('is-active', active);
      card.style.setProperty('--deck-depth', depth);
      card.style.setProperty('--deck-layer', cards.length - depth);
      card.inert = !showAll && !active;
      if (!showAll && !active) card.setAttribute('aria-hidden', 'true');
      else card.removeAttribute('aria-hidden');
      buttons[index].setAttribute('aria-pressed', String(!showAll && active));
    });
    status.textContent = showAll ? 'All roles' : `${selected + 1} / ${cards.length}`;
    status.setAttribute('aria-label', showAll ? 'Showing all companies' : `${names[selected]}, card ${selected + 1} of ${cards.length}`);
    allButton.textContent = showAll ? 'Card deck' : 'View all';
    allButton.setAttribute('aria-label', showAll ? 'Return to card deck' : 'Show all experience cards');
    allButton.setAttribute('aria-pressed', String(showAll));
  }
  controls.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
      buttons[selected].focus();
    }
  });
  render();
})();
