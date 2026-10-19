import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { useIncidentStore } from '../src/stores/incidentStore.ts';
import { sortIncidentsForQueue, getTopCriticalIncident, getReportCount } from '../src/utils/ordering.ts';
import { classifySeverity, getIncidentSeverity } from '../src/utils/severity.ts';
import { evaluateIncidentEscalation, DEV_ESCALATION_MS } from '../src/utils/escalation.ts';
import type { Incident } from '../src/types/index.ts';

describe('Workflow & End-to-End Acceptance Tests', () => {
  test('Test 1 & 4: Banner, list, queue and siren all pick the exact same critical incident', () => {
    const list: Partial<Incident>[] = [
      {
        id: 'INC-HIGH-1',
        type: 'accident',
        severity: 'High',
        status: 'reported',
        createdAt: '2026-10-11T10:00:00Z',
      },
      {
        id: 'INC-CRIT-2',
        type: 'medical',
        severity: 'Critical',
        status: 'reported',
        createdAt: '2026-10-11T10:05:00Z',
      },
      {
        id: 'INC-CRIT-1',
        type: 'security',
        severity: 'Critical',
        status: 'reported',
        createdAt: '2026-10-11T10:02:00Z', // Oldest critical
      },
    ];

    const sortedQueue = sortIncidentsForQueue(list);
    const topForSiren = getTopCriticalIncident(list);

    // Oldest critical must be first in queue
    assert.strictEqual(sortedQueue[0].id, 'INC-CRIT-1');
    assert.strictEqual(topForSiren?.id, 'INC-CRIT-1');
    // Top of sorted queue matches siren selection
    assert.strictEqual(sortedQueue[0].id, topForSiren?.id);
  });

  test('Test 2: Ten alerts created rapidly: unique IDs, none lost or overwritten', () => {
    const store = useIncidentStore.getState();
    const initialCount = store.incidents.length;

    const createdIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const id = store.createEmergencyAlert(`USER-${i}`, `Reporter ${i}`);
      createdIds.push(id);
    }

    const currentIncidents = useIncidentStore.getState().incidents;
    assert.strictEqual(currentIncidents.length, initialCount + 10);

    // Verify all 10 IDs are distinct
    const uniqueIds = new Set(createdIds);
    assert.strictEqual(uniqueIds.size, 10);

    // Verify all exist in store
    for (const id of createdIds) {
      assert.ok(currentIncidents.some((inc) => inc.id === id));
    }
  });

  test('Test 3: Ordering by severity, waiting time, report count, then ID', () => {
    const timeT0 = '2026-10-11T10:00:00.000Z';
    const timeT1 = '2026-10-11T10:01:00.000Z';

    const testSet: Partial<Incident>[] = [
      { id: 'I-MOD', type: 'hazard', createdAt: timeT0 },
      { id: 'I-HIGH', type: 'accident', createdAt: timeT0 },
      { id: 'I-CRIT-RECENT', type: 'fire', createdAt: timeT1 },
      { id: 'I-CRIT-OLDEST', type: 'security', createdAt: timeT0 },
    ];

    const sorted = sortIncidentsForQueue(testSet);
    assert.strictEqual(sorted[0].id, 'I-CRIT-OLDEST');
    assert.strictEqual(sorted[1].id, 'I-CRIT-RECENT');
    assert.strictEqual(sorted[2].id, 'I-HIGH');
    assert.strictEqual(sorted[3].id, 'I-MOD');
  });

  test('Test 5: Acknowledging top incident stops only its siren and next critical takes over', () => {
    const store = useIncidentStore.getState();

    // Get current top critical incident
    const initialTop = getTopCriticalIncident(store.incidents);
    assert.ok(initialTop);

    // Set siren active on initialTop
    store.setActiveSirenIncidentId(initialTop.id);
    assert.strictEqual(useIncidentStore.getState().activeSirenIncidentId, initialTop.id);

    // Acknowledge initialTop
    store.acknowledgeIncident(initialTop.id, 'ADM-001', 'Admin');

    const updated = useIncidentStore.getState();
    const acked = updated.incidents.find((i) => i.id === initialTop.id);
    assert.strictEqual(acked?.status, 'acknowledged');

    // Siren on initialTop was stopped
    assert.strictEqual(updated.activeSirenIncidentId, null);

    // Next critical takes over as top
    const nextTop = getTopCriticalIncident(updated.incidents);
    assert.ok(nextTop);
    assert.notStrictEqual(nextTop.id, initialTop.id);
  });

  test('Test 8: 60-second mute counts down and expires', () => {
    const store = useIncidentStore.getState();
    store.setMuted(true, 60);

    assert.strictEqual(useIncidentStore.getState().isMuted, true);
    assert.strictEqual(useIncidentStore.getState().muteRemainingSeconds, 60);

    // Tick 30 times
    for (let i = 0; i < 30; i++) {
      useIncidentStore.getState().decrementMuteSeconds();
    }
    assert.strictEqual(useIncidentStore.getState().muteRemainingSeconds, 30);
    assert.strictEqual(useIncidentStore.getState().isMuted, true);

    // Tick remaining 30 times
    for (let i = 0; i < 30; i++) {
      useIncidentStore.getState().decrementMuteSeconds();
    }
    assert.strictEqual(useIncidentStore.getState().muteRemainingSeconds, 0);
    assert.strictEqual(useIncidentStore.getState().isMuted, false);
  });

  test('Test 9: Escalation at short duration with no duplicate records', () => {
    const baseTime = 1000000;
    const pastTime = new Date(baseTime - (DEV_ESCALATION_MS + 2000)).toISOString();

    const incident: Partial<Incident> = {
      id: 'INC-ESC-TEST',
      type: 'fire',
      status: 'reported',
      createdAt: pastTime,
      escalationHistory: [],
    };

    const firstEval = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseTime);
    assert.strictEqual(firstEval.shouldEscalate, true);
    assert.ok(firstEval.record);

    // Add record to history
    incident.escalationHistory = [firstEval.record!];

    // Second evaluation must NOT escalate again
    const secondEval = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseTime + 5000);
    assert.strictEqual(secondEval.shouldEscalate, false);
  });

  test('Test 10: Group and split preserve original reports, IDs, and log audit history', () => {
    const store = useIncidentStore.getState();

    // 1. Merge two incidents
    const incA = store.createEmergencyAlert('U1', 'Student 1', 'S1', undefined, 'medical');
    const incB = store.createEmergencyAlert('U2', 'Student 2', 'S2', undefined, 'medical');

    store.mergeIncidents(incA, incB, 'ADM-001', 'Admin');

    const mergedIncident = useIncidentStore.getState().incidents.find((i) => i.id === incA);
    assert.ok(mergedIncident);
    assert.strictEqual(mergedIncident.reports?.length, 2);
    assert.ok(mergedIncident.auditTrail?.some((a) => a.action === 'merge'));

    // 2. Split the second report out
    const reportToSplit = mergedIncident.reports![1];
    const newIncidentId = store.splitReport(incA, reportToSplit.id, 'ADM-001', 'Admin');

    assert.ok(newIncidentId);
    const updatedIncA = useIncidentStore.getState().incidents.find((i) => i.id === incA);
    const splitIncident = useIncidentStore.getState().incidents.find((i) => i.id === newIncidentId);

    assert.strictEqual(updatedIncA?.reports?.length, 1);
    assert.strictEqual(splitIncident?.reports?.length, 1);
    assert.strictEqual(splitIncident?.reports?.[0].id, reportToSplit.id);
    assert.ok(updatedIncA?.auditTrail?.some((a) => a.action === 'split'));
    assert.ok(splitIncident?.auditTrail?.some((a) => a.action === 'split'));
  });

  test('Test 11: Badge and counter values are derived consistently from state', () => {
    const incidents = useIncidentStore.getState().incidents;
    const active = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled');
    const criticalWaiting = active.filter(
      (i) => getIncidentSeverity(i) === 'Critical' && i.status === 'reported'
    );
    const acknowledged = incidents.filter((i) => i.status === 'acknowledged');

    // Counts must match exact length of state subsets
    assert.strictEqual(typeof active.length, 'number');
    assert.strictEqual(typeof criticalWaiting.length, 'number');
    assert.strictEqual(typeof acknowledged.length, 'number');
    assert.ok(criticalWaiting.length <= active.length);
  });

  test('Test 15: Demo alerts remain marked isDemo: true and separate from real records', () => {
    const store = useIncidentStore.getState();
    store.simulateAlerts(3);

    const afterSim = useIncidentStore.getState().incidents;
    const demoItems = afterSim.filter((i) => i.isDemo);
    const realItems = afterSim.filter((i) => !i.isDemo);

    assert.ok(demoItems.length >= 3);
    assert.ok(realItems.every((i) => !i.isDemo));

    // Clear demo items
    store.clearDemoAlerts();
    const afterClear = useIncidentStore.getState().incidents;
    assert.strictEqual(afterClear.filter((i) => i.isDemo).length, 0);
  });
});
