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
  const { loading, data } = useDataFetcher({
    url: "http://localhost:8000/api/language/get-big5-data",
    demoData,
  });
  if (loading) return { data: [] };
  return { data };
};
