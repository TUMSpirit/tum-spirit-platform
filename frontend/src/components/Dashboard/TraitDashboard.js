import { DashboardCard } from "./layout/DashboardCard";
import { getHelpContent } from "./help/helpContent.js";
import { Big5Chart } from "./charts/Big5Chart.js";
import { useBig5Data } from "./model/useBig5Data.js";
import { useBig5TeamData } from "./model/useBig5TeamData.js";
import { useState, useEffect } from "react";

export const TraitDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use custom hooks to fetch data for both user and team
  const userFetcher = useBig5Data;
  const teamFetcher = useBig5TeamData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard caption={"Big 5"}>
        <Big5Chart
          userFetcher={userFetcher}
          teamFetcher={teamFetcher}
          onHoverIndexChanged={setCurrentIndex}
        />
      </DashboardCard>

      <DashboardCard caption="Big 5 Explanation" className="lg:col-span-2">
        <p>{getHelpContent("big5")}</p>
        <h1 className="text-2xl text-center">
          {[
            ["O", 4],
            ["C", 1],
            ["E", 0],
            ["A", 2],
            ["N", 3],
          ].map(([char, index], key) => (
            <b
              key={key}
              className={
                currentIndex === index
                  ? "font-black"
                  : "font-normal text-gray-500"
              }
            >
              {char}
            </b>
          ))}
        </h1>
        {[
          [
            <>
              <b>Openness</b> describes an individual's degree of intellectual
              curiosity, creativity, and preference for novelty and variety.
              People high in openness are typically imaginative, open to new
              ideas, and have a broad range of interests. They are more
              adventurous and willing to engage in new experiences. On the other
              hand, those with lower levels of openness may prefer routine,
              showing caution towards new experiences and a more conventional
              approach to problem-solving.
            </>,
            4,
          ],
          [
            <>
              <b>Conscientiousness</b> reflects an individual's self-discipline,
              orderliness, and reliability. Highly conscientious people are
              organized, dependable, and responsible, often setting and
              achieving high goals. They like to plan ahead and have strong
              impulse control. Lower scores in conscientiousness might indicate
              a more laid-back or spontaneous personality, where individuals may
              prioritize flexibility over structure and are more likely to act
              on impulse.
            </>,
            1,
          ],
          [
            <>
              <b>Extraversion</b> is characterized by an orientation towards the
              external world, focusing on sociability, enthusiasm, and
              assertiveness. Extroverts get energy from social interactions,
              display warmth and have a tendency to seek stimulation in the
              company of others. They are often perceived as talkative and
              dynamic. Conversely, introverts get their energy from solitude and
              may have fewer, but deeper, social engagements. They might prefer
              reflecting before speaking and prefer intimate gatherings over
              large social events.
            </>,
            0,
          ],
          [
            <>
              <b>Agreeableness</b> describes the quality of one's interpersonal
              interactions also reflecting attributes such as altruism, trust,
              and compassion. Individuals scoring high in agreeableness are
              cooperative, sympathetic, and value harmony in their
              relationships. They are more likely to be considerate, friendly,
              and willing to compromise. Those with lower scores might be more
              competitive or skeptical of others intentions, which can lead to
              them being more assertive or antagonistic in interactions.
            </>,
            2,
          ],
          [
            <>
              <b>Neuroticism</b> indicates the tendency to experience negative
              emotions such as anxiety, sadness, and irritability. It measures
              emotional stability and how well a person can deal with stress.
              High levels of neuroticism are associated with a higher
              sensitivity to negative stimuli and a predisposition to perceive
              normal situations as threatening. People with low neuroticism
              scores tend to remain calm and free from persistent negative
              feelings, even in challenging circumstances.
            </>,
            3,
          ],
        ].map(([char, index], key) => (
          <p key={key} className={currentIndex === index ? "" : "hidden"}>
            {char}
          </p>
        ))}
      </DashboardCard>
    </div>
  );
};
