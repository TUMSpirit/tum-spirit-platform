import React, { useState, useEffect } from "react";
import { Modal, Typography, Form, Radio, Button, message, Steps } from "antd";
import axios from "axios";
import styled from 'styled-components';
import { useAuthHeader } from "react-auth-kit";
import { useSocket } from "../../context/SocketProvider";
import ghost from "../../assets/images/ghost.png"; // Assuming you have a ghost image asset

const { Step } = Steps;
const { Title, Text } = Typography;

// Styled components
const QuestionLabel = styled.div`
  font-weight: 800;
`;

const LegendWrapper = styled.div`
  background-color: #f0f2f5;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
`;

const LegendText = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  margin-bottom: 20px;
`;

const StartTestButton = styled(Button)`
  width: 150px;
  margin-top: 20px;
`;
const renderLegend = () => (
  <LegendWrapper>
    <LegendText>1 - Strongly Disagree</LegendText>
    <LegendText>2 - Disagree</LegendText>
    <LegendText>3 - Neutral</LegendText>
    <LegendText>4 - Agree</LegendText>
    <LegendText>5 - Strongly Agree</LegendText>
  </LegendWrapper>
);

const questions = [
  { id: 1, trait: "Neuroticism", question: "I am not a worrier.", reverseScored: true },
  { id: 2, trait: "Extraversion", question: "I like to have a lot of people around me." },
  { id: 3, trait: "Openness", question: "I enjoy concentrating on a fantasy or daydream and exploring all its possibilities, letting it grow and develop." },
  { id: 4, trait: "Agreeableness", question: "I try to be courteous to everyone I meet." },
  { id: 5, trait: "Conscientiousness", question: "I keep my belongings neat and clean." },
  { id: 6, trait: "Neuroticism", question: "At times I have felt bitter and resentful." },
  { id: 7, trait: "Extraversion", question: "I laugh easily." },
  { id: 8, trait: "Openness", question: "I experience a wide range of emotions or feelings." },
  { id: 9, trait: "Agreeableness", question: "If someone starts a fight, I'm ready to fight back.", reverseScored: true },
  { id: 10, trait: "Conscientiousness", question: "I'm pretty good about pacing myself so as to get things done on time." },
  { id: 11, trait: "Neuroticism", question: "When I'm under a great deal of stress, sometimes I feel like I'm going to pieces." },
  { id: 12, trait: "Extraversion", question: "I don't get much pleasure from chatting with people.", reverseScored: true },
  { id: 13, trait: "Openness", question: "I am intrigued by the patterns I find in art and nature." },
  { id: 14, trait: "Agreeableness", question: "Some people think I'm selfish and egotistical.", reverseScored: true },
  { id: 15, trait: "Conscientiousness", question: "I often come into situations without being fully prepared.", reverseScored: true },
  { id: 16, trait: "Neuroticism", question: "I rarely feel lonely or blue.", reverseScored: true },
  { id: 17, trait: "Extraversion", question: "I really enjoy talking to people." },
  { id: 18, trait: "Openness", question: "I believe letting students hear controversial speakers can only confuse and mislead them.", reverseScored: true },
  { id: 19, trait: "Agreeableness", question: "I tend to assume the best about people." },
  { id: 20, trait: "Conscientiousness", question: "I try to perform all the tasks assigned to me conscientiously." },
  { id: 21, trait: "Neuroticism", question: "I often feel tense and jittery." },
  { id: 22, trait: "Extraversion", question: "I like to be where the action is." },
  { id: 23, trait: "Openness", question: "Poetry has little or no effect on me.", reverseScored: true },
  { id: 24, trait: "Agreeableness", question: "At times I bully or flatter people into doing what I want them to.", reverseScored: true },
  { id: 25, trait: "Conscientiousness", question: "I have a clear set of goals and work toward them in an orderly fashion." },
  { id: 26, trait: "Neuroticism", question: "Sometimes I feel completely worthless." },
  { id: 27, trait: "Extraversion", question: "I prefer jobs that let me work alone without being bothered by other people.", reverseScored: true },
  { id: 28, trait: "Openness", question: "I think it's interesting to learn and develop new hobbies." },
  { id: 29, trait: "Agreeableness", question: "I have no sympathy for beggars.", reverseScored: true },
  { id: 30, trait: "Conscientiousness", question: "I waste a lot of time before settling down to work." },
  { id: 31, trait: "Neuroticism", question: "I rarely feel fearful or anxious.", reverseScored: true },
  { id: 32, trait: "Extraversion", question: "I often feel as if I'm bursting with energy." },
  { id: 33, trait: "Openness", question: "I seldom notice the moods or feelings that different environments produce.", reverseScored: true },
  { id: 34, trait: "Agreeableness", question: "When I've been insulted, I just try to forgive and forget." },
  { id: 35, trait: "Conscientiousness", question: "I work hard to accomplish my goals." },
  { id: 36, trait: "Neuroticism", question: "I often get angry at the way people treat me." },
  { id: 37, trait: "Extraversion", question: "I am cheerful, high spirited person." },
  { id: 38, trait: "Openness", question: "I would have difficulty just letting my mind wander without control or guidance.", reverseScored: true },
  { id: 39, trait: "Agreeableness", question: "Some people think of me as cold and calculating.", reverseScored: true },
  { id: 40, trait: "Conscientiousness", question: "When I make a commitment, I can always be counted on to follow through." },
  { id: 41, trait: "Neuroticism", question: "Too often, when things go wrong, I get discouraged and feel like giving up." },
  { id: 42, trait: "Extraversion", question: "I shy away from crowds of people.", reverseScored: true },
  { id: 43, trait: "Openness", question: "Sometimes when I am reading poetry or looking at a work of art, I feel a chill or wave of excitement" },
  { id: 44, trait: "Agreeableness", question: "I'm better than most people, and I know it.", reverseScored: true },
  { id: 45, trait: "Conscientiousness", question: "Sometimes I'm not as dependable or reliable as I should be.", reverseScored: true },
  { id: 46, trait: "Neuroticism", question: "I am seldom sad or depressed.", reverseScored: true },
  { id: 47, trait: "Extraversion", question: "My life is fast-paced." },
  { id: 48, trait: "Openness", question: "I have little interest in speculating on the nature of the universe or the human condition.", reverseScored: true },
  { id: 49, trait: "Agreeableness", question: "I generally try to be thoughtful and considerate." },
  { id: 50, trait: "Conscientiousness", question: "I am a productive person who always gets the job done." },
  { id: 51, trait: "Neuroticism", question: "I often fret helpless and want someone else to solve my problems." },
  { id: 52, trait: "Extraversion", question: "I am very active person." },
  { id: 53, trait: "Openness", question: "I have a lot of intellectual curiosity." },
  { id: 54, trait: "Agreeableness", question: "If I don't like people, I let them know it.", reverseScored: true },
  { id: 55, trait: "Conscientiousness", question: "I never seem to be able to get organized.", reverseScored: true },
  { id: 56, trait: "Neuroticism", question: "At times I have been so ashamed I just wanted to hide." },
  { id: 57, trait: "Extraversion", question: "I would rather go my own way than be a leader of others.", reverseScored: true },
  { id: 58, trait: "Openness", question: "I often enjoy playing with theories or abstract ideas." },
  { id: 59, trait: "Agreeableness", question: "If necessary, I am willing to manipulate people to get what I want.", reverseScored: true },
  { id: 60, trait: "Conscientiousness", question: "I strive for excellence in everything I do." }
];

/*
// NEOFFI questions grouped by trait
const questions = [
  // Neuroticism (N) - Measures emotional stability and personal adjustment
  { id: 1, trait: "Neuroticism", question: "I am not a worrier.", reverseScored: true },
  { id: 2, trait: "Neuroticism", question: "I rarely feel fearful or anxious.", reverseScored: true },
  { id: 3, trait: "Neuroticism", question: "I often feel tense and jittery." },
  { id: 4, trait: "Neuroticism", question: "I often get angry at the way people treat me." },
  { id: 5, trait: "Neuroticism", question: "At times I have felt bitter and resentful." },
  { id: 6, trait: "Neuroticism", question: "I rarely feel lonely or blue.", reverseScored: true },
  { id: 7, trait: "Neuroticism", question: "Sometimes I feel completely worthless." },
  { id: 8, trait: "Neuroticism", question: "I am seldom sad or depressed.", reverseScored: true },
  { id: 9, trait: "Neuroticism", question: "Too often, when things go wrong, I get discouraged and feel like giving up." },
  { id: 10, trait: "Neuroticism", question: "At times I have been so ashamed I just wanted to hide." },
  { id: 11, trait: "Neuroticism", question: "I often fret helpless and want someone else to solve my problems." },
  { id: 12, trait: "Neuroticism", question: "When I'm under a great deal of stress, sometimes I feel like I'm going to pieces." },

  // Extraversion (E) - Measures sociability, assertiveness, and activity levels
  { id: 13, trait: "Extraversion", question: "I don't get much pleasure from chatting with people.", reverseScored: true },
  { id: 14, trait: "Extraversion", question: "I really enjoy talking to people." },
  { id: 15, trait: "Extraversion", question: "I prefer jobs that let me work alone without being bothered by other people.", reverseScored: true },
  { id: 16, trait: "Extraversion", question: "I like to have a lot of people around me." },
  { id: 17, trait: "Extraversion", question: "I shy away from crowds of people.", reverseScored: true },
  { id: 18, trait: "Extraversion", question: "I would rather go my own way than be a leader of others.", reverseScored: true },
  { id: 19, trait: "Extraversion", question: "My life is fast-paced." },
  { id: 20, trait: "Extraversion", question: "I am very active person." },
  { id: 21, trait: "Extraversion", question: "I often feel as if I'm bursting with energy." },
  { id: 22, trait: "Extraversion", question: "I like to be where the action is." },
  { id: 23, trait: "Extraversion", question: "I am cheerful, high spirited person." },
  { id: 24, trait: "Extraversion", question: "I laugh easily." },

  // Openness (O) - Measures imagination, curiosity, and openness to experience
  { id: 25, trait: "Openness", question: "I enjoy concentrating on a fantasy or daydream and exploring all its possibilities, letting it grow and develop." },
  { id: 26, trait: "Openness", question: "I would have difficulty just letting my mind wander without control or guidance.", reverseScored: true },
  { id: 27, trait: "Openness", question: "Poetry has little or no effect on me.", reverseScored: true },
  { id: 28, trait: "Openness", question: "Sometimes when I am reading poetry or looking at a work of art, I feel a chill or wave of excitement" },
  { id: 29, trait: "Openness", question: "I am intrigued by the patterns I find in art and nature." },
  { id: 30, trait: "Openness", question: "I experience a wide range of emotions or feelings." },
  { id: 31, trait: "Openness", question: "I seldom notice the moods or feelings that different environments produce.", reverseScored: true },
  { id: 32, trait: "Openness", question: "I think it's interesting to learn and develop new hobbies." },
  { id: 33, trait: "Openness", question: "I often enjoy playing with theories or abstract ideas." },
  { id: 34, trait: "Openness", question: "I have little interest in speculating on the nature of the universe or the human condition.", reverseScored: true },
  { id: 35, trait: "Openness", question: "I have a lot of intellectual curiosity." },
  { id: 36, trait: "Openness", question: "I believe letting students hear controversial speakers can only confuse and mislead them.", reverseScored: true },

  // Agreeableness (A) - Measures trust, kindness, and social harmony
  { id: 37, trait: "Agreeableness", question: "I tend to assume the best about people." },
  { id: 38, trait: "Agreeableness", question: "If neccessary, I am willing to manipulate people to get what I want.", reverseScored: true },
  { id: 39, trait: "Agreeableness", question: "At times I bully or flatter people into doing what I want them to.", reverseScored: true },
  { id: 40, trait: "Agreeableness", question: "Some people think of me as cold and calculating.", reverseScored: true },
  { id: 41, trait: "Agreeableness", question: "I generally try to be thoughtful and considerate." },
  { id: 42, trait: "Agreeableness", question: "Some people think I'm selfish and egotistical.", reverseScored: true },
  { id: 43, trait: "Agreeableness", question: "I try to be courteous to everyone I meet." },
  { id: 44, trait: "Agreeableness", question: "When I've been insulted, I just try to forgive and forget." },
  { id: 45, trait: "Agreeableness", question: "If someone starts a fight, I'm ready to fight back.", reverseScored: true },
  { id: 46, trait: "Agreeableness", question: "If I don't like people, I let them know it.", reverseScored: true },
  { id: 47, trait: "Agreeableness", question: "I'm better than most people, and I know it.", reverseScored: true },
  { id: 48, trait: "Agreeableness", question: "I have no sympathy for beggars.", reverseScored: true },

  // Conscientiousness (C) - Measures self-discipline, responsibility, and goal-orientation
  { id: 49, trait: "Conscientiousness", question: "I often come into situations without being fully prepared.", reverseScored: true },
  { id: 50, trait: "Conscientiousness", question: "I keep my belongings neat and clean." },
  { id: 51, trait: "Conscientiousness", question: "I never seem to be able to get organized.", reverseScored: true },
  { id: 52, trait: "Conscientiousness", question: "Sometimes I'm not as dependable or reliable as I should be.", reverseScored: true },
  { id: 53, trait: "Conscientiousness", question: "When I make a commitment, I can always be counted on to follow through." },
  { id: 54, trait: "Conscientiousness", question: "I try to perform all the tasks assigned to me conscientiously." },
  { id: 55, trait: "Conscientiousness", question: "I work hard to accomplish my goals." },
  { id: 56, trait: "Conscientiousness", question: "I have a clear set of goals and work toward them in an orderly fashion." },
  { id: 57, trait: "Conscientiousness", question: "I strive for excellence in everything I do." },
  { id: 58, trait: "Conscientiousness", question: "I'm pretty good about pacing myself so as to get things done on time." },
  { id: 59, trait: "Conscientiousness", question: "I am a productive person who always gets the job done." },
  { id: 60, trait: "Conscientiousness", question: "I waste a lot of time before settling down to work." }
];*/


// Define sections based on question IDs (grouping every 12 questions)
const sections = [
  { section: 1, title: "Section 1", questionRange: [1, 12] },
  { section: 2, title: "Section 2", questionRange: [13, 24] },
  { section: 3, title: "Section 3", questionRange: [25, 36] },
  { section: 4, title: "Section 4", questionRange: [37, 48] },
  { section: 5, title: "Section 5", questionRange: [49, 60] }
];

// Map each question to a section based on its ID
const questionsWithSections = questions.map((question) => {
  // Find the section the question belongs to
  const section = sections.find(
    (s) => question.id >= s.questionRange[0] && question.id <= s.questionRange[1]
  );

  return {
    ...question,
    section: section.section, // Assign the section number to the question
  };
});

const PreFormPage = ({ onStart }) => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <AvatarWrapper>
      <img src={ghost} alt="ghost" className="h-24" style={{ maxWidth: '100%', padding: "0 10%" }} />
    </AvatarWrapper>
    <Title level={3}>Get Ready for Your Personality Evaluation</Title>
    <Text type="secondary">
      We will now ask you a series of questions to evaluate your personality. Take your time and answer honestly.
    </Text>
    <div style={{ marginTop: '20px' }}>
      <StartTestButton type="primary" onClick={onStart}>
        Start Test
      </StartTestButton>
    </div>
  </div>
);

const NEOFFIForm = ({ isPreModalVisible, setPreModalVisible }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [answeredCount, setAnsweredCount] = useState([]);
  const authHeader = useAuthHeader();
  const { updateSettings } = useSocket();

  // Corrected SaveStepAnswers to properly merge values
  const saveStepAnswers = () => {
    const currentValues = form.getFieldsValue(); // Get the current form values for the step
    const updatedValues = { ...formValues, ...currentValues }; // Merge new step values with all previously saved answers
    setFormValues(updatedValues); // Persist all answers
  };

  // Calculate answered questions count dynamically
  const calculateAnsweredQuestions = (values) => {
    return sections.map((section) => ({
      section: section.section,
      answered: questionsWithSections.filter(
        (q) => q.section === section.section && values[`question_${q.id}`] !== undefined
      ).length,
      total: section.questionRange[1] - section.questionRange[0] + 1
    }));
  };

  // Update answered count whenever form values change
  const handleValuesChange = (changedValues) => {
    const updatedValues = { ...formValues, ...changedValues }; // Merge new values with existing values
    setFormValues(updatedValues); // Update form values
    calculateAnsweredQuestions(updatedValues); // Recalculate the answered count
  };

  const handleNext = () => {
    form.validateFields()
      .then(() => {
        saveStepAnswers();
        setCurrentStep(currentStep + 1);
      })
      .catch(() => {
        message.info('Please fill out all required fields before proceeding.');
      });
  };

  const handlePrevious = () => {
    saveStepAnswers();
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    saveStepAnswers(); // Save answers before submitting
    setLoading(true);
    const results = calculateResults(formValues);

    try {
      await axios.post("/api/neoffi/save", results, {
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/json'
        },
      });
      message.success("NEOFFI submitted successfully!");
      form.resetFields();
      updateSettings('trigger_neoffi_test', false);
      setModalVisible(false);
    } catch (error) {
      message.error("Error submitting NEOFFI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = (values) => {
    const scores = {
      Neuroticism: 0,
      Extraversion: 0,
      Openness: 0,
      Agreeableness: 0,
      Conscientiousness: 0,
    };

    // Loop over all form responses
    Object.keys(values).forEach((key) => {
      const questionId = parseInt(key.split("_")[1], 10);
      const answer = values[key]; // 0-4 scale

      const question = questionsWithSections.find(q => q.id === questionId);
      if (question) {
        // Adjust for reverse scoring
        const finalAnswer = question.reverseScored ? (6 - answer) : answer;

        // Add the score to the corresponding trait
        scores[question.trait] += finalAnswer;
      }
    });

    return scores;
  };

  const renderQuestions = (section) => {
    const sectionQuestions = questionsWithSections.filter(q => q.section === section);

    return (
      <>
        {renderLegend()}
        {sectionQuestions.map((item) => (
          <Form.Item
            key={item.id}
            label={<QuestionLabel>{item.question}</QuestionLabel>}
            name={`question_${item.id}`}
            rules={[{ required: true, message: 'Please select an answer.' }]}
          >
            <Radio.Group>
              {[1, 2, 3, 4, 5].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        ))}
      </>
    );
  };

  useEffect(() => {
    // Initialize answered count on first render
    setAnsweredCount(calculateAnsweredQuestions(formValues));
    form.setFieldsValue(formValues);
  }, [currentStep, formValues, form]);

  const startTest = () => {
    setPreModalVisible(false);
    setModalVisible(true); // Open the main modal
  };

  return (
    <>
      <Modal open={isPreModalVisible} footer={null} width={600} closable={false} centered>
        <PreFormPage onStart={startTest} />
      </Modal>
      <Modal open={isModalVisible} footer={null} width={800} centered onCancel={() => setModalVisible(false)}>
        <Title level={3} className="text-center mb-5">NEOFFI Questionnaire</Title>

        <Steps current={currentStep} size="small" className="mb-5">
          {answeredCount.map((s) => (
            <Step
              key={s.section}
              title={`Section ${s.section}`}
              description={`${s.answered} / ${s.total} answered`}
            />
          ))}
        </Steps>

        <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
          {renderQuestions(sections[currentStep].section)}

          <div style={{ display: 'flex', justifyContent: currentStep > 0 ? 'space-between' : 'flex-end' }}>
            {currentStep > 0 && (
              <Button onClick={handlePrevious}>Back</Button>
            )}
            {currentStep < sections.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            )}
            {currentStep === sections.length - 1 && (
              <Button type="primary" loading={loading} onClick={handleFinish}>
                Submit
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default NEOFFIForm;