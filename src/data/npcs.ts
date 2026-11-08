import { SoundManager } from '../core/Audio';
import { DialogueSystem } from '../core/Dialogue';
import { GameState } from '../core/GameState';
import { Player } from '../entities/Player';
import { Npc } from '../entities/Npc';

export interface NpcTalkContext {
  game: GameState;
  npc: Npc;
  player: Player;
  dialogue: DialogueSystem;
  sound: SoundManager;
}

export type NpcTalkHandler = (ctx: NpcTalkContext) => boolean;
import { Rect } from './rooms';

/**
 * Village NPCs ported from `_ref_repo/InGame/GameObjects/NPCs/` (see src/entities/Npc.ts).
 * Positions are the map object origins of the room manifests (`public/assets/rooms/<room>_manifest.json`);
 * the feet anchor is (x + 8, y + 16) like every ObjPerson/ObjPersonNew constructor (ObjBowWow: (x, y + 16)).
 * Dialogues are French adaptations of `_ref_repo/Data/Languages/dialog_eng.lng`; the first branch of the
 * original `scripts.zScript` dialog path is used until the matching quest state is ported.
 */
export type NpcBehavior =
  | 'look' // ObjPerson / ObjPersonNew: plays stand_<dir> toward Link within 32 px
  | 'lookRandom' // ObjShopkeeper: same, with a random 0-250 ms or 1.5-2.5 s delay per turn
  | 'lookSide' // ObjGrandmother: stand_-1 / stand_1 when Link is beside her
  | 'static' // plays one animation forever (ObjFisherman, ObjTrendy, npc07)
  | 'hop' // ObjBowWowSmall / ObjDog: idle 500-1500 ms, then hop in a random direction for 750-1500 ms
  | 'chained' // ObjBowWow: hops around its stake, held by a 46 px chain
  | 'ballGame'; // ObjBallGame: two children throwing a ball

export interface NpcDef {
  id: string;
  animator: string; // key of NPC_ANIMATORS (src/data/npcAnimations.ts)
  animation?: string; // fixed animation (ObjPersonNew `animationName`); default: the behavior's
  behavior: NpcBehavior;
  x: number; // map object origin (16x16 cell top-left), logical px
  y: number;
  body: Rect; // solid box relative to the feet anchor
  speaker?: string;
  pages?: string[][]; // conversations, cycled in order
  talkKey?: string; // shared conversation counter (npc05_help: every village kid continues the same tip cycle)
  sfx?: 'bowwow_yip'; // played when talking (ObjBowWowSmall.Interact)
  requires?: 'FLAG_SWORD_OBTAINED'; // spawn condition already covered by GameState flags
  onTalk?: NpcTalkHandler;
}

// Body boxes from the constructors: ObjPerson(New) Rectangle(0, 0, 14, 10) -> (-7, -10, 14, 10)
const PERSON: Rect = { x: -7, y: -10, w: 14, h: 10 };

const KIDS_HELP = [
  ["Il paraît que quand tu sauvegardes, tu repars de la dernière porte que tu as franchie… Pourquoi ? Aucune idée, je suis qu'un gamin !"],
  ["J'ai entendu dire qu'on peut regarder la carte de l'île avec SELECT… Mais je comprends pas ce que ça veut dire !"],
  ["Quand il te reste peu de cœurs, entre dans une maison ou une grotte… Pourquoi ? J'en sais rien, je suis qu'un gamin !"]
];

