import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = [
    {
        sender: "Norbert",
        message: "Hi Daniel, ist dein Feature soweit?",
        date: "10/02/2024",
    },
    { sender: "You", message: "Ja sieht gut aus!", date: "10/02/2024" },
    {
        sender: "Alina",
        message: "Perfekt, ich bin mit meinem auch bald fertig :)",
        date: "10/02/2024",
    },
];

export const useChatTimelineData = () => {
    const { data } = useDataFetcher({
        url: "/api/chathistory",
        filter: true,
        demoData,
    });

    return data.map((message) => ({
        children: (
            <>
                <b>{message.sender}:</b> {message.message}
            </>
        ),
        color: message.sender === "You" ? "green" : "blue",
    }));
};
