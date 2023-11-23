import * as d3 from "d3";
import forceBoundary from "d3-force-boundary";
import { useEffect, useRef } from "react";
import creaturesData from "../data/data.json";
import "./CreaturePanel.scss";

export default function CreaturesPanel({
	selectedCreatures,
	setForInfo,
	baseRadius = 20,
}) {
	const panelRef = useRef();
	const linksRef = useRef([]);
	const nodesRef = useRef([]);
	const simulationRef = useRef();
	const creaImgsRef = useRef();
	const textsRef = useRef();
	const linesRef = useRef();

	useEffect(() => {
		const links = [];
		const nodes = [];

		//we wanna know all species related to our selected creatures
		//find preys and put them in data nodes and links
		creaturesData.forEach((creaData) => {
			if (selectedCreatures.includes(creaData.species)) {
				nodes.push({ species: creaData.species });
				creaData.preys.forEach((prey) => {
					links.push({ source: creaData.species, target: prey });
					nodes.push({ species: prey });
				});
			}
		});

		//find predators and put them in data nodes and links
		creaturesData.forEach((creaData) => {
			selectedCreatures.forEach((selectedCrea) => {
				if (creaData.preys.includes(selectedCrea)) {
					links.push({
						source: creaData.species,
						target: selectedCrea,
					});
					nodes.push({ species: creaData.species });
				}
			});
		});

		//remove duplicate links and nodes
		const temLinks = [];
		const uniqLinks = links.filter((link) => {
			let bool = true;
			for (let i = 0; i < temLinks.length; i++) {
				if (
					temLinks[i].source === link.source &&
					temLinks[i].target === link.target
				) {
					bool = false;
					break;
				}
			}
			if (bool) {
				temLinks.push(link);
			}
			return bool;
		});

		//populate links array for D3
		linksRef.current = uniqLinks;

		const temNodes = [];
		const uniqNodes = nodes.filter((node) => {
			let bool = true;
			for (let i = 0; i < temNodes.length; i++) {
				if (temNodes[i].species === node.species) {
					bool = false;
					break;
				}
			}
			if (bool) {
				temNodes.push(node);
			}
			return bool;
		});

		//populate nodes array for D3
		nodesRef.current = uniqNodes.map((node) => {
			//we wanna know the each type of all species in the panel
			let type;
			for (let i = 0; i < creaturesData.length; i++) {
				if (node.species === creaturesData[i].species) {
					type = creaturesData[i].type;
					break;
				}
			}
			//according to type we give a x pos that the species image tends to locate in panel
			let posX;
			switch (type) {
				case "apex":
					posX = 0;
					break;
				case "meso":
					posX = 1 / 3;
					break;
				case "prey":
					posX = 2 / 3;
					break;
				case "other":
					posX = 1;
					break;
				default:
					posX = 1;
					break;
			}
			let radius = baseRadius;
			if (selectedCreatures.includes(node.species)) {
				radius = baseRadius + 40;
				posX = posX + (1 / 2 - posX) * 0.5;
			}
			const imgUrl = `${import.meta.env.VITE_PUBLIC_URL}/images/${
				node.species
			}.png`;
			return { species: node.species, radius, imgUrl, posX };
		});

		//binding and unbinding data in D3
		const panel = d3.select(panelRef.current);
		linesRef.current = panel
			.selectAll("line") //draw lines accroding to links
			.data(linksRef.current)
			.join(
				(enter) =>
					enter
						.append("line")
						.attr("stroke", "white")
						.attr("marker-end", (link) => {
							for (let i = 0; i < nodesRef.current.length; i++) {
								if (nodesRef.current[i].species === link.target) {
									if (nodesRef.current[i].radius > baseRadius) {
										return "url(#arrowL)";
									} else {
										return "url(#arrowS)";
									}
								}
							}
						}),
				(update) =>
					update.attr("marker-end", (link) => {
						for (let i = 0; i < nodesRef.current.length; i++) {
							if (nodesRef.current[i].species === link.target) {
								if (nodesRef.current[i].radius > baseRadius) {
									return "url(#arrowL)";
								} else {
									return "url(#arrowS)";
								}
							}
						}
					}),
				(exit) => exit.remove()
			);

		textsRef.current = panel
			.selectAll("text") //draw texts of all species in panel
			.data(nodesRef.current, (node) => node.species)
			.join(
				(enter) =>
					enter
						.append("text")
						.attr("fill", "black")
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "hanging")
						.classed("large", (node) => node.radius > baseRadius) //conditional class, font-size
						.text((node) => node.species),
				(update) =>
					update
						.text((node) => node.species)
						.classed("large", (node) => node.radius > baseRadius)
						.classed("", (node) => node.radius === baseRadius),
				(exit) => exit.remove()
			);

		creaImgsRef.current = panel
			.selectAll("image") //draw images of all species in panel
			.data(nodesRef.current, (node) => node.species)
			.join(
				(enter) =>
					enter
						.append("image")
						.attr("href", (node) => node.imgUrl)
						.attr("height", (node) => node.radius * 2) //use radius property in image size
						.attr("width", (node) => node.radius * 2),
				(update) =>
					update
						.attr("height", (node) => node.radius * 2)
						.attr("width", (node) => node.radius * 2),
				(exit) => exit.remove()
			);

		creaImgsRef.current.raise();
		textsRef.current.raise();

		//force simulation setting
		simulationRef.current = d3
			.forceSimulation(nodesRef.current)
			.force(
				"boundary",
				forceBoundary(
					baseRadius * 5,
					baseRadius * 3,
					getPanelBox().w - baseRadius * 2,
					getPanelBox().h - baseRadius * 4
				)
			)
			.force("collide", d3.forceCollide(100).iterations(4))
			// .force("charge", d3.forceManyBody().strength(-1000))
			.force(
				"x",
				d3
					.forceX()
					.strength(0.6)
					.x((node) => {
						return node.posX * getPanelBox().w;
					})
			)
			.force(
				"link",
				d3
					.forceLink(linksRef.current)
					.id((node) => node.species)
					.distance(100)
			)
			.force("center", d3.forceCenter(getPanelBox().w / 2, getPanelBox().h / 2))
			.alphaDecay(0.1);

		//force simulation running and updating
		simulationRef.current.on("tick", () => {
			linesRef.current
				.attr("x1", (link) => link.source.x) //upding link-lines position
				.attr("y1", (link) => link.source.y)
				.attr("x2", (link) => link.target.x)
				.attr("y2", (link) => link.target.y);

			creaImgsRef.current
				.attr("x", (node) => node.x - node.radius) //upding creature images position
				.attr("y", (node) => node.y - node.radius);

			textsRef.current
				.attr("x", (node) => node.x) //upding text position
				.attr("y", (node) => node.y + node.radius * 0.65);
		});

		//click one creature image in the panel to set the highlight creature to show info in info board
		creaImgsRef.current.on("click", (e, node) => {
			creaImgsRef.current.attr("class", null);
			e.target.classList.add("show-info");
			setForInfo(node.species);
		});
	}, [selectedCreatures]);

	const getPanelBox = () => {
		return {
			w: panelRef.current.getBoundingClientRect().width,
			h: panelRef.current.getBoundingClientRect().height,
		};
	};

	useEffect(() => {
		//initial creature hightlight in panel
		creaImgsRef.current.classed(
			"show-info",
			(node) => node.species === "jaguar"
		);
		const handleResize = () => {
			simulationRef.current
				.force("center")
				.x(getPanelBox().w / 2)
				.y(getPanelBox().h / 2);
			simulationRef.current.alpha(0.3).restart();
		};
		window.addEventListener("resize", handleResize, true);

		return () => {
			window.removeEventListener("resize", handleResize, true);
		};
	}, []);

	return (
		<svg ref={panelRef} className="creature-panel">
			<defs>
				<marker
					id="arrowL"
					fill="yellow"
					viewBox="0 0 10 10"
					refX="70"
					refY="5"
					markerWidth="200"
					markerHeight="15"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" />
				</marker>
				<marker
					id="arrowS"
					fill="white"
					viewBox="0 0 15 15"
					refX="70"
					refY="5"
					markerWidth="200"
					markerHeight="15"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" />
				</marker>
			</defs>
		</svg>
	);
}
