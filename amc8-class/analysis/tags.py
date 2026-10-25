# Topic tags for AMC 8 2018, 2019, 2020 and 2022 (problems 1-25 each), assigned by reading the
# papers. One primary skill per problem. Tags matching an app topic use its id; NEW:* are gaps.
T = {
 2018: "ratios fractions NEW:logic area sequences rates divisibility stats area fractions probability ratios stats NEW:logic circles combos rates divisors counting NEW:similar remainders NEW:similar probability solids exponents",
 2019: "mental area fractions pythag NEW:graphs probability stats percents solids stats NEW:venn NEW:spatial NEW:logic remainders probability rates fractions probability NEW:logic equations coords percents gcflcm NEW:similar counting",
 2020: "ratios stats area sequences percents NEW:logic counting equations solids combos NEW:graphs mental probability stats percents NEW:logic divisors pythag divisibility NEW:logic counting NEW:logic counting area area",
 2022: "area NEW:customops divisors NEW:spatial equations sequences rates fractions sequences NEW:graphs NEW:logic probability counting combos NEW:graphs equations units coords stats NEW:logic percents NEW:logic counting solids probability",
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
print('By group (of 100):')
for g, ids in groups.items(): print(f'  {g:42s} {sum(allc[i] for i in ids):3d}')
print('\nBy tag:'); [print(f'  {t:16s} {n}') for t, n in allc.most_common()]
print('\nHard band (18-25, 32 problems):'); [print(f'  {t:16s} {n}') for t, n in band['hard 18-25'].most_common()]
