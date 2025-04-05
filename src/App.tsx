import { GameEngine } from "./components/GameEngine";
import { Slingshot } from "./components/Slingshot";
import { Tower } from "./components/Tower";
import "./App.css";
import { useState } from "react";
import { LEVEL_LAYOUT } from "./components/Levels";

const BIRD_COUNT = 3;
const MAX_LEVEL_COUNT = Object.keys(LEVEL_LAYOUT).length;
export const SCALE = 0.7;
console.log("🚀 ~ 0.7:", 0.7);

function App() {
  const [birdCount, setBirdCount] = useState(BIRD_COUNT);
  const [pigCount, setPigCount] = useState(0);
  const [level, setLevel] = useState({ level: 2, type: "regular" });
  const [gameOver, setGameOver] = useState(false);

  function continueToNextlevel() {
    if (level.level === MAX_LEVEL_COUNT) {
      return;
    }

    setLevel({ level: level.level + 1, type: "regular" });
    setBirdCount(BIRD_COUNT);
  }

  function restartLevel() {
    setLevel({ level: level.level, type: "restart" });
    setBirdCount(BIRD_COUNT);
    setGameOver(false);
  }

  return (
    <>
      <GameEngine>
        {(world, mouseConstraint, engine) => (
          <>
            <Slingshot
              world={world}
              mouseConstraint={mouseConstraint}
              engine={engine}
              level={level}
              birdCount={birdCount}
              pigCount={pigCount}
              setBirdCount={setBirdCount}
              setGameOver={setGameOver}
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
          Birds left: {birdCount}
        </span>
        <span className="text-black border rounded-sm bg-white px-2 py-1">
          Pigs left: {pigCount}
        </span>
        <span className="text-black border rounded-sm bg-white px-2 py-1">
          Level: {level.level}
        </span>
      </div>
      {pigCount === 0 && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white px-2 py-1">
          You win!
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-sm"
            onClick={continueToNextlevel}
          >
            Next level
          </button>
        </span>
      )}
      {gameOver && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white px-2 py-1">
          You lose!
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-sm"
            onClick={restartLevel}
          >
            Restart level
          </button>
        </span>
      )}
    </>
  );
}

export default App;
