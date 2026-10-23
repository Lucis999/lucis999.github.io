# Publish Lucis Portfolio

The website is static and uses relative links. The deployable site is in `dist/`.

## Repository setup

1. Use the authenticated GitHub account to locate any existing personal website repository before creating a new one.
2. Copy the reviewed website source into that repository: `dist/`, `scripts/`, `projects-data.json`, and `.github/workflows/pages.yml`.
3. Do not copy local Git metadata, `.openai/`, credentials, uploads or intermediate files. The course reports and spreadsheets are not part of this website.
4. Set the repository's Pages publishing source to **GitHub Actions**.
5. Push the reviewed source to `main`, or run the workflow manually.
6. Wait for a successful Pages deployment and verify the actual returned public URL, navigation, logos, project pages and resume download.

## Update projects

Edit the content fields in `projects-data.json`. Each project includes an explicit contribution field and pending materials. Run:

```sh
node scripts/update-projects.mjs
node scripts/check-site.mjs
```

The publication workflow regenerates project pages, checks links and JavaScript, and deploys only `dist/`.

Original academic reports and spreadsheets are intentionally excluded. Current resume and contact links are included in the site as approved by the owner.

GitHub references:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
