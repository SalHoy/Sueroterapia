import { protocolData, standardData } from './protocols.js';

const els = {
  list: document.querySelector('#protocol-list'),
  search: document.querySelector('#search'),
  clearSearch: document.querySelector('#clear-search'),
  main: document.querySelector('#main-content'),
  sidebar: document.querySelector('#sidebar'),
  overlay: document.querySelector('#sidebar-overlay'),
  openSidebar: document.querySelector('#open-sidebar'),
  closeSidebar: document.querySelector('#close-sidebar'),
  print: document.querySelector('#print-button'),
  printContainer: document.querySelector('#print-container')
};

let currentIndex = -1;
let searchTerm = '';
let searchTimer = null;

const escapeHTML = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const normalize = (value) => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

function protocolMatches(protocol, term) {
  const query = normalize(term);
  if (!query) return true;
  return normalize([
    protocol.name,
    protocol.frase,
    protocol.caracteristicas,
    protocol.idealPara,
    protocol.comoFunciona
  ].join(' ')).includes(query);
}

function filteredProtocols() {
  return protocolData
    .map((protocol, index) => ({ protocol, index }))
    .filter(({ protocol }) => protocolMatches(protocol, searchTerm));
}

function setHash(index) {
  const hash = index < 0 ? '#catalogo' : `#protocolo-${index + 1}`;
  if (window.location.hash !== hash) window.history.pushState({}, '', hash);
}

