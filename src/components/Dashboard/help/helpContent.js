const helpDict = {
    big5: (
        <>
            The Big 5 are a value describing the human Charater in 5 categories.
        </>
    ),
    sentiment: (
        <div className="block">
            <p>
                On the sentiment line chart you get a quick overview of the{" "}
                <b>history of your sentiment.</b>
            </p>
            <p>
                Sentiment values range from -1 (
                <span className="text-red-500">very negative</span>) to 1 (
                <span className="text-green-500">very positive</span>).
            </p>
            <p>
                These values are very dependent on the <b>mood of a person</b>{" "}
                and countless <b>other external factors</b>.
            </p>
            <p>
                This means that sentiment most likely changes all the time,
                however trends should be noticeable.
            </p>
        </div>
    ),
    subjectivity: <>subjectivity help</>,
    messages_heatmap: <></>,
    language_3dscatter: <></>,
};

export const getHelpContent = (key) => {
    return helpDict[key];
};
