"""Regenerate illustrative charts. Requires Python + matplotlib.

Run from any directory: python docs/week6/generate_figures.py
CSV templates for real data are created only when absent, never overwritten.
"""
from pathlib import Path
import csv
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
(ROOT / 'assets').mkdir(exist_ok=True)
(ROOT / 'data').mkdir(exist_ok=True)
DATA = {
    'todo': ('Todo List', 24, [24, 21, 21, 13, 5, 0]),
    'study': ('Study Planner', 15, [15, 12, 12, 7, 3, 0]),
}
for slug, (title, total, remaining) in DATA.items():
    ideal = [round(total * (1 - day / 5), 1) for day in range(6)]
    with (ROOT / 'data' / f'{slug}-simulation.csv').open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['Day', 'Ideal', 'Actual_simulated', 'Data_type'])
        writer.writerows([f'D{d}', ideal[d], remaining[d], 'SIMULATED_NOT_TEAM_HISTORY'] for d in range(6))
    template = ROOT / 'data' / f'{slug}-actual-template.csv'
    if not template.exists():
        with template.open('w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['Day','Date','Initial_SP_confirmed_by_team','Ideal_remaining','Actual_remaining','Done_story_IDs','Scope_change_SP','Blocker','Owner','Recorded_at','Board_evidence'])
            writer.writerows([[f'D{d}'] + [''] * 10 for d in range(6)])
    fig, ax = plt.subplots(figsize=(10.5, 5.8), facecolor='#f7f8f2')
    ax.set_facecolor('#ffffff')
    ax.plot(range(6), ideal, linestyle='--', color='#93a18d', linewidth=2.4, label='Ideal remaining')
    ax.plot(range(6), remaining, color='#215f50', marker='o', markersize=8, linewidth=3, label='Actual (simulated)')
    for d, value in enumerate(remaining):
        ax.annotate(str(value), (d, value), xytext=(0, 10), textcoords='offset points', ha='center', fontsize=12, color='#173d37', weight='bold')
    ax.set_xlim(-.2, 5.2)
    ax.set_ylim(-1, total + 4)
    ax.set_xticks(range(6), [f'Day {d}' for d in range(6)])
    ax.set_yticks(range(0, total + 1, 3))
    ax.set_ylabel('Remaining story points', labelpad=12)
    ax.grid(axis='y', alpha=.2)
    ax.spines[['top','right']].set_visible(False)
    ax.spines[['bottom','left']].set_color('#cbd6c6')
    ax.tick_params(colors='#465b51')
    ax.legend(loc='upper right', frameon=False)
    fig.suptitle(f'{title} / 5-day sprint', x=.095, ha='left', fontsize=21, weight='bold', color='#173d37')
    fig.text(.095,.89,'SIMULATED EXAMPLE — not recorded team progress',fontsize=12,color='#9c6426')
    fig.text(.095,.035,'Count points only when the whole story meets the Definition of Done. Scope is fixed in this example.',fontsize=9,color='#596c64')
    fig.subplots_adjust(top=.81,bottom=.14,left=.095,right=.96)
    fig.savefig(ROOT / 'assets' / f'{slug}-burndown.svg')
    fig.savefig(ROOT / 'assets' / f'{slug}-burndown.png', dpi=150)
    plt.close(fig)
print('Created two simulated charts and CSVs; preserved any existing actual-data templates.')
