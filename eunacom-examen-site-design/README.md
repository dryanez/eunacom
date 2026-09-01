# eunacom-examen-site-design

The alternative look: the design bundle (`EUNACOM Sitio.html`) ported page for
page — eleven pages driven by in-page state, kept for comparison against the
main site in `../eunacom-examen-site`.

Run both at once to compare:

    cd eunacom-examen-site        && npm run dev   # http://localhost:5173
    cd eunacom-examen-site-design && npm run dev   # http://localhost:5174

Only the main site deploys. This one is a local reference; if we adopt it,
point the Vercel project's root directory here.

Its pages are generated — edit the design or `scripts/`, then:

    npm run design
