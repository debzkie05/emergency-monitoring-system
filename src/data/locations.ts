import type { CampusBuilding } from '../types';

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'ccs',
    name: 'CCS Building',
    floors: ['Ground Floor', '2nd Floor', '3rd Floor', '4th Floor'],
  },
  {
    id: 'coe',
    name: 'COE Building',
    floors: ['Ground Floor', '2nd Floor', '3rd Floor'],
  },
  {
    id: 'eng',
    name: 'Engineering Building',
    floors: ['Ground Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'],
  },
  {
    id: 'lib',
    name: 'Library',
    floors: ['Ground Floor', '2nd Floor', '3rd Floor'],
  },
  {
    id: 'gym',
    name: 'Gymnasium',
    floors: ['Ground Floor', '2nd Floor'],
  },
  {
    id: 'cafe',
    name: 'Cafeteria',
    floors: ['Ground Floor'],
  },
  {
    id: 'main',
    name: 'Main Gate',
    floors: ['Ground Level'],
  },
];

// Room suggestions per building
export const CAMPUS_ROOMS: Record<string, string[]> = {
  ccs: [
    'Computer Laboratory 1',
    'Computer Laboratory 2',
    'Computer Laboratory 3',
    'Room 201',
    'Room 202',
    'Room 203',
    'Room 204',
    'Faculty Room',
    'Dean\'s Office',
    'Hallway',
    'Lobby',
  ],
  coe: [
    'Room 101',
    'Room 102',
    'Room 201',
    'Room 202',
    'Faculty Room',
    'Laboratory',
    'Hallway',
    'Lobby',
  ],
  eng: [
    'Room 101',
    'Room 201',
    'Room 301',
    'Workshop A',
    'Workshop B',
    'Laboratory',
    'Hallway',
    'Lobby',
  ],
  lib: [
    'Reading Area',
    'Reference Section',
    'Computer Section',
    'Study Room 1',
    'Study Room 2',
    'Lobby',
  ],
  gym: [
    'Main Court',
    'Stage Area',
    'Bleachers',
    'Lobby',
  ],
  cafe: [
    'Dining Area',
    'Kitchen',
    'Counter',
  ],
  main: [
    'Guard House',
    'Entrance',
    'Parking Area',
  ],
};
