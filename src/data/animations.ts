export interface AnimationFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  renderW: number;
  renderH: number;
  originX: number;
  originY: number;
}

export interface AnimationDef {
  frameTime: number;
  loop: boolean;
  frames: AnimationFrame[];
}

export const ANIMATIONS: Record<string, AnimationDef> = {
  "link_intro_sleep": {
    "frameTime": 600,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 4,
        "w": 164,
        "h": 249,
        "renderW": 25.5,
        "renderH": 49.0,
        "originX": 12.75,
        "originY": 33.0
      }
    ]
  },
  "link_intro_wake": {
    "frameTime": 280,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 4,
        "w": 164,
        "h": 249,
        "renderW": 25.5,
        "renderH": 49.0,
        "originX": 12.75,
        "originY": 33.0
      },
      {
        "x": 174,
        "y": 4,
        "w": 164,
        "h": 249,
        "renderW": 25.5,
        "renderH": 49.0,
        "originX": 12.75,
        "originY": 33.0
      },
      {
        "x": 344,
        "y": 4,
        "w": 164,
        "h": 249,
        "renderW": 25.5,
        "renderH": 49.0,
        "originX": 12.75,
        "originY": 33.0
      }
    ]
  },
  "link_intro_sit": {
    "frameTime": 400,
    "loop": true,
    "frames": [
      {
        "x": 344,
        "y": 4,
        "w": 164,
        "h": 249,
        "renderW": 25.5,
        "renderH": 49.0,
        "originX": 12.75,
        "originY": 33.0
      }
    ]
  },
  "link_jump": {
    "frameTime": 200,
    "loop": false,
    "frames": [
      {
        "x": 514,
        "y": 4,
        "w": 112,
        "h": 170,
        "renderW": 13.84,
        "renderH": 21.0,
        "originX": 6.92,
        "originY": 18.9
      }
    ]
  },
  "link_idle_down": {
    "frameTime": 1800,
    "loop": true,
    "frames": [
      {
        "x": 899,
        "y": 4,
        "w": 79,
        "h": 156,
        "renderW": 10.63,
        "renderH": 21.0,
        "originX": 5.32,
        "originY": 19.95
      }
    ]
  },
  "link_idle_up": {
    "frameTime": 1800,
    "loop": true,
    "frames": [
      {
        "x": 4,
        "y": 259,
        "w": 81,
        "h": 162,
        "renderW": 10.5,
        "renderH": 21.0,
        "originX": 5.25,
        "originY": 19.95
      }
    ]
  },
  "link_idle_left": {
    "frameTime": 1800,
    "loop": true,
    "frames": [
      {
        "x": 550,
        "y": 259,
        "w": 82,
        "h": 158,
        "renderW": 10.9,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      }
    ]
  },
  "link_idle_right": {
    "frameTime": 1800,
    "loop": true,
    "frames": [
      {
        "x": 274,
        "y": 259,
        "w": 82,
        "h": 158,
        "renderW": 10.9,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      }
    ]
  },
  "link_walk_down": {
    "frameTime": 130,
    "loop": true,
    "frames": [
      {
        "x": 717,
        "y": 4,
        "w": 83,
        "h": 160,
        "renderW": 10.89,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      },
      {
        "x": 899,
        "y": 4,
        "w": 79,
        "h": 156,
        "renderW": 10.63,
        "renderH": 21.0,
        "originX": 5.32,
        "originY": 19.95
      },
      {
        "x": 806,
        "y": 4,
        "w": 87,
        "h": 161,
        "renderW": 11.35,
        "renderH": 21.0,
        "originX": 5.67,
        "originY": 19.95
      },
      {
        "x": 899,
        "y": 4,
        "w": 79,
        "h": 156,
        "renderW": 10.63,
        "renderH": 21.0,
        "originX": 5.32,
        "originY": 19.95
      }
    ]
  },
  "link_walk_up": {
    "frameTime": 130,
    "loop": true,
    "frames": [
      {
        "x": 91,
        "y": 259,
        "w": 85,
        "h": 164,
        "renderW": 10.88,
        "renderH": 21.0,
        "originX": 5.44,
        "originY": 19.95
      },
      {
        "x": 4,
        "y": 259,
        "w": 81,
        "h": 162,
        "renderW": 10.5,
        "renderH": 21.0,
        "originX": 5.25,
        "originY": 19.95
      },
      {
        "x": 182,
        "y": 259,
        "w": 86,
        "h": 162,
        "renderW": 11.15,
        "renderH": 21.0,
        "originX": 5.58,
        "originY": 19.95
      },
      {
        "x": 4,
        "y": 259,
        "w": 81,
        "h": 162,
        "renderW": 10.5,
        "renderH": 21.0,
        "originX": 5.25,
        "originY": 19.95
      }
    ]
  },
  "link_walk_left": {
    "frameTime": 130,
    "loop": true,
    "frames": [
      {
        "x": 638,
        "y": 259,
        "w": 86,
        "h": 158,
        "renderW": 11.43,
        "renderH": 21.0,
        "originX": 5.71,
        "originY": 19.95
      },
      {
        "x": 550,
        "y": 259,
        "w": 82,
        "h": 158,
        "renderW": 10.9,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      },
      {
        "x": 730,
        "y": 259,
        "w": 90,
        "h": 158,
        "renderW": 11.96,
        "renderH": 21.0,
        "originX": 5.98,
        "originY": 19.95
      },
      {
        "x": 550,
        "y": 259,
        "w": 82,
        "h": 158,
        "renderW": 10.9,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      }
    ]
  },
  "link_walk_right": {
    "frameTime": 130,
    "loop": true,
    "frames": [
      {
        "x": 362,
        "y": 259,
        "w": 86,
        "h": 158,
        "renderW": 11.43,
        "renderH": 21.0,
        "originX": 5.71,
        "originY": 19.95
      },
      {
        "x": 274,
        "y": 259,
        "w": 82,
        "h": 158,
        "renderW": 10.9,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      },
      {
        "x": 454,
        "y": 259,
        "w": 90,
        "h": 158,
        "renderW": 11.96,
        "renderH": 21.0,
        "originX": 5.98,
        "originY": 19.95
      },
      {
        "x": 274,
        "y": 259,
        "w": 82,
        "h": 158,
        "renderW": 10.9,
        "renderH": 21.0,
        "originX": 5.45,
        "originY": 19.95
      }
    ]
  },
  "link_sword_down": {
    "frameTime": 50,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 600,
        "w": 209,
        "h": 210,
        "renderW": 28.32,
        "renderH": 28.45,
        "originX": 8.33,
        "originY": 27.91
      },
      {
        "x": 225,
        "y": 600,
        "w": 254,
        "h": 176,
        "renderW": 34.41,
        "renderH": 23.85,
        "originX": 19.32,
        "originY": 23.3
      },
      {
        "x": 491,
        "y": 600,
        "w": 210,
        "h": 169,
        "renderW": 28.45,
        "renderH": 22.9,
        "originX": 12.86,
        "originY": 22.76
      }
    ]
  },
  "link_sword_up": {
    "frameTime": 50,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 822,
        "w": 150,
        "h": 208,
        "renderW": 20.32,
        "renderH": 28.18,
        "originX": 10.19,
        "originY": 27.64
      },
      {
        "x": 166,
        "y": 822,
        "w": 254,
        "h": 206,
        "renderW": 34.41,
        "renderH": 27.91,
        "originX": 19.7,
        "originY": 27.37
      },
      {
        "x": 432,
        "y": 822,
        "w": 119,
        "h": 212,
        "renderW": 16.12,
        "renderH": 28.72,
        "originX": 9.1,
        "originY": 28.59
      }
    ]
  },
  "link_sword_side": {
    "frameTime": 50,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 1046,
        "w": 154,
        "h": 200,
        "renderW": 20.86,
        "renderH": 27.1,
        "originX": 11.29,
        "originY": 26.55
      },
      {
        "x": 170,
        "y": 1046,
        "w": 310,
        "h": 169,
        "renderW": 42.0,
        "renderH": 22.9,
        "originX": 11.75,
        "originY": 22.35
      },
      {
        "x": 492,
        "y": 1046,
        "w": 276,
        "h": 205,
        "renderW": 37.39,
        "renderH": 27.77,
        "originX": 7.6,
        "originY": 27.23
      }
    ]
  },
  "link_sword_charge": {
    "frameTime": 100,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 1263,
        "w": 192,
        "h": 184,
        "renderW": 26.01,
        "renderH": 24.93,
        "originX": 8.33,
        "originY": 24.39
      }
    ]
  },
  "link_spin_attack": {
    "frameTime": 60,
    "loop": true,
    "frames": [
      {
        "x": 208,
        "y": 1263,
        "w": 395,
        "h": 179,
        "renderW": 53.52,
        "renderH": 24.25,
        "originX": 33.69,
        "originY": 23.71
      },
      {
        "x": 615,
        "y": 1263,
        "w": 231,
        "h": 187,
        "renderW": 31.3,
        "renderH": 25.34,
        "originX": 16.15,
        "originY": 24.79
      }
    ]
  },
  "link_shield_block_down": {
    "frameTime": 100,
    "loop": false,
    "frames": [
      {
        "x": 713,
        "y": 600,
        "w": 124,
        "h": 167,
        "renderW": 16.8,
        "renderH": 22.63,
        "originX": 10.97,
        "originY": 22.08
      }
    ]
  },
  "link_shield_block_up": {
    "frameTime": 100,
    "loop": false,
    "frames": [
      {
        "x": 563,
        "y": 822,
        "w": 110,
        "h": 194,
        "renderW": 14.9,
        "renderH": 26.28,
        "originX": 7.43,
        "originY": 25.74
      }
    ]
  },
  "link_shield_block_side": {
    "frameTime": 100,
    "loop": false,
    "frames": [
      {
        "x": 780,
        "y": 1046,
        "w": 137,
        "h": 176,
        "renderW": 18.56,
        "renderH": 23.85,
        "originX": 6.08,
        "originY": 23.3
      }
    ]
  },
  "link_shield_bash": {
    "frameTime": 100,
    "loop": false,
    "frames": [
      {
        "x": 4,
        "y": 1462,
        "w": 207,
        "h": 170,
        "renderW": 28.05,
        "renderH": 23.03,
        "originX": 10.13,
        "originY": 22.49
      }
    ]
  },
  "marin_idle": {
    "frameTime": 600,
    "loop": true,
    "frames": [
      {
        "x": 826,
        "y": 259,
        "w": 84,
        "h": 161,
        "renderW": 11.22,
        "renderH": 21.5,
        "originX": 5.61,
        "originY": 20.43
      }
    ]
  },
  "marin_sing": {
    "frameTime": 550,
    "loop": true,
    "frames": [
      {
        "x": 826,
        "y": 259,
        "w": 84,
        "h": 161,
        "renderW": 11.22,
        "renderH": 21.5,
        "originX": 5.61,
        "originY": 20.43
      },
      {
        "x": 916,
        "y": 259,
        "w": 85,
        "h": 161,
        "renderW": 11.35,
        "renderH": 21.5,
        "originX": 5.67,
        "originY": 20.43
      }
    ]
  },
  "tarin_idle": {
    "frameTime": 700,
    "loop": true,
    "frames": [
      {
        "x": 4,
        "y": 429,
        "w": 134,
        "h": 163,
        "renderW": 18.09,
        "renderH": 22.0,
        "originX": 9.04,
        "originY": 20.9
      }
    ]
  },
  "tarin_sleep": {
    "frameTime": 700,
    "loop": true,
    "frames": [
      {
        "x": 144,
        "y": 429,
        "w": 123,
        "h": 153,
        "renderW": 16.08,
        "renderH": 20.0,
        "originX": 8.04,
        "originY": 19.0
      }
    ]
  },
  "weathercock": {
    "frameTime": 240,
    "loop": true,
    "frames": [
      {
        "x": 273,
        "y": 429,
        "w": 114,
        "h": 139,
        "renderW": 14.76,
        "renderH": 18.0,
        "originX": 7.38,
        "originY": 17.1
      },
      {
        "x": 393,
        "y": 429,
        "w": 93,
        "h": 140,
        "renderW": 11.96,
        "renderH": 18.0,
        "originX": 5.98,
        "originY": 17.1
      },
      {
        "x": 492,
        "y": 429,
        "w": 113,
        "h": 139,
        "renderW": 14.63,
        "renderH": 18.0,
        "originX": 7.32,
        "originY": 17.1
      },
      {
        "x": 611,
        "y": 429,
        "w": 93,
        "h": 140,
        "renderW": 11.96,
        "renderH": 18.0,
        "originX": 5.98,
        "originY": 17.1
      }
    ]
  },
  "flower": {
    "frameTime": 400,
    "loop": true,
    "frames": [
      {
        "x": 710,
        "y": 429,
        "w": 124,
        "h": 110,
        "renderW": 14.65,
        "renderH": 13.0,
        "originX": 7.33,
        "originY": 11.7
      },
      {
        "x": 840,
        "y": 429,
        "w": 138,
        "h": 116,
        "renderW": 15.47,
        "renderH": 13.0,
        "originX": 7.74,
        "originY": 11.7
      }
    ]
  }
};
