# Stable Matching Visualizer

<p align="right">
  <strong>English</strong> |
  <a href="README.pt-BR.md">Português (Brasil)</a>
</p>

Stable Matching Visualizer is an educational webtool for studying stable matching models with step-by-step execution, synchronized tables/graphs, algorithm-aware counters, and empirical complexity curves.

🔗 Live demo: https://brunogrisci.github.io/stablematching
🔗 GitHub repository: https://github.com/BrunoGrisci/stable-matching-visualizer

![Overview of the Stable Matching Visualizer](overview.png)

## Features

- Five scenarios in one interface:
  - Stable Marriage (classic one-to-one).
  - Good and Bad Categories.
  - Forbidden Pairs.
  - Resident Matching (capacities and bounded applications).
  - Stable Roommates (Irving's algorithm).
- Scenario-aware algorithm execution:
  - Gale-Shapley engine for two-sided scenarios.
  - Irving engine for Stable Roommates (Phase 1 proposals, Phase 1 reduction, Phase 2 rotation elimination).
  - Early return optimization in Irving when Phase 1 already ends with mutual top-choice pairs.
- Step controls and pacing:
  - `Run step`, `Auto run`, and `Run full`.
  - Adjustable auto speed.
  - Full step log with textual explanation.
- Curves and counters aligned with the selected algorithm:
  - Gale-Shapley scenarios: proposal-based curves/counters.
  - Stable Roommates: Irving operations `P + D + R` (proposals, preference deletions, rotations found).
- Synchronized visual learning views:
  - Preference tables with highlights, accepted/rejected states, and crossed-out deletions.
  - Bipartite graph for two-sided scenarios.
  - Complete circular graph for roommates, including dashed deleted edges and engagement/breakup markers (`O` / `∅`).
  - Dedicated Phase 2 rotation-trace panel for Irving (cycle construction + elimination progress).
- Pedagogical support:
  - Pseudocode with active-line highlighting.
  - Data-structure cards.
  - Correctness insights panel.
  - Built-in instance presets plus editable tables and CSV import/export.
- Usability and accessibility:
  - Light and dark themes.
  - English / Portuguese (Brazil) localization.
  - Resizable split panes and collapsible side panels.

## Pedagogical goals

- Make deferred acceptance and rotation elimination concrete and inspectable.
- Compare different matching models under a unified UI while preserving each model’s algorithmic semantics.
- Connect pseudocode operations to visible state changes in tables, graph edges, counters, and logs.
- Support classroom demonstrations with deterministic presets and reproducible execution traces.
- Encourage empirical complexity analysis using built-in curve benchmarks.

## Tech stack

- HTML5
- CSS3 (custom responsive styling)
- Vanilla JavaScript (ES6+)

## Project structure

- `stablematching.html`: main entry page.
- `stablematching/css/style.css`: complete UI styling.
- `stablematching/js/i18n.js`: EN / pt-BR localization dictionary.
- `stablematching/js/algorithms.js`: Gale-Shapley and Irving engines, generators, CSV parser/exporter.
- `stablematching/js/main.js`: UI state, rendering, controls, stepping, and curves workflow.

## Usage

1. Open `stablematching.html` in a browser (or serve the repository with a static server).
2. Choose a `Scenario` and an `Instance preset`, then click `Load instance`.
3. Run the algorithm with `Run step`, `Auto run`, or `Run full`.
4. Inspect pseudocode, data structures, preference tables, graph updates, and correctness insights.
5. Use the `Curves` tab to benchmark random/inverse/easy/worst-case families.

## CSV format

Header:

```csv
group,name,prefs,capacity,category
```

Supported row types:

- `men` / `women` (aliases: `m`, `w`, `man`, `woman`)
- `roommates` (aliases: `roommate`, `r`)
- `forbidden,man,woman`

Rules:

- `prefs` uses `|` separators.
- `capacity` applies to two-sided scenarios (default `1`).
- `category` supports `good` / `bad` in Good/Bad scenario.
- In roommates rows, `capacity` and `category` are ignored.

Minimal roommates CSV example:

```csv
group,name,prefs,capacity,category
roommates,A,B|D|F|C|E,,
roommates,B,D|E|F|A|C,,
roommates,C,D|E|F|A|B,,
roommates,D,F|C|A|E|B,,
roommates,E,F|C|D|B|A,,
roommates,F,A|B|D|C|E,,
```

## Credits

Developed by Prof. Bruno Iochins Grisci  
Departamento de Informática Teórica  
Instituto de Informática – Universidade Federal do Rio Grande do Sul (UFRGS)  
🔗 https://brunogrisci.github.io/  
🔗 https://www.inf.ufrgs.br/site/  
🔗 https://www.ufrgs.br/site/

## Development note

This webtool was created with the assistance of Generative AI (GPT-5.3-Codex).

## References

**Main references**
- Gale, David; Shapley, Lloyd S. "College Admissions and the Stability of Marriage." *The American Mathematical Monthly* 69(1), 1962.
- Kleinberg, Jon; Tardos, Éva. *Algorithm Design*. Addison-Wesley (Pearson), 2005.
- Irving, Robert W. "An efficient algorithm for the stable roommates problem." *Journal of Algorithms* 6(4), 1985. https://doi.org/10.1016/0196-6774(85)90033-1

**Other references**
- Princeton Gale-Shapley demo: https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/01DemoGaleShapley.pdf
- Stable Marriage Problem (Numberphile): https://www.youtube.com/watch?v=Qcv1IqHWAzg
- Stable roommates problem (Wikipedia): https://en.wikipedia.org/wiki/Stable_roommates_problem
- Irving's Algorithm and Stable Roommates Problem: https://www.youtube.com/watch?v=5QLxAp8mRKo

## License

This project is licensed under the MIT License.  
You are free to use, modify, and redistribute it for academic and educational purposes, provided proper attribution is given.  
See the LICENSE file for details.

## Citation

If you use this tool in academic work (papers, theses, technical reports, or teaching material), please cite it as:

Grici, Bruno Iochins. *Stable Matching Visualizer*. Web educational tool, 2026. Available at: https://github.com/BrunoGrisci/stable-matching-visualizer

```bibtex
@misc{grisci_stable_matching_visualizer_2026,
  author       = {Bruno Iochins Grisci},
  title        = {Stable Matching Visualizer},
  year         = {2026},
  howpublished = {\url{https://github.com/BrunoGrisci/stable-matching-visualizer}},
  note         = {Educational web tool}
}
```

## See also

**Karatsuba Multiplication Visualizer**  
Web app: https://brunogrisci.github.io/karatsuba  
Repository: https://github.com/BrunoGrisci/karatsuba_visualization  
Educational webtool for comparing classroom multiplication and Karatsuba with step-by-step decomposition and operation curves.

**Cashier's Algorithm Game**  
Web app: https://brunogrisci.github.io/cashiers  
Repository: https://github.com/BrunoGrisci/cashiers_algorithm_game  
Educational game comparing Greedy and Dynamic Programming for the change-making problem.

**Projeto e Análise de Algoritmos (INF05027/INF05028)**  
Repository: https://github.com/BrunoGrisci/projeto-e-analise-de-algoritmos  
Repository of codes and examples for INF05027 and INF05028 courses at UFRGS.
