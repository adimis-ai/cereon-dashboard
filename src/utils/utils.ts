// apps/cereon-demo-client/dashboard/utils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Primitive = string | number | boolean | null | undefined;
type JSONLike = Primitive | JSONObject | JSONArray;
interface JSONObject {
  [k: string]: JSONLike;
}
interface JSONArray extends Array<JSONLike> {}

const PLACEHOLDER_RE = /\$\{\{\s*([^}]+?)\s*\}\}/g; // ${{ expr }}
const SINGLE_PLACEHOLDER_RE = /^\s*\$\{\{\s*([^}]+?)\s*\}\}\s*$/;

/**
 * Resolve ${{ ... }} placeholders in a JSON-like structure.
 * Supported grammar: root `runtime` followed by dot/bracket access with optional `?.`
 * `runtime.` is a virtual root. Evaluate against { runtime: runtimeParams }.
 * Examples:
 *   - runtime.limit
 *   - runtime.annotations[1]?.jobId
 *   - runtime['foo'][0]
 * No function calls. No arithmetic. No global access.
 */
export function resolveParamPlaceholders<T>(
  value: T,
  runtimeParams: Record<string, unknown> | undefined | null
): T {
  const root = (runtimeParams ?? {}) as Record<string, unknown>;
  const ctx: Ctx = { runtime: root };

  const visit = (node: any): any => {
    if (typeof node === "string") return resolveInString(node, ctx);
    if (Array.isArray(node)) return node.map(visit);
    if (isPlainObject(node)) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) out[k] = visit(v);
      return out;
    }
    return node;
  };

  return visit(value);
}

type Ctx = {
  runtime: Record<string, unknown>;
};

function resolveInString(str: string, ctx: Ctx): any {
  const singleMatch = str.match(SINGLE_PLACEHOLDER_RE);
  if (singleMatch && singleMatch[1] !== undefined) {
    const resolved = safeResolvePath(singleMatch[1].trim(), ctx);
    return resolved === undefined ? null : resolved;
  }

  return str.replace(PLACEHOLDER_RE, (_: string, expr: string) => {
    const v = safeResolvePath((expr ?? "").trim(), ctx);
    return stringifyForInterpolation(v);
  });
}

function stringifyForInterpolation(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

/**
 * Resolve expr like "runtime.a?.b[0]['c']" against ctx with strict rules.
 * Returns undefined if blocked or not found.
 */
function safeResolvePath(expr: string, ctx: Ctx): unknown {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return undefined;

  const first = tokens[0]!;
  if (first.type !== "ident" || first.value !== "runtime") return undefined;

  let cur: any = ctx.runtime;

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i] as Token;

    if (t.type === "optional") {
      const next = tokens[i + 1] as Token | undefined;
      if (
        cur == null &&
        next &&
        (next.type === "ident" ||
          next.type === "index" ||
          next.type === "stringIndex")
      ) {
        return undefined;
      }
      continue;
    }

    if (t.type === "ident") {
      if (cur == null) return undefined;
      cur = cur[t.value];
      continue;
    }

    if (t.type === "index") {
      if (cur == null) return undefined;
      const idx = t.value;
      if (!Array.isArray(cur)) {
        cur = (cur as any)?.[idx];
      } else {
        cur = cur[idx];
      }
      continue;
    }

    if (t.type === "stringIndex") {
      if (cur == null) return undefined;
      cur = (cur as any)?.[t.value];
      continue;
    }
  }

  return cur;
}

type Token =
  | { type: "ident"; value: string }
  | { type: "optional" } // from "?."
  | { type: "index"; value: number }
  | { type: "stringIndex"; value: string };

/** Tiny tokenizer for the supported subset. */
function tokenize(expr: string): Token[] {
  const src = expr.trim();
  const out: Token[] = [];
  let i = 0;

  const pushIdent = (s: string) => {
    if (!s) return;
    out.push({ type: "ident", value: s });
  };

  // initial identifier
  let identBuf = "";
  while (i < src.length && /[A-Za-z0-9_$]/.test(src.charAt(i))) {
    identBuf += src.charAt(i);
    i++;
  }
  if (identBuf) pushIdent(identBuf);

  while (i < src.length) {
    const ch = src.charAt(i);

    // optional chaining
    if (ch === "?" && src.charAt(i + 1) === ".") {
      out.push({ type: "optional" });
      i += 2;
      continue;
    }

    // dot access
    if (ch === ".") {
      i++;
      let buf = "";
      while (i < src.length && /[A-Za-z0-9_$]/.test(src.charAt(i))) {
        buf += src.charAt(i);
        i++;
      }
      if (buf) out.push({ type: "ident", value: buf });
      continue;
    }

    // bracket access
    if (ch === "[") {
      i++;
      while (i < src.length && /\s/.test(src.charAt(i))) i++;

      if (src.charAt(i) === "'" || src.charAt(i) === '"') {
        const quote = src.charAt(i);
        i++;
        let s = "";
        while (i < src.length && src.charAt(i) !== quote) {
          s += src.charAt(i);
          i++;
        }
        i++;
        while (i < src.length && /\s/.test(src.charAt(i))) i++;
        if (src.charAt(i) === "]") i++;
        out.push({ type: "stringIndex", value: s });
        continue;
      }

      let numBuf = "";
      let sign = "";
      if (src.charAt(i) === "-") {
        sign = "-";
        i++;
      }
      while (i < src.length && /[0-9]/.test(src.charAt(i))) {
        numBuf += src.charAt(i);
        i++;
      }
      while (i < src.length && /\s/.test(src.charAt(i))) i++;
      if (src.charAt(i) === "]") i++;
      const n = Number(sign + numBuf);
      if (Number.isInteger(n)) out.push({ type: "index", value: n });
      continue;
    }

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    break;
  }

  return out;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (Object.prototype.toString.call(v) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
