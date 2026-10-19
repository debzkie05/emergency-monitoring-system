import type { EmergencyType } from '@/types';

export interface ResolutionStep {
  id: string;
  title: string;
  description: string;
  recommendedDepartment: string;
  isUrgent?: boolean;
}

export interface EmergencyProtocol {
  type: EmergencyType;
  title: string;
  objective: string;
  priorityLevel: 'Immediate (Critical)' | 'High Priority' | 'Standard Response';
  steps: ResolutionStep[];
}

export const EMERGENCY_PROTOCOLS: Record<EmergencyType, EmergencyProtocol> = {
  fire: {
    type: 'fire',
    title: 'Fire Emergency Protocol',
    objective: 'Evacuate occupants, contain fire hazard, and safeguard campus lives',
    priorityLevel: 'Immediate (Critical)',
    steps: [
      {
        id: 'fire-1',
        title: 'Activate Building Evacuation Alarm',
        description: 'Sound the campus fire horn and initiate immediate orderly evacuation of the affected building.',
        recommendedDepartment: 'Campus Security',
        isUrgent: true,
      },
      {
        id: 'fire-2',
        title: 'Dispatch Bureau of Fire Protection (BFP / 911)',
        description: 'Notify municipal fire department with building code, floor level, and accessible entry gates.',
        recommendedDepartment: 'Emergency Dispatch',
        isUrgent: true,
      },
      {
        id: 'fire-3',
        title: 'Cordon Perimeter & Clear Fire Lanes',
        description: 'Assign security personnel to secure a 100-meter safety zone and clear driveway for fire engines.',
        recommendedDepartment: 'Security Patrol (RSP-001)',
      },
      {
        id: 'fire-4',
        title: 'Isolate Gas & Electrical Mains',
        description: 'Coordinate with facilities engineers to switch off power and gas lines leading to the affected sector.',
        recommendedDepartment: 'Maintenance / Facilities (RSP-003)',
      },
      {
        id: 'fire-5',
        title: 'Conduct Headcount & First Aid Triage',
        description: 'Stage medical personnel at designated evacuation assembly area to treat smoke inhalation and injuries.',
        recommendedDepartment: 'Campus Clinic (RSP-002)',
      },
    ],
  },
  medical: {
    type: 'medical',
    title: 'Medical Emergency Protocol',
    objective: 'Provide immediate clinical triage and expedite emergency hospital transfer if needed',
    priorityLevel: 'Immediate (Critical)',
    steps: [
      {
        id: 'med-1',
        title: 'Dispatch Campus Medical Clinic / EMT',
        description: 'Deploy on-duty clinic nurses and first responders equipped with AED and trauma kit to exact location.',
        recommendedDepartment: 'Campus Clinic (RSP-002)',
        isUrgent: true,
      },
      {
        id: 'med-2',
        title: 'Clear Pathway & Hold Service Elevators',
        description: 'Instruct ground security to lock service elevators and guide stretcher team directly to the patient.',
        recommendedDepartment: 'Security Patrol (RSP-001)',
      },
      {
        id: 'med-3',
        title: 'Summon Emergency Ambulance (911 / Red Cross)',
        description: 'If patient is unconscious, unresponsive, or bleeding severely, dispatch city ambulance immediately.',
        recommendedDepartment: 'Emergency Dispatch',
        isUrgent: true,
      },
      {
        id: 'med-4',
        title: 'Contact Student Emergency Guardian',
        description: 'Retrieve student emergency contact records from registry and notify parent or designated guardian.',
        recommendedDepartment: 'Admin / Student Affairs',
      },
      {
        id: 'med-5',
        title: 'Log Medical Incident & Patient Transfer',
        description: 'Document vitals, primary assessment, medication given, and receiving hospital facility.',
        recommendedDepartment: 'Campus Clinic (RSP-002)',
      },
    ],
  },
  security: {
    type: 'security',
    title: 'Security Threat Protocol',
    objective: 'Neutralize threat, protect students and staff, and secure campus perimeter',
    priorityLevel: 'Immediate (Critical)',
    steps: [
      {
        id: 'sec-1',
        title: 'Deploy Armed Security Quick Response Team',
        description: 'Send patrol units to assess, de-escalate, or apprehend suspicious or hostile individual(s).',
        recommendedDepartment: 'Security Patrol (RSP-001)',
        isUrgent: true,
      },
      {
        id: 'sec-2',
        title: 'Review Live CCTV & Sector Lockdown',
        description: 'Pull live camera feeds around the location. Lock adjacent entry gates if necessary to contain movement.',
        recommendedDepartment: 'CCTV Control Center',
      },
      {
        id: 'sec-3',
        title: 'Notify Local Police Station (PNP)',
        description: 'If physical violence, weapons, or trespassing occurs, request immediate police patrol backup.',
        recommendedDepartment: 'Security Management',
        isUrgent: true,
      },
      {
        id: 'sec-4',
        title: 'Issue Targeted Student Safety Advisory',
        description: 'Broadcast discreet safety alert to students in the area to steer clear of the sector.',
        recommendedDepartment: 'Admin Dispatch',
      },
      {
        id: 'sec-5',
        title: 'File Security Blotter & Preserve Evidence',
        description: 'Secure CCTV recordings, witness statements, and confiscate unauthorized contraband.',
        recommendedDepartment: 'Security Patrol (RSP-001)',
      },
    ],
  },
  accident: {
    type: 'accident',
    title: 'Accident Response Protocol',
    objective: 'Provide first aid, secure physical scene, and prevent further accidents',
    priorityLevel: 'High Priority',
    steps: [
      {
        id: 'acc-1',
        title: 'Dispatch First Aid & Safety Officer',
        description: 'Deploy on-site responders to assess injured persons and stabilize conditions.',
        recommendedDepartment: 'Campus Clinic (RSP-002)',
        isUrgent: true,
      },
      {
        id: 'acc-2',
        title: 'Secure & Cordon Off Incident Site',
        description: 'Set up warning cones and barricades to prevent secondary collisions or student crowd build-up.',
        recommendedDepartment: 'Security Patrol (RSP-001)',
      },
      {
        id: 'acc-3',
        title: 'Document Incident Scene & Vehicle/Property Data',
        description: 'Take photographs of damage, skid marks, road conditions, and collect involved parties information.',
        recommendedDepartment: 'Safety Inspector',
      },
      {
        id: 'acc-4',
        title: 'Clear Debris & Restore Safe Passage',
        description: 'Have maintenance sweep broken glass or debris and inspect for hazardous fluid leaks.',
        recommendedDepartment: 'Maintenance / Facilities (RSP-003)',
      },
    ],
  },
  hazard: {
    type: 'hazard',
    title: 'Environmental & Structural Hazard Protocol',
    objective: 'Isolate hazard, prevent injuries, and restore facilities safely',
    priorityLevel: 'Standard Response',
    steps: [
      {
        id: 'haz-1',
        title: 'Erect Safety Barricades & Warning Signage',
        description: 'Immediately isolate affected zone (wet floor, exposed wiring, chemical leak, falling debris).',
        recommendedDepartment: 'Maintenance / Facilities (RSP-003)',
        isUrgent: true,
      },
      {
        id: 'haz-2',
        title: 'Reroute Foot Traffic & Post Guard',
        description: 'Direct students and staff to alternative hallways or stairwells away from hazard zone.',
        recommendedDepartment: 'Security Patrol (RSP-001)',
      },
      {
        id: 'haz-3',
        title: 'Execute Remediation & Technical Repairs',
        description: 'Specialist maintenance team applies repair, cleaning, or structural reinforcement.',
        recommendedDepartment: 'Maintenance / Facilities (RSP-003)',
      },
      {
        id: 'haz-4',
        title: 'Safety Re-Inspection & Area Reopening',
        description: 'Safety supervisor verifies that the hazard has been eliminated before removing barriers.',
        recommendedDepartment: 'Campus Safety Officer',
      },
    ],
  },
  other: {
    type: 'other',
    title: 'General Emergency Protocol',
    objective: 'Verify emergency validity, assess conditions, and assign appropriate response teams',
    priorityLevel: 'High Priority',
    steps: [
      {
        id: 'oth-1',
        title: 'Contact Reporter for Immediate Verification',
        description: 'Place direct phone call to reporting student to clarify nature and severity of the incident.',
        recommendedDepartment: 'Admin Dispatch',
        isUrgent: true,
      },
      {
        id: 'oth-2',
        title: 'Deploy Roving Officer for On-Site Assessment',
        description: 'Dispatch nearest patrol officer to physically inspect the reported coordinates.',
        recommendedDepartment: 'Security Patrol (RSP-001)',
      },
      {
        id: 'oth-3',
        title: 'Reclassify Emergency Type & Severity',
        description: 'Update the system classification based on findings (Medical, Fire, Hazard, Security).',
        recommendedDepartment: 'Administrator',
      },
      {
        id: 'oth-4',
        title: 'Assign Specialized Department',
        description: 'Hand over handling to appropriate response department and monitor resolution.',
        recommendedDepartment: 'Campus Safety Dispatch',
      },
    ],
  },
};

export function getProtocolForEmergency(type?: EmergencyType): EmergencyProtocol {
  if (!type || !EMERGENCY_PROTOCOLS[type]) {
    return EMERGENCY_PROTOCOLS.other;
  }
  return EMERGENCY_PROTOCOLS[type];
}
