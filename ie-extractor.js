(() => {
  if (document.getElementById('ie-root')) { document.getElementById('ie-root').style.display = 'flex'; return; }

  // ── iStock type detection ──────────────────────────────────────────────────
  function getIstockInfo(fn) {
    let m;
    if ((m = fn.match(/istockphoto-(\d+)/i))) return { type: 'istockphoto', id: m[1] };
    if ((m = fn.match(/iStock-(\d+)/i)))      return { type: 'istock',      id: m[1] };
    return null;
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const images = [...document.querySelectorAll('img')].reduce((acc, img) => {
    const src = img.currentSrc || img.src;
    if (!src || src.startsWith('data:')) return acc;
    const filename = src.split('/').pop().split('?')[0] || '(no filename)';
    const info = getIstockInfo(filename);
    acc.push({ idx: acc.length, src, filename, alt: img.alt || '', width: img.naturalWidth, height: img.naturalHeight, istockId: info?.id || null, istockType: info?.type || null });
    return acc;
  }, []);

  const nI  = images.filter(i => i.istockType === 'istock').length;
  const nIP = images.filter(i => i.istockType === 'istockphoto').length;

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css = `
  #ie-root { all: initial; position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
#ie-root *, #ie-root *::before, #ie-root *::after { box-sizing: border-box; }
#ie-panel { background: #fff; border-radius: 12px; box-shadow: 0 12px 56px rgba(0,0,0,0.25); width: 93vw; max-width: 1340px; height: 87vh; display: flex; flex-direction: column; overflow: hidden; }
#ie-header { background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 12px 16px; display: flex; align-items: center; gap: 10px; cursor: grab; user-select: none; border-radius: 12px 12px 0 0; flex-shrink: 0; }
#ie-header:active { cursor: grabbing; }
#ie-title { font-family: inherit; font-size: 14px; font-weight: 700; color: #1e293b; white-space: nowrap; margin: 0; padding: 0; }
#ie-subtitle { font-family: inherit; font-size: 12px; color: #94a3b8; white-space: nowrap; margin: 0; padding: 0; }
#ie-close { font-family: inherit; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; color: #dc2626; width: 28px; height: 28px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin: 0 0 0 auto; padding: 0; line-height: 1; }
#ie-close:hover { background: #fecaca; }
#ie-toolbar { border-bottom: 2px solid #e2e8f0; background: #f8fafc; flex-shrink: 0; }
.ie-tb-row { padding: 9px 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 0; }
.ie-tb-row + .ie-tb-row { border-top: 1px solid #e9eef4; }
#ie-search { font-family: inherit; border: 1px solid #cbd5e1; border-radius: 7px; padding: 7px 12px; font-size: 13px; width: 250px; outline: none; color: #1e293b; background: #fff; line-height: 1; margin: 0; display: block; }
#ie-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
.ie-pill-check { font-family: inherit; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 12px; font-weight: 500; color: #475569; cursor: pointer; user-select: none; white-space: nowrap; line-height: 1; margin: 0; }
.ie-pill-check:hover { background: #f1f5f9; border-color: #94a3b8; }
.ie-pill-check input { cursor: pointer; accent-color: #3b82f6; margin: 0; padding: 0; width: 14px; height: 14px; }
.ie-pill-check strong { color: #1e293b; margin: 0; padding: 0; }
#ie-sel-info { font-family: inherit; font-size: 12px; color: #64748b; white-space: nowrap; line-height: 1; margin: 0; padding: 0; }
#ie-sel-info strong { margin: 0; padding: 0; color: #1e293b; }
.ie-sel-hidden-badge { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 600; margin: 0 0 0 4px; }
.ie-spacer { flex: 1; min-width: 4px; }
.ie-btn { font-family: inherit; display: inline-flex; align-items: center; gap: 6px; padding: 8px 15px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; line-height: 1; border: 1px solid transparent; margin: 0; text-decoration: none; }
.ie-btn:active { opacity: 0.82; }
.ie-btn-indigo { background: #4f46e5; color: #fff; border-color: #4338ca; }
.ie-btn-indigo:hover { background: #4338ca; }
.ie-btn-violet { background: #7c3aed; color: #fff; border-color: #6d28d9; }
.ie-btn-violet:hover { background: #6d28d9; }
.ie-btn-green  { background: #16a34a; color: #fff; border-color: #15803d; }
.ie-btn-green:hover  { background: #15803d; }
.ie-dd-wrap { position: relative; display: inline-flex; margin: 0; padding: 0; }
.ie-dd-menu { position: absolute; top: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 9px; box-shadow: 0 8px 28px rgba(0,0,0,0.13); min-width: 268px; z-index: 9999; overflow: hidden; display: none; margin: 0; padding: 0; }
.ie-dd-menu.open { display: block; }
.ie-dd-item { font-family: inherit; padding: 11px 16px; font-size: 13px; color: #1e293b; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0; }
.ie-dd-item:hover { background: #f8fafc; }
.ie-dd-label { display: flex; align-items: center; gap: 8px; margin: 0; padding: 0; }
.ie-dd-badge { font-family: inherit; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 20px; padding: 2px 9px; white-space: nowrap; min-width: 28px; text-align: center; margin: 0; }
.ie-dd-sep { height: 1px; background: #f1f5f9; margin: 2px 0; padding: 0; }
#ie-body { overflow: auto; flex: 1; margin: 0; padding: 0; }
#ie-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0; padding: 0; }
#ie-table th { font-family: inherit; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 8px 9px; border-bottom: 2px solid #e2e8f0; text-align: left; position: sticky; top: 0; z-index: 2; overflow: hidden; white-space: nowrap; margin: 0; }
#ie-table td { font-family: inherit; padding: 7px 9px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; overflow: hidden; margin: 0; }
#ie-table tr:hover td { background: #f8fafc; }
#ie-table tr.ie-hidden { display: none; }
img.ie-thumb { display: block; max-width: 100%; max-height: 54px; border: 1px solid #e2e8f0; border-radius: 4px; object-fit: contain; margin: 0; padding: 0; }
.ie-filename { font-family: inherit; font-size: 12px; color: #1e293b; font-weight: 500; word-break: break-all; line-height: 1.4; margin: 0; padding: 0; }
.ie-alt { font-family: inherit; font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; padding: 0; }
.ie-dim { font-family: inherit; font-size: 12px; color: #64748b; white-space: nowrap; margin: 0; padding: 0; }
.ie-url a { font-family: inherit; font-size: 11px; color: #3b82f6; text-decoration: none; word-break: break-all; margin: 0; padding: 0; }
.ie-url a:hover { text-decoration: underline; }
.ie-num { font-family: inherit; font-size: 11px; color: #cbd5e1; text-align: center; margin: 0; padding: 0; }
.ie-istock-type-badge { font-family: inherit; display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-radius: 3px; padding: 2px 5px; margin: 0 0 4px 0; }
.ie-badge-istock      { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.ie-badge-istockphoto { background: #f5f3ff; color: #5b21b6; border: 1px solid #ddd6fe; }
.ie-istock-id { font-family: monospace; font-size: 12px; font-weight: 700; color: #374151; margin: 0 0 5px 0; padding: 0; }
.ie-istock-open { font-family: inherit; display: block; width: 100%; padding: 5px 8px; font-size: 11px; font-weight: 600; border-radius: 5px; cursor: pointer; text-align: center; line-height: 1; border: 1px solid; white-space: nowrap; margin: 0; }
.ie-istock-open-1 { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.ie-istock-open-1:hover { background: #dbeafe; }
.ie-istock-open-2 { background: #f5f3ff; color: #5b21b6; border-color: #ddd6fe; }
.ie-istock-open-2:hover { background: #ede9fe; }
.ie-cb { cursor: pointer; width: 15px; height: 15px; accent-color: #3b82f6; margin: 0; padding: 0; display: block; }
.ie-resizer { position: absolute; right: 0; top: 0; bottom: 0; width: 5px; cursor: col-resize; user-select: none; z-index: 3; border-radius: 2px; margin: 0; padding: 0; }
.ie-resizer:hover, .ie-resizer.ie-resizing { background: rgba(59,130,246,0.5); }
#ie-fab { all: initial; position: fixed; z-index: 2147483646; background: #4f46e5; color: #fff; border: 1px solid #4338ca; border-radius: 50px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: grab; box-shadow: 0 4px 18px rgba(79,70,229,0.4); display: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; user-select: none; white-space: nowrap; line-height: 1; }
#ie-fab:hover { background: #4338ca; }
#ie-fab:active { cursor: grabbing; }
  `;

  // ── Rows ───────────────────────────────────────────────────────────────────
  const tbodyHtml = images.map(img => {
    let istockCell = '<span style="color:#e2e8f0;font-size:13px;">—</span>';
    if (img.istockId) {
      const badge = img.istockType === 'istock'
        ? '<span class="ie-istock-type-badge ie-badge-istock">iStock</span>'
        : '<span class="ie-istock-type-badge ie-badge-istockphoto">istockphoto</span>';
      const cls = img.istockType === 'istock' ? 'ie-istock-open-1' : 'ie-istock-open-2';
      istockCell = `${badge}<div class="ie-istock-id">${img.istockId}</div><button class="ie-istock-open ${cls}" data-istock="${img.istockId}">↗ Open in iStock</button>`;
    }
    const srch = (img.filename + ' ' + img.alt + ' ' + (img.istockId || '')).toLowerCase();
    return `<tr data-idx="${img.idx}" data-src="${img.src}" data-filename="${img.filename}" data-istock-type="${img.istockType || ''}" data-istock="${img.istockId || ''}" data-search="${srch}">
      <td class="ie-num">${img.idx + 1}</td>
      <td style="text-align:center"><input type="checkbox" class="ie-cb ie-row-cb" checked /></td>
      <td><img class="ie-thumb" src="${img.src}" loading="lazy" alt="${img.alt}" /></td>
      <td><div class="ie-filename">${img.filename}</div>${img.alt ? `<div class="ie-alt">alt: ${img.alt}</div>` : ''}</td>
      <td class="ie-dim">${img.width && img.height ? `${img.width} × ${img.height}` : '—'}</td>
      <td>${istockCell}</td>
      <td class="ie-url"><a href="${img.src}" target="_blank">${img.src}</a></td>
    </tr>`;
  }).join('');

  // ── Panel HTML ─────────────────────────────────────────────────────────────
  const panelHtml = `
    <div id="ie-header">
      <span id="ie-title">🖼 Image Extractor</span>
      <span id="ie-subtitle">${images.length} images · ${nI} iStock · ${nIP} istockphoto</span>
      <button id="ie-close" title="Close">✕</button>
    </div>
    <div id="ie-toolbar">
      <div class="ie-tb-row">
        <input id="ie-search" type="text" placeholder="🔍  Search filename, alt or ID…" />
        <label class="ie-pill-check"><input type="checkbox" id="ie-f-istock" /> iStock-XXXX <strong>(${nI})</strong></label>
        <label class="ie-pill-check"><input type="checkbox" id="ie-f-istockphoto" /> istockphoto-XXXX <strong>(${nIP})</strong></label>
        <span class="ie-spacer"></span>
        <span id="ie-sel-info"></span>
      </div>
      <div class="ie-tb-row">
        <button class="ie-btn ie-btn-indigo" id="ie-open-istock">↗ Open all iStock-XXXX (${nI})</button>
        <button class="ie-btn ie-btn-violet" id="ie-open-istockphoto">↗ Open all istockphoto-XXXX (${nIP})</button>
        <span class="ie-spacer"></span>
        <label class="ie-pill-check"><input type="checkbox" id="ie-check-all" checked /> Select all visible</label>
        <div class="ie-dd-wrap">
          <button class="ie-btn ie-btn-green" id="ie-dl-toggle">⬇ Download ▾</button>
          <div class="ie-dd-menu" id="ie-dl-menu">
            <div class="ie-dd-item" data-dl="visible-ticked">
              <span class="ie-dd-label">☑ Visible &amp; ticked</span>
              <span class="ie-dd-badge" id="ie-dl-c1">—</span>
            </div>
            <div class="ie-dd-item" data-dl="ticked">
              <span class="ie-dd-label">✔ All ticked (incl. hidden)</span>
              <span class="ie-dd-badge" id="ie-dl-c2">—</span>
            </div>
            <div class="ie-dd-sep"></div>
            <div class="ie-dd-item" data-dl="all">
              <span class="ie-dd-label">⬇ Download all</span>
              <span class="ie-dd-badge" id="ie-dl-c3">${images.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="ie-body">
      <table id="ie-table">
        <colgroup>
          <col style="width:36px"><col style="width:34px"><col style="width:90px">
          <col style="width:195px"><col style="width:90px"><col style="width:148px"><col>
        </colgroup>
        <thead><tr>
          <th>#<div class="ie-resizer" data-col="0"></div></th>
          <th style="text-align:center">✓<div class="ie-resizer" data-col="1"></div></th>
          <th>Preview<div class="ie-resizer" data-col="2"></div></th>
          <th>Filename<div class="ie-resizer" data-col="3"></div></th>
          <th>Dimensions<div class="ie-resizer" data-col="4"></div></th>
          <th>iStock ID<div class="ie-resizer" data-col="5"></div></th>
          <th>URL<div class="ie-resizer" data-col="6"></div></th>
        </tr></thead>
        <tbody id="ie-tbody">${tbodyHtml}</tbody>
      </table>
    </div>
  `;

  // ── Inject ─────────────────────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const root = document.createElement('div');
  root.id = 'ie-root';
  const panel = document.createElement('div');
  panel.id = 'ie-panel';
  panel.innerHTML = panelHtml;
  root.appendChild(panel);
  document.body.appendChild(root);

  const fab = document.createElement('button');
  fab.id = 'ie-fab';
  fab.textContent = '🖼 Images';
  fab.style.cssText = 'bottom:24px;right:24px;';
  document.body.appendChild(fab);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const $         = id => document.getElementById(id);
  const allRows     = () => [...document.querySelectorAll('#ie-tbody tr')];
  const visRows     = () => allRows().filter(r => !r.classList.contains('ie-hidden'));
  const tickedRows  = () => allRows().filter(r => r.querySelector('.ie-row-cb')?.checked);
  const visTickRows = () => allRows().filter(r => !r.classList.contains('ie-hidden') && r.querySelector('.ie-row-cb')?.checked);

  // ── Selection info + download badge counts ─────────────────────────────────
  function updateSelInfo() {
    const t  = tickedRows();
    const th = t.filter(r => r.classList.contains('ie-hidden'));
    const all = allRows().length;
    const vt  = visTickRows().length;

    let html = `<strong>${t.length}</strong> of <strong>${all}</strong> selected`;
    if (th.length) html += ` <span class="ie-sel-hidden-badge">${th.length} hidden</span>`;
    $('ie-sel-info').innerHTML = html;

    $('ie-dl-c1').textContent = vt;
    $('ie-dl-c2').textContent = t.length;
    $('ie-dl-c3').textContent = all;
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  function applyFilter() {
    const q   = $('ie-search').value.trim().toLowerCase();
    const fI  = $('ie-f-istock').checked;
    const fIP = $('ie-f-istockphoto').checked;
    const typeActive = fI || fIP;
    allRows().forEach(r => {
      const matchQ = !q || r.dataset.search.includes(q);
      const t = r.dataset.istockType;
      const matchT = !typeActive || (fI && t === 'istock') || (fIP && t === 'istockphoto');
      r.classList.toggle('ie-hidden', !(matchQ && matchT));
    });
    updateSelInfo();
  }
  $('ie-search').addEventListener('input', applyFilter);
  $('ie-f-istock').addEventListener('change', applyFilter);
  $('ie-f-istockphoto').addEventListener('change', applyFilter);

  // ── Select all visible ─────────────────────────────────────────────────────
  $('ie-check-all').addEventListener('change', e => {
    visRows().forEach(r => { r.querySelector('.ie-row-cb').checked = e.target.checked; });
    updateSelInfo();
  });
  $('ie-tbody').addEventListener('change', e => {
    if (e.target.classList.contains('ie-row-cb')) updateSelInfo();
  });

  // ── Close / FAB ────────────────────────────────────────────────────────────
  $('ie-close').addEventListener('click', () => { root.style.display = 'none'; fab.style.display = 'block'; });
  root.addEventListener('click', e => { if (e.target === root) { root.style.display = 'none'; fab.style.display = 'block'; } });
  fab.addEventListener('click', () => { if (!fab._drag) { root.style.display = 'flex'; fab.style.display = 'none'; } });

  // ── Per-row iStock ─────────────────────────────────────────────────────────
  $('ie-tbody').addEventListener('click', e => {
    const btn = e.target.closest('.ie-istock-open');
    if (btn) window.open(`https://www.istockphoto.com/search/2/image?phrase=${btn.dataset.istock}`, '_blank');
  });

  // ── Open all by type ───────────────────────────────────────────────────────
  function openAllType(type, label) {
    const list = images.filter(i => i.istockType === type);
    if (!list.length) return alert(`No ${label} images found on this page.`);
    if (list.length > 5 && !confirm(`Open ${list.length} tabs?`)) return;
    list.forEach(img => window.open(`https://www.istockphoto.com/search/2/image?phrase=${img.istockId}`, '_blank'));
  }
  $('ie-open-istock').addEventListener('click',      () => openAllType('istock',      'iStock-XXXX'));
  $('ie-open-istockphoto').addEventListener('click', () => openAllType('istockphoto', 'istockphoto-XXXX'));

  // ── Download ───────────────────────────────────────────────────────────────
  $('ie-dl-toggle').addEventListener('click', e => {
    e.stopPropagation();
    updateSelInfo();
    $('ie-dl-menu').classList.toggle('open');
  });
  document.addEventListener('click', () => $('ie-dl-menu').classList.remove('open'));

  async function downloadImages(rowEls) {
    if (!rowEls.length) { alert('No images match the current selection.'); return; }
    for (const row of rowEls) {
      const { src, filename } = row.dataset;
      try {
        const resp = await fetch(src, { mode: 'cors' });
        if (!resp.ok) throw new Error();
        const blob = await resp.blob();
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      } catch {
        const a = Object.assign(document.createElement('a'), { href: src, download: filename, target: '_blank' });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  $('ie-dl-menu').addEventListener('click', async e => {
    const action = e.target.closest('[data-dl]')?.dataset.dl;
    if (!action) return;
    $('ie-dl-menu').classList.remove('open');
    if      (action === 'visible-ticked') await downloadImages(visTickRows());
    else if (action === 'ticked')         await downloadImages(tickedRows());
    else if (action === 'all')            await downloadImages(allRows());
  });

  // ── Drag panel ─────────────────────────────────────────────────────────────
  let pdx = 0, pdy = 0, dragPanel = false;
  $('ie-header').addEventListener('mousedown', e => {
    if (e.target.id === 'ie-close') return;
    dragPanel = true;
    const r = panel.getBoundingClientRect();
    pdx = e.clientX - r.left; pdy = e.clientY - r.top;
    Object.assign(panel.style, { position: 'absolute', margin: '0', left: r.left + 'px', top: r.top + 'px' });
    Object.assign(root.style, { alignItems: 'flex-start', justifyContent: 'flex-start' });
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (dragPanel) { panel.style.left = (e.clientX - pdx) + 'px'; panel.style.top = (e.clientY - pdy) + 'px'; }
  });
  document.addEventListener('mouseup', () => { dragPanel = false; });

  // ── Drag FAB ───────────────────────────────────────────────────────────────
  let fdx = 0, fdy = 0, dragFab = false;
  fab.addEventListener('mousedown', e => {
    dragFab = true; fab._drag = false;
    const r = fab.getBoundingClientRect();
    fdx = e.clientX - r.left; fdy = e.clientY - r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragFab) return;
    fab._drag = true;
    Object.assign(fab.style, { left: (e.clientX - fdx) + 'px', top: (e.clientY - fdy) + 'px', right: 'auto', bottom: 'auto' });
  });
  document.addEventListener('mouseup', () => { dragFab = false; setTimeout(() => { fab._drag = false; }, 10); });

  // ── Column resize — preview col drives image max-height ───────────────────
  const cols = [...document.querySelectorAll('#ie-table col')];
  const ths  = [...document.querySelectorAll('#ie-table th')];
  let activeCol = null, activeColIdx = -1, rStartX = 0, rStartW = 0;

  document.querySelectorAll('.ie-resizer').forEach(h => {
    h.addEventListener('mousedown', e => {
      activeColIdx = parseInt(h.dataset.col);
      activeCol    = cols[activeColIdx];
      rStartX      = e.clientX;
      rStartW      = parseInt(getComputedStyle(ths[activeColIdx]).width);
      h.classList.add('ie-resizing');
      e.preventDefault(); e.stopPropagation();
    });
  });
  document.addEventListener('mousemove', e => {
    if (!activeCol) return;
    const w = Math.max(30, rStartW + (e.clientX - rStartX));
    activeCol.style.width = w + 'px';
    if (activeColIdx === 2) {
      const h = Math.max(20, Math.round(w * 0.85)) + 'px';
      document.querySelectorAll('img.ie-thumb').forEach(img => { img.style.maxHeight = h; });
    }
  });
  document.addEventListener('mouseup', () => {
    document.querySelectorAll('.ie-resizer').forEach(r => r.classList.remove('ie-resizing'));
    activeCol = null; activeColIdx = -1;
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  updateSelInfo();
})();
