# stable-matching-visualizer

Interactive web tool for studying the Gale-Shapley algorithm (Stable Matching Problem), with step-by-step execution, graph animation, editable instances, and proposal curves.

## Features

- Full Gale-Shapley simulation with:
  - `Run step`
  - `Auto run` with speed control (`0.25x, 0.5x, 1x, 2x, 4x, 8x, 10x`)
  - `Run full` (jump directly to final state)
  - highlighted pseudocode line
  - data-structure panel (`w_rank`, free queue, `next_idx`, `engaged_to`)
  - step log
- Language toggle: English and Brazilian Portuguese.
- Theme toggle: light and dark mode.
- Resizable layout splitters and collapsible Control/Algorithm panels.
- Preference-table visualization:
  - two side-by-side tables
  - highlighted active proposer/receiver
  - partner rank markers
- Bipartite graph visualization:
  - men on one side, women on the other
  - directed preference edges
  - thicker edges for higher preference
  - golden edges for engaged pairs
  - engagement ring indicators
- Counters:
  - number of proposals
  - engaged pairs
  - single men
  - single women
- Instance sources:
  - HPL/SPL demo instance
  - HOMENS/MULHERES worst-case instance (labeled as `Worst case`)
  - random, inverse, and easy generators (custom `n`)
  - editable men/women tables
  - CSV import/export
- Curves tab (similar to `plot_curves` in `references/galeshapley.py`):
  - average proposals for random/inverse/easy/worst-case families
  - reference curves (`~n`, `~n(n+1)/2`, `~n^2`)
  - interactive toggles, point click tooltips, X-range selector, Y zoom
- Extra scenario menu:
  - good/bad categories
  - forbidden pairs
  - capacity-based receiver side (hospital-style extension)
- Group name customization for both sides (default: Men/Women).
- Correctness insights panel:
  - perfect matching status
  - unstable-pair check
  - termination bound check
  - proposer-optimal / receiver-pessimal note

## Main Files

- `galeshapley.html`
- `galeshapley/css/style.css`
- `galeshapley/js/i18n.js`
- `galeshapley/js/algorithms.js`
- `galeshapley/js/main.js`

## How To Run Locally

Use any static server. Example:

```bash
python3 -m http.server 4173
```

Then open:

- `http://127.0.0.1:4173/galeshapley.html`

## CSV Format

Supported CSV rows:

- `group,name,prefs,capacity,category`
- `forbidden,man,woman`

Where:

- `group` is `men` or `women`
- `prefs` uses `|` separator (example: `W1|W2|W3`)
- `capacity` is optional (default `1`)
- `category` is optional (`good` / `bad`)

Example:

```csv
group,name,prefs,capacity,category
men,M1,W2|W1|W3,1,good
men,M2,W1|W2|W3,1,bad
women,W1,M2|M1|M3,1,good
women,W2,M1|M2|M3,2,bad
forbidden,M1,W3
```

## Notes

- The app is static (`HTML/CSS/JavaScript`) and suitable for GitHub Pages hosting.
- For very large instances, graph rendering switches to a compact mode to remain responsive.

## License

MIT License. See `LICENSE`.
