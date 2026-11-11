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
