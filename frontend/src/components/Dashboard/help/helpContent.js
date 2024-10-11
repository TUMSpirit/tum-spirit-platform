const helpDict = {
    big5: (
        <>
            The Big 5 are values that describe the human charater within 5 dimensions.
        </>
    ),
    subjectivity: (
        <div className="block">
            <p>
                The subjectivity line chart provides a <b>clear view</b> of how
                subjective or objective your messages are over time.
            </p>
            <p>
                Subjectivity values range from 0 (completely <span className="text-blue-500">objective</span>) to 1
                (completely <span className="text-purple-500">subjective</span>).
            </p>
            <p>
                Objectivity typically reflects <b>factual statements</b>, while subjectivity includes personal opinions, beliefs, or feelings.
            </p>
            <p>
                Observing your subjectivity trends can help you better understand the tone and content style of your communications.
            </p>
        </div>
    ),
    
    messages_heatmap: (
        <div className="block">
            <p>
                The chat messages per day heatmap allows you to visualize <b>daily message activity</b> across a calendar-like grid.
            </p>
            <p>
                Darker squares indicate days with <b>more message activity</b>, while lighter squares reflect <b>fewer messages</b>.
            </p>
            <p>
                This view helps identify <b>communication patterns</b> and peaks in activity, which can reveal insights into when team collaboration is most intense.
            </p>
        </div>
    ),
    
    language_3dscatter: (
        <div className="block">
            <p>
                The language analysis 3D scatter plot shows a <b>multi-dimensional view</b> of your messages based on linguistic features such as tone, sentiment, and structure.
            </p>
            <p>
                Each point represents a message, and its position in 3D space is determined by <b>language characteristics</b>.
            </p>
            <p>
                This visualization helps to capture the <b>complexity of communication patterns</b>, allowing you to explore your messages from different perspectives.
            </p>
        </div>
    ),
    
};

export const getHelpContent = (key) => {
    return helpDict[key];
};
