/**
 * Minimal ZIP writer (STORE method, no compression) — dependency-free.
 * Fine for our bundle sizes (JSON + Markdown + one PNG). Format per the
 * PKWARE APPNOTE; readable by every unzip tool.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(d: Date): { date: number; time: number } {
  return {
    date: (((d.getFullYear() - 1980) & 0x7f) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
  };
}

export interface ZipEntry {
  name: string;
  data: Uint8Array | string;
}

export function buildZip(entries: ZipEntry[]): Blob {
  const enc = new TextEncoder();
  const now = dosDateTime(new Date());
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const u16 = (v: number) => new Uint8Array([v & 0xff, (v >> 8) & 0xff]);
  const u32 = (v: number) => new Uint8Array([v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff]);
  const cat = (...parts: Uint8Array[]) => {
    const total = parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  };

  for (const e of entries) {
    const name = enc.encode(e.name);
    const data = typeof e.data === "string" ? enc.encode(e.data) : e.data;
    const crc = crc32(data);

    const local = cat(
      u32(0x04034b50), u16(20), u16(0x0800 /* UTF-8 names */), u16(0 /* STORE */),
      u16(now.time), u16(now.date), u32(crc), u32(data.length), u32(data.length),
      u16(name.length), u16(0), name, data,
    );
    chunks.push(local);

    central.push(cat(
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0),
      u16(now.time), u16(now.date), u32(crc), u32(data.length), u32(data.length),
      u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
    ));
    offset += local.length;
  }

  const centralStart = offset;
  const centralBytes = cat(...central);
  const end = cat(
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralBytes.length), u32(centralStart), u16(0),
  );

  return new Blob([cat(...chunks), centralBytes, end], { type: "application/zip" });
}
