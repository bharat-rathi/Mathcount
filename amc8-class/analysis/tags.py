# Topic tags for AMC 8 2018, 2019, 2020 and 2022 (problems 1-25 each), assigned by reading the
# papers. One primary skill per problem. Tags matching an app topic use its id; NEW:* are gaps.
T = {
 2018: "ratios fractions NEW:logic area sequences rates divisibility stats area fractions probability ratios stats NEW:logic circles combos rates divisors counting NEW:similar remainders NEW:similar probability solids exponents",
 2019: "mental area fractions pythag NEW:graphs probability stats percents solids stats NEW:venn NEW:spatial NEW:logic remainders probability rates fractions probability NEW:logic equations coords percents gcflcm NEW:similar counting",
 2020: "ratios stats area sequences percents NEW:logic counting equations solids combos NEW:graphs mental probability stats percents NEW:logic divisors pythag divisibility NEW:logic counting NEW:logic counting area area",
 2022: "area NEW:customops divisors NEW:spatial equations sequences rates fractions sequences NEW:graphs NEW:logic probability counting combos NEW:graphs equations units coords stats NEW:logic percents NEW:logic counting solids probability",
 # 2023-2026 read from live.poshenloh.com/past-contests (hosted with MAA permission).
 2023: "mental NEW:spatial mental gcflcm ratios exponents coords NEW:logic NEW:graphs fractions rates circles fractions NEW:logic rates remainders NEW:spatial remainders NEW:similar stats counting sequences probability NEW:similar sequences",
 2024: "units fractions area sequences probability circles NEW:logic counting ratios sequences coords equations counting NEW:logic NEW:logic NEW:logic counting circles NEW:venn solids ratios circles gcflcm area probability",
 2025: "area mental ratios sequences coords remainders NEW:graphs solids stats area NEW:spatial circles remainders stats NEW:logic NEW:logic fractions NEW:similar rates sequences NEW:logic divisors gcflcm equations counting",
 2026: "mental mental pythag percents rates area fractions percents exponents NEW:logic circles NEW:logic pythag sequences NEW:spatial divisibility combos sequences rates counting probability NEW:logic circles units counting",
}
# Po-Shen Loh difficulty ratings (370 = easiest, ~2000 = hardest) for 2023-2026.
RATING = {
 2023: [370,660,450,960,720,900,1070,1020,1020,900,1100,1370,1240,1480,1410,1540,1580,1740,1410,1600,1690,1790,1840,1930,1950],
 2024: [370,450,720,770,960,1070,1310,1030,870,960,960,980,1310,1420,1540,1660,1410,1540,1170,1420,1340,1580,1810,1710,1950],
 2025: [720,450,660,720,960,900,770,960,1070,1220,1140,1280,1220,1170,1480,1650,1340,1310,1650,1580,1840,1710,1770,1840,1930],
 2026: [370,660,720,770,870,900,980,960,1040,1040,1120,1310,1330,1050,1450,1330,1450,1510,1450,1510,1590,1710,1690,1820,2000],
}
# Problems that need a genuinely multi-step or clever idea (my judgement), used for the "hard" analysis.
from collections import Counter, defaultdict
allc, band = Counter(), defaultdict(Counter)
for y, s in T.items():
    tags = s.split(); assert len(tags) == 25, (y, len(tags))
    for i, t in enumerate(tags, 1):
        b = 'easy 1-8' if i <= 8 else 'mid 9-17' if i <= 17 else 'hard 18-25'
        allc[t] += 1; band[b][t] += 1
groups = {
 'Number theory': ['divisibility','gcflcm','divisors','units','remainders'],
 'Arithmetic & fractions/percents/ratios': ['mental','fractions','percents','ratios','NEW:customops'],
 'Algebra & sequences': ['equations','exponents','sequences'],
 'Rates & word problems': ['rates'],
 'Counting & probability': ['counting','combos','probability','NEW:venn'],
 'Statistics & graphs': ['stats','NEW:graphs'],
 'Geometry': ['area','circles','pythag','coords','solids','NEW:similar','NEW:spatial','angles'],
 'Logic & puzzles': ['NEW:logic'],
}
N=sum(allc.values()); print(f'By group (of {N}):')
for g, ids in groups.items(): print(f'  {g:42s} {sum(allc[i] for i in ids):3d}')
print('\nBy tag:'); [print(f'  {t:16s} {n}') for t, n in allc.most_common()]
print(f'\nHard band (18-25, {sum(band["hard 18-25"].values())} problems):'); [print(f'  {t:16s} {n}') for t, n in band['hard 18-25'].most_common()]

# Average difficulty per group, 2023-2026 only.
gof = {t: g for g, ids in groups.items() for t in ids}
dif = defaultdict(list)
for y, r in RATING.items():
    for t, d in zip(T[y].split(), r): dif[gof.get(t, '?')].append(d)
print('\nAverage difficulty rating 2023-26 (higher = harder):')
for g, v in sorted(dif.items(), key=lambda kv: -sum(kv[1]) / len(kv[1])): print(f'  {g:42s} {sum(v)/len(v):6.0f}  (n={len(v)})')
