import { useEffect, useRef } from "react";
import { Bodies, Composite, Events, Vector } from "matter-js";

const blockImage = "/block.png";

interface TowerProps {
  world: Matter.World;
  engine: Matter.Engine;
  pigCount: number;
  setPigCount: (count: number | ((prev: number) => number)) => void;
}

interface CollisionEvent {
  pairs: Array<{
    bodyA: Matter.Body;
    bodyB: Matter.Body;
  }>;
}

export function Tower({ world, engine, pigCount, setPigCount }: TowerProps) {
  const towerRefs = useRef<Matter.Body[]>([]);
  const pigRefs = useRef<Matter.Body[]>([]);

  useEffect(() => {
    console.log(`Pig count changed: ${pigCount}`);
  }, [pigCount]);

  useEffect(() => {
    // Clean up previous tower
    towerRefs.current.forEach(body => Composite.remove(world, body));
    towerRefs.current = [];
    pigRefs.current = [];

    // Create simple tower of boxes
    const towerRows = 8;
    const boxSize = 60;
    const towerX = (window.innerWidth * 3) / 4;
    const towerY = window.innerHeight - (towerRows * boxSize) - 225;

    for (let row = 0; row < towerRows; row++) {
      const x = row === towerRows-1 ? towerX - 10 : towerX ;
      const y = towerY + row * boxSize;
      const box = Bodies.rectangle(x, y, boxSize, boxSize, {
        render: {
          sprite: {
            texture: blockImage,
            xScale: (boxSize + 10) / 128,
            yScale: (boxSize + 10) / 128,
          },
        },
      });
      Composite.add(world, box);
      towerRefs.current.push(box);
    }

    // Add two green balls at the top of the tower
    // const pigPositions = [
    //   { x: towerX - 40, y: towerY - 30 },
    //   { x: towerX + 40, y: towerY - 30 }
    // ];
    const pigPositions = [
      { x: window.innerWidth - 550, y: window.innerHeight - 250 },
      { x: window.innerWidth - 400, y: window.innerHeight - 250 }
    ];

    pigPositions.forEach(({ x, y }) => {
      const greenBall = Bodies.circle(x, y, 30, {
        render: {
          fillStyle: "#4CAF50",
        },
        label: 'pig',
      });
      Composite.add(world, greenBall);
      towerRefs.current.push(greenBall);
      pigRefs.current.push(greenBall);
    });
    setPigCount(pigPositions.length);
  }, [world, engine]);

  useEffect(() => {
    // Add collision event listener
    const handleCollision = (event: CollisionEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if either body is a pig
        if (bodyA.label === 'pig' || bodyB.label === 'pig') {
          const pig = bodyA.label === 'pig' ? bodyA : bodyB;
          const other = bodyA.label === 'pig' ? bodyB : bodyA;

          // Calculate collision speed
          const speed = Math.sqrt(
            Math.pow(pig.velocity.x, 2) + 
            Math.pow(pig.velocity.y, 2)
          );

          // Calculate impact force using relative velocity
          const relativeVelocity = Vector.sub(pig.velocity, other.velocity);
          const impactForce = Vector.magnitude(relativeVelocity);

          // If pig hits something at high speed or is hit hard enough, remove it
          if (speed > 5 || impactForce > 5 || other.collisionFilter.group === -1) {
            console.log(`Pig destroyed! Remaining pigs: ${pigRefs.current.length - 1}`);
            Composite.remove(world, pig);
            pigRefs.current = pigRefs.current.filter(p => p.id !== pig.id);
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
          console.log(`Pig left viewport! Remaining pigs: ${pigRefs.current.length - 1}`);
          Composite.remove(world, pig);
          pigRefs.current = pigRefs.current.filter(p => p.id !== pig.id);
          setPigCount((prev: number) => prev - 1);
        }
      });
    };

    // Add event listeners
    Events.on(engine, 'collisionStart', handleCollision);
    Events.on(engine, 'afterUpdate', handleUpdate);

    return () => {
      Events.off(engine, 'collisionStart', handleCollision);
      Events.off(engine, 'afterUpdate', handleUpdate);
      towerRefs.current.forEach(body => Composite.remove(world, body));
    };
  }, [world, engine]);

  return null;
} 