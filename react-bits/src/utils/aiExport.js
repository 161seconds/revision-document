const SITE_ORIGIN = 'https://reactbits.dev';

const SKIP_SELECTOR = [
  '.docs-button-bar',
  '.docs-page-actions',
  '.docs-code-header',
  '.docs-segmented',
  '.docs-code-options',
  '.linenumber',
  'button',
  'select',
  'svg'
].join(',');

const shouldSkip = el => typeof el.matches === 'function' && el.matches(SKIP_SELECTOR);

const collapse = text => text.replace(/\s+/g, ' ');

const absoluteUrl = href => {
  if (!href) return '';
  try {
    return new URL(href, window.location.origin).href.replace(window.location.origin, SITE_ORIGIN);
  } catch {
    return href;
  }
};

function inlineToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) return collapse(node.textContent);
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  if (shouldSkip(node)) return '';

  const inner = Array.from(node.childNodes).map(inlineToMarkdown).join('');
  const tag = node.tagName.toLowerCase();

  switch (tag) {
    case 'code':
      return inner.trim() ? `\`${inner.trim()}\`` : '';
    case 'strong':
    case 'b':
      return inner.trim() ? `**${inner.trim()}**` : '';
    case 'em':
    case 'i':
      return inner.trim() ? `*${inner.trim()}*` : '';
    case 'br':
      return '\n';
    case 'a': {
      const label = inner.trim();
      const href = absoluteUrl(node.getAttribute('href'));
      if (!label) return '';
      return href ? `[${label}](${href})` : label;
    }
    case 'span':
      if (node.classList.contains('docs-highlight')) {
        return inner.trim() ? `**${inner.trim()}**` : '';
      }
      return inner;
    default:
      return inner;
  }
}

const inlineOf = el =>
  inlineToMarkdown(el)
    .replace(/[ \t]+/g, ' ')
    .trim();

function codeBlockToMarkdown(pre) {
  const clone = pre.cloneNode(true);
  clone.querySelectorAll('.linenumber').forEach(n => n.remove());

  const code = clone.textContent.replace(/\n{3,}/g, '\n\n').trim();
  if (!code) return '';

  const classNames = `${pre.className || ''} ${pre.querySelector('code')?.className || ''}`;
  const langMatch = /language-([a-z0-9]+)/i.exec(classNames);
  const lang = langMatch && langMatch[1] !== 'null' ? langMatch[1] : '';

  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

function listToMarkdown(list, ordered) {
  return Array.from(list.children)
    .filter(li => li.tagName.toLowerCase() === 'li' && !shouldSkip(li))
    .map((li, i) => {
      const text = inlineOf(li);
      if (!text) return '';
      const marker = ordered ? `${i + 1}.` : '-';
      return `${marker} ${text.split('\n').join('\n  ')}`;
    })
    .filter(Boolean)
    .join('\n');
}

function controlStateToMarkdown(el) {
  if (el.classList.contains('docs-segmented')) {
    const label = el.querySelector('.docs-segment.is-active .docs-segment-label');
    const text = label ? collapse(label.textContent).trim() : '';
    return text ? `_Selected: **${text}**_` : '';
  }

  if (el.classList.contains('docs-code-options')) {
    const parts = Array.from(el.querySelectorAll('select'))
      .map(sel => {
        const opt = sel.options[sel.selectedIndex];
        return opt ? opt.textContent.trim() : '';
      })
      .filter(Boolean);
    return parts.length ? `_Selected stack: **${parts.join(' + ')}**_` : '';
  }

  return '';
}

function blockToMarkdown(el) {
  if (el.classList && (el.classList.contains('docs-segmented') || el.classList.contains('docs-code-options'))) {
    return controlStateToMarkdown(el);
  }
  if (shouldSkip(el)) return '';
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'h1':
      return `# ${inlineOf(el)}`;
    case 'h2':
      return `## ${inlineOf(el)}`;
    case 'h3':
      return `### ${inlineOf(el)}`;
    case 'h4':
      return `#### ${inlineOf(el)}`;
    case 'h5':
    case 'h6':
      return `##### ${inlineOf(el)}`;
    case 'p':
      return inlineOf(el);
    case 'ul':
      return listToMarkdown(el, false);
    case 'ol':
      return listToMarkdown(el, true);
    case 'pre':
      return codeBlockToMarkdown(el);
    case 'blockquote':
      return inlineOf(el)
        .split('\n')
        .map(l => `> ${l}`)
        .join('\n');
    case 'hr':
      return '---';
    default: {
      const pre = tag === 'div' && el.classList.contains('docs-code') ? el.querySelector('pre') : null;
      if (pre) return codeBlockToMarkdown(pre);
      return Array.from(el.children).map(blockToMarkdown).filter(Boolean).join('\n\n');
    }
  }
}

