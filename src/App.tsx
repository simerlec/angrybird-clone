import { GameEngine } from "./components/GameEngine";
import { Slingshot } from "./components/Slingshot";
import { Tower } from "./components/Tower";
import "./App.css";

function App() {
  return (
    <GameEngine>
      {(world, mouseConstraint, engine) => (
        <>
          <Slingshot world={world} mouseConstraint={mouseConstraint} engine={engine} />
          <Tower world={world} engine={engine} />
        </>
      )}
    </GameEngine>
  );
}

export default App;
