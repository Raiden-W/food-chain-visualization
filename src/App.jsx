import { useState } from "react";
import CreaturesPanel from "./components/CreaturesPanel";
import CreaturesBar from "./components/CreaturesBar";
import "./App.scss";
import InfoBoard from "./components/InfoBoard";

function App() {
	const [selectedSt, setSelected] = useState(["jaguar", "guinea pig"]);
	const [forInfoSt, setForInfo] = useState("jaguar");
	return (
		<div className="app-wrapper">
			<div className="upper">
				<InfoBoard forInfoSt={forInfoSt} />
				<CreaturesPanel
					selectedCreatures={selectedSt}
					setForInfo={setForInfo}
				/>
			</div>
			<CreaturesBar setSelected={setSelected} selectedSt={selectedSt} />
		</div>
	);
}

export default App;
