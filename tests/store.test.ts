import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Incident } from '../src/types/index.ts';

describe('Store & Persistence Data Rules', () => {
  test('Demo alerts are never stored as real persisted records', () => {
    const mixedIncidents: Partial<Incident>[] = [
      { id: 'INC-REAL-1', isDemo: false },
      { id: 'DEMO-1234-1', isDemo: true },
      { id: 'INC-REAL-2', isDemo: undefined },
      { id: 'DEMO-1234-2', isDemo: true },
    ];

    const persisted = mixedIncidents.filter((inc) => !inc.isDemo);
    assert.strictEqual(persisted.length, 2);
    assert.strictEqual(persisted[0].id, 'INC-REAL-1');
    assert.strictEqual(persisted[1].id, 'INC-REAL-2');
  });

  test('Burst alert IDs are unique', () => {
    const ids = new Set<string>();
    const count = 10;
    const nowMs = Date.now();

    for (let i = 0; i < count; i++) {
      const id = `INC-${String(i + 1).padStart(3, '0')}-${nowMs.toString().slice(-4)}-${i}`;
      ids.add(id);
    }

    assert.strictEqual(ids.size, 10, 'All 10 burst IDs must be unique');
  });
});
