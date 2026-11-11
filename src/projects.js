// One entry per mixer channel. Each stop is a detent on that channel's fader, top to bottom.
export const CONTENT = [
  {
    title: 'Claude Notch',
    tag: 'Swift, Python, Claude Code',
    stops: [
      {
        label: 'WHAT',
        text: 'A companion for Claude Code in the MacBook notch. It watches every session on the Mac, the desktop app\'s included, and brings what needs you to the notch: permission prompts to answer, each session\'s chat, a line when a long turn ends, and replies typed from any app.',
      },
      {
        label: 'ARCH',
        text: 'Three processes on separate ports, so any one can die without taking the others down. The daemon and notch run at login.',
        specs: [
          ['Shell', 'SwiftUI notch panel, approval cards, hotkeys'],
          ['Daemon', 'Roster, approval inbox, hosted ptys; ws :8767, tcp :8766, http :8768'],
          ['Hook', 'notch_hook.py in each session, one question and one answer over tcp'],
          ['Voice', 'pipecat pipeline, ws :8765, paused'],
        ],
      },
      {
        label: 'SPEECH',
        text: 'It started as a voice agent, and the speech pipeline is still in the repo, off by default for now. Both directions run locally, and hold-to-talk marks the end of a turn, so the model only transcribes a bounded buffer on key-up. Measured on an M1 Max:',
        specs: [
          ['STT', 'parakeet-tdt-0.6b-v3 on MLX'],
          ['Key-up to text', '57 ms for 0.7 s of audio, 86 ms for 3.4 s'],
          ['TTS', 'Kokoro-82M via ONNX, about 4x realtime'],
          ['First audio', '269 to 709 ms, by sentence length'],
        ],
      },
      { label: 'LINKS', links: [{ label: 'Source code', url: 'https://github.com/bl0opy/claude-notch' }] },
    ],
  },
  {
    title: 'synqd',
    tag: 'Swift, WidgetKit, Supabase',
    stops: [
      {
        label: 'WHAT',
        text: 'Paired iOS app and widgets that share a partner’s live time, status and location. Live on the App Store since November 2026, after a TestFlight beta that reached 30 users in its first week and shipped their requests across 4+ builds.',
      },
      {
        label: 'SYNC',
        text: 'Postgres on Supabase is the source of truth. Location updates reach the partner in under a second.',
        specs: [
          ['Live', 'Realtime subscription on the partner’s profile row'],
          ['Background', 'DB trigger, Edge Function, silent APNs push'],
          ['Fallback', 'BGAppRefreshTask and scenePhase refresh'],
          ['Auth', 'Sign in with Apple, 6-character invite pairing via RPC'],
        ],
      },
      {
        label: 'WIDGET',
        text: 'The app and the WidgetKit extension are separate processes, so they share a model through an App Group.',
        specs: [
          ['Shared', 'JSON and UserDefaults in an App Group'],
          ['Surfaces', 'Medium and Lock Screen widgets'],
          ['Action', 'AppIntent sends a miss-you push from the widget'],
          ['Nudge', 'pg_cron nudges once if a miss-you goes unanswered'],
          ['Clips', 'Five-second clip takes over the widget until watched'],
          ['Streak', 'Daily clip streak shown as a flame on the widget'],
          ['State', 'Five states from each partner’s own wake and sleep hours'],
        ],
      },
      {
        label: 'LINKS',
        links: [
          { label: 'App Store', url: 'https://apps.apple.com/app/synqd/id6780106702' },
          { label: 'mysynqd.com', url: 'https://mysynqd.com/' },
        ],
      },
    ],
  },
  {
    title: 'Floor Piano',
    tag: 'Python, OpenCV, FastAPI',
    stops: [
      {
        label: 'WHAT',
        text: 'A playable projected piano, driven by a single webcam and classical computer vision. No ML dependencies. Installed at the 2026 MMBC Conference as part of Emanate.',
      },
      {
        label: 'CV',
        text: 'A background thread segments feet from the floor and resolves each contact to a key.',
        specs: [
          ['Segmentation', 'MOG2, history 300, no shadow detection'],
          ['Noise rejection', 'Contours under 800 px are discarded'],
          ['Calibration', 'Homography to top-down space, so key regions are resolution-independent'],
        ],
      },
      {
        label: 'STACK',
        text: 'One FastAPI server handles the video, the events and the sound.',
        specs: [
          ['Video', 'MJPEG stream, displayed in a plain img tag'],
          ['Events', 'WebSocket broadcast of key presses'],
          ['Audio', 'pygame.mixer additive synthesis, with optional WAV samples'],
          ['Input', 'USB webcam or RTSP/HTTP stream'],
        ],
      },
      {
        label: 'LINKS',
        links: [
          { label: 'Source code', url: 'https://github.com/bl0opy/floor-piano' },
          { label: 'emanate.studio', url: 'https://www.emanate.studio/' },
          { label: 'Live Demo', url: 'https://youtube.com/shorts/_eDrTClHqNM?feature=share' },
        ],
      },
    ],
  },
  {
    title: 'Solo.ai',
    tag: 'Swift, LiteRT-LM, on-device ML',
    stops: [
      {
        label: 'WHAT',
        text: 'iOS chat that runs a language model on the phone and scrubs personal data before any cloud LLM sees it. The privacy system is validated by an 89-test automated suite.',
      },
      {
        label: 'MODEL',
        text: 'Two inference providers behind one chat surface. A hybrid pipeline cut response start from about 20 s to about 2.7 s.',
        specs: [
          ['Local', 'Gemma 4 E4B via a custom Swift package over LiteRT-LM'],
          ['Streaming', 'Token by token through the Session API'],
          ['Cloud', 'Claude or GPT-4o over SSE'],
          ['Keys', 'Stored in the iOS Keychain'],
        ],
      },
      {
        label: 'TRUST',
        text: 'Every prompt passes through the local model first, in three tiers:',
        specs: [
          ['Detect', 'Finds personally identifiable information on-device'],
          ['Reformulate', 'Reduces sensitive prompts to the minimum necessary context'],
          ['Escalate', 'Sends high-risk prompts to the user for review'],
        ],
      },
    ],
  },
  {
    title: 'Mic Iso',
    tag: 'Python, NumPy, real-time DSP',
    stops: [
      {
        label: 'WHAT',
        text: 'Voice isolation for close-talking mics, without ML. It uses the proximity effect: a cardioid mic held close captures a large 80 to 300 Hz boost that distant voices and room noise lack.',
      },
      {
        label: 'CHAIN',
        text: 'Detection and gating run on different bands. Below 500 Hz always passes, so a false trigger only bleeds highs.',
        specs: [
          ['Sidechain', 'Bandpass 80 to 300 Hz, drives the gate'],
          ['Split', 'Crossover at 500 Hz'],
          ['Gated', 'High band only, then recombined'],
          ['Output', 'Fixed-threshold noise gate cleanup'],
        ],
      },
      {
        label: 'GATE',
        text: 'The adaptive gate tracks a noise floor that only falls, and opens at a multiple of it. Defaults, tuned in a Flask and Socket.IO gate lab:',
        specs: [
          ['Threshold', 'Floor x 5.0, starting at -60 dBFS'],
          ['Detector', '50 ms RMS window'],
          ['Envelope', '5 ms attack, 180 ms hold, 110 ms release'],
          ['Buffer', '512 samples at 44.1 kHz'],
        ],
      },
    ],
  },
  {
    title: 'Lockword',
    tag: 'AI tooling, not public yet',
    stops: [
      {
        label: 'WHAT',
        text: 'Line-level locks for AI agents. They can read what you lock and rewrite everything around it, but they can\'t change a locked word, and only a person can unlock one. It isn\'t public yet, so this covers what it does rather than how.',
      },
      {
        label: 'CODE',
        text: 'One comment locks a function, class, method or region, so agents can run without approving every edit. The same change always gets the same verdict, and anything it can\'t verify is rejected.',
        specs: [
          ['Mark', '# @lock, right in the code'],
          ['Agents', 'Claude Code and Codex are stopped before a locked edit lands'],
          ['Other tools', 'Cursor, Copilot, Aider and hand edits are caught at commit and push'],
          ['Pull requests', 'A required GitHub check, including PRs from cloud agents'],
        ],
      },
      {
        label: 'DOCS',
        text: 'A desktop app brings the same locks to documents, spreadsheets and slides. Hand AI the whole file and review only its suggestions.',
        specs: [
          ['Lock', 'A sentence, a clause, a cell or slide text'],
          ['Formats', 'DOCX, MD, TXT, XLSX, CSV, PPTX, PDF'],
          ['Review', 'Changes arrive inline as a diff to accept or reject'],
          ['Verify', 'Check any exported copy to see each lock is still intact'],
        ],
      },
    ],
  },
  {
    title: 'Ayan Chandrasekaran',
    code: 'MASTER',
    tag: 'CS and Music, Michigan',
    stops: [
      {
        label: 'ABOUT',
        text: 'I build at the intersection of software, hardware and sound. B.S. Computer Science at the University of Michigan with a minor in Music, graduating May 2028.',
        specs: [
          ['Languages', 'Python, TypeScript, C/C++, Swift, Java, SQL'],
          ['Focus', 'ML and computer vision, agentic systems, digital signal processing, real-time interfaces'],
        ],
      },
      {
        label: 'WORK',
        text: 'What I do outside these projects:',
        specs: [
          ['Smith+Nephew', 'ML and CV intern for surgical robotics, two summers. ResNet-50 pressure ulcer staging at 74% vs 67% clinician accuracy on high-confidence predictions'],
          ['Emanate', 'Founder. Interactive concert visuals in C++ and Python: gesture-controlled granular synthesis and projection mapping'],
          ['MMBC', 'Director of Creative Technology. Real-time visuals for a 500+ attendee conference'],
          ['Google Student Developers', 'Project Manager. Alert pipeline for HomeRise, a shelter network with 18 San Francisco locations'],
        ],
      },
      {
        label: 'LINKS',
        links: [
          { label: 'GitHub', url: 'https://github.com/bl0opy' },
          { label: 'LinkedIn', url: 'https://linkedin.com/in/ayanchan/' },
          { label: 'R\u00e9sum\u00e9', url: 'https://bl0opy.github.io/resume/' },
          { label: 'ayanchan@umich.edu', url: 'mailto:ayanchan@umich.edu' },
        ],
      },
    ],
  },
];

export const MASTER = CONTENT.length - 1;

// Lines under the name on the LED screen.
export const IDENTITY = ["University of Michigan '28", 'Computer Science', 'Programmer + Musician'];
