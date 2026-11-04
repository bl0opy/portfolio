# portfolio

Personal site, built as a three.js mixing console. Scroll moves between the name strip and six project channels. Each channel's fader, or the master knob on the name strip, steps through that section's content.

No build step. Three.js and fonts load from CDNs.

## Run

```bash
python tools/dev_server.py
```

Then open http://localhost:5199.

## Layout

| File | What it does |
|---|---|
| `src/projects.js` | All site copy and links. This is the file to edit. |
| `src/console.js` | The console scene, navigation, drag controls and meters. |
| `src/mixer.js` | Finish values, panel print, knobs, faders, tape and display. |
| `src/led.js` | LED screen: dot-matrix font and layouts. |
| `src/kit.js` | Shared geometry helpers and commit counts behind the meters. |
| `src/panel.js` | Side panel and the plain fallback page. |
| `src/sound.js` | Synthesized plug and knob sounds, the beat and the sound toggle. |
| `src/app.js` | Renderer, render loop and input wiring. |
| `src/main.js` | Loads the 3D app, or the fallback if it can't run. |
| `tools/dev_server.py` | Static server that also saves renders from `window.capture`. |

## Beat

`assets/audio/beat.mp3` loops quietly after the visitor's first click or key press, since browsers block audio before that. To swap the track, replace the file and set `BEAT_LENGTH` in `src/sound.js` to its length in seconds. The site runs without it.

## Other finishes

The earlier Vintage, Silver, Studio and object scenes are saved at the tag `vintage-metal-v1`.
