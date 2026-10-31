import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSiteSafetyScore,
  categorizeHazards,
  transitionActionStatus,
  validateSiteInput,
  Observation
} from './safety-engine';

test('calculateSiteSafetyScore returns 100 for zero hazards', () => {
  const result = calculateSiteSafetyScore([]);
  assert.equal(result.score, 100);
  assert.equal(result.grade, 'A+');
  assert.equal(result.status, 'Excellent');
  assert.equal(result.criticalCount, 0);
});

test('calculateSiteSafetyScore applies appropriate penalties for critical and high hazards', () => {
  const sampleObservations: Observation[] = [
    {
      id: 'OBS-001',
      category: 'Fall Protection',
      severity: 'Critical',
      uncertaintyStatus: 'Needs Human Review',
      verificationStatus: 'pending',
      timestamp: '00:45',
      zoneId: 'zone-building',
      sopCitation: 'OSHA 1926.501',
      actionStatus: 'pending_review'
    },
    {
      id: 'OBS-002',
      category: 'PPE Compliance',
      severity: 'Medium',
      uncertaintyStatus: 'Potential Issue',
      verificationStatus: 'pending',
      timestamp: '01:12',
      zoneId: 'zone-storage',
      sopCitation: 'OSHA 1926.100',
      actionStatus: 'pending_review'
    },
    {
      id: 'OBS-003',
      category: 'Electrical Safety',
      severity: 'High',
      uncertaintyStatus: 'Potential Issue',
      verificationStatus: 'dismissed', // Dismissed should NOT count against safety score
      timestamp: '02:00',
      zoneId: 'zone-electrical',
      sopCitation: 'OSHA 1926.405',
      actionStatus: 'resolved'
    }
  ];

  // 100 - 15 (Critical) - 5 (Medium) = 80
  const result = calculateSiteSafetyScore(sampleObservations);
  assert.equal(result.score, 80);
  assert.equal(result.criticalCount, 1);
  assert.equal(result.mediumCount, 1);
  assert.equal(result.highCount, 0); // because it was dismissed
  assert.equal(result.grade, 'A');
  assert.equal(result.status, 'Good');
});

test('categorizeHazards accurately tallies categories excluding dismissed ones', () => {
  const sampleObservations: Observation[] = [
    {
      id: 'OBS-01',
      category: 'PPE Compliance',
      severity: 'Medium',
      uncertaintyStatus: 'Potential Issue',
      verificationStatus: 'pending',
      timestamp: '00:10',
      zoneId: 'zone-a',
      sopCitation: 'SOP-1',
      actionStatus: 'pending_review'
    },
    {
      id: 'OBS-02',
      category: 'PPE Compliance',
      severity: 'Low',
      uncertaintyStatus: 'Potential Issue',
      verificationStatus: 'verified',
      timestamp: '00:20',
      zoneId: 'zone-a',
      sopCitation: 'SOP-1',
      actionStatus: 'in_progress'
    },
    {
      id: 'OBS-03',
      category: 'Fall Protection',
      severity: 'Critical',
      uncertaintyStatus: 'Needs Human Review',
      verificationStatus: 'pending',
      timestamp: '00:30',
      zoneId: 'zone-b',
      sopCitation: 'SOP-2',
      actionStatus: 'pending_review'
    },
    {
      id: 'OBS-04',
      category: 'Electrical Safety',
      severity: 'High',
      uncertaintyStatus: 'Potential Issue',
      verificationStatus: 'dismissed',
      timestamp: '00:40',
      zoneId: 'zone-c',
      sopCitation: 'SOP-3',
      actionStatus: 'resolved'
    }
  ];

  const counts = categorizeHazards(sampleObservations);
  assert.equal(counts['PPE Compliance'], 2);
  assert.equal(counts['Fall Protection'], 1);
  assert.equal(counts['Electrical Safety'], undefined);
});

test('transitionActionStatus advances statuses as expected', () => {
  assert.equal(transitionActionStatus('pending_review', 'confirm'), 'confirmed');
  assert.equal(transitionActionStatus('confirmed', 'assign'), 'assigned');
  assert.equal(transitionActionStatus('assigned', 'start'), 'in_progress');
  assert.equal(transitionActionStatus('in_progress', 'resolve'), 'resolved');
  assert.equal(transitionActionStatus('resolved', 'reopen'), 'in_progress');
});

test('validateSiteInput checks required fields properly', () => {
  const invalid = validateSiteInput({ name: 'A', location: '', manager: '' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.location);
  assert.ok(invalid.errors.manager);

  const valid = validateSiteInput({
    name: 'Metropolis Tower C',
    location: 'Sector 42, Metro Expressway',
    manager: 'Sarah Jenkins'
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
