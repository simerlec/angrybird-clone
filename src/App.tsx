import { GameEngine } from "./components/GameEngine";
import { Slingshot } from "./components/Slingshot";
import { Tower } from "./components/Tower";
import "./App.css";
import { useState } from "react";

function App() {
  const [pigCount, setPigCount] = useState(0);

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
            />
          </>
        )}
      </GameEngine>
      <span className="absolute top-0 left-0">{pigCount}</span>
    </>
  );
}

export default App;
