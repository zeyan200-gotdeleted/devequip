const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

type Rule = [RegExp, string | ((m: string) => string)];

function tokenize(source: string, rules: Rule[]) {
  const combined = new RegExp(rules.map(([re]) => `(${re.source})`).join('|'), 'g');
  const groupOffsets: number[] = [];
  let offset = 1;
  for (const [re] of rules) {
    groupOffsets.push(offset);
    offset += 1 + new RegExp(`${re.source}|`).exec('')!.length - 1;
  }

  let out = '';
  let last = 0;
  for (const m of source.matchAll(combined)) {
    out += escapeHtml(source.slice(last, m.index));
    const ruleIndex = groupOffsets.findIndex((g) => m[g] !== undefined);
    const cls = rules[ruleIndex][1];
    const className = typeof cls === 'function' ? cls(m[0]) : cls;
    out += `<span class="${className}">${escapeHtml(m[0])}</span>`;
    last = m.index! + m[0].length;
  }
  return out + escapeHtml(source.slice(last));
}

const KEYWORDS =
  'const|let|var|function|class|return|export|import|default|from|as|async|await|new|if|else|for|while|switch|case|break|continue|try|catch|throw|null|undefined|package|type|interface|implements|extends|public|private|static|local|then|end|elseif|in|not|and|or|nil|true|false|do|repeat|until|self';
const TYPES =
  'string|number|boolean|any|void|Instance|Vector3|Vector2|CFrame|Color3|UDim2|UDim|Enum|TweenInfo|game|workspace|script';

const jsonRules: Rule[] = [
  [/"(?:\\.|[^\\"])*"(?=\s*:)/, 'syntax-keyword'],
  [/"(?:\\.|[^\\"])*"/, 'syntax-string'],
  [/\b(?:true|false|null)\b/, 'syntax-type'],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'syntax-number'],
];

const htmlRules: Rule[] = [
  [/<!--[\s\S]*?-->/, 'syntax-comment'],
  [/<\/?[a-zA-Z0-9:-]+/, 'syntax-tag'],
  [/\s[a-zA-Z0-9:@-]+=(?=["'])/, 'syntax-attr'],
  [/"[^"]*"|'[^']*'/, 'syntax-string'],
];

const cssRules: Rule[] = [
  [/\/\*[\s\S]*?\*\//, 'syntax-comment'],
  [/[a-zA-Z-]+(?=\s*:)/, 'syntax-keyword'],
  [/[.#a-zA-Z0-9:-]+(?=\s*\{)/, 'syntax-function'],
  [/"[^"]*"|'[^']*'/, 'syntax-string'],
  [/-?\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?\b/, 'syntax-number'],
];

const LINE_COMMENT: Record<string, RegExp> = {
  lua: /--[^\n]*/,
  luau: /--[^\n]*/,
  py: /#[^\n]*/,
  sh: /#[^\n]*/,
  yml: /#[^\n]*/,
  yaml: /#[^\n]*/,
  toml: /#[^\n]*/,
  dockerfile: /#[^\n]*/,
};

const luaLongRules: Rule[] = [
  [/--\[(?:\[[\s\S]*?\]\]|=\[[\s\S]*?\]=\])/, 'syntax-comment'],
  [/\[(?:\[[\s\S]*?\]\]|=\[[\s\S]*?\]=\])/, 'syntax-string'],
];

const codeRules = (ext: string, withTags: boolean): Rule[] => [
  ...(ext === 'lua' || ext === 'luau' ? luaLongRules : []),
  [LINE_COMMENT[ext] ?? /\/\/[^\n]*/, 'syntax-comment'],
  [/\/\*[\s\S]*?\*\//, 'syntax-comment'],
  [/`[\s\S]*?`|"(?:\\.|[^\\"\n])*"|'(?:\\.|[^\\'\n])*'/, 'syntax-string'],
  ...(withTags ? ([[/<\/?[A-Za-z][\w:-]*/, 'syntax-tag']] as Rule[]) : []),
  [new RegExp(`\\b(?:${KEYWORDS})\\b`), 'syntax-keyword'],
  [new RegExp(`\\b(?:${TYPES})\\b`), 'syntax-type'],
  [/[a-zA-Z_$][\w$]*(?=\()/, 'syntax-function'],
  [/\b\d+(?:\.\d+)?\b/, 'syntax-number'],
];

export function highlight(content: string, filename: string) {
  const lower = filename.toLowerCase();
  const ext = lower === 'dockerfile' ? 'dockerfile' : (lower.split('.').pop() ?? '');
  if (ext === 'json') return tokenize(content, jsonRules);
  if (ext === 'html' || ext === 'xml' || ext === 'svg') return tokenize(content, htmlRules);
  if (ext === 'css') return tokenize(content, cssRules);
  if (ext === 'md' || ext === 'txt') return escapeHtml(content);
  return tokenize(content, codeRules(ext, ext === 'vue'));
}
