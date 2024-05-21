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
    }
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
