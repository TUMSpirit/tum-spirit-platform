export const TaskT = {
	id: String,
	title: String,
	description: String,
	priority: String,
	deadline: Number,
	image: String,
	alt: String,
	tags: [
		{
			title: String,
			bg: String,
			text: String
		}
	]
};

const Column = {
	name: String,
	items: [TaskT]
};

export const Columns = {};

