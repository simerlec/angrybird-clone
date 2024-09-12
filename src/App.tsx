import { useEffect, useRef } from "react";
import {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint,
  Constraint,
  Vector,
  Events,
  Body,
} from "matter-js";
import "./App.css";

// Update these import statements
const blockImage = "/block.png";
const birdImage = "/bird.png";
const slingshotImage = "/sling.png";

function App() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Create engine and world
    const engine = Engine.create();
    const world = engine.world;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent", // Change this to transparent
      },
    });

    // Create runner
    const runner = Runner.create();

    // Create ground
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 250,
      window.innerWidth,
      50,
      {
        isStatic: true,
        render: {
          fillStyle: "transparent", // Make the ground transparent
          strokeStyle: "transparent", // Also make the outline transparent
        },
      }
    );

    // Remove the tower creation code and replace it with the slingshot image
    const slingshotWidth = 100; // Adjust this value based on your image
    const slingshotHeight = 150; // Adjust this value based on your image
    const slingshotX = window.innerWidth / 4;
    const slingshotY = window.innerHeight - slingshotHeight / 2 - 225 - 80; // Moved up by 50 pixels

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
            xScale: slingshotWidth / 128, // Adjust scale as needed
            yScale: slingshotHeight / 128, // Adjust scale as needed
          },
        },
        collisionFilter: {
          group: -1, // Negative group for the slingshot
        },
      }
    );

    // Add slingshot to the world
    Composite.add(world, slingshot);

    // Update the ball position
    const ballRadius = 50;
    const ball = Bodies.circle(
      slingshotX,
      slingshotY - slingshotHeight / 2 + ballRadius - 100, // Moved up by 100 pixels
      ballRadius,
      {
        restitution: 0.8, // Make the ball bouncy
        render: {
          sprite: {
            texture: birdImage,
            xScale: (ballRadius * 2 + 10) / 128, // Slightly increased scale
            yScale: (ballRadius * 2 + 8) / 128, // Slightly increased scale
          },
        },
        collisionFilter: {
          group: -1, // Same negative group as the tower
        },
      }
    );

    // Update the fixed point for the slingshot constraint
    const fixedPoint = {
      x: slingshotX,
      y: slingshotY - slingshotHeight / 2 + ballRadius - 90, // Moved up by 100 pixels
    };

    // Create the slingshot constraint
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

    // Add ball and constraint to the world
    Composite.add(world, [ball, slingshotConstraint]);

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    // Add event listener for mouse release
    Events.on(
      mouseConstraint,
      "enddrag",
      (event: Matter.IEvent<Matter.MouseConstraint>) => {
        const mouseEvent = event as unknown as { body: Matter.Body };
        if (mouseEvent.body === ball) {
          // Remove the constraint
          Composite.remove(world, slingshotConstraint);

          // Calculate the force to apply
          const force = Vector.sub(fixedPoint, ball.position);
          const powerFactor = 0.004; // Adjust this value to change the launch power

          // Apply the force to the ball
          Body.applyForce(ball, ball.position, Vector.mult(force, powerFactor));
        }
      }
    );

    // Add mouseConstraint to the world
    Composite.add(world, mouseConstraint);

    // Sync the mouse with the renderer
    render.mouse = mouse;

    // Create pyramid of boxes
    const pyramidRows = 10;
    const boxSize = 60; // Reduced box size for better visibility
    const pyramidX = (window.innerWidth * 3) / 4; // Move pyramid to the right
    const pyramidHeight = pyramidRows * boxSize;
    const pyramidY = window.innerHeight - pyramidHeight - 225; // Adjusted for new ground height

    for (let row = 0; row < pyramidRows; row++) {
      for (let col = 0; col <= row; col++) {
        const x = pyramidX + (col - row / 2) * boxSize;
        const y = pyramidY + row * boxSize;
        const box = Bodies.rectangle(x, y, boxSize, boxSize, {
          render: {
            sprite: {
              texture: blockImage,
              xScale: (boxSize + 10) / 128, // Slightly increased scale
              yScale: (boxSize + 10) / 128, // Slightly increased scale
            },
          },
        });
        Composite.add(world, box);
      }
    }

    // Add ground to the world
    Composite.add(world, ground);

    // Run the engine, renderer, and runner
    Render.run(render);
    Runner.run(runner, engine);

    // Cleanup on component unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      Mouse.clearSourceEvents(mouse);
    };
  }, []);

  return <div ref={sceneRef} className="game-container" />;
}

export default App;
