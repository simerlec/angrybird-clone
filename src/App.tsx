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
} from "matter-js";
import "./App.css";

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
        background: "#f0f0f0",
      },
    });

    // Create runner
    const runner = Runner.create();

    // Create ground
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight,
      window.innerWidth,
      50,
      { isStatic: true }
    );

    // Create vertical tower on the left
    const towerWidth = 40;
    const towerHeight = window.innerHeight * 0.2;
    const towerX = window.innerWidth / 4;
    const towerY = window.innerHeight - towerHeight / 2 - 25; // Adjust for ground height

    const tower = Bodies.rectangle(towerX, towerY, towerWidth, towerHeight, {
      isStatic: true,
      render: {
        fillStyle: "#8B4513", // Brown color for the tower
      },
    });

    // Add tower to the world
    Composite.add(world, tower);

    // Create ball on top of the tower
    const ballRadius = 50;
    const ball = Bodies.circle(
      towerX,
      towerY - towerHeight / 2 - ballRadius,
      ballRadius,
      {
        restitution: 0.8, // Make the ball bouncy
        render: {
          fillStyle: "#FF0000", // Red color for the ball
        },
      }
    );

    // Add ball to the world
    Composite.add(world, ball);

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

    // Add mouseConstraint to the world
    Composite.add(world, mouseConstraint);

    // Sync the mouse with the renderer
    render.mouse = mouse;

    // Create pyramid of boxes
    const pyramidRows = 10;
    const boxSize = 60; // Reduced box size for better visibility
    const pyramidX = (window.innerWidth * 3) / 4; // Move pyramid to the right
    const pyramidHeight = pyramidRows * boxSize;
    const pyramidY = (window.innerHeight - pyramidHeight) / 2; // Center the entire pyramid

    for (let row = 0; row < pyramidRows; row++) {
      for (let col = 0; col <= row; col++) {
        const x = pyramidX + (col - row / 2) * boxSize;
        const y = pyramidY + row * boxSize; // Corrected this line
        const box = Bodies.rectangle(x, y, boxSize, boxSize, {
          // Remove isStatic property to make boxes dynamic
          render: {
            fillStyle: `rgb(${Math.random() * 255},${Math.random() * 255},${
              Math.random() * 255
            })`,
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

  return <div ref={sceneRef} style={{ width: "100vw", height: "100vh" }} />;
}

export default App;