export function sectionToMarkdown(section, { sourceUrl } = {}) {
  if (!section) return '';

  const body = Array.from(section.children).map(blockToMarkdown).filter(Boolean).join('\n\n');

  const source = sourceUrl || absoluteUrl(window.location.pathname);
  const attribution = `> Source: ${source}\n> React Bits — an open source collection of animated React components.`;

  const [firstLine, ...rest] = body.split('\n\n');
  if (firstLine && firstLine.startsWith('# ')) {
    return `${firstLine}\n\n${attribution}\n\n${rest.join('\n\n')}`.trim() + '\n';
  }
  return `${attribution}\n\n${body}`.trim() + '\n';
}

export const variantCode = (language, style) =>
  `${(language || 'JS').toUpperCase()}-${(style || 'CSS').toUpperCase().replace('TAILWIND', 'TW')}`;

export const registryUrl = (componentName, language, style) =>
  `${SITE_ORIGIN}/r/${componentName}-${variantCode(language, style)}.json`;

export const componentDocsUrl = (category, subcategory) => `${SITE_ORIGIN}/${category}/${subcategory}`;

export function buildCompactPrompt({ componentName, category, subcategory, language, style, installCommand, usage }) {
  const lines = [
    `Help me add the <${componentName} /> component from React Bits to my project.`,
    '',
    `Variant: ${variantCode(language, style)} (${language === 'TS' ? 'TypeScript' : 'JavaScript'}, ${style === 'TW' ? 'Tailwind' : 'plain CSS'})`,
    `Docs: ${componentDocsUrl(category, subcategory)}`,
    `Component source + dependencies (JSON): ${registryUrl(componentName, language, style)}`
  ];

  if (installCommand) {
    lines.push('', 'Install it with:', installCommand);
  }

  if (usage) {
    lines.push('', 'Use this configuration:', usage);
  }

  lines.push(
    '',
    'Please fetch the registry JSON above for the exact source, install any listed dependencies, add the component to my project, and wire it into the right place.',
    `If this is not the right component, the full library index is at ${SITE_ORIGIN}/llms.txt.`
  );

  return lines.join('\n');
}

const MAX_URL_PROMPT = 6000;

export const AI_PROVIDERS = {
  chatgpt: {
    label: 'Open in ChatGPT',
    kind: 'prompt',
    build: p => `https://chatgpt.com/?q=${encodeURIComponent(p)}`
  },
  claude: {
    label: 'Open in Claude',
    kind: 'prompt',
    build: p => `https://claude.ai/new?q=${encodeURIComponent(p)}`
  },
  v0: {
    label: 'Open in v0',
    kind: 'registry',
    build: url => `https://v0.dev/chat/api/open?url=${encodeURIComponent(url)}`
  }
};

export function openInAI(providerKey, payload) {
  const provider = AI_PROVIDERS[providerKey];
  if (!provider) return false;

  const { prompt = '', registryUrl: itemUrl = '' } = typeof payload === 'string' ? { prompt: payload } : payload || {};

  let target;
  if (provider.kind === 'registry') {
    if (!itemUrl) return false;
    target = provider.build(itemUrl);
  } else {
    if (!prompt) return false;
    const trimmed = prompt.length > MAX_URL_PROMPT ? `${prompt.slice(0, MAX_URL_PROMPT)}\n\n[truncated]` : prompt;
    target = provider.build(trimmed);
  }

  window.open(target, '_blank', 'noopener,noreferrer');
  return true;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;top:0;';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
