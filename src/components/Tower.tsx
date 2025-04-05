import { useEffect, useRef } from "react";
import { Bodies, Composite, Events, Vector } from "matter-js";
import { LEVEL_LAYOUT } from "./Levels";
import { SCALE } from "../App";

const blockImage = "/block.png";
const pigImage = "/victim_michael.png";

interface TowerProps {
  world: Matter.World;
  engine: Matter.Engine;
  level: { level: number; type: string };
  pigCount: number;
  setPigCount: (count: number | ((prev: number) => number)) => void;
}

interface CollisionEvent {
  pairs: Array<{
    bodyA: Matter.Body;
    bodyB: Matter.Body;
  }>;
}

export function Tower({
  world,
  engine,
  pigCount,
  setPigCount,
  level,
}: TowerProps) {
  const towerRefs = useRef<Matter.Body[]>([]);
  const pigRefs = useRef<Matter.Body[]>([]);

  useEffect(() => {
    console.log(`Pig count changed: ${pigCount}`);
  }, [pigCount]);

  useEffect(() => {
    // Clean up previous tower
    towerRefs.current.forEach((body) => Composite.remove(world, body));
    towerRefs.current = [];
    pigRefs.current = [];

    // Create simple tower of boxes
    const boxSize = 60 * SCALE;

    const levelData = LEVEL_LAYOUT[level.level];
    const towerCount = levelData.towers.length;

    for (let towerIndex = 0; towerIndex < towerCount; towerIndex++) {
      const tower = levelData.towers[towerIndex];
      for (let row = 1; row < tower.count + 1; row++) {
        // const x = row === towerRows - 1 ? towerX - 10 : towerX;
        const x = tower.x;
        const y = tower.y - row * boxSize;
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
  }, [world, engine, level]);

  useEffect(() => {
    // Add collision event listener
    const handleCollision = (event: CollisionEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if either body is a pig
        if (bodyA.label === "pig" || bodyB.label === "pig") {
          const pig = bodyA.label === "pig" ? bodyA : bodyB;
          const other = bodyA.label === "pig" ? bodyB : bodyA;

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
            isBird: other.collisionFilter.group === -1,
          });

          if (
            other.collisionFilter.group === -1 ||
            verticalSpeed > 4 ||
            (impactForce > 4 && speed > 5) ||
            angularSpeed > 2
          ) {
            console.log({
              speed,
              impactForce,
              verticalSpeed,
              angularSpeed,
              isBird: other.collisionFilter.group === -1,
            });
            console.log(
              `Pig destroyed! Remaining pigs: ${pigRefs.current.length - 1}`
            );
            Composite.remove(world, pig);
            pigRefs.current = pigRefs.current.filter((p) => p.id !== pig.id);
            setPigCount((prev: number) => prev - 1);
          }
        }
      });
    };

    // Add update event listener to check if pigs are out of bounds
    const handleUpdate = () => {
      pigRefs.current.forEach((pig) => {
        const margin = 100; // Extra margin to ensure pig is fully off screen

        // Check if pig is outside viewport
        if (
          pig.position.x < -margin ||
          pig.position.x > window.innerWidth + margin ||
          pig.position.y < -margin ||
          pig.position.y > window.innerHeight + margin
        ) {
          console.log(
            `Pig left viewport! Remaining pigs: ${pigRefs.current.length - 1}`
          );
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
      towerRefs.current.forEach((body) => Composite.remove(world, body));
    };
  }, [world, engine, level]);

  return null;
}
