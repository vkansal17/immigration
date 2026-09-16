# Harbor

Harbor is an infrastructure-free, static progressive web app for people and families starting to navigate U.S. immigration information. It provides:

- Curated links to official USCIS, Department of State, USA.gov, DOJ, and employment-verification sources
- A pathway orientation tool for family, work, humanitarian, and other routes
- A browser-local case, document, and deadline tracker
- JSON export/import backups for the tracker
- An offline app shell through a service worker

## Run locally

No package installation or build step is required. Serve this directory with any static web server so the service worker can run:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>. The app can also be deployed directly to a static host such as GitHub Pages.

## Privacy and limitations

Tracker entries are stored with `localStorage` in the browser you are using. Harbor has no backend, database, analytics, login, or data pipeline. Exported JSON backups are unencrypted files; store and share them carefully. Clearing browser data or using a different browser/device will not carry entries over unless you export and import a backup.

Harbor is an educational directory and planning aid, not legal advice. It does not determine eligibility, provide legal representation, or publish live immigration news. Source cards link to official pages and show their source and review date; confirm current requirements, fees, forms, deadlines, and policy directly with the linked agency. For case-specific help, use a licensed attorney or a DOJ-accredited representative.

## Validation

The JavaScript syntax can be checked without dependencies:

```bash
node --check app.js
node --check sw.js
```
