// Voiceover for videos/demo/demo.mp4 with ElevenLabs: one clip per segment, placed at its start time,
// then mixed onto the video. Run from the repo root: node --env-file=.env videos/demo/tools/voiceover.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const VOICE = process.env.ELEVENLABS_VOICE ?? "JBFqnCBsd6RMkjVDRZzb"; // George: warm British narrator
const DIR = "videos/demo/vo";
const VIDEO = "videos/demo/demo.mp4";

// Start times match what is on screen in demo.mp4: terminal runs, case 110, case 206, the reality-sim run.
const SEGMENTS = [
  { at: 0.3, end: 14.8, text: "This is case-agent. It works repair cases for a letting agency, using Claude and seven tools. Here it runs the same oven repair twice: case 110, and case 206, where the tenant also mentions a smell of gas." },
  { at: 15.2, end: 26.0, text: "In case 110, the visit dates conflict. So it emails the contractor to confirm, tells the tenant it's checking, and waits." },
  { at: 26.4, end: 39.0, text: "Case 206 is different. It texts the tenant to leave and call the gas emergency line, then hands the case to a person: what it checked, what conflicts, and the one decision left." },
  { at: 39.4, end: 59.4, text: "Every tool call passes a guard in code first. We test it on practice cases with hidden answer sheets, cut at a decision point, so it never sees what happened next. And every action cites the event it answers, so each decision can be audited." },
];

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
mkdirSync(DIR, { recursive: true });

const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

const clips = await Promise.all(SEGMENTS.map(async (s, i) => {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ text: s.text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const file = `${DIR}/${i}.mp3`;
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  // A clip longer than its slot is sped up just enough to fit (never more than 1.25x).
  const tempo = Math.min(1.25, Math.max(1, dur(file) / (s.end - s.at)));
  console.log(`segment ${i}: ${dur(file).toFixed(1)} s for a ${(s.end - s.at).toFixed(1)} s slot, tempo ${tempo.toFixed(2)}`);
  return { file, at: s.at, tempo };
}));

const inputs = clips.flatMap((c) => ["-i", c.file]);
const chains = clips.map((c, i) => `[${i + 1}:a]atempo=${c.tempo.toFixed(3)},adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[a${i}]`);
const mix = `${chains.join(";")};${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad[a]`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", VIDEO, ...inputs, "-filter_complex", mix, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(dur(VIDEO)), "-movflags", "+faststart", `${DIR}/demo-vo.mp4`]);
console.log(`wrote ${DIR}/demo-vo.mp4`);
