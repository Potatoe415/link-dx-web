import { RoomDef } from './types';
import { MABE_VILLAGE_ROOMS } from './mabe_village';

export type { Rect, WarpTrigger, RoomProp, RoomDef } from './types';

// One module per region (mabe_village, toronbo_shores, mysterious_forest, dungeon1, ...).
// Region modules must not share room ids; collisions are reported at startup.
const REGIONS: Record<string, RoomDef>[] = [MABE_VILLAGE_ROOMS];

function mergeRegions(regions: Record<string, RoomDef>[]): Record<string, RoomDef> {
  const merged: Record<string, RoomDef> = {};
  for (const region of regions) {
    for (const [key, room] of Object.entries(region)) {
      if (merged[key]) {
        console.error(`Duplicate room id "${key}" across region modules`);
      }
      merged[key] = room;
    }
  }
  return merged;
}

export const ROOMS: Record<string, RoomDef> = mergeRegions(REGIONS);
