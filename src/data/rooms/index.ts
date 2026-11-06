import { RoomDef } from './types';
import { MABE_VILLAGE_ROOMS } from './mabe_village';
import { MABE_VILLAGE_OVERWORLD_ROOMS } from './mabe_village_overworld';
import { TORONBO_SHORES_ROOMS } from './toronbo_shores';

export type { Rect, WarpTrigger, RoomProp, RoomDef, RoomNeighbors, RoomMusic, RoomAmbience, GroundKind, GroundZone, SignDef, ChestDef, ChestContents, InteractableDef, GroundItemDef, CuttableDef } from './types';

// One module per region (mabe_village, toronbo_shores, mysterious_forest, dungeon1, ...).
// Region modules must not share room ids; collisions are reported at startup.
const REGIONS: Record<string, RoomDef>[] = [MABE_VILLAGE_ROOMS, MABE_VILLAGE_OVERWORLD_ROOMS, TORONBO_SHORES_ROOMS];

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
