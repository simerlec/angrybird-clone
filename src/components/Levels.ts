const DISTANCE_FROM_GROUND = 205;

type BoxType = "tower" | "wall";

interface Box {
  x: number;
  y: number;
  count: number;
  type: BoxType;
  width?: number;
  height?: number;
}

export const LEVEL_LAYOUT: Record<
  number,
  {
    boxes: Box[];
    pigs: { x: number; y: number }[];
  }
> = {
  "1": {
    boxes: [
      {
        x: window.innerWidth * 0.75 - 60,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 7,
        type: "tower",
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 4,
        type: "tower",
      },
      {
        x: window.innerWidth * 0.75 + 60,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
        count: 7,
        type: "tower",
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
    boxes: [
      {
        x: window.innerWidth * 0.75 - 50,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 100,
        count: 1,
        type: "wall",
        width: 30,
        height: 100,
      },
      {
        x: window.innerWidth * 0.75 + 100,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 100,
        count: 1,
        type: "wall",
        width: 30,
        height: 100,
      },
      {
        x: window.innerWidth * 0.75 + 25,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 130,
        count: 1,
        type: "wall",
        width: 250,
        height: 20,
      },
      {
        x: window.innerWidth * 0.75 - 50,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 170,
        count: 1,
        type: "wall",
        width: 30,
        height: 100,
      },
      {
        x: window.innerWidth * 0.75 + 100,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 170,
        count: 1,
        type: "wall",
        width: 30,
        height: 100,
      },
      {
        x: window.innerWidth * 0.75 + 25,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 200,
        count: 1,
        type: "wall",
        width: 250,
        height: 20,
      },
    ],

    pigs: [
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 300,
      },
      {
        x: window.innerWidth * 0.75 + 200,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
      },
      {
        x: window.innerWidth * 0.75 + 25,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 140,
      },
    ],
  },
  "3": {
    boxes: [
      // First house (bottom) - much wider to support top houses
      {
        x: window.innerWidth * 0.75 - 300,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 100,
        count: 1,
        type: "wall",
        width: 30,
        height: 200,
      },
      {
        x: window.innerWidth * 0.75 + 300,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 100,
        count: 1,
        type: "wall",
        width: 30,
        height: 200,
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 200,
        count: 1,
        type: "wall",
        width: 600,
        height: 30,
      },
      // Second house (top right) - well within the right side of bottom house
      {
        x: window.innerWidth * 0.75 + 150,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 400,
        count: 1,
        type: "wall",
        width: 20,
        height: 200,
      },
      {
        x: window.innerWidth * 0.75 + 250,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 400,
        count: 1,
        type: "wall",
        width: 20,
        height: 200,
      },
      {
        x: window.innerWidth * 0.75 + 200,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 500,
        count: 1,
        type: "wall",
        width: 100,
        height: 20,
      },
      // Third house (top left) - well within the left side of bottom house
      {
        x: window.innerWidth * 0.75 - 250,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 350,
        count: 1,
        type: "wall",
        width: 20,
        height: 150,
      },
      {
        x: window.innerWidth * 0.75 - 150,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 350,
        count: 1,
        type: "wall",
        width: 20,
        height: 150,
      },
      {
        x: window.innerWidth * 0.75 - 200,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 425,
        count: 1,
        type: "wall",
        width: 200,
        height: 20,
      },
    ],
    pigs: [
      // Pig in bottom house
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight - DISTANCE_FROM_GROUND,
      },
      // Pig in top right house
      {
        x: window.innerWidth * 0.75 + 200,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 250,
      },
      // Two pigs in top left house
      {
        x: window.innerWidth * 0.75 - 170,
        y: window.innerHeight - DISTANCE_FROM_GROUND - 455,
      },
    ],
  },
};
