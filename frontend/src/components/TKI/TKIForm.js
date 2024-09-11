import React, { useMemo, useState } from "react";
import { Modal, Typography, Form, Input, Button, Radio, message, Steps } from "antd";
import axios from "axios";
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuthHeader } from "react-auth-kit";
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

// Animation variants
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const PreFormPage = ({ onStart, onSkip }) => (
  <div
    style={{ textAlign: 'center', padding: '20px'}}
  >
    <AvatarWrapper>
      <UserOutlined style={{ fontSize: '100px', color: '#7D4EBC' }} />
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
  const [showPreForm, setShowPreForm] = useState(true);
  const authHeader = useAuthHeader();


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

  const parts = [
    { part: 1, title: "Kommunikation", totalQuestions: 26 },
    { part: 2, title: "Ziele", totalQuestions: 11 },
    { part: 3, title: "Aufgabenstil", totalQuestions: 7 }
  ];

  const questionsByPart = useMemo(() => {
    return parts.reduce((acc, part) => {
      acc[part.part] = questions.filter(q => q.part === part.part);
      return acc;
    }, {});
  }, [questions, parts]);

  const answeredQuestionsCount = useMemo(() => {
    return Object.keys(form.getFieldsValue()).length;
  }, [form]);

  const handleNext = () => setCurrentStep(currentStep + 1);
  const handlePrevious = () => setCurrentStep(currentStep - 1);
  const handlePartChange = (part) => setCurrentStep(part - 1);

  const onFinish = async (values) => {
    setLoading(true);
    const results = calculateResults(values);
  
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
      //onClose(); // Close the modal after submission
  
    } catch (error) {
      // Handle error responses
      if (error.response) {
        // Server responded with a status other than 2xx
        message.error(`Fehler beim Absenden des TKI: ${error.response.data?.detail || error.message}`);
      } else {
        // Network or other errors
        message.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      }
    } finally {
      setLoading(false); // Always remove the loading state at the end
    }
  };
  

  const calculateResults = (values) => {
    let scores = {
      vision: 0,
      taskOrientation: 0,
      synergy: 0,
      appreciation: 0,
      participativeSafety: 0,
      reflection: 0,
      highStandards: 0,
      informationSharing: 0,
      security: 0,
      influence: 0,
      contact: 0,
      supportForInnovation: 0,
    };

    Object.keys(values).forEach((key) => {
      const questionId = parseInt(key.split("_")[1], 10);
      const answer = values[key];

      if (questionId <= 26) {
        scores.synergy += answer;
        scores.participativeSafety += answer;
      } else if (questionId >= 27 && questionId <= 37) {
        scores.vision += answer;
      } else if (questionId >= 38 && questionId <= 44) {
        scores.taskOrientation += answer;
        scores.reflection += answer;
        scores.highStandards += answer;
      }
    });

    return normalizeToStanine(scores);
  };

  const normalizeToStanine = (rawScores) => {
    let stanineScores = {};

    Object.keys(rawScores).forEach((dimension) => {
      const rawScore = rawScores[dimension];
      if (rawScore >= 26) stanineScores[dimension] = 9;
      else if (rawScore >= 21) stanineScores[dimension] = 8;
      else if (rawScore >= 16) stanineScores[dimension] = 7;
      else if (rawScore >= 11) stanineScores[dimension] = 5;
      else if (rawScore >= 6) stanineScores[dimension] = 3;
      else stanineScores[dimension] = 1;
    });

    return stanineScores;
  };

  const renderQuestions = (part) => {
    return questions
      .filter((q) => q.part === part)
      .map((item) => (
        <Form.Item
          key={item.id}
          label={item.question}
          name={`question_${item.id}`}
        >
          <Radio.Group>
            {item.part === 1 ? (
              <>
                <Radio value={1}>Trifft gar nicht zu</Radio>
                <Radio value={2}>Trifft wenig zu</Radio>
                <Radio value={3}>Trifft mittelmäßig zu</Radio>
                <Radio value={4}>Trifft überwiegend zu</Radio>
                <Radio value={5}>Trifft völlig zu</Radio>
              </>
            ) : item.part === 2 ? (
              <>
                <Radio value={1}>Gar nicht</Radio>
                <Radio value={2}>Ein wenig</Radio>
                <Radio value={3}>Mittelmäßig</Radio>
                <Radio value={4}>Erheblich</Radio>
                <Radio value={5}>Völlig</Radio>
              </>
            ) : (
              <>
                <Radio value={1}>In sehr geringem Umfang</Radio>
                <Radio value={2}>In geringem Umfang</Radio>
                <Radio value={3}>In mittelmäßigem Umfang</Radio>
                <Radio value={4}>In großem Umfang</Radio>
                <Radio value={5}>In sehr großem Umfang</Radio>
              </>
            )}
          </Radio.Group>
        </Form.Item>
      ));
  };

  const closeModal = () => {
    setShowPreForm(false);
    // Optionally, reset the trigger on the server
  };

  if (showPreForm) {
    return (
      <Modal
        open={visible}
        footer={null}
        width={600}
        closable={false}
        centered
      >
        <PreFormPage
          onStart={() => setShowPreForm(false)}
          //onSkip={onClosePre}
        />
      </Modal>
    );
  }

  return (
      <Modal
        open={!showPreForm}
        onCancel={closeModal}
        footer={null}
        width={800}
        centered
        style={{animation:"fadeIn 1s", opacity:"1"}}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>TKI Questionnaire</Title>

        <Steps current={currentStep} type="navigation" size="small" style={{ marginBottom: "20px" }}>
          {parts.map((p) => (
            <Step
              key={p.part}
              title={p.title}
              onClick={() => handlePartChange(p.part)}
              description={`${questionsByPart[p.part].filter(q => form.getFieldValue(`question_${q.id}`) !== undefined).length} / ${p.totalQuestions} answered`}
            />
          ))}
        </Steps>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {renderQuestions(parts[currentStep].part)}
          {currentStep === parts.length - 1 && (
            <Form.Item label="Anmerkungen (optional)" name="comments">
              <Input.TextArea rows={4} placeholder="Anmerkungen zur Umfrage" />
            </Form.Item>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {currentStep > 0 && (
              <Button onClick={handlePrevious}>Zurück</Button>
            )}
            {currentStep < parts.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Weiter
              </Button>
            )}
            {currentStep === parts.length - 1 && (
              <Button type="primary" htmlType="submit" loading={loading}>
                Absenden
              </Button>
            )}
          </div>
        </Form>
      </Modal>
  );
};

export default TKIForm;
