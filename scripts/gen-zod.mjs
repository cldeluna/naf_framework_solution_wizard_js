// Regenerate src/types/wizardPayload.ts from the canonical JSON Schema.
// The schema is generated from the Pydantic models in the original repo
// (scripts/gen_schema.py). To update: copy the fresh wizard_payload.schema.json
// into src/types/, then run: npm run gen:types
import fs from "node:fs";
import { execSync } from "node:child_process";

const SRC = "src/types/wizard_payload.schema.json";
const OUT = "src/types/wizardPayload.ts";
const s = JSON.parse(fs.readFileSync(SRC, "utf8"));
const defs = s.$defs || {};

function deref(o, seen = new Set()) {
  if (Array.isArray(o)) return o.map((x) => deref(x, seen));
  if (o && typeof o === "object") {
    if (o.$ref) {
      const name = o.$ref.replace("#/$defs/", "");
      if (seen.has(name)) return {};
      return deref(defs[name], new Set([...seen, name]));
    }
    const out = {};
    for (const [k, v] of Object.entries(o)) {
      if (k === "$defs") continue;
      if (k === "allOf" && v.length === 1) { Object.assign(out, deref(v[0], seen)); continue; }
      out[k] = deref(v, seen);
    }
    return out;
  }
  return o;
}

// Pydantic's default_factory fields (every section object, every list) emit no
// "default" in the JSON Schema, so the converter would make them merely
// .optional(). Mirror the Python behavior instead: an object property without
// a default defaults to {} (its own field defaults then apply), an array to [].
// => WizardPayloadSchema.parse({}) yields a fully-defaulted payload.
function addDefaults(node) {
  if (Array.isArray(node)) { node.forEach(addDefaults); return; }
  if (!node || typeof node !== "object") return;
  for (const prop of Object.values(node.properties || {})) {
    if (prop && typeof prop === "object" && !("default" in prop)) {
      if (prop.type === "object") prop.default = {};
      else if (prop.type === "array") prop.default = [];
    }
    addDefaults(prop);
  }
  if (node.items) addDefaults(node.items);
}

const flat = deref(s);
addDefaults(flat);
fs.writeFileSync("/tmp/schema_deref.json", JSON.stringify(flat));
execSync(`npx --yes json-schema-to-zod -i /tmp/schema_deref.json -o ${OUT}`, { stdio: "inherit" });

let ts = fs.readFileSync(OUT, "utf8");
// Zod 4: .default(x) returns x unparsed, so nested field defaults would not
// apply; .prefault(x) parses the default through the schema (Zod 3 behavior).
ts = ts.replaceAll(".default({})", ".prefault({})");
ts = ts.replace("export default", "export const WizardPayloadSchema =");
ts += '\nexport type WizardPayload = z.infer<typeof WizardPayloadSchema>;\n';
ts = "// GENERATED FILE — do not edit. Run `npm run gen:types` (see scripts/gen-zod.mjs).\n" + ts;
fs.writeFileSync(OUT, ts);
console.log(`wrote ${OUT}`);
