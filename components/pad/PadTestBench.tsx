"use client";

import { useState } from "react";
import { guessPad } from "@/lib/actions/pad";
import type { PadGuess } from "@/lib/types";
import { buttonClass } from "@/components/ui/Button";
import { resizePhoto } from "./resize";

type Row = {
  name: string;
  type: string;
  kb: number;
  jpegKb?: number;
  expected: string;
  guess?: PadGuess;
  ms?: number;
  error?: string;
};

/** "full-jam-1.jpg" → expects "full". Name test photos light-/moderate-/full-… */
const expectedFrom = (name: string) => name.toLowerCase().match(/light|moderate|full/)?.[0] ?? "?";

/** Dev-only: runs the real resize + guessPad() path on a batch of photos and prints what came back. */
export function PadTestBench() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  async function run(files: FileList) {
    setRunning(true);
    const out: Row[] = [];
    for (const f of Array.from(files)) {
      const row: Row = { name: f.name, type: f.type || "unknown", kb: Math.round(f.size / 1024), expected: expectedFrom(f.name) };
      out.push(row);
      setRows([...out]);
      try {
        const jpeg = await resizePhoto(f);
        row.jpegKb = Math.round(jpeg.size / 1024);
        const form = new FormData();
        form.append("photo", jpeg, "pad.jpg");
        const t0 = performance.now();
        row.guess = await guessPad(form);
        row.ms = Math.round(performance.now() - t0);
      } catch (err) {
        row.error = String(err);
      }
      setRows([...out]);
    }
    setRunning(false);
  }

  const done = rows.filter((r) => r.guess || r.error);
  const correct = done.filter((r) => r.guess?.soak === r.expected).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10">
      <h1 className="font-serif text-5xl text-blue">pad check test bench</h1>
      <p className="max-w-[65ch] text-muted">
        dev only. pick the photos in <code>design/test-pads/</code> (name them light-…, moderate-…, full-…). each one goes through the
        same browser resize and <code>guessPad()</code> call as Pad Check. nothing is saved. the server terminal shows Gemini&apos;s errors.
      </p>
      <label className={buttonClass("solid-blue", "md", "self-start")}>
        {running ? "running…" : "choose test photos"}
        <input type="file" accept="image/*" multiple className="sr-only" disabled={running} onChange={(e) => e.target.files && run(e.target.files)} />
      </label>
      {done.length > 0 && (
        <p className="font-bold" role="status">
          {correct} of {done.length} soak guesses matched the file name.
        </p>
      )}
      <div className="overflow-x-auto rounded-inner border border-line bg-card">
        <table className="w-full min-w-[46rem] text-left text-sm tabular-nums">
          <thead className="bg-paper">
            <tr>
              {["file", "type", "size", "sent", "expected", "soak", "clot", "ok", "time", "error"].map((h) => (
                <th key={h} scope="col" className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">{r.kb} KB</td>
                <td className="px-3 py-2">{r.jpegKb != null ? `${r.jpegKb} KB jpeg` : "…"}</td>
                <td className="px-3 py-2">{r.expected}</td>
                <td className={`px-3 py-2 font-bold ${r.guess && r.guess.soak === r.expected ? "text-mustard" : ""}`}>{r.guess?.soak ?? "–"}</td>
                <td className="px-3 py-2">{r.guess?.clot ?? "–"}</td>
                <td className="px-3 py-2">{r.guess ? String(r.guess.ok) : "…"}</td>
                <td className="px-3 py-2">{r.ms != null ? `${(r.ms / 1000).toFixed(1)}s` : ""}</td>
                <td className="px-3 py-2 text-red">{r.error ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
