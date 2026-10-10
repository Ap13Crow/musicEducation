import { buildAffinity, creatorSurname, rankRecommendations, scoreItem, type RecItem } from '../lib/libraryRecommendations';

const item = (id: string, overrides: Partial<RecItem> = {}): RecItem => ({ id, creator: null, instruments: [], musicStyles: [], skillLevels: [], ...overrides });
const violinist = { instruments: ['Violin'], musicStyles: ['Baroque'], skillLevel: 'INTERMEDIATE' };
const noHistory = buildAffinity([]);

describe('library recommendations', () => {
  it('reads surnames in both name orders', () => {
    expect(creatorSurname('Schubert, Franz (1797-1828). Compositeur')).toBe('schubert');
    expect(creatorSurname('Franz Schubert')).toBe('schubert');
    expect(creatorSurname('Antonín Dvořák')).toBe('dvorak');
    expect(creatorSurname('J. S. Bach')).toBe('bach');
    expect(creatorSurname('Cain, Joe. Direction')).toBe('cain');
    expect(creatorSurname(null)).toBeNull();
  });

  it('scores profile matches and explains them', () => {
    const rec = scoreItem(item('a', { instruments: ['Violin'], musicStyles: ['Baroque'], skillLevels: ['INTERMEDIATE'] }), violinist, noHistory);
    expect(rec).toEqual({ id: 'a', score: 9, reasons: ['For violin', 'Baroque, a style you like'] });
  });

  it('skips what does not match and what is far above the level', () => {
    expect(scoreItem(item('b', { instruments: ['Trumpet'] }), violinist, noHistory)).toBeNull();
    expect(scoreItem(item('c', { instruments: ['Violin'], skillLevels: ['PROFESSIONAL'] }), violinist, noHistory)).toBeNull();
  });

  it('learns composers and styles from reading history, and never repeats it', () => {
    const history = [
      { item: item('h1', { creator: 'Schubert, Franz', musicStyles: ['Romantic'], instruments: ['Voice'] }), weight: 3 },
      { item: item('h2', { creator: 'Franz Schubert', musicStyles: ['Romantic'] }), weight: 3 },
    ];
    const affinity = buildAffinity(history);
    const blank = { instruments: [], musicStyles: [], skillLevel: null };
    expect(scoreItem(item('h1', { creator: 'Schubert, Franz' }), blank, affinity)).toBeNull();
    expect(scoreItem(item('n1', { creator: 'Franz Schubert', musicStyles: ['Romantic'] }), blank, affinity)?.reasons).toEqual(['More by Schubert']);
    expect(scoreItem(item('n2', { creator: 'Robert Schumann', musicStyles: ['Romantic'], instruments: ['Voice'] }), blank, affinity)?.reasons).toEqual([
      "Romantic, like what you've been reading",
    ]);
  });

  it('ranks by score and keeps at most two per composer', () => {
    const candidates = [
      item('1', { creator: 'J. S. Bach', instruments: ['Violin'], musicStyles: ['Baroque'] }),
      item('2', { creator: 'J. S. Bach', instruments: ['Violin'], musicStyles: ['Baroque'] }),
      item('3', { creator: 'J. S. Bach', instruments: ['Violin'], musicStyles: ['Baroque'] }),
      item('4', { creator: 'Vivaldi', instruments: ['Violin'] }),
      item('5', { creator: 'Satie', instruments: ['Piano'] }),
    ];
    const picks = rankRecommendations(candidates, violinist, noHistory, 10, '2026-10-10');
    expect(picks).toHaveLength(3);
    expect(picks.filter((pick) => ['1', '2', '3'].includes(pick.id))).toHaveLength(2);
    expect(picks[picks.length - 1].id).toBe('4');
  });
});
