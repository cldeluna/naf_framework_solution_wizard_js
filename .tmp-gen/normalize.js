const HTML_TAG_RE = /<[^>]+>/g;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HARD_TEXT_CAP = 1e5;
function cleanText(value) {
  return value.replace(HTML_TAG_RE, "").replace(CONTROL_RE, "").trim().slice(0, HARD_TEXT_CAP);
}
function walk(value) {
  if (typeof value === "string") return cleanText(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null) continue;
      out[k] = walk(v);
    }
    return out;
  }
  return value;
}
function clampStrings(value, max) {
  if (typeof value === "string") return value.slice(0, max);
  if (Array.isArray(value)) return value.map((v) => clampStrings(v, max));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, clampStrings(v, max)])
    );
  }
  return value;
}
function normalizePayload(raw) {
  const data = walk(raw);
  if (!data || typeof data !== "object") return data;
  const stakeholders = data["stakeholders"];
  const choices = stakeholders?.["choices"];
  if (choices && typeof choices === "object") {
    for (const [cat, v] of Object.entries(choices)) {
      if (typeof v === "string") choices[cat] = v ? [v] : [];
      else if (!Array.isArray(v)) choices[cat] = [];
    }
  }
  const ini = data["initiative"];
  if (ini && !ini["use_case"] && typeof ini["expected_use"] === "string" && ini["expected_use"]) {
    ini["use_case"] = ini["expected_use"];
  }
  return data;
}
function clampAll(raw, max = HARD_TEXT_CAP) {
  return clampStrings(raw, max);
}
export {
  HARD_TEXT_CAP,
  clampAll,
  cleanText,
  normalizePayload
};
