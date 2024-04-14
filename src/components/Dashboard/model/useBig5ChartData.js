// export const useBig5ChartData = () => {
//     const traitData = getBig5DataTrait();
//     const stateData = getBig5DataState();

//     const labels = [
//         "Extraversion",
//         "Conscientiousness ",
//         "Agreeableness ",
//         "Neuroticism ",
//         "Openness",
//     ];

//     const datasets = [
//         {
//             label: "You",
//             backgroundColor: "#1890ff55",
//             borderColor: "#1890ff",
//             pointBackgroundColor: undefined,
//             pointBorderColor: undefined,
//             pointBorderWidth: 0,
//             pointHitRadius: 20,
//             pointHoverBackgroundColor: "#fff",
//             pointHoverBorderColor: "rgba(179,181,198,1)",
//             data: traitData,
//             fill: false,
//         },
//         ...stateData.map((data) => ({
//             label: "You " + data.x.toDateString(),
//             backgroundColor: "#1890ff20",
//             borderColor: "transparent",
//             pointBackgroundColor: "transparent",
//             pointBorderColor: "transparent",
//             pointBorderWidth: 0,
//             pointHitRadius: 20,
//             pointHoverBackgroundColor: "#fff",
//             pointHoverBorderColor: "rgba(179,181,198,1)",
//             data: data.y,
//             fill: true,
//         })),
//     ];

//     return {
//         labels,
//         datasets,
//     };
// };

// export const useBig5TraitChartData = () => {
//     const traitData = getBig5DataTrait();

//     const labels = [
//         "Extraversion",
//         "Conscientiousness ",
//         "Agreeableness ",
//         "Neuroticism ",
//         "Openness",
//     ];

//     const datasets = [
//         {
//             label: "You",
//             backgroundColor: "#1890ff55",
//             borderColor: "#1890ff",
//             pointBackgroundColor: undefined,
//             pointBorderColor: undefined,
//             pointBorderWidth: 0,
//             pointHitRadius: 20,
//             pointHoverBackgroundColor: "#fff",
//             pointHoverBorderColor: "rgba(179,181,198,1)",
//             data: traitData,
//             fill: false,
//         },
//     ];

//     return {
//         labels,
//         datasets,
//     };
// };

// export const useBig5StateChartData = () => {
//     const stateData = getBig5DataState();

//     const transformed = Array.from({ length: 5 }, (_, i) =>
//         stateData.map((entry) => entry.y[i])
//     );

//     const labels = stateData.map((entry) => entry.x);

//     const datasetOptions = [
//         { label: "Extraversion", color: "#1890ff" },
//         { label: "Conscientiousness", color: "#005577" },
//         { label: "Agreeableness", color: "#40cc90" },
//         { label: "Neuroticism", color: "#dd7040" },
//         { label: "Openness", color: "#1890ff" },
//     ];

//     const datasets = [
//         ...transformed.map((data, i) => ({
//             label: datasetOptions[i].label,
//             backgroundColor: datasetOptions[i].color,
//             borderColor: datasetOptions[i].color,
//             pointRadius: 0,
//             data,
//             tension: 0.1,
//         })),
//     ];

//     return {
//         labels,
//         datasets,
//     };
// };

// const dateHelper = (i) => {
//     const date = new Date();
//     date.setDate(date.getDate() - i * 7);
//     return date;
// };

// function randomHelper(min, max) {
//     return Math.random() * (max - min) + min;
// }

// const getBig5DataState = () => {
//     // return [
//     //     { x: 1, y: [1, 2, 4, 1, 2.5] },
//     //     { x: 2, y: [0.5, 2.5, 3, 1.5, 2] },
//     //     { x: 3, y: [1, 2, 3, 2, 2.5] },
//     //     { x: 4, y: [0.5, 3, 4, 1, 2] },
//     //     { x: 5, y: [0.2, 4, 4.5, 1.2, 2.2] },
//     // ];
//     return Array.from({ length: 8 }, (_, i) => ({
//         x: dateHelper(8 - i),
//         y: [
//             randomHelper(1, 2),
//             randomHelper(3, 3.7),
//             randomHelper(2.3, 2.7),
//             randomHelper(2, 3),
//             randomHelper(3, 4),
//         ],
//     }));
// };

// export const getBig5DataTrait = () => {
//     return getBig5DataState()
//         .map((entry) => entry.y)
//         .reduce((prevVal, curVal, curIndex) =>
//             prevVal.map((v, i) => (v * curIndex + curVal[i]) / (curIndex + 1))
//         );
// };
