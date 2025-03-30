import { useEffect, useRef } from "react";
import {
  Bodies,
  Composite,
  Constraint,
  Events,
  Vector,
  Body,
} from "matter-js";

const slingshotImage = "/sling.png";
const birdImage = "/bird.png";

interface SlingshotProps {
  world: Matter.World;
  mouseConstraint: Matter.MouseConstraint;
}

export function Slingshot({ world, mouseConstraint }: SlingshotProps) {
  const ballRef = useRef<Matter.Body | null>(null);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const slingshotRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    // Clean up previous bodies
    if (ballRef.current) Composite.remove(world, ballRef.current);
    if (constraintRef.current) Composite.remove(world, constraintRef.current);
    if (slingshotRef.current) Composite.remove(world, slingshotRef.current);

    // Create slingshot
    const slingshotWidth = 100;
    const slingshotHeight = 150;
    const slingshotX = window.innerWidth / 4;
    const slingshotY = window.innerHeight - slingshotHeight / 2 - 225;

    const slingshot = Bodies.rectangle(
      slingshotX,
      slingshotY,
      slingshotWidth,
      slingshotHeight,
      {
        isStatic: true,
        render: {
          sprite: {
            texture: slingshotImage,
            xScale: slingshotWidth / 128,
            yScale: slingshotHeight / 128,
          },
        },
        collisionFilter: {
          group: -1,
        },
      }
    );

    // Create initial ball
    const ballRadius = 50;
    const ball = Bodies.circle(
      slingshotX,
      slingshotY - slingshotHeight / 2 + ballRadius - 100,
      ballRadius,
      {
        restitution: 0.8,
        render: {
          sprite: {
            texture: birdImage,
            xScale: (ballRadius * 2 + 10) / 128,
            yScale: (ballRadius * 2 + 8) / 128,
          },
        },
        collisionFilter: {
          group: -1,
        },
      }
    );

    // Create constraint
    const fixedPoint = {
      x: slingshotX,
      y: slingshotY - slingshotHeight / 2 + ballRadius - 90,
    };

    const slingshotConstraint = Constraint.create({
      pointA: fixedPoint,
      bodyB: ball,
      stiffness: 0.01,
      damping: 0.1,
      render: {
        visible: true,
        lineWidth: 2,
        strokeStyle: "#FFA500",
      },
    });

    // Add to world
    Composite.add(world, [slingshot, ball, slingshotConstraint]);

    // Store refs
    ballRef.current = ball;
    constraintRef.current = slingshotConstraint;
    slingshotRef.current = slingshot;

    // Add event listener for mouse release
    const handleEndDrag = (event: Matter.IEvent<Matter.MouseConstraint>) => {
      const mouseEvent = event as unknown as { body: Matter.Body };
      if (mouseEvent.body === ballRef.current) {
        // Remove the constraint
        Composite.remove(world, constraintRef.current!);

        // Calculate the force to apply
        const force = Vector.sub(fixedPoint, ballRef.current!.position);
        const powerFactor = 0.004;

        // Apply the force to the ball
        Body.applyForce(ballRef.current!, ballRef.current!.position, Vector.mult(force, powerFactor));

        // Reset the slingshot after a delay
        setTimeout(() => {
          // Remove the old ball
          Composite.remove(world, ballRef.current!);

          // Create a new ball
          const newBall = Bodies.circle(
            slingshotX,
            slingshotY - slingshotHeight / 2 + ballRadius - 100,
            ballRadius,
            {
              restitution: 0.8,
              render: {
                sprite: {
                  texture: birdImage,
                  xScale: (ballRadius * 2 + 10) / 128,
                  yScale: (ballRadius * 2 + 8) / 128,
                },
              },
              collisionFilter: {
                group: -1,
              },
            }
          );

          // Create new constraint
          const newConstraint = Constraint.create({
            pointA: fixedPoint,
            bodyB: newBall,
            stiffness: 0.01,
            damping: 0.1,
            render: {
              visible: true,
              lineWidth: 2,
              strokeStyle: "#FFA500",
            },
          });

          // Add new ball and constraint to the world
          Composite.add(world, [newBall, newConstraint]);

          // Update mouse constraint to work with new ball
          mouseConstraint.constraint.bodyB = newBall;

          // Update refs
          ballRef.current = newBall;
          constraintRef.current = newConstraint;
        }, 2000);
      }
    };

    Events.on(mouseConstraint, "enddrag", handleEndDrag);

    return () => {
      Events.off(mouseConstraint, "enddrag", handleEndDrag);
      if (ballRef.current) Composite.remove(world, ballRef.current);
      if (constraintRef.current) Composite.remove(world, constraintRef.current);
      if (slingshotRef.current) Composite.remove(world, slingshotRef.current);
    };
  }, [world, mouseConstraint]);

  return null;
} 