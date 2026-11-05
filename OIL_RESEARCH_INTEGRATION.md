# Oil research portfolio integration

The oil project now links to and embeds a public, same-origin snapshot at
`dist/wti-research/`. Its source is the sanitized Dashboard release
`cfc79256aba21b58c6b512450d849df1021e44af`. The separate Sites research workspace
keeps its existing private audience; public portfolio visitors do not need to
authenticate there.

The exhibit now follows a continuous visualization-first layout: 2026 context,
Shipping Lab, conditional price, question and evidence, models, reliability,
then limitations. There is no chapter-tab navigation. The 22-page report remains
available; the separate illustrated summary has been removed from hosted files
and links. `?embed=portfolio` hides duplicate chrome and reports body height to
the same-origin Portfolio wrapper, avoiding an internal scrolling panel.
The original globe assets and motion controls are unchanged.

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
