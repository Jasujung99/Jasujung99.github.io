import TurndownService from 'turndown';

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

// Keep line breaks nicer for Korean text
td.addRule('preserveLineBreaks', {
  filter: ['p', 'br'],
  replacement: function(content, node) {
    if (node.nodeName.toLowerCase() === 'br') return '  \n';
    return content + '\n\n';
  }
});

export function htmlToMarkdown(html) {
  try {
    return td.turndown(html);
  } catch {
    return '';
  }
}

export function buildFrontMatter({ title, date, source, external_url }) {
  const fm = [
    '---',
    `title: ${escapeYaml(title || '')}`,
    date ? `date: ${date}` : null,
    source ? `source: ${source}` : null,
    external_url ? `external_url: ${external_url}` : null,
    '---',
    ''
  ].filter(Boolean).join('\n');
  return fm + '\n';
}

function escapeYaml(s) {
  if (typeof s !== 'string') return '';
  if (/[:\-?{}\[\],&*!#|>'"%@`]/.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}
