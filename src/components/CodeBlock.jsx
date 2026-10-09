// A small editor-style code block with a hand-written JavaScript tokenizer: no highlight
// library. The scanner walks the source one character at a time and emits tokens for
// comments, strings, numbers, keywords, literals, object keys, identifiers and punctuation.

const KEYWORDS = new Set(['const', 'let', 'var', 'export', 'default', 'return', 'function', 'new', 'import', 'from']);
const LITERALS = new Set(['true', 'false', 'null', 'undefined']);
const PUNCTUATION = '{}[]().,;:=+-*/<>!?&|';

const isDigit = (ch) => ch >= '0' && ch <= '9';
const isIdentStart = (ch) => /[A-Za-z_$]/.test(ch);
const isIdent = (ch) => /[\w$]/.test(ch);

export function tokenize(source) {
  const tokens = [];
  let i = 0;
  const push = (type, text) => {
    // Merge runs of plain text so the output stays small.
    const last = tokens[tokens.length - 1];
    if (type === 'plain' && last?.type === 'plain') last.text += text;
    else tokens.push({ type, text });
  };

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i);
      const stop = end === -1 ? source.length : end;
      push('comment', source.slice(i, stop));
      i = stop;
    } else if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      push('comment', source.slice(i, stop));
      i = stop;
    } else if (ch === "'" || ch === '"' || ch === '`') {
      let j = i + 1;
      while (j < source.length && source[j] !== ch) j += source[j] === '\\' ? 2 : 1;
      push('string', source.slice(i, j + 1));
      i = j + 1;
    } else if (isDigit(ch)) {
      let j = i;
      while (j < source.length && (isDigit(source[j]) || source[j] === '.' || source[j] === '_')) j += 1;
      push('number', source.slice(i, j));
      i = j;
    } else if (isIdentStart(ch)) {
      let j = i;
      while (j < source.length && isIdent(source[j])) j += 1;
      const word = source.slice(i, j);
      // A word followed by a colon (spaces allowed) is an object key.
      let k = j;
      while (source[k] === ' ') k += 1;
      let type = 'ident';
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (LITERALS.has(word)) type = 'literal';
      else if (source[k] === ':') type = 'property';
      push(type, word);
      i = j;
    } else if (PUNCTUATION.includes(ch)) {
      push('punct', ch);
      i += 1;
    } else {
      push('plain', ch);
      i += 1;
    }
  }
  return tokens;
}

// Splits the token stream into lines, breaking any token that spans a newline.
function toLines(tokens) {
  const lines = [[]];
  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, text: part });
    });
  }
  return lines;
}

const TOKEN_CLASS = {
  comment: 'text-muted italic',
  string: 'text-(--teal)',
  number: 'text-(--amber)',
  keyword: 'text-(--purple)',
  literal: 'text-(--pink)',
  property: 'text-(--blue)',
  ident: 'text-fg',
  punct: 'text-muted',
  plain: '',
};

export default function CodeBlock({ code, fileName, meta, className = '' }) {
  const lines = toLines(tokenize(code));
  const digits = String(lines.length).length;

  return (
    <figure className={`code-window overflow-hidden rounded-2xl border border-line bg-surface ${className}`}>
      <figcaption className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5 font-mono text-xs text-muted">
        <span aria-hidden="true" className="size-2 rounded-full bg-(--teal)" />
        <span className="text-fg">{fileName}</span>
        {meta && <span className="ml-auto truncate">{meta}</span>}
      </figcaption>
      <pre className="overflow-x-auto py-3 font-mono text-[0.7rem] leading-[1.7] [font-variant-ligatures:none] sm:text-[0.8rem]">
        <code className="block sm:min-w-max">
          {lines.map((line, index) => (
            <span key={index} className="code-line flex pr-4">
              <span aria-hidden="true" className="w-[calc(var(--digits)*1ch+1.25rem)] shrink-0 select-none pr-3 sm:w-[calc(var(--digits)*1ch+2rem)] sm:pr-4 text-right text-muted" style={{ '--digits': digits }}>
                {index + 1}
              </span>
              <span className="min-w-0 whitespace-pre-wrap break-words sm:whitespace-pre">
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={TOKEN_CLASS[token.type]}>
                    {token.text}
                  </span>
                ))}
                {/* Keeps empty lines one line tall. */}
                {line.length === 0 && ' '}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
