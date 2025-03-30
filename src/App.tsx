import { GameEngine } from "./components/GameEngine";
import { Slingshot } from "./components/Slingshot";
import { Tower } from "./components/Tower";
import "./App.css";
import { useState } from "react";

function App() {
  const [pigCount, setPigCount] = useState(0);
  const [level, setLevel] = useState(1);

  return (
    <>
      <GameEngine>
        {(world, mouseConstraint, engine) => (
          <>
            <Slingshot
              world={world}
              mouseConstraint={mouseConstraint}
              engine={engine}
            />
            <Tower
              world={world}
              engine={engine}
              pigCount={pigCount}
              setPigCount={setPigCount}
              level={level}
            />
          </>
        )}
      </GameEngine>
      <div className="flex space-x-2 absolute top-4 left-4">
        <span className="text-black border rounded-sm bg-white px-2 py-1">
          Pigs left: {pigCount}
        </span>
        <span className="text-black border rounded-sm bg-white px-2 py-1">
          Level: {level}
        </span>
      </div>
      {pigCount === 0 && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white px-2 py-1">
          You win!
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-sm"
            onClick={() => setLevel(level + 1)}
          >
            Next level
          </button>
        </span>
      )}
    </>
  );
}

export default App;
