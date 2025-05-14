import "./App.css";
import { DotsGrid } from "./dots-grid";
import { DotsGridWithAnimation } from "./dots-grid-with-animation";

function App() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        height: "100vh",
        overflow: "scroll",
      }}
    >
      <DotsGridWithAnimation />
      <DotsGrid />
    </div>
  );
}

export default App;
