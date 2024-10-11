import React, { useMemo, useState, useEffect } from "react";
import { Modal, Typography, Form, Input, Button, Radio, message, Steps, Col, Row } from "antd";
import axios from "axios";
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuthHeader } from "react-auth-kit";
import { useSocket } from "../../context/SocketProvider";
import ghost from "../../assets/images/ghost.png";
import { UserOutlined } from '@ant-design/icons';


const { Step } = Steps;
const { Title, Text } = Typography;

// Styled components for better design
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

const QuestionLabel = styled.div`
  font-weight: 800; // Bold questions
`;

const AnswerText = styled.span`
  font-size: 12px; // Smaller font size for answers
`;

const LegendWrapper = styled.div`
  background-color: #f0f2f5; /* Light gray background */
  border: 1px solid #d9d9d9; /* Border for the legend */
  border-radius: 5px;
  padding: 16px; /* Spacing inside the legend */
  margin-bottom: 24px;
  text-align: center;
`;

const LegendText = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

const renderLegend = (part) => {
  switch (part) {
    case 1:
      return (
        <LegendWrapper className="space-y-4 sm:space-y-0 sm:flex sm:justify-around">
          <div className="sm:inline-block">
            <LegendText>1 - Does not apply at all</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>2 - Applies a little</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>3 - Moderately applies</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>4 - Mostly applies</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>5 - Fully applies</LegendText>
          </div>
        </LegendWrapper>
      );
    case 2:
      return (
        <LegendWrapper className="space-y-4 sm:space-y-0 sm:flex sm:justify-around">
          <div className="sm:inline-block">
            <LegendText>1 - Not at all</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>2 - A little</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>3 - Moderately</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>4 - Considerably</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>5 - Fully</LegendText>
          </div>
        </LegendWrapper>
      );
    case 3:
      return (
        <LegendWrapper className="space-y-4 sm:space-y-0 sm:flex sm:justify-around">
          <div className="sm:inline-block">
            <LegendText>1 - To a very small extent</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>2 - To a small extent</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>3 - To a moderate extent</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>4 - To a large extent</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>5 - To a very large extent</LegendText>
          </div>
        </LegendWrapper>
      );
    default:
      return null;
  }
};

const PreFormPage = ({ onStart, onSkip }) => (
  <div
    style={{ textAlign: 'center', padding: '20px' }}
  >
    <AvatarWrapper>
      <img
        src={ghost}
        alt="ghost"
        className="h-24"
        style={{ maxWidth: '100%', padding: "0 10%" }}
      />
    </AvatarWrapper>
    <Title level={3}>Are you ready for a short test?</Title>
    <Text type="secondary">
      This test helps us better understand your team dynamics and support you optimally.
    </Text>
    <div style={{ marginTop: '20px' }}>
      <StartTestButton type="primary" onClick={onStart}>
        Start Test
      </StartTestButton>
      <Button style={{ marginLeft: '10px' }} onClick={onSkip}>
        Skip Test
      </Button>
    </div>
  </div>
);

