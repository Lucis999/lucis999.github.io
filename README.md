# lucis999.github.io
Lucis Li — Data &amp; Business Analytics Portfolio

## Hotel Security

The Hotel Security decision-support demo is hosted at /hotel-security/ and appears in the Home and My Projects galleries. It shares portfolio navigation, fonts and globe background. Sources contains only Report PDF and Presentation PDF, both privacy-redacted; original editable documents and other source artifacts are not published. Simulation code matches the validated standalone prototype. Run node scripts/update-projects.mjs and node scripts/check-site.mjs to regenerate and validate portfolio pages.

## Project entry transitions

Launched projects are ordered Vancouver Road Safety, EEG, Mortgage Financial Planner, Crude Oil Research, Hotel Security, and Movie Night. Clicking a project starts a short theme-specific canvas transition, then opens the original destination. The transition is decorative and synthetic. Skip or Escape navigates immediately; reduced-motion settings, paused portfolio motion, modified clicks, downloads and new-tab links preserve standard navigation. A capture-phase listener prevents the existing generic fade from pre-empting the project animation. Page exit cancels pending frames/timers, and a timeout provides a navigation fallback.

Run node scripts/check-project-transitions.mjs for route interception, motion/navigation safety and exact gallery order checks. Browser QA covered all six themes and destinations, automatic cleanup, Skip/Escape, paused motion and a 390px mobile viewport.

## Cryptography & Financial Cybersecurity

The new project lives at `/cryptography/`, with an opening-animation replay page at `/cryptography-entry.html`. It reuses the existing globe, fonts, navigation and motion preferences. The English payment arena, guided experiment, algorithm comparison, migration planner and two verified redacted group papers are included. All account movement is synthetic; WebCrypto signatures, authenticated encryption and SHA-256 digests are real.

The shared `cipher` transition depicts a payment envelope passing through a symbolic machine. It is decorative, lasts about two seconds, supports Skip/Escape, and is bypassed for reduced or paused motion. The original six projects retain their order; the new card is seventh. This English edition is approved for publication through the existing GitHub Pages workflow.

## Shared project layout

All project pages use `dist/project-shell.css` and the idempotent `scripts/update-project-shells.mjs` presentation pass. The content frame is capped at 850px, with a common back link, responsive heading scale, previous/next project navigation and an external portfolio footer. Each project retains its research content, visual identity and interactive behavior. Crypto comparisons stack below 900px; their diagram labels are enlarged for the narrower desktop frame. Hotel context remains available in an expandable section.

`update-projects.mjs` applies this pass during every build. `check-project-shells.mjs` guards the common structure on all 12 canonical and legacy project pages. Browser QA covers desktop, iPad landscape/portrait, tablet and 390px/360px phones, including menus, navigation and representative interactions.

## WebSocket Security Lab

Published under `/websocket-security/`, with a decorative entry preview at `/websocket-entry.html`. It uses the existing portfolio globe, Inter / Space Grotesk / Cormorant fonts, shared navigation, 850px project frame, previous/next links, motion controls and footer. The new gallery card is grouped with the launched interactive projects; course and sample badges are omitted from the public interface.

The public GitHub Pages edition is a browser-local educational simulation. An isolated MessageChannel relay supports the six guided stories, two synthetic personas, free-play interception and session analytics without any external network connection or backend. TLS, authentication, origin validation and end-to-end integrity are modeled controls. The original standalone Node/WebSocket demo remains a separate local development artifact; this static edition makes no live WebSocket, packet-capture or historical-performance claims.

The original 2022 group work and the new 2026 reconstruction are labeled separately. Sources includes only `INCS690-public-redacted.pdf`: the verified 19-page public copy removes other students' names and all IDs, retains Yanqing Li (Lucis), and is reconstructed from sanitized page images with no hidden source text or attachments. No original unredacted file is published.

The `websocket` transition follows a message through a compromised relay and a symbolic integrity check. It is decorative and synthetic. Skip/Escape, reduced motion, paused motion and modified/new-tab clicks follow the existing transition behavior.

Validation: `node --test tests/websocket-security.test.mjs`, `node scripts/update-projects.mjs`, `node scripts/check-site.mjs`, `node scripts/check-project-transitions.mjs`, `node scripts/check-project-shells.mjs`. Browser acceptance covered all six scenarios, exact message outcomes, manual reverse-direction tampering, PDF hash, globe rendering, entry navigation/skip and widths 320–1440 pixels.
