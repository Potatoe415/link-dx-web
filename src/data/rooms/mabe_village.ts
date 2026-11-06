import { RoomDef } from './types';

// Marin's house interior + the screen in front of it (overworld r10 c02).
export const MABE_VILLAGE_ROOMS: Record<string, RoomDef> = {
  indoor: {
    id: 'indoor',
    name: "Marin's House (Indoor)",
    width: 160,
    height: 128,
    bgPixel: '/assets/indoor_bg_pixel.png',
    bgGhibli: '/assets/indoor_bg.png',
    spawnPoint: { x: 60.5, y: 48, direction: 3 }, // Exact anchor of the right bed in indoor_bg.png
    warpTriggers: [
      {
        triggerBox: { x: 70, y: 116, w: 20, h: 12 },
        targetRoom: 'outdoor',
        targetX: 85.5,
        targetY: 88,
        targetDirection: 3, // Link exits facing Down onto the dirt path
        requiredDirection: 3 // Must walk Down to exit
      }
    ],
    colliders: [
      // Outer wooden cabin walls
      { x: 0, y: 0, w: 15, h: 128 },     // Left wall
      { x: 145, y: 0, w: 15, h: 128 },   // Right wall
      { x: 15, y: 0, w: 130, h: 15 },    // Top wall
      { x: 15, y: 112, w: 53, h: 16 },   // Bottom wall left of doorway (x: 15..68)
      { x: 92, y: 112, w: 53, h: 16 },   // Bottom wall right of doorway (x: 92..145)

      // Left twin bed (x: 15..41, y: 15..64)
      { x: 15, y: 15, w: 26, h: 49 },

      // Right bed where Link sleeps (x: 48..73, y: 15..64)
      { x: 48, y: 15, w: 25, h: 49 },

      // Two ceramic clay pots in bottom-left corner (x: 16..46, y: 95..112)
      { x: 16, y: 95, w: 30, h: 17 },

      // Top-right wooden chest of drawers (x: 112..128, y: 0..27)
      { x: 112, y: 0, w: 16, h: 27 },

      // Top-right blue-grey storage trunks (x: 127..145, y: 16..48)
      { x: 127, y: 16, w: 18, h: 32 },

      // Dining table & two yellow woven stools on bottom-right
      { x: 129, y: 65, w: 14, h: 13 },   // Upper yellow stool
      { x: 113, y: 79, w: 32, h: 17 },   // Wooden dining table
      { x: 129, y: 98, w: 14, h: 13 }    // Lower yellow stool
    ],
    props: [
      {
        id: 'marin',
        name: 'Marin',
        speakerName: 'Marine',
        x: 92,
        y: 42,
        animation: 'marin_sing',
        collision: { x: 87, y: 35, w: 10, h: 7 },
        zIndex: 10,
        dialogues: [
          [
            "Quelle chance ! Tu es enfin réveillé ! Je suis Marine ! Tu es sur l'île Cocolint !",
            "Je t'ai trouvé échoué sur la plage... J'ai cru que tu ne te réveillerais jamais !",
            "Si tu cherches ton épée, va voir sur la plage au sud du village des Mouettes !"
          ],
          [
            "J'adore chanter la Ballade du Poisson-Rêve ! Si tu tends l'oreille, tu l'entendras dans tout le village.",
            "Prends bien soin de toi dehors, Link !"
          ]
        ]
      },
      {
        id: 'tarin',
        name: 'Tarin',
        speakerName: 'Tarkin',
        x: 103,
        y: 86,
        animation: 'tarin_idle',
        collision: { x: 97, y: 78, w: 12, h: 8 },
        zIndex: 10,
        dialogues: [
          [
            "Hé ! Le p'tit gars est enfin debout ! Moi c'est Tarkin ! Tu as l'air d'aller mieux !",
            "Tiens, j'ai trouvé ça sur la plage avec toi... Ton nom est gravé au dos de ce bouclier !",
            "Fais attention en sortant, des monstres rôdent près des côtes depuis la tempête !"
          ],
          [
            "Rien de tel qu'une bonne poêlée de champignons de la forêt Enchantée ! Hé hé !",
            "N'oublie pas de passer voir la girouette devant la maison !"
          ]
        ]
      }
    ]
  },

  outdoor: {
    id: 'outdoor',
    name: 'Mabe Village (Outdoor 10x8)',
    width: 160,
    height: 128,
    bgPixel: '/assets/outdoor_bg_pixel.png',
    bgGhibli: '/assets/outdoor_bg.png',
    fgPixel: '/assets/outdoor_fg_pixel.png',
    fgGhibli: '/assets/outdoor_fg.png',
    spawnPoint: { x: 85.5, y: 88, direction: 3 },
    warpTriggers: [
      {
        // Cottage front doorway entrance trigger (x: 80..91, y: 68..75)
        triggerBox: { x: 80, y: 68, w: 11, h: 7 },
        targetRoom: 'indoor',
        targetX: 80,
        targetY: 108,
        targetDirection: 1, // Link enters facing Up
        requiredDirection: 1 // Must walk Up into doorway to enter
      }
    ],
    colliders: [
      // 4 Invisible outer bounds locking Link inside the 160x128 screen
      { x: 0, y: 0, w: 6, h: 128 },      // Left screen border
      { x: 154, y: 0, w: 6, h: 128 },    // Right screen border
      { x: 0, y: 0, w: 160, h: 10 },     // Top screen border
      { x: 0, y: 122, w: 160, h: 6 },    // Bottom screen border

      // Cottage facade & roof (x: 62..109, y: 48..80, leaving doorway at x: 80..91 open)
      { x: 62, y: 48, w: 18, h: 32 },    // Left cottage wall
      { x: 91, y: 48, w: 18, h: 32 },    // Right cottage wall
      { x: 80, y: 48, w: 11, h: 20 },    // Roof & lintel above doorway

      // Large Ghibli tree trunk & lower canopy to the right of cottage
      { x: 109, y: 44, w: 23, h: 20 },

      // Rustic wooden post fence surrounding the yard
      { x: 37, y: 14, w: 97, h: 13 },    // Top fence row
      { x: 37, y: 27, w: 7, h: 80 },     // Left fence column
      { x: 37, y: 95, w: 36, h: 12 },    // Bottom-left fence (stops at dirt path x=73)
      { x: 98, y: 95, w: 37, h: 12 },    // Bottom-right fence (starts after path at x=98)
      { x: 128, y: 64, w: 7, h: 43 }     // Right fence column
    ],
    props: [
      {
        id: 'weathercock',
        name: 'Weathercock',
        x: 85.5,
        y: 48,
        animation: 'weathercock',
        zIndex: 25 // On roof peak
      },
      {
        id: 'flower1',
        name: 'Flower Left',
        x: 54,
        y: 74,
        animation: 'flower',
        zIndex: 5
      },
      {
        id: 'flower2',
        name: 'Flower Right',
        x: 116,
        y: 84,
        animation: 'flower',
        zIndex: 5
      }
    ]
  }
};
