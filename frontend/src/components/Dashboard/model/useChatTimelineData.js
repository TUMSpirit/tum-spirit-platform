import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = [
  {
    sender: "Martin",
    message: "Hi! Perfekt, danke fürs Erstellen - LG 🙂",
    date: "13/05/2024",
  },
  {
    sender: "You",
    message: "Hey, Ich habe einen Termin für nächste Woche angelegt.",
    date: "13/05/2024",
  },
];

export const useChatTimelineData = () => {
  const { loading, data } = useDataFetcher({
    url: "/api/language/get-chat-log",
    demoData,
  });

  if (loading) return [];

  // Format the data to be displayed in the chat timeline
  return data.map((message) => ({
    children: (
      <>
        <b>{message.sender}:</b> {message.message}
      </>
    ),
    color: "blue",
  }));
};
