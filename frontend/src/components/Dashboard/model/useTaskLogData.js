import { useDataFetcher } from "./utils/useDataFetcher";
const demoData = [
  {
    task: "Intro Presentation",
    message: "Status changed to In Progress",
    userInvolved: false,
    date: "10/02/2024",
  },
  {
    task: "Build Prototype",
    message: "Created",
    userInvolved: false,
    date: "10/02/2024",
  },
  {
    task: "Build Prototype",
    message: "Assigned to Daniel Günther",
    userInvolved: true,
    date: "10/02/2024",
  },
  {
    task: "Build Prototype",
    message: "Status changed to In Progress",
    userInvolved: true,
    date: "10/02/2024",
  },
  {
    task: "Intro Presentation",
    message: "Status changed to Completed",
    userInvolved: false,
    date: "10/02/2024",
  },
  {
    task: "Build Prototype",
    message: "Status changed to Completed",
    userInvolved: true,
    date: "10/02/2024",
  },
];

export const useTaskLogData = () => {
  const { loading, data } = useDataFetcher({
    url: "/api/tasklog",
    demoData,
    filter: true,
  });
  if (loading) return [];
  return data.map((message) => ({
    children: (
      <>
        <b>Task: {message.task}</b> <i>{message.message}</i>
      </>
    ),
    color: message.userInvolved ? "green" : "blue",
  }));
};
