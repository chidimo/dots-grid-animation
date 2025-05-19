import "./App.css";
// import { DotsGrid } from "./dots-grid";
// import { DotsGridWithAnimation } from "./dots-grid-with-animation";
// import { InteractiveDotGrid } from "./interactive-dot-grid";
import { AnimatedBackground } from "./animated-background";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <AnimatedBackground />
      {/* <InteractiveDotGrid /> */}
      {/* <DotsGridWithAnimation /> */}
      {/* <DotsGrid /> */}
    </div>
  );
}

export default App;
