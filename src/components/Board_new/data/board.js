import { v4 as uuidv4 } from "uuid"
import taskImage from "../task3.jpg"
import taskImage2 from "../task3.jpg"
import taskImage3 from "../task3.jpg"
import { getRandomColors } from "../helpers/getRandomColors"

export const Board = {
	backlog: {
		name: "Backlog",
		items: [
			{
				id: uuidv4(),
				title: "Intro Presentation",
				description: "Erstelle eine Präsentation für die Einführung des Projekts",
				priority: "low",
				deadline: 50,
				tags: [
					{ title: "Orga", ...{ bg: "#fef3c7", text: "#d97706" }}
				]
			}
		]
	},
	pending: {
		name: "Doing",
		items: [
			{
				id: uuidv4(),
				title: "Nutzerbefragung",
				description: "Nutzerbefragung zum Thema Online-Learning",
				priority: "high",
				deadline: 50,
				tags: [
					{ title: "Analysis", ...{ bg: "#dbeafe", text: "#2563eb" } }
				]
			},
			{
				id: uuidv4(),
				title: "Tech Setup",
				description: "Erstellen einer Entwicklungsumgebung für die Zusammenarbeit",
				priority: "low",
				deadline: 50,
				image: taskImage,
				alt: "task image",
				tags: [
					{ title: "Development", ...{ bg: "#ecfccb", text: "#65a30d" } }
				]
			}
		]
	},
	doing: {
		name: "Testing",
		items: [
			{
				id: uuidv4(),
				title: "Ideation",
				description: "Ideengenerierung im Mindmap-Stil",
				priority: "low",
				deadline: 50,
				tags: [
					{ title: "Analysis", ...{ bg: "#dbeafe", text: "#2563eb" } }
				]
			},
			{
				id: uuidv4(),
				title: "Projektplan erarbeiten",
				description: "Erstellen eines Projektplans in Excel (Gantt-Chart auch möglich)",
				priority: "medium",
				deadline: 50,
				tags: [
					{ title: "Orga", ...{ bg: "#fef3c7", text: "#d97706" }}
				]
			}
		]
	},
	done: {
		name: "Done",
		items: [
			{
				id: uuidv4(),
				title: "Mail an Project Lead",
				description: "Formuliere eine kurze Mail an den Projekt Lead mit den wichtigsten Informationen zum Team",
				priority: "high",
				deadline: 50,
				tags: [
					{ title: "Orga", ...{ bg: "#fef3c7", text: "#d97706" }}
				]
			}
		]
	}
};
