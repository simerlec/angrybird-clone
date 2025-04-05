const DISTANCE_FROM_GROUND = 205;

export const LEVEL_LAYOUT: Record<
  number,
  {
    towers: { x: number; y: number; count: number }[];
    pigs: { x: number; y: number }[];
  }
> = {
  "1": {
    towers: [
      {
        x: window.innerWidth * 0.75 - 60,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 7,
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 4,
      },
      {
        x: window.innerWidth * 0.75 + 60,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 7,
      },
    ],
    pigs: [
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - 60 * 3 - DISTANCE_FROM_GROUND,
      },
    ],
  },
  "2": {
    towers: [
      {
        x: window.innerWidth * 0.75 - 60,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 7,
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 4,
      },
      {
        x: window.innerWidth * 0.75 + 60,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 7,
      },
    ],
    pigs: [
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - 60 * 3 - DISTANCE_FROM_GROUND,
      },
      {
        x: window.innerWidth * 0.75 - 100,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
      },
    ],
  },
};
