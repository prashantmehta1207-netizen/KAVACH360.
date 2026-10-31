/**
 * KAVACH360 AI - Core Safety Intelligence & Rule Engine
 * Pure logic calculations for safety score, risk stratification,
 * SOP matching, and action state transitions.
 */

export interface Observation {
  id: string;
  category: 'PPE Compliance' | 'Fall Protection' | 'Electrical Safety' | 'Blocked Emergency Exits' | 'Heavy Machinery' | 'Scaffolding Safety' | 'Unsafe Working Environment';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  uncertaintyStatus: 'Potential Issue' | 'Needs Human Review' | 'Verified Incident';
  verificationStatus: 'pending' | 'verified' | 'dismissed' | 'extra_evidence_requested';
  timestamp: string;
  zoneId: string;
  sopCitation: string;
  actionStatus: 'pending_review' | 'confirmed' | 'assigned' | 'in_progress' | 'resolved';
}

export interface SOPRule {
  id: string;
  category: string;
  standard: string;
  ruleTitle: string;
  pageRef: number;
  mandatoryRequirement: string;
  prescribedCorrectiveAction: string;
}

export interface SiteSafetyScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  status: 'Excellent' | 'Good' | 'Caution' | 'Critical';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

/**
 * Calculates safety compliance score (0-100) based on observed hazards and severity penalties.
 */
export function calculateSiteSafetyScore(observations: Observation[]): SiteSafetyScore {
  let score = 100;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const obs of observations) {
    if (obs.verificationStatus === 'dismissed') continue;

    // Penalty weights
    switch (obs.severity) {
      case 'Critical':
        criticalCount++;
        score -= 15;
        break;
      case 'High':
        highCount++;
        score -= 9;
        break;
      case 'Medium':
        mediumCount++;
        score -= 5;
        break;
      case 'Low':
        lowCount++;
        score -= 2;
        break;
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A+';
  let status: 'Excellent' | 'Good' | 'Caution' | 'Critical' = 'Excellent';

  if (score >= 90) {
    grade = 'A+';
    status = 'Excellent';
  } else if (score >= 80) {
    grade = 'A';
    status = 'Good';
  } else if (score >= 65) {
    grade = 'B';
    status = 'Caution';
  } else if (score >= 50) {
    grade = 'C';
    status = 'Caution';
  } else {
    grade = 'D';
    status = 'Critical';
  }

  return {
    score,
    grade,
    status,
    criticalCount,
    highCount,
    mediumCount,
    lowCount
  };
}

/**
 * Categorizes active hazards by category for charting.
 */
export function categorizeHazards(observations: Observation[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const obs of observations) {
    if (obs.verificationStatus === 'dismissed') continue;
    counts[obs.category] = (counts[obs.category] || 0) + 1;
  }
  return counts;
}

/**
 * State machine for action center workflow transitions.
 */
export function transitionActionStatus(
  current: 'pending_review' | 'confirmed' | 'assigned' | 'in_progress' | 'resolved',
  action: 'confirm' | 'assign' | 'start' | 'resolve' | 'dismiss' | 'reopen'
): 'pending_review' | 'confirmed' | 'assigned' | 'in_progress' | 'resolved' {
  switch (action) {
    case 'confirm':
      return 'confirmed';
    case 'assign':
      return 'assigned';
    case 'start':
      return 'in_progress';
    case 'resolve':
      return 'resolved';
    case 'reopen':
      return 'in_progress';
    case 'dismiss':
      return 'resolved';
    default:
      return current;
  }
}

/**
 * Validates new site creation payload.
 */
export function validateSiteInput(site: { name?: string; location?: string; manager?: string }): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  if (!site.name || site.name.trim().length < 3) {
    errors.name = 'Site name must be at least 3 characters.';
  }
  if (!site.location || site.location.trim().length < 3) {
    errors.location = 'Location or city address is required.';
  }
  if (!site.manager || site.manager.trim().length < 2) {
    errors.manager = 'Site Safety Manager name is required.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
