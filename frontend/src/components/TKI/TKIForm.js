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
            <LegendText>1 - Trifft gar nicht zu</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>2 - Trifft wenig zu</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>3 - Mittelmäßig</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>4 - Trifft überwiegend zu</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>5 - Trifft völlig zu</LegendText>
          </div>
        </LegendWrapper>
      );
    case 2:
      return (
        <LegendWrapper className="space-y-4 sm:space-y-0 sm:flex sm:justify-around">
          <div className="sm:inline-block">
            <LegendText>1 - Gar nicht</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>2 - Ein wenig</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>3 - Mittelmäßig</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>4 - Erheblich</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>5 - Völlig</LegendText>
          </div>
        </LegendWrapper>
      );
    case 3:
      return (
        <LegendWrapper className="space-y-4 sm:space-y-0 sm:flex sm:justify-around">
          <div className="sm:inline-block">
            <LegendText>1 - In sehr geringem Umfang</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>2 - In geringem Umfang</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>3 - In mittelmäßigem Umfang</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>4 - In großem Umfang</LegendText>
          </div>
          <div className="sm:inline-block">
            <LegendText>5 - In sehr großem Umfang</LegendText>
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
    <Title level={3}>Bist du bereit für einen kleinen Test?</Title>
    <Text type="secondary">
      Dieser Test hilft uns, deine Teamdynamik besser zu verstehen und dich optimal zu unterstützen.
    </Text>
    <div style={{ marginTop: '20px' }}>
      <StartTestButton type="primary" onClick={onStart}>
        Test starten
      </StartTestButton>
      <Button style={{ marginLeft: '10px' }} onClick={onSkip}>
        Test überspringen
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

  const questions = [
    // Part 1: Communication and Innovation (1-26)
    { id: 1, part: 1, question: "In der Regel geben wir Informationen an alle Mitglieder des Teams weiter, anstatt sie für uns zu behalten." },
    { id: 2, part: 1, question: "Wir werden bei der Entwicklung neuer Ideen prompt und bereitwillig unterstützt." },
    { id: 3, part: 1, question: "Wir alle beeinflussen einander." },
    { id: 4, part: 1, question: "Dem Team gelingt es immer, seine Fähigkeiten auch in Leistung umzusetzen." },
    { id: 5, part: 1, question: "Wir stehen in regelmäßigem Kontakt miteinander." },
    { id: 6, part: 1, question: "In unserem Team nehmen wir uns die Zeit, die wir brauchen, um neue Ideen zu entwickeln." },
    { id: 7, part: 1, question: "Die Teammitglieder fühlen sich gegenseitig akzeptiert und verstanden." },
    { id: 8, part: 1, question: "Jede Ansicht wird angehört, auch wenn es die Meinung einer Minderheit ist." },
    { id: 9, part: 1, question: "Es gibt niemals Spannungen zwischen Personen im Team." },
    { id: 10, part: 1, question: "Das Team ist Veränderungen gegenüber aufgeschlossen und empfänglich." },
    { id: 11, part: 1, question: "Personen im Team arbeiten zusammen, um neue Ideen zu entwickeln und zu verwirklichen." },
    { id: 12, part: 1, question: "Ein Teil dieses Teams zu sein ist für die Teammitglieder das Wichtigste bei der Arbeit." },
    { id: 13, part: 1, question: "Wir haben eine 'wir sitzen in einem Boot'-Einstellung." },
    { id: 14, part: 1, question: "Wir stehen in häufigem gegenseitigen Austausch." },
    { id: 15, part: 1, question: "Das Team ist in seinem Bereich wesentlich besser als irgendein anderes Team." },
    { id: 16, part: 1, question: "Wir halten uns über arbeitsrelevante Themen gegenseitig auf dem Laufenden." },
    { id: 17, part: 1, question: "Die Mitglieder des Teams stellen Ressourcen zur Verfügung und teilen diese auch bereitwillig, um bei der Realisierung neuer Ideen zu helfen." },
    { id: 18, part: 1, question: "Die Beziehungen zwischen den Personen im Team sind gleichbleibend harmonisch." },
    { id: 19, part: 1, question: "Bei uns herrscht ein ständiges Geben und Nehmen." },
    { id: 20, part: 1, question: "Wir halten als Team zusammen." },
    { id: 21, part: 1, question: "Die Personen im Team suchen ständig nach neuen Wegen, Probleme zu betrachten." },
    { id: 22, part: 1, question: "Mit Leichtigkeit erreicht das Team durchweg die höchsten Ziele." },
    { id: 23, part: 1, question: "Es gibt im Team echtes Bemühen, Informationen innerhalb der ganzen Arbeitsgruppe zu teilen." },
    { id: 24, part: 1, question: "Das Team bewegt sich ständig auf die Entwicklung neuer Antworten zu." },
    { id: 25, part: 1, question: "Die Teammitglieder geben praktische Unterstützung für neue Ideen und deren Verwirklichung." },
    { id: 26, part: 1, question: "Die Teammitglieder treffen sich häufig, um sowohl informelle als auch formelle Gespräche zu führen." },

    // Part 2: Goals (27-37)
    { id: 27, part: 2, question: "Wie genau sind Sie sich im Klaren über die Ziele Ihres Teams?" },
    { id: 28, part: 2, question: "Was denken Sie, inwieweit sind diese Ziele nützlich und angemessen?" },
    { id: 29, part: 2, question: "Inwieweit stimmen Sie persönlich mit diesen Zielen überein?" },
    { id: 30, part: 2, question: "Was denken Sie, inwieweit stimmen die anderen Teammitglieder mit diesen Zielen überein?" },
    { id: 31, part: 2, question: "Was denken Sie, inwieweit sind die Ziele Ihres Teams den anderen Teammitgliedern klar und deutlich gegenwärtig?" },
    { id: 32, part: 2, question: "Was denken Sie, inwieweit können die Ziele Ihres Teams auch tatsächlich erreicht werden?" },
    { id: 33, part: 2, question: "Was denken Sie, inwieweit sind diese Ziele für Sie persönlich von Bedeutung?" },
    { id: 34, part: 2, question: "Was denken Sie, inwieweit sind diese Ziele für Ihr Unternehmen von Bedeutung?" },
    { id: 35, part: 2, question: "Was denken Sie, inwieweit sind diese Ziele von gesellschaftlicher Bedeutung?" },
    { id: 36, part: 2, question: "Was denken Sie, inwieweit sind diese Ziele realistisch und erreichbar?" },
    { id: 37, part: 2, question: "Was denken Sie, inwieweit fühlen sich die Mitglieder Ihres Teams diesen Zielen verpflichtet?" },

    // Part 3: Task Style (38-44)
    { id: 38, part: 3, question: "Stellen Ihre Teamkollegen Ihnen nützliche und praktische Unterstützung zur Verfügung, die es Ihnen ermöglicht, Ihre Arbeit so gut als möglich zu verrichten?" },
    { id: 39, part: 3, question: "Geben Sie und Ihre Kollegen aufeinander Acht, damit die Arbeit einen hohen Standard behält?" },
    { id: 40, part: 3, question: "Sind die Teammitglieder bereit, die Grundlagen der eigenen Arbeit in Frage zu stellen?" },
    { id: 41, part: 3, question: "Ist das Team bereit, potentielle Schwachstellen seiner Arbeit kritisch zu bewerten, um das bestmögliche Endergebnis zu erzielen?" },
    { id: 42, part: 3, question: "Bauen die Teammitglieder gegenseitig auf ihren Ideen auf, um das bestmögliche Ergebnis zu erhalten?" },
    { id: 43, part: 3, question: "Ist es den Teammitgliedern ein echtes Anliegen, dass das Team den höchstmöglichen Leistungsstandard erreicht?" },
    { id: 44, part: 3, question: "Gibt es im Team klare Kriterien, die von den Mitgliedern angestrebt werden, um als gesamtes Team das Optimale zu erreichen?" }
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
    { part: 1, title: "Kommunikation", totalQuestions: 26 },
    { part: 2, title: "Ziele", totalQuestions: 11 },
    { part: 3, title: "Aufgabenstil", totalQuestions: 7 }
  ];


  const onFinish = async (values) => {
    setLoading(true);
    //const allValues = { ...formValues, ...values };
    const results = calculateResults(formValues);

    try {
      const response = await axios.post("/api/tki/save", results, {
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/json', // Ensure JSON content type
        },
      });

      // If the request succeeds
      message.success("TKI erfolgreich abgesendet!");
      form.resetFields(); // Reset the form after successful submission
      updateSettings('trigger_tki_test', false);
      setModalVisible(false);

      //onClose(); // Close the modal after submission

    } catch (error) {
      // Handle error responses
      if (error.response) {
        // Server responded with a status other than 2xx
        message.error("Fehler beim Absenden des TKI: ${error.response.data?.detail || error.message}");
      } else {
        // Network or other errors
        message.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      }
    } finally {
      setLoading(false); // Always remove the loading state at the end
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
    questions.forEach(q => {
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
        message.info('Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie fortfahren.');
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
        message.info('Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie fortfahren.');
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
        {questions
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
      <Title level={3} className="text-center mb-5">TKI Questionnaire</Title>

      {/* Steps without navigation type but clickable */}
      <Steps current={currentStep} size="small" className="mb-5">
        {parts.map((p) => (
          <Step
            key={p.part}
            title={p.title}
            onClick={() => handlePartChange(p.part)}
            description={`${questions.filter(q => q.part === p.part && formValues[`question_${q.id}`] !== undefined).length} / ${p.totalQuestions} beantwortet`}
          />
        ))}
      </Steps>

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        {renderQuestions(parts[currentStep].part)}

        <div className="flex justify-between" style={{ display: 'flex', justifyContent: currentStep > 0 ? 'space-between' : 'flex-end' }}>
          {currentStep > 0 && (
            <Button onClick={handlePrevious}>Zurück</Button>
          )}
          {currentStep < parts.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              Weiter
            </Button>
          )}
          {currentStep === parts.length - 1 && (
            <Button type="primary" htmlType="submit" loading={loading} onClick={onFinish}>
              Absenden
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default TKIForm;
