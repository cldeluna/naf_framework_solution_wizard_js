// Validate naf_report_*.json export(s) against the payload contract:
// normalize (lenient load) -> Zod parse. Run via: npm run validate:export <file...>
import { readFileSync } from "node:fs";
import { WizardPayloadSchema } from "../src/types/wizardPayload";
import { normalizePayload } from "../src/types/normalize";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: npm run validate:export -- <naf_report_*.json> [...]");
  process.exit(2);
}

let failed = false;
for (const file of files) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  const res = WizardPayloadSchema.safeParse(normalizePayload(data));
  const name = file.split("/").pop();
  if (res.success) {
    console.log(
      "VALID  :", name,
      "| title:", JSON.stringify(res.data.initiative.title),
      "| milestones:", res.data.timeline.items.length,
    );
  } else {
    failed = true;
    console.log("INVALID:", name);
    for (const i of res.error.issues.slice(0, 6)) {
      console.log("   -", i.path.join("."), `[${i.code}]`, i.message);
    }
  }
}
process.exit(failed ? 1 : 0);