export const NPCS: Record<string, NpcDef[]> = {
  witch_hut: [
    {
      id: 'witch',
      animator: 'witch',
      animation: 'idle',
      behavior: 'static',
      x: 64,
      y: 64,
      body: PERSON,
      speaker: 'Sorcière Syrup',
      onTalk: ({ game, npc, player, dialogue, sound }) => {
        if (game.hasItem('toadstool')) {
          dialogue.startCustomDialogue(
            'Sorcière Syrup',
            [
              "Ooooh ! Tu m'apportes le Champignon du sommeil, oui !",
              "Attends un petit instant, je te prépare ça en deux temps trois mouvements !"
            ],
            () => {
              npc.playAnimation('mix');
              sound.playSfx('menu_open', 0.8);
              setTimeout(() => {
                npc.playAnimation('idle');
                game.removeItem('toadstool');
                game.addItem('powder');
                if (game.equippedB === 'toadstool' || game.equippedB === null) game.equip('B', 'powder');
                player.startItemGet('powder');
                sound.playSfx('item_get', 0.85);
                dialogue.startCustomDialogue(
                  '★ Objet Obtenu ★',
                  [
                    'Vous obtenez de la Poudre Magique !',
                    'Saupoudrez-en sur les torches ou sur les ennemis pour voir ce qui se passe !'
                  ],
                  () => player.finishItemGet()
                );
              }, 1200);
            }
          );
          return true;
        }
        if (game.hasItem('powder')) {
          dialogue.startCustomDialogue(
            'Sorcière Syrup',
            ["Essaie cette Poudre Magique sur tes ennemis, et... surprise ! Si tu es à court, va chercher un autre champignon dans la forêt et je t'en referai !"]
          );
          return true;
        }
        dialogue.startCustomDialogue(
          'Sorcière Syrup',
          ["Bouillonne, chaudron, bouillonne ! Un champignon dans ma mixture, et voilà de la poudre pure !"]
        );
        return true;
      }
    }
  ],
  ow_r05_c01: [
    {
      id: 'raccoon',
      animator: 'raccoon',
      animation: 'idle',
      behavior: 'static',
      x: 112,
      y: 48,
      body: PERSON,
      speaker: 'Raton-Laveur',
      onTalk: ({ game, npc, player, dialogue, sound }) => {
        if (game.isChestOpened('ow_r05_c01', 'raccoon_transformed')) {
          dialogue.startCustomDialogue(
            'Tarkin',
            ["Ouh là là... Quelle aventure ! Je ferais bien d'éviter de croquer dans des champignons bizarres..."]
          );
          return true;
        }
        if (game.hasItem('powder')) {
          dialogue.startCustomDialogue(
            'Raton-Laveur',
            [
              "Grrr ! Mon pif me chatouille !",
              "Link saupoudre de la Poudre Magique sur le museau du raton-laveur !"
            ],
            () => {
              npc.playAnimation('rotate');
              sound.playSfx('menu_select', 0.8);
              setTimeout(() => {
                npc.setAnimator('tarin', 'stand_3');
                sound.playSfx('treasure', 0.85);
                game.markChestOpened('ow_r05_c01', 'raccoon_transformed');
                dialogue.startCustomDialogue(
                  'Tarkin',
                  [
                    "Aie aie aie... J'ai la tête qui tourne comme une toupie !",
                    "Qu'est-ce que je fais là ? J'ai rêvé que j'étais un raton-laveur...",
                    "J'ai dû manger un champignon pas très frais en venant cueillir des noisettes.",
                    "Bon, je ferais mieux de rentrer à la maison !"
                  ]
                );
              }, 1200);
            }
          );
          return true;
        }
        dialogue.startCustomDialogue(
          'Raton-Laveur',
          ["Héhéhé ! Mon pif me gratte, mais tu ne passeras pas ! Va faire un tour ailleurs !"]
        );
        return true;
      }
    }
  ],

  ulrira: [
    {
      id: 'ulrira', animator: 'npc04', behavior: 'static', animation: 'stand_0', x: 64, y: 40, body: PERSON,
      speaker: 'Pépé le Ramollo',
      pages: [["Euh… Hum… Comment dire… Appelle-moi… Dehors… …", "On dirait que le vieux Pépé le Ramollo est un grand timide, en personne…"]]
    }
  ],
  meow_house: [
    {
      id: 'madam_meowmeow', animator: 'npc09', behavior: 'look', x: 64, y: 48, body: PERSON, speaker: 'Mme Miaou',
      pages: [['Ho ho ho ! Mon Toutou est si fier de sa belle fourrure !']]
    },
    {
      id: 'small_bowwow_meow', animator: 'bowWowSmall', behavior: 'hop', x: 32, y: 32, body: { x: -5, y: -8, w: 10, h: 8 },
      speaker: 'Petit Toutou', sfx: 'bowwow_yip', pages: [['OUAF OUAF !\nOUAF OUAF !']]
    }
  ],
  bowwow_kennel: [
    {
      id: 'small_bowwow_kennel', animator: 'bowWowSmall', behavior: 'hop', x: 64, y: 40, body: { x: -5, y: -8, w: 10, h: 8 },
      speaker: 'Petit Toutou', sfx: 'bowwow_yip',
      pages: [['Du maquillage ! Des bijoux ! Des robes ! Je veux tout ! Soupir… Et quelques nouveaux accessoires, ce serait bien…']]
    }
  ],
  quadruplets_house_e: [
    {
      id: 'quadruplets_mother', animator: 'npc07', behavior: 'static', animation: 'stand', x: 32, y: 48, body: { x: -8, y: -10, w: 16, h: 10 },
      speaker: 'Mère des quadruplés',
      pages: [[
        'Ils se ressemblent tellement que même moi, je m’y perds parfois…',
        'Au fait, mon bébé voudrait une poupée Yoshi. J’en ai vu une au Jeu de hasard, mais je n’ai pas réussi à l’attraper.'
      ]]
    }
  ],
  shop: [
    {
      id: 'shopkeeper', animator: 'shopkeeper', behavior: 'lookRandom', x: 112, y: 80, body: { x: -7, y: -10, w: 14, h: 10 },
      speaker: 'Marchand', pages: [['Hé ! Bienvenue ! Quelque chose te plaît ?! Apporte-le-moi ici !']]
    }
  ],
  trendy_game: [
    {
      id: 'trendy', animator: 'npc_trendy', behavior: 'static', animation: 'stand_0', x: 128, y: 94, body: { x: -4, y: -8, w: 8, h: 8 },
      speaker: 'Gérant', pages: [['JEU DE HASARD !\n10 rubis la partie.', 'Les boutons A et B déplacent la grue… Le reste, c’est une question de timing ! (Le jeu n’est pas encore ouvert.)']]
    }
  ],
  ow_r08_c01: [
    {
      id: 'fisherman', animator: 'npc_fisherman', behavior: 'static', animation: 'stand', x: 96, y: 63, body: { x: -8, y: -11, w: 15, h: 11 },
      speaker: 'Pêcheur', pages: [['Ça te dirait d’aller à la pêche, mon petit ?', 'Je ne te prendrai que 10 rubis… (La pêche n’est pas encore ouverte.)']]
    }
  ],
  ow_r08_c03: [
    { id: 'npc_boy_1', animator: 'npc_green_boy', behavior: 'look', x: 80, y: 32, body: PERSON, speaker: 'Gamin', pages: KIDS_HELP, talkKey: 'npc05_help' }
  ],
  ow_r09_c02: [
    {
      id: 'npc_boy_2', animator: 'npc_green_boy', behavior: 'look', x: 112, y: 80, body: PERSON, speaker: 'Gamin',
      pages: [["Marine ? Elle aime aller regarder l'océan toute seule… Pourquoi ? Hé, je suis qu'un gamin, demande pas !"]]
    },
    { id: 'dog_square', animator: 'dog', behavior: 'hop', x: 48, y: 96, body: { x: -6, y: -8, w: 12, h: 8 }, speaker: 'Chien', pages: [['GRRRR…']] }
  ],
  ow_r10_c01: [
    {
      id: 'bowwow', animator: 'BowWow', behavior: 'chained', x: 68, y: 68, body: { x: -7, y: -10, w: 14, h: 10 },
      speaker: 'Toutou', sfx: 'bowwow_yip', pages: [['OUAF ! OUAF !']]
    },
    { id: 'dog_meow', animator: 'dog', behavior: 'hop', x: 112, y: 16, body: { x: -6, y: -8, w: 12, h: 8 }, speaker: 'Chien', pages: [['GRRRR…']] }
  ],
  ow_r11_c00: [
    {
      // npc_boy_ball_left/right state 0 -> npc05_help (their npc_ball_* lines come later in the story)
      id: 'ball_game', animator: 'npc_boy_left', behavior: 'ballGame', x: 64, y: 64, body: PERSON, speaker: 'Gamin',
      pages: KIDS_HELP, talkKey: 'npc05_help'
    }
  ],
  ow_r11_c01: [
    {
      id: 'grandma_ulrira', animator: 'npc_woman_broom', behavior: 'lookSide', x: 112, y: 80, body: { x: -7, y: -12, w: 14, h: 12 },
      speaker: 'Mamie Youpi', pages: [['YAHOU ! Je vais très bien, et toi ?!']]
    }
  ],
  ow_r11_c03: [
    { id: 'npc_boy_0', animator: 'npc_green_boy', behavior: 'look', animation: 'stand_3', x: 32, y: 80, body: PERSON, speaker: 'Gamin', pages: KIDS_HELP, talkKey: 'npc05_help' },
    { id: 'dog_trendy', animator: 'dog', behavior: 'hop', x: 32, y: 32, body: { x: -6, y: -8, w: 12, h: 8 }, speaker: 'Chien', pages: [['GRRRR…']] }
  ]
};
