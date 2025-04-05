import { useEffect, useRef } from "react";
import { Bodies, Composite, Constraint, Events, Vector, Body } from "matter-js";
import { SCALE } from "../App";

const slingshotImage = "/sling.png";
const birdImage = "/angry_kathi.png";

interface SlingshotProps {
  world: Matter.World;
  mouseConstraint: Matter.MouseConstraint;
  engine: Matter.Engine;
  birdCount: number;
  pigCount: number;
  setBirdCount: (count: number | ((prev: number) => number)) => void;
  level: { level: number; type: string };
  setGameOver: (gameOver: boolean) => void;
}

interface SlingshotConfig {
  slingshotWidth: number;
  slingshotHeight: number;
  slingshotX: number;
  slingshotY: number;
}

export function Slingshot({
  pigCount,
  birdCount,
  setBirdCount,
  world,
  mouseConstraint,
  engine,
  level,
  setGameOver,
}: SlingshotProps) {
  const ballRef = useRef<Matter.Body | null>(null);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const slingshotRef = useRef<Matter.Body | null>(null);
  const fixedPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasBeenFiredRef = useRef(false);
  const birdCountRef = useRef(birdCount);
  const pigCountRef = useRef(pigCount);

  useEffect(() => {
    birdCountRef.current = birdCount;
  }, [birdCount]);

  useEffect(() => {
    pigCountRef.current = pigCount;
  }, [pigCount]);

  const createNewBird = (config: SlingshotConfig) => {
    if (birdCountRef.current <= 0 && pigCountRef.current > 0) {
      setGameOver(true);
      return;
    }

    if (birdCountRef.current <= 0) {
      return;
    }

    const bird = ballRef.current;
    if (bird) {
      Composite.remove(world, bird);
    }

    const { slingshotX, slingshotY, slingshotHeight } = config;
    const ballRadius = 50 * SCALE;

    // Create initial ball
    const ball = Bodies.circle(
      slingshotX,
      slingshotY - slingshotHeight / 2 + ballRadius - 100 * SCALE,
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
      y: slingshotY - slingshotHeight / 2 + ballRadius - 90 * SCALE,
    };
    fixedPointRef.current = fixedPoint;

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
    Composite.add(world, [ball, slingshotConstraint]);

    // Store refs
    ballRef.current = ball;
    constraintRef.current = slingshotConstraint;
    hasBeenFiredRef.current = false;
  };

  useEffect(() => {
    // Clean up previous bodies
    if (ballRef.current) Composite.remove(world, ballRef.current);
    if (constraintRef.current) Composite.remove(world, constraintRef.current);
    if (slingshotRef.current) Composite.remove(world, slingshotRef.current);

    // Create slingshot
    const slingshotWidth = 100 * SCALE;
    const slingshotHeight = 150 * SCALE;
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

    // Create initial bird and constraint
    createNewBird({ slingshotWidth, slingshotHeight, slingshotX, slingshotY });

    // Add slingshot to world
    Composite.add(world, slingshot);
    slingshotRef.current = slingshot;

    // Add event listener for mouse release
    const handleEndDrag = (event: Matter.IEvent<Matter.MouseConstraint>) => {
      const mouseEvent = event as unknown as { body: Matter.Body };
      if (mouseEvent.body === ballRef.current && fixedPointRef.current) {
        // Remove the constraint
        Composite.remove(world, constraintRef.current!);

        // Calculate the force to apply
        const force = Vector.sub(
          fixedPointRef.current,
          ballRef.current!.position
        );
        const powerFactor = 0.002 * SCALE;

        // Apply the force to the ball
        Body.applyForce(
          ballRef.current!,
          ballRef.current!.position,
          Vector.mult(force, powerFactor)
        );
        hasBeenFiredRef.current = true;
        setBirdCount((prev) => prev - 1);
      }
    };

    // Add update event listener to check bird position and velocity
    const handleUpdate = () => {
      if (ballRef.current && hasBeenFiredRef.current) {
        const bird = ballRef.current;
        const margin = 100; // Extra margin to ensure bird is fully off screen

        // Check if bird is outside viewport
        if (
          bird.position.x < -margin ||
          bird.position.x > window.innerWidth + margin ||
          bird.position.y < -margin ||
          bird.position.y > window.innerHeight + margin
        ) {
          // Bird left viewport, create new one
          createNewBird({
            slingshotWidth,
            slingshotHeight,
            slingshotX,
            slingshotY,
          });
        } else {
          // Check if bird has stopped moving
          const speed = Math.sqrt(
            Math.pow(bird.velocity.x, 2) + Math.pow(bird.velocity.y, 2)
          );

          if (speed < 0.1) {
            // Bird has stopped, create new one
            createNewBird({
              slingshotWidth,
              slingshotHeight,
              slingshotX,
              slingshotY,
            });
          }
        }
      }
    };

    Events.on(mouseConstraint, "enddrag", handleEndDrag);
    Events.on(engine, "afterUpdate", handleUpdate);

    return () => {
      Events.off(mouseConstraint, "enddrag", handleEndDrag);
      Events.off(engine, "afterUpdate", handleUpdate);
      if (ballRef.current) Composite.remove(world, ballRef.current);
      if (constraintRef.current) Composite.remove(world, constraintRef.current);
      if (slingshotRef.current) Composite.remove(world, slingshotRef.current);
    };
  }, [world, mouseConstraint, engine, level]);

  return null;
}
