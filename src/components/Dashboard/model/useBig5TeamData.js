import { randomHelper } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = [
    randomHelper(1, 5),
    randomHelper(1, 5),
    randomHelper(1, 5),
    randomHelper(1, 5),
    randomHelper(1, 5),
];

export const useBig5TeamData = () => {
    return useDataFetcher({ url: "/api/big5team", demoData });
};
