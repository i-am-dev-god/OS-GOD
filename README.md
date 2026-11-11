# Lightlink

A browser-based prototype for transferring files using animated QR codes. It is a baseline for testing optical transfer, not the proposed high-speed custom visual grid.

## Use

1. Load the deployed site on **both phones while online**, and wait until each says “Ready for offline.” Offline caching requires HTTPS and browser support; browsers may evict cached files. Test airplane mode before relying on it.
2. Select Send on one device and Receive on the other. Choose a non-empty file up to 10 MiB and allow camera access on the receiver.
3. Point the receiver at the sender's screen. Frames repeat until all are read. If progress stalls, the receiver shows the first missing group number: type it into the sender to repeat that group. Repeat for other missing groups, or select Repeat all frames.
4. Once the SHA-256 hash matches, download the file. Keep both pages open; a reload or closing the page loses transfer progress.

The baseline uses ordinary QR error correction and repeats exact chunks. It does **not** use fountain codes, encryption, automatic feedback, or the planned custom visual grid. It has not been validated across physical devices; camera capture, performance, and offline support differ by browser. Anyone who can see the displayed codes can potentially reconstruct the file; don't use it for confidential files. SHA-256 detects corruption but doesn't authenticate the sender. Frame speed is configurable, and lower settings may work better. Larger files can take a long time.

## Development

Node 22: `npm ci`, `npm test`, `npm run dev`, `npm run build`. A relative base path supports GitHub Pages project URLs. The included workflow deploys to GitHub Pages after changes reach `main`, assuming Pages is configured for GitHub Actions and repository permissions permit deployment. The local Vite development server does not provide offline caching; use the production build to test it.

## Direct Wi-Fi mode (experimental)

The home page now offers WebRTC data-channel transfer (up to 100 MiB). Both devices must connect to the same Wi-Fi or hotspot. **Turn mobile data off on both devices**: a browser cannot reliably establish that a host candidate is using Wi-Fi rather than cellular. The app has no STUN or TURN servers, removes non-host ICE candidates, and checks selected local and remote candidates are host candidates before sending; this prevents relay use but cannot itself guarantee which network interface carries packets. Local networks may block device-to-device connectivity.

Both devices need internet access for signaling via the existing Supabase project's public Realtime Broadcast (connection details only, not file bytes). Each session uses a six-digit room code. This code is easy to guess and does not authenticate the peer. Both users must compare and confirm the additional six-digit safety number derived from WebRTC fingerprints before any file transfer. This provides only limited protection against impersonation, especially with a public signaling service; do not use this prototype for sensitive files. WebRTC encrypts data in transit; SHA-256 verifies received content but does not independently authenticate the sender. File hashing and receiving use memory proportional to file size. This mode has not been tested on physical phones; speed, network behavior, signaling reliability, and real device compatibility are unverified. The previous QR prototype remains in the code but is not the main flow.

## Updating the website

When online, the service worker fetches fresh navigation HTML and falls back to the cached page if the network is unavailable. When a new service worker takes over, the page offers an update button rather than interrupting a transfer. If an older installed version still shows a 16-character pairing code, open the site in a private browser tab or clear the site data, then reload while online. Both phones must use the same current version.
