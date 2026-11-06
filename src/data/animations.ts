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
