import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateIncidentEscalation,
  isIncidentEscalated,
  DEV_ESCALATION_MS,
  ESCALATION_MESSAGE,
} from '../src/utils/escalation.ts';
import type { Incident } from '../src/types/index.ts';

describe('Escalation Logic', () => {
  const baseNow = 1700000000000;

  test('Triggers escalation for unacknowledged critical incident past threshold', () => {
    const createdTime = new Date(baseNow - (DEV_ESCALATION_MS + 1000)).toISOString();
    const incident: Partial<Incident> = {
      id: 'INC-001',
      type: 'medical',
      status: 'reported',
      createdAt: createdTime,
      escalationHistory: [],
    };

    const result = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseNow);
    assert.strictEqual(result.shouldEscalate, true);
    assert.strictEqual(result.type, 'unacknowledged');
    assert.strictEqual(result.record?.message, ESCALATION_MESSAGE);
  });

  test('Does not trigger escalation before threshold is reached', () => {
    const createdTime = new Date(baseNow - (DEV_ESCALATION_MS - 2000)).toISOString();
    const incident: Partial<Incident> = {
      id: 'INC-001',
      type: 'medical',
      status: 'reported',
      createdAt: createdTime,
      escalationHistory: [],
    };

    const result = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseNow);
    assert.strictEqual(result.shouldEscalate, false);
  });

  test('Triggers escalation for acknowledged critical incident with no responder assigned past threshold', () => {
    const ackTime = new Date(baseNow - (DEV_ESCALATION_MS + 500)).toISOString();
    const incident: Partial<Incident> = {
      id: 'INC-002',
      type: 'security',
      status: 'acknowledged',
      assignedTo: undefined,
      updatedAt: ackTime,
      statusHistory: [
        { status: 'reported', timestamp: new Date(baseNow - 30000).toISOString() },
        { status: 'acknowledged', timestamp: ackTime },
      ],
      escalationHistory: [],
    };

    const result = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseNow);
    assert.strictEqual(result.shouldEscalate, true);
    assert.strictEqual(result.type, 'unassigned');
    assert.strictEqual(result.record?.message, ESCALATION_MESSAGE);
  });

  test('Does not escalate acknowledged incident if responder is already assigned', () => {
    const ackTime = new Date(baseNow - (DEV_ESCALATION_MS + 5000)).toISOString();
    const incident: Partial<Incident> = {
      id: 'INC-003',
      type: 'fire',
      status: 'acknowledged',
      assignedTo: 'RSP-001',
      assignedToName: 'Security Officer',
      updatedAt: ackTime,
      escalationHistory: [],
    };

    const result = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseNow);
    assert.strictEqual(result.shouldEscalate, false);
  });

  test('Never triggers duplicate escalation for the same condition', () => {
    const createdTime = new Date(baseNow - 50000).toISOString();
    const incident: Partial<Incident> = {
      id: 'INC-004',
      type: 'medical',
      status: 'reported',
      createdAt: createdTime,
      escalationHistory: [
        {
          type: 'unacknowledged',
          timestamp: new Date(baseNow - 20000).toISOString(),
          message: ESCALATION_MESSAGE,
        },
      ],
    };

    const result = evaluateIncidentEscalation(incident, DEV_ESCALATION_MS, baseNow);
    assert.strictEqual(result.shouldEscalate, false);
  });

  test('Non-critical incidents do not escalate', () => {
    const createdTime = new Date(baseNow - 50000).toISOString();
    const hazardIncident: Partial<Incident> = {
      id: 'INC-005',
      type: 'hazard', // Moderate
      status: 'reported',
      createdAt: createdTime,
      escalationHistory: [],
    };

    const accidentIncident: Partial<Incident> = {
      id: 'INC-006',
      type: 'accident', // High
      status: 'reported',
      createdAt: createdTime,
      escalationHistory: [],
    };

    assert.strictEqual(evaluateIncidentEscalation(hazardIncident, DEV_ESCALATION_MS, baseNow).shouldEscalate, false);
    assert.strictEqual(evaluateIncidentEscalation(accidentIncident, DEV_ESCALATION_MS, baseNow).shouldEscalate, false);
  });

  test('isIncidentEscalated returns proper status and message', () => {
    const escalatedIncident: Partial<Incident> = {
      id: 'INC-007',
      escalationHistory: [
        {
          type: 'unacknowledged',
          timestamp: '2026-10-11T10:00:00Z',
          message: ESCALATION_MESSAGE,
        },
      ],
    };

    const check = isIncidentEscalated(escalatedIncident);
    assert.strictEqual(check.isEscalated, true);
    assert.strictEqual(check.message, ESCALATION_MESSAGE);
  });
});
