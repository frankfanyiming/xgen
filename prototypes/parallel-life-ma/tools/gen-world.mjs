// 从 Lite 世界包 JSON 生成 world.js（export const WORLD = …）。内容原样照搬，不做任何改写。
// 用法：node tools/gen-world.mjs [世界包.json] [输出.js]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = '/tmp/claude-0/-home-user-xgen/61dff879-9f88-5ed2-80a0-37aef5f6ef93/scratchpad/lite/world-package.lite.json';
const src = process.argv[2] || SRC;
const out = process.argv[3] || fileURLToPath(new URL('../world.js', import.meta.url));

const raw = readFileSync(src, 'utf8');
const pkg = JSON.parse(raw);
if (pkg.schema !== 'lite-1') throw new Error('不是 lite-1 世界包：' + src);

const body = JSON.stringify(pkg, null, 1);
// 往返校验：生成的对象必须和源 JSON 完全一致
if (JSON.stringify(JSON.parse(body)) !== JSON.stringify(pkg)) throw new Error('序列化往返不一致');

const head = `// 由 tools/gen-world.mjs 从 world-package.lite.json 原样生成，不要手改。\n// 世界：${pkg.universe.title}（${pkg.universe.key}），节点 ${pkg.nodes.length} 个，人物 ${pkg.cast.length} + 配角 ${pkg.supporting.length}。\n`;
writeFileSync(out, `${head}export const WORLD = ${body};\n`);
console.log(`写好了 ${out}（${Math.round(Buffer.byteLength(body) / 1024)} KB）`);
