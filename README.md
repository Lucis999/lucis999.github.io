# lucis999.github.io
Lucis Li — Data &amp; Business Analytics Portfolio

## Hotel Security

The Hotel Security decision-support demo is hosted at /hotel-security/ and appears in the Home and My Projects galleries. It shares portfolio navigation, fonts and globe background. Sources contains only Report PDF and Presentation PDF, both privacy-redacted; original editable documents and other source artifacts are not published. Simulation code matches the validated standalone prototype. Run node scripts/update-projects.mjs and node scripts/check-site.mjs to regenerate and validate portfolio pages.

## Project entry transitions

Launched projects are ordered Vancouver Road Safety, EEG, Mortgage Financial Planner, Crude Oil Research, Hotel Security, and Movie Night. Clicking a project starts a short theme-specific canvas transition, then opens the original destination. The transition is decorative and synthetic. Skip or Escape navigates immediately; reduced-motion settings, paused portfolio motion, modified clicks, downloads and new-tab links preserve standard navigation. A capture-phase listener prevents the existing generic fade from pre-empting the project animation. Page exit cancels pending frames/timers, and a timeout provides a navigation fallback.

Run node scripts/check-project-transitions.mjs for route interception, motion/navigation safety and exact gallery order checks. Browser QA covered all six themes and destinations, automatic cleanup, Skip/Escape, paused motion and a 390px mobile viewport.
