MYCAT + MP3 / NEW SYNTHETIC DEMO KIT
These files are newly generated fixtures, not historical evidence.

CASE 1: MyCAT-original.pdf is the baseline PDF (605 bytes).
MyCAT.jpg contains identical PDF bytes with a misleading JPG extension.
Expect PDF / Mismatch, then export a PDF copy and re-upload: PDF / Consistent.
PDF SHA-256: e122feb3d4f66ee78f8d21707f54913c1ff823ccb9643f3dfe6b16b071a8efd6

CASE 2: File05-synthetic is a REAL encoded MP3 with its extension omitted.
File05-synthetic-original.mp3 contains the identical bytes with a normal extension.
Expect MP3 / Missing extension, then export and re-upload: MP3 / Consistent.
Content: two generated sine tones (440 Hz then 660 Hz), low amplitude, faded edges.
No speech, music, personal recordings, scripts or executable payloads.
Source duration 2.4 seconds; decoded MP3 duration about 2.43 seconds including encoding delay.
44.1 kHz, stereo, 128 kbps. 38,870 bytes.
MP3 SHA-256: 21bfba866fff15f3c3154b981fd0a7293a9d25523b13576d0e845564016801d8
Browser playback and full recovery workflow tested. Not historical File05.
Generator: tools/generate-audio.mjs; provenance: audio-provenance.json.

CASE 3: unknown-control.bin is unsupported plain content. Expect Unconfirmed.
No recovery extension is suggested for an unconfirmed type.

On the webpage, Use MyCAT Example and Use MP3 Example work without downloading.
Only the known bundled synthetic audio is offered for playback, based on its SHA-256.
All other uploads are inspected as bytes; they are not executed or rendered.
Recovery exports identical bytes with a suggested extension; it does not repair damaged data.
