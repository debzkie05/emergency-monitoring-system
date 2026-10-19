import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifySeverity, getIncidentSeverity } from '../src/utils/severity.ts';

describe('Severity Classification', () => {
  test('Classifies fire, medical, and security as Critical', () => {
    assert.strictEqual(classifySeverity('fire'), 'Critical');
    assert.strictEqual(classifySeverity('medical'), 'Critical');
    assert.strictEqual(classifySeverity('security'), 'Critical');
    assert.strictEqual(classifySeverity('FIRE'), 'Critical');
    assert.strictEqual(classifySeverity('Medical'), 'Critical');
  });

  test('Classifies accident and other as High', () => {
    assert.strictEqual(classifySeverity('accident'), 'High');
    assert.strictEqual(classifySeverity('other'), 'High');
    assert.strictEqual(classifySeverity('Accident'), 'High');
  });

  test('Classifies safety hazard as Moderate', () => {
    assert.strictEqual(classifySeverity('hazard'), 'Moderate');
    assert.strictEqual(classifySeverity('HAZARD'), 'Moderate');
  });

  test('Classifies instant alert with no type yet as Critical', () => {
    assert.strictEqual(classifySeverity(undefined), 'Critical');
    assert.strictEqual(classifySeverity(null), 'Critical');
    assert.strictEqual(classifySeverity(''), 'Critical');
    assert.strictEqual(classifySeverity('   '), 'Critical');
  });

  test('Respects admin severity override when present', () => {
    const incidentWithOverride = {
      id: 'INC-001',
      type: 'hazard' as const,
      severity: 'Critical' as const,
      severityOverridden: true,
    };
    assert.strictEqual(getIncidentSeverity(incidentWithOverride), 'Critical');

    const incidentWithoutOverride = {
      id: 'INC-002',
      type: 'hazard' as const,
    };
    assert.strictEqual(getIncidentSeverity(incidentWithoutOverride), 'Moderate');
  });
});