const TKIForm = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPreModalVisible, setPreModalVisible] = useState(visible); // Pre-modal visibility
  const [isModalVisible, setModalVisible] = useState(false);
  const authHeader = useAuthHeader();
  const { updateSettings } = useSocket();

  // Store form values in a state variable to persist across steps and re-render dynamically
  const [formValues, setFormValues] = useState({});
  const [stepAnswers, setStepAnswers] = useState({}); // Store answers for each step
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const questionsENG = [
    // Part 1: Communication and Innovation (1-26)
    { id: 1, part: 1, question: "We generally share information within the team rather than keeping it to ourselves." },
    { id: 2, part: 1, question: "Assistance in developing new ideas is readily available." },
    { id: 3, part: 1, question: "We all influence each other." },
    { id: 4, part: 1, question: "The team always succeeds in turning skills into performance." },
    { id: 5, part: 1, question: "We keep in regular contact with each other." },
    { id: 6, part: 1, question: "In this team, we take the time needed to develop new ideas." },
    { id: 7, part: 1, question: "People feel understood and accepted by each other." },
    { id: 8, part: 1, question: "Everyone’s view is listened to, even if it is in a minority." },
    { id: 9, part: 1, question: "People in the team never experience tensions among each other." },
    { id: 10, part: 1, question: "The team is open and responsive to change." },
    { id: 11, part: 1, question: "People in the team cooperate in order to help develop and apply new ideas." },
    { id: 12, part: 1, question: "Being part of this team is the most important thing about work for the team members." },
    { id: 13, part: 1, question: "We have a 'we are in it together' attitude." },
    { id: 14, part: 1, question: "We interact frequently." },
    { id: 15, part: 1, question: "The team is significantly better than any other team in its area." },
    { id: 16, part: 1, question: "People keep each other informed about work-related issues in the team." },
    { id: 17, part: 1, question: "Members of the team provide and share resources to help in the application of new ideas." },
    { id: 18, part: 1, question: "Relationships between people in the team are constantly harmonious." },
    { id: 19, part: 1, question: "There is a lot of give and take." },
    { id: 20, part: 1, question: "We keep in touch with each other as a team." },
    { id: 21, part: 1, question: "People in this team are always searching for fresh, new ways of looking at problems." },
    { id: 22, part: 1, question: "The team always achieves the highest goals easily." },
    { id: 23, part: 1, question: "There are real attempts to share information throughout the team." },
    { id: 24, part: 1, question: "This team is always moving towards the development of new answers." },
    { id: 25, part: 1, question: "Team members provide practical support for new ideas and their application." },
    { id: 26, part: 1, question: "Members of the team meet frequently to talk both formally and informally." },

    // Part 2: Goals (27-37)
    { id: 27, part: 2, question: "How clear are you about what your team objectives are?" },
    { id: 28, part: 2, question: "To what extent do you think they are useful and appropriate objectives?" },
    { id: 29, part: 2, question: "How far are you in agreement with these objectives?" },
    { id: 30, part: 2, question: "To what extent do you think other team members agree with these objectives?" },
    { id: 31, part: 2, question: "To what extent do you think your team’s objectives are clearly understood by other members of the team?" },
    { id: 32, part: 2, question: "To what extent do you think your team’s objectives can actually be achieved?" },
    { id: 33, part: 2, question: "How worthwhile do you think these objectives are to you?" },
    { id: 34, part: 2, question: "How worthwhile do you think these objectives are to the organization?" },
    { id: 35, part: 2, question: "How worthwhile do you think these objectives are to the wider society?" },
    { id: 36, part: 2, question: "To what extent do you think these objectives are realistic and can be attained?" },
    { id: 37, part: 2, question: "To what extent do you think members of your team are committed to these objectives?" },

    // Part 3: Task Style (38-44)
    { id: 38, part: 3, question: "Do your team colleagues provide useful ideas and practical help to enable you to do the job to the best of your ability?" },
    { id: 39, part: 3, question: "Do you and your colleagues monitor each other so as to maintain a higher standard of work?" },
    { id: 40, part: 3, question: "Are team members prepared to question the basis of what the team is doing?" },
    { id: 41, part: 3, question: "Does the team critically appraise potential weaknesses in what it is doing in order to achieve the best possible outcome?" },
    { id: 42, part: 3, question: "Do members of the team build on each other’s ideas in order to achieve the best possible outcome?" },
    { id: 43, part: 3, question: "Is there a real concern among team members that the team should achieve the highest standards of performance?" },
    { id: 44, part: 3, question: "Does the team have clear criteria which members try to meet in order to achieve excellence as a team?" }
  ];


  const dimensionMapping = {
    1: ['partizipative_sicherheit', 'informationsverteilung'],    // Example question 1 maps to synergy and informationSharing
    2: ['unterstuetzung_fuer_innovation', 'normen_der_bereitschaft'],  // Example question 2 maps to synergy and supportForInnovation
    3: ['partizipative_sicherheit', 'einfluss'],
    4: ['soziale_erwuenschtheit', 'aufgaben_aspekte'],
    5: ['partizipative_sicherheit', 'kontaktpflege'],
    6: ['unterstuetzung_fuer_innovation', 'normen_der_umsetzung'],
    7: ['partizipative_sicherheit', 'sicherheit'],
    8: ['partizipative_sicherheit', 'einfluss'],
    9: ['soziale_erwuenschtheit', 'soziale_aspekte'],
    10: ['unterstuetzung_fuer_innovation', 'normen_der_bereitschaft'],
    11: ['unterstuetzung_fuer_innovation', 'normen_der_umsetzung'],
    12: ['soziale_erwuenschtheit', 'soziale_aspekte'],
    13: ['partizipative_sicherheit', 'sicherheit'],
    14: ['partizipative_sicherheit', 'kontaktpflege'],
    15: ['soziale_erwuenschtheit', 'aufgaben_aspekte'],
    16: ['partizipative_sicherheit', 'informationsverteilung'],
    17: ['unterstuetzung_fuer_innovation', 'normen_der_umsetzung'],
    18: ['soziale_erwuenschtheit', 'soziale_aspekte'],
    19: ['partizipative_sicherheit', 'einfluss'],
    20: ['partizipative_sicherheit', 'kontaktpflege'],
    21: ['unterstuetzung_fuer_innovation', 'normen_der_bereitschaft'],
    22: ['soziale_erwuenschtheit', 'aufgaben_aspekte'],
    23: ['partizipative_sicherheit', 'informationsverteilung'],
    24: ['unterstuetzung_fuer_innovation', 'normen_der_bereitschaft'],
    25: ['unterstuetzung_fuer_innovation', 'normen_der_umsetzung'],
    26: ['partizipative_sicherheit', 'kontaktpflege'],

    // Part 2: Goals (27-37)
    27: ['vision', 'klarheit'],
    28: ['vision', 'wertschaetzung'],
    29: ['vision', 'einigkeit'],
    30: ['vision', 'einigkeit'],
    31: ['vision', 'klarheit'],
    32: ['vision', 'erreichbarkeit'],
    33: ['vision', 'wertschaetzung'],
    34: ['vision', 'wertschaetzung'],
    35: ['vision', 'wertschaetzung'],
    36: ['vision', 'erreichbarkeit'],
    37: ['vision', 'einigkeit'],

    // Part 3: Task Style (38-44)
    38: ['aufgabenorientierung', 'synergie'],
    39: ['aufgabenorientierung', 'reflexion'],
    40: ['aufgabenorientierung', 'reflexion'],
    41: ['aufgabenorientierung', 'reflexion'],
    42: ['aufgabenorientierung', 'synergie'],
    43: ['aufgabenorientierung', 'hohe_standards'],
    44: ['aufgabenorientierung', 'hohe_standards']
  };

  const stanineBoundaries = {
    klarheit: [6.9, 7.3, 7.7, 7.9, 8.2, 8.6, 9.0, 9.3],  // Boundaries for Stanine 2 to 9
    wertschaetzung: [10.3, 12.9, 13.8, 14.6, 15.3, 16.1, 16.8, 17.9],
    einigkeit: [8.9, 10.4, 11.0, 11.3, 11.7, 12.2, 12.7, 14.1],
    erreichbarkeit: [5.9, 6.7, 7.2, 7.6, 8.0, 8.4, 8.7, 8.9],
    vision: [32.9, 38.8, 40.5, 41.7, 42.4, 44.3, 46.7, 49.8],
    hohe_standards: [4.3, 6.0, 6.5, 7.0, 7.3, 7.8, 8.6, 9.0],
    reflexion: [7.6, 9.0, 10.2, 10.8, 11.5, 12.0, 12.7, 13.2],
    synergie: [5.2, 6.5, 7.0, 7.4, 7.9, 8.3, 8.7, 9.0],
    aufgabenorientierung: [17.1, 22.4, 23.5, 25.0, 26.8, 27.9, 29.3, 30.6],
    informationsverteilung: [9.7, 10.2, 11.0, 11.7, 12.3, 12.7, 13.3, 13.8],
    sicherheit: [6.0, 6.3, 7.0, 7.2, 7.8, 8.0, 8.8, 9.2],
    einfluss: [9.3, 10.1, 10.8, 11.6, 12.0, 12.3, 13.0, 13.9],
    kontaktpflege: [12.8, 13.3, 14.3, 14.9, 15.9, 16.6, 17.5, 18.5],
    partizipative_sicherheit: [38.0, 41.6, 43.3, 45.7, 47.9, 49.1, 51.4, 54.8],
    normen_der_bereitschaft: [11.1, 12.3, 13.5, 14.0, 15.2, 15.8, 16.4, 17.8],
    normen_der_umsetzung: [9.5, 11.9, 12.9, 14.2, 15.1, 15.6, 16.0, 17.0],
    unterstuetzung_fuer_innovation: [20.6, 24.2, 26.3, 28.4, 30.0, 31.3, 32.4, 34.8]
  };


  const parts = [
    { part: 1, title: "Communication", totalQuestions: 26 },
    { part: 2, title: "Goals", totalQuestions: 11 },
    { part: 3, title: "Task style", totalQuestions: 7 }
  ];


  const onFinish = async (values) => {
    setLoading(true);
  
    // Calculate results
    const results = calculateResults(formValues);
  
    // Add the raw answers to the payload
    const payload = {
      ...results,
      rawValues: formValues  // Include raw answers
    };
  
    try {
      const response = await axios.post("/api/tki/save", payload, {
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/json',
        },
      });
  
      // Handle successful submission
      message.success("TKI submitted successfully!");
      form.resetFields();
      updateSettings('trigger_tki_test', false);
      setModalVisible(false);
  
    } catch (error) {
      message.error(`Error submitting TKI: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const calculateResults = (values) => {
    // Initialize the score object
    let scores = {
      klarheit: 0,
      wertschaetzung: 0,
      einigkeit: 0,
      erreichbarkeit: 0,
      vision: 0,
      hohe_standards: 0,
      reflexion: 0,
      synergie: 0,
      aufgabenorientierung: 0,
      informationsverteilung: 0,
      sicherheit: 0,
      einfluss: 0,
      kontaktpflege: 0,
      partizipative_sicherheit: 0,
      normen_der_bereitschaft: 0,
      normen_der_umsetzung: 0,
      unterstuetzung_fuer_innovation: 0,
      aufgaben_aspekte: 0,
      soziale_aspekte: 0,
      soziale_erwuenschtheit: 0  // Track but exclude from stanine normalization
    };

    // Loop over all values (answers) in the form
    Object.keys(values).forEach((key) => {
      const questionId = parseInt(key.split("_")[1], 10); // Extract question id from the name (e.g., question_1)
      const answer = values[key];  // This will be a value from 1 to 5

      // Check if the questionId maps to any dimensions
      if (dimensionMapping[questionId]) {
        // Loop through the dimensions that this question contributes to
        dimensionMapping[questionId].forEach((dimension) => {
          scores[dimension] += answer;  // Add the answer to the corresponding dimension score
        });
      }

      // Special case: Add score to soziale_erwuenschtheit if it's one of the relevant questions
      /* const sozialeErwuenschtheitQuestions = [4, 9, 12, 15, 22];  // List of question IDs related to soziale_erwuenschtheit
       if (sozialeErwuenschtheitQuestions.includes(questionId)) {
         scores.soziale_erwuenschtheit += answer;
       }*/
    });

    // Now, we calculate the stanine scores for each dimension except 'soziale_erwuenschtheit'
    const soziale_erwuenschtheit = scores.soziale_erwuenschtheit;
    const soziale_aspekte = scores.soziale_aspekte;
    const aufgaben_aspekte = scores.aufgaben_aspekte; // Store 'soziale_erwuenschtheit' separately
    delete scores.soziale_erwuenschtheit;
    delete scores.aufgaben_aspekte;
    delete scores.soziale_aspekte;   // Remove from scores before normalization

    // Normalize the remaining scores to stanine
    const stanineScores = normalizeToStanine(scores);

    // Return the result with stanine scores and soziale_erwuenschtheit appended
    return { ...stanineScores, aufgaben_aspekte, soziale_aspekte, soziale_erwuenschtheit };
  };


  // Function to normalize the raw scores to Stanine scores based on boundaries
  const normalizeToStanine = (rawScores) => {
    let stanineScores = {};

    // Loop through each dimension and normalize based on its boundaries
    Object.keys(rawScores).forEach((dimension) => {
      const rawScore = rawScores[dimension];  // Get the raw score for the current dimension
      const boundaries = stanineBoundaries[dimension];  // Get the stanine boundaries for this dimension

      if (!boundaries) {
        // If no boundaries are found for the current dimension, log an error and skip normalization
        console.error(`Boundaries not defined for dimension: ${dimension}`);
        stanineScores[dimension] = null;  // Handle missing boundary gracefully
        return;
      }

      // Check if the raw score is below the first boundary
      if (rawScore < boundaries[0]) {
        stanineScores[dimension] = 1;  // Assign Stanine 1 if below the first boundary
      } else {
        // Iterate through the boundaries to find the correct stanine value
        for (let i = 0; i < boundaries.length; i++) {
          if (rawScore < boundaries[i]) {
            stanineScores[dimension] = i + 1;  // Stanine scores start at 1
            break;
          }
        }

        // If no boundary matched, assign the maximum stanine score
        if (!stanineScores[dimension]) {
          stanineScores[dimension] = boundaries.length + 1;
        }
      }
    });

    return stanineScores;
  };





  // Calculate answered questions count
  const calculateAnsweredQuestions = (allValues) => {
    let count = 0;
    questionsENG.forEach(q => {
      if (allValues[`question_${q.id}`] !== undefined) {
        count++;
      }
    });
    setAnsweredQuestions(count);
  };

  // Save answers when user moves between steps
  const saveStepAnswers = () => {
    const currentValues = form.getFieldsValue(); // Get the current form values
    const updatedValues = { ...formValues, ...currentValues }; // Merge new values with existing values
    setFormValues(updatedValues); // Update state
    calculateAnsweredQuestions(updatedValues); // Update the answered count
  };
  // When moving to the next step, save current step answers
  const handleNext = () => {
    form.validateFields()
      .then(() => {
        saveStepAnswers(); // Save current step's answers
        setCurrentStep(currentStep + 1); // Move to next step
      })
      .catch(() => {
        message.info('Please fill out all required fields before proceeding.');
      });
  };

  const handlePrevious = () => {
    saveStepAnswers(); // Save current step's answers
    setCurrentStep(currentStep - 1); // Move to previous step
  };

  const handlePartChange = (part) => {
    form.validateFields()
      .then(() => {
        saveStepAnswers(); // Save current step's answers before changing part
        setCurrentStep(part - 1); // Move to selected step
      })
      .catch(() => {
        message.info('Please fill out all required fields before proceeding.');
      });
  };

  // Handle value changes without overwriting previous answers
  const handleValuesChange = (changedValues) => {
    const updatedValues = { ...formValues, ...changedValues }; // Merge new values with existing values
    setFormValues(updatedValues); // Update form values
    calculateAnsweredQuestions(updatedValues); // Recalculate the answered count
  };

  const renderQuestions = (part) => {
    return (
      <>
        {renderLegend(part)} {/* Display the legend based on the current part */}
        {questionsENG
          .filter((q) => q.part === part)
          .map((item) => (
            <Form.Item
              key={item.id}
              label={<QuestionLabel>{item.question}</QuestionLabel>}
              name={`question_${item.id}`}
              rules={[{ required: true, message: 'Bitte wählen Sie eine Antwort.' }]}
              className="mb-4"
            >
              <Radio.Group className="w-full flex flex-col sm:flex-row gap-2">
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
    form.setFieldsValue(formValues); // Restore saved form values
    calculateAnsweredQuestions(formValues); // Recalculate answered questions count
  }, [currentStep, formValues, form]);

  const startTest = () => {
    setPreModalVisible(false);
    setModalVisible(true); // Open the main modal
  };

  if (isPreModalVisible) {
    return (
      <Modal open={isPreModalVisible} footer={null} width={600} closable={false} centered>
        <PreFormPage onStart={startTest} onSkip={() => setPreModalVisible(false)} />
      </Modal>
    );
  }

  return (
    <Modal open={isModalVisible} footer={null} width={800} centered onCancel={() => setModalVisible(false)}>
      <Title level={3} className="text-center mb-5">Team Questionnaire</Title>

      {/* Steps without navigation type but clickable */}
      <Steps current={currentStep} size="small" className="mb-5">
        {parts.map((p) => (
          <Step
            key={p.part}
            title={p.title}
            onClick={() => handlePartChange(p.part)}
            description={`${questionsENG.filter(q => q.part === p.part && formValues[`question_${q.id}`] !== undefined).length} / ${p.totalQuestions} answered`}
          />
        ))}
      </Steps>

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        {renderQuestions(parts[currentStep].part)}

        <div className="flex justify-between" style={{ display: 'flex', justifyContent: currentStep > 0 ? 'space-between' : 'flex-end' }}>
          {currentStep > 0 && (
            <Button onClick={handlePrevious}>Back</Button>
          )}
          {currentStep < parts.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
          {currentStep === parts.length - 1 && (
            <Button type="primary" htmlType="submit" loading={loading} onClick={onFinish}>
              Submit
            </Button>
          )}
        </div>

      </Form>
    </Modal>
  );
};

export default TKIForm;
