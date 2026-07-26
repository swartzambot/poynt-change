// Edit this map to add/rename terminals, then click "reload" on chrome://extensions
const TID_NAMES = {
  '0008047096808203': 'Pension Lane',
  '0008047096808255': 'Pond Mills',
  '0008047096808327': 'Debit J',
  '0008047096808018': 'Debit I',
  '0008047096808322': 'Debit H',
  '0008047096808497': 'Debit G',
  '0008047096808316': 'Debit F',
  '0008047096808273': 'Debit E',
  '0008047096808283': 'Debit D',
  '0008047096808351': 'Debit C',
  '0008047096808023': 'Debit B',
  '0008047096808466': 'Debit A',
};

// Optional leading "TID:" label is absorbed so we don't render "TID: Debit A (TID: ...)"
const TID_RE = new RegExp(`(?:TID:\\s*)?(${Object.keys(TID_NAMES).join('|')})`, 'g');
const DONE = new WeakSet();

function rewrite(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (DONE.has(node)) continue;
    const text = node.nodeValue;
    if (!text || !TID_RE.test(text)) continue;
    TID_RE.lastIndex = 0;
    node.nodeValue = text.replace(TID_RE, (_m, tid) => `${TID_NAMES[tid]} (TID: ${tid})`);
    DONE.add(node);
  }
}

rewrite(document.body);

// Poynt is a SPA — re-run when content loads/changes
new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const n of m.addedNodes) {
      if (n.nodeType === Node.ELEMENT_NODE) rewrite(n);
      else if (n.nodeType === Node.TEXT_NODE) rewrite(n.parentNode || n);
    }
    if (m.type === 'characterData' && m.target.parentNode) {
      DONE.delete(m.target);
      rewrite(m.target.parentNode);
    }
  }
}).observe(document.body, { childList: true, subtree: true, characterData: true });
