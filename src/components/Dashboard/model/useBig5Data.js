import { randomHelper } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = [
    randomHelper(1, 5),
    randomHelper(1, 5),
    randomHelper(1, 5),
    randomHelper(1, 5),
    randomHelper(1, 5),
];

export const useBig5Data = () => {
    return useDataFetcher({ url: "/api/big5", demoData });
};
