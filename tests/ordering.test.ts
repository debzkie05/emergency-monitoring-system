import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sortIncidentsForQueue,
  getTopCriticalIncident,
  getReportCount,
  formatWaitingTime,
} from '../src/utils/ordering.ts';
import type { Incident } from '../src/types/index.ts';

describe('Ordering and Queue Logic', () => {
  const baseIncident = (id: string, overrides: Partial<Incident> = {}): Partial<Incident> => ({
    id,
    type: 'medical',
    status: 'reported',
    createdAt: '2026-10-11T10:00:00.000Z',
    reports: [],
    ...overrides,
  });

  test('Sorts primarily by severity: Critical > High > Moderate', () => {
    const list: Partial<Incident>[] = [
      baseIncident('INC-MOD', { type: 'hazard', createdAt: '2026-10-11T08:00:00.000Z' }), // Moderate, waited long
      baseIncident('INC-CRIT', { type: 'medical', createdAt: '2026-10-11T11:00:00.000Z' }), // Critical, recent
      baseIncident('INC-HIGH', { type: 'accident', createdAt: '2026-10-11T09:00:00.000Z' }), // High
    ];

    const sorted = sortIncidentsForQueue(list);
    assert.strictEqual(sorted[0].id, 'INC-CRIT');
    assert.strictEqual(sorted[1].id, 'INC-HIGH');
    assert.strictEqual(sorted[2].id, 'INC-MOD');
  });

  test('Sorts same severity by longest waiting time (oldest createdAt first)', () => {
    const list: Partial<Incident>[] = [
      baseIncident('INC-2', { type: 'medical', createdAt: '2026-10-11T10:05:00.000Z' }),
      baseIncident('INC-1', { type: 'medical', createdAt: '2026-10-11T10:00:00.000Z' }), // waited longer
      baseIncident('INC-3', { type: 'medical', createdAt: '2026-10-11T10:10:00.000Z' }),
    ];

    const sorted = sortIncidentsForQueue(list);
    assert.strictEqual(sorted[0].id, 'INC-1');
    assert.strictEqual(sorted[1].id, 'INC-2');
    assert.strictEqual(sorted[2].id, 'INC-3');
  });

  test('Breaks ties in waiting time with higher linked reports count', () => {
    const list: Partial<Incident>[] = [
      baseIncident('INC-FEW', {
        type: 'medical',
        createdAt: '2026-10-11T10:00:00.000Z',
        reports: [{ id: 'R1' } as any],
      }),
      baseIncident('INC-MANY', {
        type: 'medical',
        createdAt: '2026-10-11T10:00:00.000Z',
        reports: [{ id: 'R1' } as any, { id: 'R2' } as any, { id: 'R3' } as any],
      }),
    ];

    const sorted = sortIncidentsForQueue(list);
    assert.strictEqual(sorted[0].id, 'INC-MANY');
    assert.strictEqual(sorted[1].id, 'INC-FEW');
  });

  test('Breaks ties in reports count with incident ID deterministically', () => {
    const list: Partial<Incident>[] = [
      baseIncident('INC-B', { type: 'medical', createdAt: '2026-10-11T10:00:00.000Z' }),
      baseIncident('INC-A', { type: 'medical', createdAt: '2026-10-11T10:00:00.000Z' }),
    ];

    const sorted = sortIncidentsForQueue(list);
    assert.strictEqual(sorted[0].id, 'INC-A');
    assert.strictEqual(sorted[1].id, 'INC-B');
  });

  test('Safely handles missing or invalid timestamps without throwing or inventing values', () => {
    const list: Partial<Incident>[] = [
      baseIncident('INC-VALID', { type: 'medical', createdAt: '2026-10-11T10:00:00.000Z' }),
      baseIncident('INC-MISSING', { type: 'medical', createdAt: undefined }),
      baseIncident('INC-INVALID', { type: 'medical', createdAt: 'not-a-date' }),
    ];

    const sorted = sortIncidentsForQueue(list);
    // Established alert with valid timestamp should come before missing/invalid fallback
    assert.strictEqual(sorted[0].id, 'INC-VALID');
  });

  test('Guarantees banner and siren pick the exact same top critical incident', () => {
    const list: Partial<Incident>[] = [
      baseIncident('INC-ACK', { type: 'medical', status: 'acknowledged', createdAt: '2026-10-11T09:00:00.000Z' }),
      baseIncident('INC-CRIT-1', { type: 'security', status: 'reported', createdAt: '2026-10-11T10:01:00.000Z' }),
      baseIncident('INC-CRIT-2', { type: 'fire', status: 'reported', createdAt: '2026-10-11T10:03:00.000Z' }),
    ];

    const topForSiren = getTopCriticalIncident(list);
    const sorted = sortIncidentsForQueue(list).filter(
      (i) => i.status === 'reported' && i.type === 'security'
    );

    assert.ok(topForSiren);
    assert.strictEqual(topForSiren.id, 'INC-CRIT-1');
  });

  test('Correctly reports report count never inventing counts', () => {
    assert.strictEqual(getReportCount({ reports: [] }), 1);
    assert.strictEqual(getReportCount({}), 1);
    assert.strictEqual(getReportCount({ reports: [{ id: '1' } as any, { id: '2' } as any] }), 2);
  });

  test('Formats waiting time cleanly MM:SS', () => {
    const now = 1000000;
    const created123sAgo = new Date(now - 123 * 1000).toISOString();
    assert.strictEqual(formatWaitingTime(created123sAgo, now), '02:03');

    const created42sAgo = new Date(now - 42 * 1000).toISOString();
    assert.strictEqual(formatWaitingTime(created42sAgo, now), '00:42');
  });

  test('Freezes waiting duration once an alert is acknowledged', () => {
    const createdTime = '2026-10-11T10:00:00.000Z';
    const ackTime = '2026-10-11T10:02:15.000Z'; // Acknowledged after 2m 15s

    const incident: Partial<Incident> = {
      id: 'INC-FROZEN',
      status: 'acknowledged',
      createdAt: createdTime,
      updatedAt: ackTime,
      statusHistory: [
        { status: 'reported', timestamp: createdTime },
        { status: 'acknowledged', timestamp: ackTime },
      ],
    };

    // Even if measured 1 hour later, duration remains frozen at 02:15
    const oneHourLater = new Date('2026-10-11T11:00:00.000Z').getTime();
    const formatted = formatWaitingTime(incident, oneHourLater);

    assert.strictEqual(formatted, '02:15', 'Waiting duration must freeze at acknowledgment timestamp');
  });
});
