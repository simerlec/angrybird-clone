import { GameEngine } from "./components/GameEngine";
import { Slingshot } from "./components/Slingshot";
import { Tower } from "./components/Tower";
import "./App.css";
import { useState, useEffect } from "react";
import { LEVEL_LAYOUT } from "./components/Levels";
import { Fireworks } from "@fireworks-js/react";

import logo from "./assets/angry_kathi_logo.png";

const BIRD_COUNT = 3;
const MAX_LEVEL_COUNT = Object.keys(LEVEL_LAYOUT).length;
export const SCALE = 0.7;

function App() {
  const [birdCount, setBirdCount] = useState(BIRD_COUNT);
  const [pigCount, setPigCount] = useState(0);
  const [level, setLevel] = useState({ level: 1, type: "regular" });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [prisonMichaelMessageOpen, setPrisonMichaelMessageOpen] =
    useState(true);
  const [angryModeActivated, setAngryModeActivated] = useState(false);

  // Read initial level from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const levelParam = params.get("level");
    if (levelParam) {
      const levelNum = parseInt(levelParam);
      if (levelNum >= 1 && levelNum <= MAX_LEVEL_COUNT) {
        setLevel({ level: levelNum, type: "regular" });
      }
    } else {
      // Set initial level in URL if not present
      params.set("level", "1");
      window.history.pushState({}, "", `?${params.toString()}`);
    }
  }, []);

  function continueToNextlevel() {
    if (level.level === MAX_LEVEL_COUNT) {
      return;
    }

    const newLevel = level.level + 1;
    setLevel({ level: newLevel, type: "regular" });
    setBirdCount(BIRD_COUNT);

    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("level", newLevel.toString());
    window.history.pushState({}, "", `?${params.toString()}`);
  }

  function restartLevel() {
    setLevel({ level: level.level, type: "restart" });
    setBirdCount(BIRD_COUNT);
    setGameOver(false);
  }

  return (
    <>
      {gameStarted && (
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
                setAngryModeActivated={setAngryModeActivated}
              />
              <Tower
                world={world}
                engine={engine}
                pigCount={pigCount}
                setPigCount={setPigCount}
                level={level}
                angryModeActivated={angryModeActivated}
              />
            </>
          )}
        </GameEngine>
      )}
      {!gameStarted && (
        <div className="flex flex-col space-y-10 absolute top-1/4 left-1/2 -translate-x-1/2">
          <img src={logo} alt="logo" className="w-[800px] animate-bounce" />
          <div className="flex flex-col space-y-4 text-center bg-black/50 p-4 rounded-md">
            <span className="text-2xl font-bold whitespace-nowrap">
              Play the new Angry Kathi game!
            </span>
            <span className="text-lg leading-8">
              Kathi is back and angrier than ever!
              <br />
              Can you help her defeat the Michaels?
            </span>
          </div>
          <button
            className="!bg-blue-500 hover:!bg-blue-600 text-white px-2 py-1 rounded-sm w-[300px] h-[100px] text-2xl mx-auto space-x-4 flex items-center justify-center"
            onClick={() => setGameStarted(true)}
          >
            <span className="text-4xl">😠</span>
            <span className="text-2xl font-bold">Start game</span>
            <span className="text-4xl">😠</span>
          </button>
        </div>
      )}
      {gameStarted && (
        <div className="flex space-x-2 absolute top-4 left-4 text-sm">
          <span className="text-black border rounded-sm bg-white px-2 py-1">
            Kathi's left: {birdCount}
          </span>
          <span className="text-black border rounded-sm bg-white px-2 py-1">
            Michael's left: {pigCount}
          </span>
          <span className="text-black border rounded-sm bg-white px-2 py-1">
            Level: {level.level}
          </span>
        </div>
      )}
      {gameStarted && level.level < 4 && pigCount === 0 && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white p-4 space-x-2 flex flex-col items-center space-y-4">
          <span>Michael got what he deserved!</span>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-sm"
            onClick={continueToNextlevel}
          >
            Next level
          </button>
        </span>
      )}
      {gameStarted && level.level >= 4 && pigCount === 0 && (
        <>
          <Fireworks
            options={{
              rocketsPoint: {
                min: 50,
                max: 50,
              },
              intensity: 30,
              explosion: 8,
              decay: { min: 0.015, max: 0.03 },
              flickering: 50,
              traceLength: 3,
              traceSpeed: 10,
              opacity: 0.5,
              particles: 200,
            }}
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              position: "fixed",
              zIndex: 1,
            }}
          />
          <span className="flex flex-col space-y-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white items-center animate-bounce p-6 text-center z-10">
            <span className="text-5xl font-bold">Congratulations!</span>
            <span>
              You've defeated the Michaels and helped Kathi to get her revenge!
            </span>
            <span>
              ...and as an additional reward, you will also get your birthday
              presents!
            </span>
            <p className="text-4xl mt-8">🎉🎉 Happy birthday! 🎉🎉</p>
            <br />
            <span className="text-4xl">🎁🎁🎁</span>
          </span>
        </>
      )}
      {gameStarted && gameOver && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white p-4 space-x-2 flex flex-col items-center space-y-4">
          <span>Michael won? Impossible!</span>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-sm"
            onClick={restartLevel}
          >
            Restart level
          </button>
        </span>
      )}
      {gameStarted && level.level === 4 && prisonMichaelMessageOpen && (
        <span className="flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black border rounded-sm bg-white p-4 space-y-4">
          <span className="text-lg leading-8 text-center text-pretty space-x-2">
            <span className="text-4xl">👮‍♀️👮‍♀️</span>
            <span>
              Oh no, it's "Hefn Bruder Michael"! We cannot win without getting
              really ANGRY!
            </span>
            <span className="text-4xl">🚨🚨</span>
          </span>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-sm self-center"
            onClick={() => setPrisonMichaelMessageOpen(false)}
          >
            I want to try!
          </button>
        </span>
      )}
    </>
  );
}

export default App;
