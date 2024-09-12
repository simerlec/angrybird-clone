import { useEffect, useRef } from "react";
import { Engine, Render, Runner, World, Bodies, Composite } from "matter-js";
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

    // Create pyramid of boxes
    const pyramidRows = 10;
    const boxSize = 60; // Reduced box size for better visibility
    const pyramidX = window.innerWidth / 2;
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
    };
  }, []);

  return <div ref={sceneRef} style={{ width: "100vw", height: "100vh" }} />;
}

export default App;
