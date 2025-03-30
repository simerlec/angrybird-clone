import { useEffect, useRef } from "react";
import { Bodies, Composite, Events } from "matter-js";

const blockImage = "/block.png";

interface TowerProps {
  world: Matter.World;
  engine: Matter.Engine;
}

interface CollisionEvent {
  pairs: Array<{
    bodyA: Matter.Body;
    bodyB: Matter.Body;
  }>;
}

export function Tower({ world, engine }: TowerProps) {
  const towerRefs = useRef<Matter.Body[]>([]);
  const pigRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    // Clean up previous tower
    towerRefs.current.forEach(body => Composite.remove(world, body));
    towerRefs.current = [];

    // Create simple tower of boxes
    const towerRows = 8;
    const boxSize = 60;
    const towerX = (window.innerWidth * 3) / 4;
    const towerY = window.innerHeight - (towerRows * boxSize) - 225;

    for (let row = 0; row < towerRows; row++) {
      const x = towerX;
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

    // Add green ball at the top of the tower
    const greenBall = Bodies.circle(
      towerX,
      towerY - 30, // Place it slightly above the top box
      30,
      {
        render: {
          fillStyle: "#4CAF50",
        },
        label: 'pig', // Add label for collision detection
      }
    );
    Composite.add(world, greenBall);
    towerRefs.current.push(greenBall);
    pigRef.current = greenBall;

    // Add collision event listener
    const handleCollision = (event: CollisionEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if either body is the pig
        if (bodyA.label === 'pig' || bodyB.label === 'pig') {
          const pig = bodyA.label === 'pig' ? bodyA : bodyB;
          const other = bodyA.label === 'pig' ? bodyB : bodyA;

          // Calculate collision speed
          const speed = Math.sqrt(
            Math.pow(pig.velocity.x, 2) + 
            Math.pow(pig.velocity.y, 2)
          );

          console.log("pig hit something", speed);

          // If pig hits something at high speed or is hit by the bird, remove it
          if (speed > 5 || other.collisionFilter.group === -1) {
            Composite.remove(world, pig);
            pigRef.current = null;
          }
        }
      });
    };

    // Add update event listener to check if pig is out of bounds
    const handleUpdate = () => {
      if (pigRef.current) {
        const pig = pigRef.current;
        const margin = 100; // Extra margin to ensure pig is fully off screen

        // Check if pig is outside viewport
        if (
          pig.position.x < -margin ||
          pig.position.x > window.innerWidth + margin ||
          pig.position.y < -margin ||
          pig.position.y > window.innerHeight + margin
        ) {
          console.log("pig left viewport");
          Composite.remove(world, pig);
          pigRef.current = null;
        }
      }
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