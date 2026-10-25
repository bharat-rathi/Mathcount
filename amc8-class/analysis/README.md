# What the AMC 8 actually tests

This analysis covers 100 problems: the 2018, 2019, 2020 and 2022 papers, as linked from the
mathschool.com AMC 8 page. The 2024 PDF is a scan with no text layer, and the 2023 PDF was
too large to fetch, so both are excluded. 2021 had no contest.

Each problem got one primary skill tag, assigned by reading it (see `tags.py`; run
`python3 tags.py` for the counts). Tags are a judgement call, and many problems mix skills.

## Topic share vs. the current course

| Area | Share of real problems | Share of current course (topics) |
|---|---|---|
| Geometry (area, circles, Pythagoras, 3D, coordinates, similar triangles, spatial) | 21% | 26% (6 of 23) |
| Counting & probability | 19% | 13% (3) |
| Arithmetic: fractions, percents, ratios | 16% | 22% (5) |
| Statistics & reading graphs | 11% | 4% (1) |
| **Logic & puzzles** | **11%** | **0%** |
| Number theory | 9% | 22% (5) |
| Algebra & sequences | 9% | 13% (3) |
| Rates & word problems | 4% | 4% (1) |

## Findings

1. **About a fifth of the test isn't taught at all.** That's 22 of 100 problems:
   logic and puzzles (11), interpreting graphs (4), similar triangles and area ratios (3),
   spatial reasoning such as reflections and cube views (2), Venn diagrams (1) and custom
   operations (1).
2. **Logic is the biggest single category**, and 5 of its 11 problems are in the hard band
   (#18–25). Examples: seating constraints, magic grids, working backwards through a
   process, and simulations.
3. **Number theory is over-weighted.** The course spends 5 topics (22%) on it, but it is
   only 9% of the real problems.
4. **Counting and probability are under-weighted.** They're the second-largest area (19%)
   and the most common topic among hard problems (8 of 32), but get only 3 topics.
5. **Statistics shows up mostly through charts.** In 6 of the 11 stats and graphs problems,
   the student first has to read a bar chart, dot plot, scatter plot or distance–time graph.
   The app shows no charts.
6. **Angles and polygons: zero problems in this sample.** It can shrink to a smaller unit.
7. **Hard problems (#18–25) are mostly counting with casework, logic, and similar
   triangles.** Those are the areas to target for boss battles and the hand-made set of hard problems.
