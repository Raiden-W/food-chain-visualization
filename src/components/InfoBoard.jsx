import { Fragment, useEffect, useState } from "react";
import creaturesData from "../data/data.json";

export default function InfoBoard({ forInfoSt }) {
	const [infoSt, setInfo] = useState();
	useEffect(() => {
		for (let i = 0; i < creaturesData.length; i++) {
			if (creaturesData[i].species === forInfoSt) {
				setInfo(creaturesData[i].info);
				break;
			}
		}
	}, [forInfoSt]);

	return (
		<div className="info-board">
			{forInfoSt && (
				<Fragment>
					<h4>{forInfoSt}</h4>
					<p>{infoSt}</p>
				</Fragment>
			)}
		</div>
	);
}
