import { useEffect, useRef, useState } from "react";
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

interface GameEngineProps {
  children: (
    world: Matter.World,
    mouseConstraint: Matter.MouseConstraint,
    engine: Matter.Engine
  ) => React.ReactNode;
}

export function GameEngine({ children }: GameEngineProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [world, setWorld] = useState<Matter.World | null>(null);
  const [mouseConstraint, setMouseConstraint] =
    useState<Matter.MouseConstraint | null>(null);
  const [engine, setEngine] = useState<Matter.Engine | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Create engine and world
    const engine = Engine.create();
    const world = engine.world;
    setWorld(world);
    setEngine(engine);

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
      },
    });

    // Create runner
    const runner = Runner.create();

    // Create ground
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 150,
      window.innerWidth,
      50,
      {
        isStatic: true,
        render: {
          fillStyle: "transparent",
          strokeStyle: "transparent",
        },
        label: "ground",
      }
    );

    // Add ground to the world
    Composite.add(world, ground);

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
    setMouseConstraint(mouseConstraint);

    // Add mouseConstraint to the world
    Composite.add(world, mouseConstraint);

    // Sync the mouse with the renderer
    render.mouse = mouse;

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

  return (
    <div ref={sceneRef} className="game-container">
      {world &&
        mouseConstraint &&
        engine &&
        children(world, mouseConstraint, engine)}
    </div>
  );
}
