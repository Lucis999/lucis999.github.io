# Oil research portfolio integration

The oil project now links to and embeds a public, same-origin snapshot at
`dist/wti-research/`. Its source is the sanitized Dashboard release
`da8016896c107e2986318895ab2d45965e5ce5d4`. The separate Sites research workspace
keeps its existing private audience; public portfolio visitors do not need to
authenticate there.

The copied exhibit retains all four chapters, evidence downloads, the 23-page
report and one-page summary. Only the wrapper is adapted: `?embed=portfolio`
hides duplicate page chrome, keeps chapter navigation visible and scrolls inside
the frame; `?period=2026#market` opens the 2026 market record. The original
`atlas.js`, world-map data, background CSS and motion controls are unchanged.

The project page and project cards are generated from `projects-data.json` by
`scripts/update-projects.mjs`; `scripts/oil-feature.mjs` renders the 2026 evidence
panel and iframe from `oil-research-context.json`. Oil is now in the launched
project gallery. Existing projects retain their content; pagination is updated.

2026 is explicitly a partial-year, frozen historical study, not a live signal.
Its 211 WTI observations end 3 November 2026. Separate 2026 forecast and range
scores are included, but there is no causal attribution of the price surge or
claim it was predicted in advance. New model gains remain small and uncertain.

Run `node scripts/update-projects.mjs` and `node scripts/check-site.mjs` before
publishing. Check the iframe, 2026 entry link, report downloads and unchanged
globe background in a browser. Original academic files containing identifiers
are not included in the public snapshot.
