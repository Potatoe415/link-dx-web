import { ItemId } from '../core/GameState';

/** Source rect on one of the original UI sheets (copied from `_ref_repo/Data/ui.png` and `Map Objects/items.png`). */
export interface UiSprite {
  sheet: 'ui' | 'items';
  x: number;
  y: number;
  w: number;
  h: number;
}

export const UI_SHEETS = {
  ui: '/assets/ui/ui.png',
  items: '/assets/ui/items.png'
} as const;

// From `_ref_repo/Data/ui.atlas`
export const UI_HEART: UiSprite = { sheet: 'ui', x: 1, y: 1, w: 7, h: 7 }; // 5 frames: full, 3/4, 1/2, 1/4, empty (stride 8)
export const UI_HEART_STRIDE = 8;
export const UI_RUPEE: UiSprite = { sheet: 'ui', x: 1, y: 9, w: 7, h: 7 };
export const UI_LETTER: UiSprite = { sheet: 'ui', x: 1, y: 32, w: 6, h: 6 }; // glyphs: "L-", 0..9 (stride 7)
export const UI_LETTER_STRIDE = 7;
export const UI_GAME_OVER: UiSprite = { sheet: 'ui', x: 0, y: 39, w: 78, h: 24 };

// From `_ref_repo/Data/Map Objects/items.atlas`
export const ITEM_SPRITES: Record<ItemId, UiSprite> = {
  shield: { sheet: 'items', x: 40, y: 127, w: 8, h: 10 },
  sword: { sheet: 'items', x: 176, y: 148, w: 8, h: 16 },
  powder: { sheet: 'items', x: 49, y: 123, w: 8, h: 14 },
  feather: { sheet: 'items', x: 58, y: 121, w: 7, h: 16 },
  bracelet: { sheet: 'items', x: 66, y: 123, w: 8, h: 14 },
  bombs: { sheet: 'items', x: 102, y: 124, w: 8, h: 13 },
  bow: { sheet: 'items', x: 145, y: 123, w: 6, h: 14 },
  hookshot: { sheet: 'items', x: 128, y: 121, w: 7, h: 16 },
  ocarina: { sheet: 'items', x: 119, y: 123, w: 8, h: 14 },
  rod: { sheet: 'items', x: 111, y: 122, w: 7, h: 15 },
  boomerang: { sheet: 'items', x: 136, y: 125, w: 8, h: 12 },
  boots: { sheet: 'items', x: 84, y: 124, w: 8, h: 13 },
  shovel: { sheet: 'items', x: 93, y: 123, w: 8, h: 14 },
  flippers: { sheet: 'items', x: 118, y: 19, w: 8, h: 15 }
};

/** The 8 Siren Instruments (16x16 each, stacked vertically). */
export const INSTRUMENT_SPRITE = (index: number): UiSprite => ({ sheet: 'items', x: 224, y: index * 16, w: 16, h: 16 });

/** French names shown in the inventory (user-facing copy is French, see docs/PRODUCT.md). */
export const ITEM_NAMES_FR: Record<ItemId, string> = {
  shield: 'Bouclier',
  sword: 'Épée',
  powder: 'Poudre Magique',
  feather: 'Plume de Roc',
  bracelet: 'Bracelet de Force',
  bombs: 'Bombes',
  bow: 'Arc',
  hookshot: 'Grappin',
  ocarina: 'Ocarina',
  rod: 'Bâton de Feu',
  boomerang: 'Boomerang',
  boots: 'Bottes de Pégase',
  shovel: 'Pelle',
  flippers: 'Palmes'
};

export const INSTRUMENT_NAMES_FR = [
  'Violon des Vagues',
  'Cor du Conque',
  'Cloche des Algues',
  'Harpe du Reflux',
  'Marimba du Vent',
  'Triangle de Corail',
  "Orgue de l'Embellie",
  'Tambour des Marées'
];
