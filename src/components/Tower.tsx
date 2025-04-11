import { useEffect, useRef, useState } from "react";
import { Bodies, Composite, Events, Vector } from "matter-js";
import { LEVEL_LAYOUT } from "./Levels";
import { SCALE } from "../App";
import { SpeechBubble } from "./SpeechBubble";

const blockImage = "/block.png";
const pigImage = "/victim_michael.png";
const prisonMichaelImage = "/prison_michael.png";

interface TowerProps {
  world: Matter.World;
  engine: Matter.Engine;
  level: { level: number; type: string };
  pigCount: number;
  setPigCount: (count: number | ((prev: number) => number)) => void;
  angryModeActivated: boolean;
}

interface CollisionEvent {
  pairs: Array<{
    bodyA: Matter.Body;
    bodyB: Matter.Body;
    collision: {
      depth: number;
      normal: Matter.Vector;
    };
  }>;
}

type SpeechBubbleState =
  | {
      type: "show";
      text: string;
    }
  | {
      type: "hide";
    };

export function Tower({
  world,
  engine,
  pigCount,
  setPigCount,
  level,
  angryModeActivated,
}: TowerProps) {
  const towerRefs = useRef<Matter.Body[]>([]);
  const pigRefs = useRef<Matter.Body[]>([]);
  const pigsCanBeDestroyed = useRef(false);
  const pigPressure = useRef<
    Record<number, { time: number; contacts: number }>
  >({});
  const [speechBubbleState, setSpeechBubbleState] = useState<SpeechBubbleState>(
    {
      type: "hide",
    }
  );
  const [finalPigPosition, setFinalPigPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (speechBubbleState.type === "show") {
      const timer = setTimeout(() => {
        setSpeechBubbleState({ type: "hide" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [speechBubbleState]);

  useEffect(() => {
    pigsCanBeDestroyed.current = false;
    setTimeout(() => {
      pigsCanBeDestroyed.current = true;
    }, 1000);
  }, [level]);

  useEffect(() => {
    if (angryModeActivated) {
      setSpeechBubbleState({ type: "show", text: "Oh no, that's not good!" });
    }
  }, [angryModeActivated]);

  useEffect(() => {
    if (level.level === 4) {
      // Clean up previous tower
      towerRefs.current.forEach((body) => Composite.remove(world, body));
      towerRefs.current = [];
      pigRefs.current = [];

      const levelData = LEVEL_LAYOUT[level.level];
      const pigPositions = levelData.pigs;
      const ballRadius = 50;

      pigPositions.forEach(({ x, y }) => {
        const greenBall = Bodies.circle(x, y, 150, {
          render: {
            sprite: {
              texture: prisonMichaelImage,
              xScale: (ballRadius * 2 + 10) / 128,
              yScale: (ballRadius * 2 + 8) / 128,
            },
          },
          label: "pig",
          isStatic: true,
        });
        Composite.add(world, greenBall);
        towerRefs.current.push(greenBall);
        pigRefs.current.push(greenBall);
      });
      setPigCount(pigPositions.length);
    }
    return () => {
      towerRefs.current.forEach((body) => Composite.remove(world, body));
    };
  }, [level]);

  useEffect(() => {
    if (level.level === 4) {
      return;
    }

    // Clean up previous tower
    towerRefs.current.forEach((body) => Composite.remove(world, body));
    towerRefs.current = [];
    pigRefs.current = [];

    // Create simple tower of boxes
    const boxSize = 60 * SCALE;

    const levelData = LEVEL_LAYOUT[level.level];
    const boxCount = levelData.boxes.length;

    for (let boxIndex = 0; boxIndex < boxCount; boxIndex++) {
      const boxData = levelData.boxes[boxIndex];

      if (boxData.type === "tower") {
        // Handle tower boxes (stacked)
        for (let row = 1; row < boxData.count + 1; row++) {
          const x = boxData.x;
          const y = boxData.y - row * boxSize;

          const box = Bodies.rectangle(x, y, boxSize, boxSize, {
            render: {
              sprite: {
                texture: blockImage,
                xScale: (boxSize + 10) / 128,
                yScale: (boxSize + 10) / 128,
              },
            },
            restitution: 0.1,
            friction: 1,
            frictionAir: 0.01,
            density: 0.001,
          });
          Composite.add(world, box);
          towerRefs.current.push(box);
        }
      } else {
        // Handle wall boxes (single element)
        const width = boxData.width || boxSize * 2;
        const height = boxData.height || boxSize * 0.5;

        const box = Bodies.rectangle(boxData.x, boxData.y, width, height, {
          render: {
            fillStyle: "#8B4513",
          },
          restitution: 0.1,
          friction: 1,
          frictionAir: 0.01,
          density: 0.001,
        });
        Composite.add(world, box);
        towerRefs.current.push(box);
      }
    }

    const ballRadius = 50 * SCALE;
    const pigPositions = levelData.pigs;

    pigPositions.forEach(({ x, y }) => {
      const greenBall = Bodies.circle(x, y, 30 * SCALE, {
        render: {
          sprite: {
            texture: pigImage,
            xScale: (ballRadius * 2 + 10) / 128,
            yScale: (ballRadius * 2 + 8) / 128,
          },
        },
        restitution: 0.1,
        friction: 1,
        frictionAir: 0.01,
        density: 0.001,
        label: "pig",
      });
      Composite.add(world, greenBall);
      towerRefs.current.push(greenBall);
      pigRefs.current.push(greenBall);
    });
    setPigCount(pigPositions.length);
    return () => {
      towerRefs.current.forEach((body) => Composite.remove(world, body));
    };
  }, [world, engine, level]);

  useEffect(() => {
    // Add collision event listener
    const handleCollision = (event: CollisionEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if either body is a pig
        if (bodyA.label === "pig" || bodyB.label === "pig") {
          if (level.level >= 4 && !angryModeActivated) {
            const pig = bodyA.label === "pig" ? bodyA : bodyB;
            setFinalPigPosition({ x: pig.position.x, y: pig.position.y });
            setSpeechBubbleState({ type: "show", text: getSpeechBubbleText() });
            return;
          }

          if (bodyA.label === "pig" || bodyB.label === "pig") {
            if (level.level >= 4 && !angryModeActivated) {
              return;
            }

            const pig = bodyA.label === "pig" ? bodyA : bodyB;
            const other = bodyA.label === "pig" ? bodyB : bodyA;

            // Track sustained pressure
            const now = Date.now();
            if (!pigPressure.current[pig.id]) {
              pigPressure.current[pig.id] = { time: now, contacts: 1 };
            } else {
              pigPressure.current[pig.id].contacts++;
              // If pig has been under pressure for more than 2 seconds with multiple contacts
              if (
                now - pigPressure.current[pig.id].time > 2000 &&
                pigPressure.current[pig.id].contacts > 3
              ) {
                if (pigsCanBeDestroyed.current) {
                  console.log("Pig destroyed by sustained pressure!");
                  Composite.remove(world, pig);
                  pigRefs.current = pigRefs.current.filter(
                    (p) => p.id !== pig.id
                  );
                  setPigCount((prev: number) => prev - 1);
                  delete pigPressure.current[pig.id];
                  return;
                }
              }
            }

            // Calculate collision speed
            const speed = Math.sqrt(
              Math.pow(pig.velocity.x, 2) + Math.pow(pig.velocity.y, 2)
            );

            // Calculate impact force using relative velocity
            const relativeVelocity = Vector.sub(pig.velocity, other.velocity);
            const impactForce = Vector.magnitude(relativeVelocity);

            // Calculate vertical velocity (for fall damage)
            const verticalSpeed = Math.abs(pig.velocity.y);

            // Calculate angular velocity (for spinning damage)
            const angularSpeed = Math.abs(pig.angularVelocity);

            // Log values for debugging

            // Pig dies if:
            // 1. Hit by bird directly
            // 2. Falling too fast (vertical speed > 8)
            // 3. Hit by something moving fast (impactForce > 8)
            // 4. Spinning too fast (angularSpeed > 2)
            console.log({
              speed,
              impactForce,
              verticalSpeed,
              angularSpeed,
              crushDepth: pair.collision?.depth,
              isBird: other.collisionFilter.group === -1,
            });

            if (
              pigsCanBeDestroyed.current &&
              (other.collisionFilter.group === -1 ||
                verticalSpeed > 4 ||
                (impactForce > 8 && speed > 5) ||
                angularSpeed > 2 ||
                (pair.collision && pair.collision.depth > 1))
            ) {
              Composite.remove(world, pig);
              pigRefs.current = pigRefs.current.filter((p) => p.id !== pig.id);
              setPigCount((prev: number) => prev - 1);
            }
          }
        }
      });
    };

    // Clean up pressure tracking when pig leaves viewport
    const handleUpdate = () => {
      pigRefs.current.forEach((pig) => {
        const margin = 100;
        if (
          pig.position.x < -margin ||
          pig.position.x > window.innerWidth + margin ||
          pig.position.y < -margin ||
          pig.position.y > window.innerHeight + margin
        ) {
          delete pigPressure.current[pig.id];
          Composite.remove(world, pig);
          pigRefs.current = pigRefs.current.filter((p) => p.id !== pig.id);
          setPigCount((prev: number) => prev - 1);
        }
      });
    };

    // Add event listeners
    Events.on(engine, "collisionStart", handleCollision);
    Events.on(engine, "afterUpdate", handleUpdate);

    return () => {
      Events.off(engine, "collisionStart", handleCollision);
      Events.off(engine, "afterUpdate", handleUpdate);
    };
  }, [world, engine, level, angryModeActivated]);

  return (
    <>
      {speechBubbleState.type === "show" && (
        <SpeechBubble
          text={speechBubbleState.text}
          x={finalPigPosition.x}
          y={finalPigPosition.y}
        />
      )}
    </>
  );
}

function getSpeechBubbleText(): string {
  const texts = [
    "Hahaha!",
    "That doesn't hurt me!",
    "Is that all you got?",
    "Pathetic throw!",
    "You'll never win!",
    "I'm too powerful!",
    "Nice try, noodle arms!",
    "Can't touch this!",
    "Better luck next time!",
  ];

  return texts[Math.floor(Math.random() * texts.length)];
}
