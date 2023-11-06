import { useEffect, useRef } from "react";
import creaturesData from "../data/data.json";
import "./CreaturesBar.scss";

export default function CreaturesBar(props) {
	const barRef = useRef();

	useEffect(() => {
		const horizontalScroll = (e) => {
			if (e.deltaY > 0) barRef.current.scrollLeft += 20;
			else barRef.current.scrollLeft -= 20;
		};
		barRef.current.addEventListener("wheel", horizontalScroll, true);

		return () => {
			barRef.current.removeEventListener("wheel", horizontalScroll, true);
		};
	}, []);

	return (
		<div className="creature-bar" ref={barRef}>
			<CreaturesBand creatures={creaturesData} {...props} type="apex" />
			<div className="creature-bar-divide" />
			<CreaturesBand creatures={creaturesData} {...props} type="meso" />
			<div className="creature-bar-divide" />
			<CreaturesBand creatures={creaturesData} {...props} type="prey" />
			<div className="creature-bar-divide" />
			<CreaturesBand creatures={creaturesData} {...props} type="other" />
		</div>
	);
}

const CreaturesBand = ({ creatures, type, setSelected, selectedSt }) => {
	const handleClick = (e, species) => {
		const index = selectedSt.indexOf(species);
		if (index < 0) {
			//add this species to array
			setSelected((pre) => [...pre, species]);
			e.currentTarget.classList.add("selected");
		} else {
			//remove this species from array
			const temArr = [...selectedSt];
			temArr.splice(index, 1);
			setSelected(temArr);
			e.currentTarget.classList.remove("selected");
		}
	};

	return (
		<div className="type-container">
			<h4>{type}</h4>
			<div className="icon-container">
				{creatures.map((creature, i) => {
					if (creature.type === type) {
						return (
							<div className="creature-icon" key={i}>
								<div
									className={
										creature.species === "jaguar" ||
										creature.species === "guinea pig"
											? "image-container selected"
											: "image-container"
									}
									onClick={(e) => {
										handleClick(e, creature.species);
									}}
								>
									<img
										src={`${import.meta.env.VITE_PUBLIC_URL}/images/${
											creature.species
										}.png`}
										alt={`${creature.species} image`}
									/>
								</div>
								<p className="species-name">{creature.species}</p>
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};
