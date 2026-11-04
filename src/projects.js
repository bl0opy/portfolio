const img = (file, alt) => ({ src: `assets/projects/${file}`, alt });

// One entry per mixer channel. Each stop is a detent on that channel's fader, bottom to top.
export const CONTENT = [
  {
    title: 'Voice Agent',
    tag: 'Python, Swift, on-device speech',
    stops: [
      { label: 'WHAT', text: 'Voice-native Claude Code, living in the MacBook notch. Hold a key, talk through code out loud, and Claude Code does the actual work underneath.' },
      { label: 'HOW', text: 'Hold right option, speak, let go. Speech runs on the machine both ways, with no API key. The same notch watches every other Claude Code session, so an agent stuck on a permission prompt shows up where you are.' },
      { label: 'SEE', images: [img('voice-focus.jpg', 'The notch panel with a permission prompt and a spoken answer'), img('voice-agents.jpg', 'The notch panel listing every running session')] },
    ],
  },
  {
    title: 'Mic Iso',
    tag: 'Python, real-time DSP',
    stops: [
      { label: 'WHAT', text: 'Real-time and offline voice isolation for close-talking microphones. It keeps the primary speaker and removes background voices, room noise and bleed.' },
      { label: 'HOW', text: 'It exploits the proximity effect: a close cardioid mic picks up far more 80 to 300 Hz energy from the speaker than from distant voices. That band drives an adaptive gate on the highs, followed by a noise gate for cleanup.' },
      { label: 'SEE', images: [img('mic-iso-spectrogram.jpg', 'Spectrogram of raw audio beside the gated output')] },
    ],
  },
  {
    title: 'Floor Piano',
    tag: 'Python, OpenCV, FastAPI',
    stops: [
      { label: 'WHAT', text: 'A playable piano projected on the floor. A camera tracks where you step and plays the note in real time. Part of Emanate, with an official installation at the 2026 MMBC Conference.' },
      { label: 'HOW', text: 'MOG2 background subtraction finds foot contacts. A homography maps the angled camera view to top-down space, so key detection does not depend on resolution. FastAPI streams video and key events to the browser.' },
      { label: 'SEE', images: [img('emanate.jpg', 'The Emanate wordmark')] },
      { label: 'LINKS', links: [
        { label: 'Source code', url: 'https://github.com/bl0opy/floor-piano' },
        { label: 'emanate.studio', url: 'https://www.emanate.studio/' },
        { label: 'Emanate gesture synth demo', url: 'https://youtube.com/shorts/_eDrTClHqNM?feature=share' },
      ] },
    ],
  },
  {
    title: 'synqd',
    tag: 'Swift, Supabase, Postgres',
    stops: [
      { label: 'WHAT', text: 'An iOS app for long-distance couples. Home and lock screen widgets show your partner’s local time, status and location at a glance.' },
      { label: 'HOW', text: 'A real-time sync backend built on Postgres, edge functions and APNs pushes partner location updates in under a second. It launched on TestFlight to 30 users in the first week.' },
      { label: 'SEE', images: [img('synqd-app.jpg', 'The synqd app showing a partner card'), img('synqd-widget.jpg', 'The synqd home screen widget')] },
      { label: 'LINKS', links: [{ label: 'mysynqd.com', url: 'https://mysynqd.com/' }] },
    ],
  },
  {
    title: 'Descant',
    tag: 'Electron, Monaco, Python',
    stops: [
      { label: 'WHAT', text: 'A desktop code editor with Claude Code in the side panel. An editor first: the agent is there when you want it and out of the way when you don’t.' },
      { label: 'HOW', text: 'Monaco handles editing in about 90 languages, with ripgrep search, a source-control panel and a terminal on the same folder. Electron starts the Python backend itself.' },
      { label: 'LINKS', links: [{ label: 'Source code', url: 'https://github.com/bl0opy/descant-ide' }] },
    ],
  },
  {
    title: 'Solo.ai',
    tag: 'Swift, Python, on-device ML',
    stops: [
      { label: 'WHAT', text: 'A privacy-first iOS chat app that scrubs personal data on the device before any cloud LLM sees it.' },
      { label: 'HOW', text: 'A local model detects personal information, reformulates sensitive prompts to the minimum necessary context, and escalates high-risk ones to you. A hybrid pipeline cut response start from about 20s to 2.7s, checked by an 89-test suite.' },
      { label: 'SEE', images: [img('soloai.jpg', 'The Solo.ai app icon')] },
    ],
  },
];