function parseHash() {
  const match = window.location.hash.match(/^#protocolo-(\d+)$/i);
  if (!match) return -1;
  const index = Number(match[1]) - 1;
  return Number.isInteger(index) && index >= 0 && index < protocolData.length ? index : -1;
}

function selectProtocol(index, updateUrl = true) {
  currentIndex = Number.isInteger(index) && index >= 0 && index < protocolData.length ? index : -1;
  if (updateUrl) setHash(currentIndex);
  renderList();
  renderContent();
  closeMobileSidebar();
}

function openMobileSidebar() {
  els.sidebar.classList.add('open');
  els.overlay.classList.add('open');
  els.openSidebar.setAttribute('aria-expanded', 'true');
  els.overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  els.sidebar.classList.remove('open');
  els.overlay.classList.remove('open');
  els.openSidebar.setAttribute('aria-expanded', 'false');
  els.overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderList() {
  const results = filteredProtocols();
  const coverActive = currentIndex === -1;
  const coverButton = `
    <button class="protocol-item ${coverActive ? 'active' : ''}" type="button" data-action="catalogo" aria-current="${coverActive ? 'page' : 'false'}">
      <span class="protocol-number">⌂</span><span>Portada</span>
    </button>`;

  const protocolButtons = results.map(({ protocol, index }) => `
    <button class="protocol-item ${currentIndex === index ? 'active' : ''}" type="button" data-index="${index}" aria-current="${currentIndex === index ? 'page' : 'false'}">
      <span class="protocol-number">${index + 1}.</span><span>${escapeHTML(protocol.name)}</span>
    </button>`).join('');

  els.list.innerHTML = coverButton + '<div aria-hidden="true" style="height:1px;background:#f1f5f9;margin:7px 3px"></div>' +
    (protocolButtons || '<div class="protocol-empty">No se encontraron protocolos.</div>');
}

function renderContent() {
  if (currentIndex < 0) renderCatalog();
  else renderDetail(protocolData[currentIndex]);
  els.main.scrollTo({ top: 0, behavior: 'auto' });
  els.main.focus({ preventScroll: true });
}

function renderCatalog() {
  const results = filteredProtocols();
  const cards = results.map(({ protocol, index }) => `
    <a class="protocol-card" href="#protocolo-${index + 1}" data-index="${index}">
      <div class="card-top">
        <span class="badge">Protocolo ${index + 1}</span>
        <span class="arrow" aria-hidden="true">→</span>
      </div>
      <h3>${escapeHTML(protocol.name)}</h3>
      <p>“${escapeHTML(protocol.frase)}”</p>
      <div class="card-footer">${escapeHTML(standardData.clasificacion)}</div>
    </a>`).join('');

  const filterLabel = searchTerm
    ? `<span class="filter-pill">Buscando: “${escapeHTML(searchTerm)}” · ${results.length}</span>`
    : '';

  els.main.innerHTML = `
    <div class="page">
      <section class="hero" aria-labelledby="catalog-title">
        <div class="hero-content">
          <img class="hero-logo" src="assets/logo.svg" alt="" width="64" height="64">
          <div class="eyebrow">Catálogo Clínico Oficial</div>
          <h1 id="catalog-title">Sueroterapia Funcional</h1>
          <p>Explora nuestra colección de protocolos y consulta la ficha descriptiva de cada opción.</p>
        </div>
        <div class="hero-actions">
          <button class="button" type="button" data-action="print">▣ &nbsp; Imprimir catálogo PDF</button>
          <div class="count-card">${protocolData.length} protocolos disponibles</div>
        </div>
      </section>

      <div class="section-heading">
        <h2>Directorio de Sueros</h2>
        ${filterLabel}
      </div>

      <div class="protocol-grid">
        ${cards || '<div class="empty-state"><strong>No se encontraron protocolos.</strong><br>Prueba con otro término de búsqueda.</div>'}
      </div>
    </div>`;
}

function renderDetail(protocol) {
  const index = currentIndex;
  const previous = index === 0 ? -1 : index - 1;
  const next = index < protocolData.length - 1 ? index + 1 : -1;

  els.main.innerHTML = `
    <article class="detail-page" aria-labelledby="detail-title">
      <header class="detail-header">
        <div class="detail-meta">
          <span class="badge">Protocolo ${index + 1} de ${protocolData.length}</span>
          <span class="badge">${escapeHTML(standardData.clasificacion)}</span>
        </div>
        <h1 id="detail-title">${escapeHTML(protocol.name)}</h1>
        <p class="quote">“${escapeHTML(protocol.frase)}”</p>
      </header>

      <div class="detail-grid">
        <div>
          <section class="detail-section">
            <h2>Características</h2>
            <p>${escapeHTML(protocol.caracteristicas)}</p>
          </section>
          <section class="detail-section">
            <h2>Ideal para</h2>
            <div class="ideal-box"><p>${escapeHTML(protocol.idealPara)}</p></div>
          </section>
          <section class="detail-section">
            <h2>Cómo funciona</h2>
            <p>${escapeHTML(protocol.comoFunciona)}</p>
          </section>
        </div>

        <div>
          <section class="detail-section">
            <h2>Indicaciones clínicas</h2>
            <p>${escapeHTML(standardData.funcion)}</p>
          </section>
          <section class="admin-card">
            <h2>Administración</h2>
            <div class="admin-row">
              <span class="admin-label">Forma de uso</span>
              <div class="admin-value">${escapeHTML(standardData.formaDeUso)}</div>
            </div>
            <div class="admin-row">
              <span class="admin-label">Presentación</span>
              <div class="admin-value">${escapeHTML(standardData.presentacion)}</div>
            </div>
          </section>
          <div class="disclaimer"><strong>Nota:</strong> Información descriptiva del catálogo. La selección, composición, dosis, indicación y administración deben ser determinadas y validadas por el profesional responsable según cada paciente y la normativa sanitaria aplicable.</div>
        </div>
      </div>

      <footer class="detail-footer">
        <button class="nav-button" type="button" data-index="${previous}" data-action="navigate">← ${previous < 0 ? 'Volver al catálogo' : 'Anterior'}</button>
        <button class="nav-button" type="button" data-index="${next}" data-action="navigate">${next < 0 ? 'Volver al catálogo' : 'Siguiente'} ${next < 0 ? '⌂' : '→'}</button>
      </footer>
    </article>`;
}

function buildPrintCatalog() {
  const cover = `
    <section class="print-page print-cover">
      <img class="print-logo" src="assets/logo.svg" alt="Health Today Care">
      <div class="print-eyebrow">Health Today Care</div>
      <h1>Catálogo Clínico<br>Sueroterapia</h1>
      <p>Protocolos funcionales · ${protocolData.length} protocolos</p>
    </section>`;

  const pages = protocolData.map((protocol, index) => `
    <section class="print-page">
      <header class="print-header">
        <div class="print-small">Health Today Care · Protocolo ${index + 1} de ${protocolData.length}</div>
        <h1>${escapeHTML(protocol.name)}</h1>
        <div class="print-quote">“${escapeHTML(protocol.frase)}”</div>
      </header>
      <div class="print-block"><h2>Características</h2><p>${escapeHTML(protocol.caracteristicas)}</p></div>
      <div class="print-block"><h2>Ideal para</h2><p>${escapeHTML(protocol.idealPara)}</p></div>
      <div class="print-block"><h2>Cómo funciona</h2><p>${escapeHTML(protocol.comoFunciona)}</p></div>
      <div class="print-admin">
        <div class="print-block"><h2>Indicaciones clínicas</h2><p><strong>${escapeHTML(standardData.funcion)}</strong></p></div>
        <div class="print-admin-box print-block"><h2>Administración</h2><p><strong>Forma de uso:</strong> ${escapeHTML(standardData.formaDeUso)}</p><br><p><strong>Presentación:</strong> ${escapeHTML(standardData.presentacion)}</p></div>
      </div>
      <p class="print-disclaimer">Información descriptiva. La indicación, composición, dosis y administración deben ser determinadas por el profesional responsable conforme a la valoración individual y la normativa sanitaria aplicable.</p>
    </section>`).join('');

  return cover + pages;
}

function printFullCatalog() {
  els.printContainer.innerHTML = buildPrintCatalog();
  els.printContainer.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => window.print(), 100);
}

function clearPrintContainer() {
  if (!window.matchMedia('print').matches) {
    els.printContainer.innerHTML = '';
    els.printContainer.setAttribute('aria-hidden', 'true');
  }
}

function handleHashChange() {
  const index = parseHash();
  selectProtocol(index, false);
}

els.list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-index], button[data-action="catalogo"]');
  if (!button) return;
  if (button.dataset.action === 'catalogo') selectProtocol(-1);
  else selectProtocol(Number(button.dataset.index));
});

