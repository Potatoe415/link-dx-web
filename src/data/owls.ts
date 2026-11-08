import { GameFlag } from '../core/GameState';
import { OwlDef } from '../entities/Owl';

/**
 * Owl appearances (ObjOwl objects of `_ref_repo/Data/Maps/overworld.map`). Each one plays once:
 * the "already talked" marker is stored with the room's collected items (GameState.markChestOpened)
 * under `saveId`. `requires` replaces the original `owl` script key (scripts.zScript `owl:0 -> owl_1_0`).
 */
export interface OwlAppearance extends OwlDef {
  saveId: string;
  requires: GameFlag;
}

export const OWLS: Record<string, OwlAppearance> = {
  ow_r04_c01: {
    saveId: 'owl_tail_key',
    requires: 'FLAG_TAIL_KEY_OBTAINED',
    x: 104,
    y: 32,
    trigger: { x: -48, y: 24, w: 48, h: 32 },
    pages: [
      'Hou hou ! Tu as obtenu la Clé Flagello !',
      'Rends-toi maintenant à la Cave Flagello, située au sud du Village des Mouettes !',
      'Récupère l’Instrument des Sirènes qui y sommeille !',
      'Fais vite ! Le Poisson-Rêve attend son réveil… Hou hou !'
    ]
  },

  // ow_r15_c02 owl at (88, 32), params ['0', ''] -> template trigger Rectangle(-16, 32, 48, 32)
  ow_r15_c02: {
    saveId: 'owl_1_0',
    requires: 'FLAG_SWORD_OBTAINED',
    x: 88,
    y: 32,
    trigger: { x: -16, y: 32, w: 48, h: 32 },
    // dialog_eng.lng owl_1_0, French adaptation
    pages: [
      'Hou hou ! Hou hou !\nAlors c’est toi, le garçon à qui appartient cette épée…',
      'Je comprends mieux pourquoi les monstres sont devenus si agressifs…',
      'Un garçon courageux est venu réveiller le Poisson-Rêve…',
      'On dit que nul ne peut quitter l’île sans avoir réveillé le Poisson-Rêve…',
      'Tu devrais maintenant aller au nord, vers la Forêt Enchantée.\nJe t’y attendrai ! Hou hou !'
    ]
  }
};
