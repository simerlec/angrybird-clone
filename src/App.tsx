import { useEffect, useRef } from "react";
import { Engine, Render, World, Bodies, Composite } from "matter-js";
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
    const boxSize = 100;
    const pyramidX = window.innerWidth / 2;
    const pyramidY = window.innerHeight - 25 - (boxSize * pyramidRows) / 2;

    for (let row = 0; row < pyramidRows; row++) {
      for (let col = 0; col <= row; col++) {
        const x = pyramidX + (col - row / 2) * boxSize;
        const y = pyramidY + row * boxSize;
        const box = Bodies.rectangle(x, y, boxSize, boxSize);
        Composite.add(world, box);
      }
    }

    // Add ground to the world
    Composite.add(world, ground);

    // Run the engine and renderer
    Engine.run(engine);
    Render.run(render);

    // Cleanup on component unmount
    return () => {
      Render.stop(render);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  return <div ref={sceneRef} style={{ width: "100vw", height: "100vh" }} />;
}

export default App;
