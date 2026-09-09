# GeM-Intel Browser Extension

This directory contains the Chrome/Edge extension source for GeM-Intel. It serves as a secure, lightweight, cryptographic evidence-capture and officer-assistance client.

## Architecture Rules
1. **No Intelligence Engine in Extension**: The extension does NOT calculate FMV, perform risk assessments, or make Gemini API calls. 
2. **Deterministic Evidence Only**: Extracts DOM context as an input for the secure backend scraping queue.
3. **Thin API Layer**: Connects ONLY to the specific BFF (Backend-For-Frontend) routes configured on the backend at `/api/v1/extension/*`.

## Building
To build the extension for local testing in Google Chrome:

```sh
node build-extension.mjs
```

Then, open Chrome, navigate to `chrome://extensions`, enable "Developer mode", and click "Load unpacked", selecting the `dist-extension` directory.

## File Structure
- `src/background/`: Background service workers for auth/state management.
- `src/content/`: `gem-detector.ts` (DOM Extraction).
- `src/popup/`: React interface for displaying Risk Cards, status, and verification hashes.