els.main.addEventListener('click', (event) => {
  const printButton = event.target.closest('[data-action="print"]');
  if (printButton) {
    printFullCatalog();
    return;
  }
  const navButton = event.target.closest('[data-action="navigate"]');
  if (navButton) {
    selectProtocol(Number(navButton.dataset.index));
  }
});

els.search.addEventListener('input', (event) => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    searchTerm = event.target.value;
    els.clearSearch.hidden = !searchTerm;
    renderList();
    if (currentIndex === -1) renderContent();
  }, 120);
});

els.clearSearch.addEventListener('click', () => {
  els.search.value = '';
  searchTerm = '';
  els.clearSearch.hidden = true;
  renderList();
  if (currentIndex === -1) renderContent();
  els.search.focus();
});

els.print.addEventListener('click', printFullCatalog);
els.openSidebar.addEventListener('click', openMobileSidebar);
els.closeSidebar.addEventListener('click', closeMobileSidebar);
els.overlay.addEventListener('click', closeMobileSidebar);
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('afterprint', clearPrintContainer);
window.addEventListener('resize', () => {
  if (window.innerWidth > 800) closeMobileSidebar();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileSidebar();
  if (event.key === '/' && document.activeElement !== els.search && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    els.search.focus();
  }
});

currentIndex = parseHash();
renderList();
renderContent();
