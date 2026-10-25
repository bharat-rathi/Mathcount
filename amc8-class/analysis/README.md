# What the AMC 8 actually tests

This analysis covers **200 problems: every AMC 8 from 2018 to 2026** (there was no 2021 contest).

- **2018, 2019, 2020 and 2022** were read from the PDFs linked on mathschool.com.
- **2023–2026** were read from live.poshenloh.com/past-contests, which hosts the papers
  with MAA permission. That site also gives each problem a difficulty rating.

Each problem got one primary skill tag, assigned by reading it (see `tags.py`; run
`python3 tags.py` for the counts). Tags are a judgement call, and many problems mix skills.

## Topic share vs. the current course

| Area | Real problems (200) | Avg difficulty 2023–26 | Current course |
|---|---|---|---|
| Geometry (incl. similar triangles, spatial) | 47 (23.5%) | 1224 | 26% |
| Arithmetic: fractions, percents, ratios | 32 (16%) | 783 (easiest) | 22% |
| Counting & probability | 32 (16%) | **1526 (hardest)** | 13% |
| **Logic & puzzles** | **23 (11.5%)** | 1455 | **0%** |
| Algebra & sequences | 21 (10.5%) | 1258 | 13% |
| Number theory | 20 (10%) | 1379 | 22% |
| Statistics & reading graphs | 16 (8%) | 1126 | 4% |
| Rates | 9 (4.5%) | 1296 | 4% |

## How other sources compare

- **gonit.app syllabus:** geometry about 25%, arithmetic and word problems about 25%,
  counting 16%, algebra 16%, number theory 12%. It counts logic as part of word problems.
  The MAA publishes no official syllabus.
- **Think Academy, 2025 paper:** geometry 9, word problems 6, number theory 5,
  combinatorics 2, probability and statistics 3.
- **ACE Academy, 2026 paper:** arithmetic, algebra and word problems 9, geometry 5,
  counting and probability 5, number theory 3. Five problems were highlighted as needing
  "logic-oriented reasoning across topic boundaries".
- **AoPS AMC 8/MATHCOUNTS course (36 lessons):** includes digit problems, base-n numbers,
  inclusion–exclusion and Venn diagrams, casework, overcounting, and geometric
  probability. Our course has none of these yet.

## Findings

1. **Logic and puzzles are 11.5% of the test and the course teaches none of it.**
   Examples: ordering clues, filling grids and circles, tiling and parity,
   extremal/"least possible" arguments, and pairing tricks.
2. **Counting and probability are the hardest area** (average rating 1526), and counting
   is the most common topic in problems #18–25. It needs more classes: casework,
   systematic listing, lattice paths and distributions.
3. **Similar triangles and area ratios** show up 6 times, all in the hard band.
4. **Number theory is over-weighted**: 22% of the course for 10% of the test. It still
   matters, since its problems are fairly hard.
5. **Arithmetic is about 16% of the test but the easiest area.** Speed and accuracy work
   here protects points; heavy teaching isn't needed.
6. **Reading charts:** 6 problems need a chart or graph read before any math.
7. **Angles and polygons barely appear** as a standalone topic.

## Facts for planning

- The **2027 AMC 8 runs January 21–27, 2027** (ACE Academy).
- **2026 cutoffs:** Honor Roll 21, Distinguished Honor Roll 24, average score 12.42
  (gonit and ACE). Reaching Honor Roll means almost no careless errors on #1–15.
