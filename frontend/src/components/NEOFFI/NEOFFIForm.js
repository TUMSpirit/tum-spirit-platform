import React, { useState } from "react";
import { Form, Input, Button, Radio, message } from "antd";
import axios from "axios";

const NEOFFIForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const questions = [
    { id: 1, question: "In der Regel geben wir Informationen an alle Mitglieder des Teams weiter, anstatt sie für uns zu behalten." },
    { id: 2, question: "Wir werden bei der Entwicklung neuer Ideen prompt und bereitwillig unterstützt." },
    { id: 3, question: "Wir alle beeinflussen einander." },
    { id: 4, question: "Dem Team gelingt es immer, seine Fähigkeiten auch in Leistung umzusetzen." },
    { id: 5, question: "Wir stehen in regelmäßigem Kontakt miteinander." },
    { id: 6, question: "In unserem Team nehmen wir uns die Zeit, die wir brauchen, um neue Ideen zu entwickeln." },
    { id: 7, question: "Die Teammitglieder fühlen sich gegenseitig akzeptiert und verstanden." },
    { id: 8, question: "Jede Ansicht wird angehört, auch wenn es die Meinung einer Minderheit ist." },
    { id: 9, question: "Es gibt niemals Spannungen zwischen Personen im Team." },
    { id: 10, question: "Das Team ist Veränderungen gegenüber aufgeschlossen und empfänglich." },
    { id: 11, question: "Personen im Team arbeiten zusammen, um neue Ideen zu entwickeln und zu verwirklichen." },
    { id: 12, question: "Ein Teil dieses Teams zu sein ist für die Teammitglieder das Wichtigste bei der Arbeit." },
    { id: 13, question: "Wir haben eine 'wir sitzen in einem Boot' - Einstellung."},
    { id: 14, question: "Wir stehen in häufigem gegenseitigen Austausch." },
    { id: 15, question: "Das Team ist in seinem Bereich wesentlich besser als irgend ein anderes Team." },
    { id: 16, question: "Wir halten uns über arbeitsrelevante Themen gegenseitig auf dem laufenden." },
    { id: 17, question: "Die Mitglieder des Teams stellen Ressourcen zur Verfügung und teilen diese auch bereitwillig, um bei der Realisierung neuer Ideen zu helfen." },
    { id: 18, question: "Die Beziehungen zwischen den Personen im Team sind gleichbleibend harmonisch." },
    { id: 19, question: "Bei uns herrscht ein ständiges Geben und Nehmen." },
    { id: 20, question: "Wir halten als Team zusammen." },
    { id: 21, question: "Die Personen im Team suchen ständig nach neuen Wegen, Probleme zu betrachten." },
    { id: 22, question: "Mit Leichtigkeit erreicht das Team durchweg die höchsten Ziele." },
    { id: 23, question: "Es gibt im Team echtes Bemühen, Informationen innerhalb der ganzen Arbeitsgruppe zu teilen." },
    { id: 24, question: "Das TEam bewegt sich ständig auf die Entwicklung neuer Antworten zu" },
    { id: 25, question: "Die Teammitglieder geben praktische Unterstützung für neue Ideen und deren Verwirklichung." },
    { id: 26, question: "Die Teammiglieder treffen sich häufig um sowohl informelle als auch formelle Gespräche zu führen" },

    { id: 27, question: "Wie genau sind Sie sich im Klaren über die Ziele Ihres Teams?" },
    { id: 28, question: "Was denken Sie, inwieweit sind diese Ziele nützlich und angemessen?" },
    { id: 29, question: "Inwieweit stimmen Sie persönlich mit diesen Zielen überein?" },
    { id: 30, question: "Was denken Sie, inwieweit stimmen die anderen Teammitglieder mit diesen Zielen überein?" },
    { id: 31, question: "Was denken Sie, inwieweit sind die Ziele Ihres Zeams den anderen Teammitgliedern klar und deutlich gegenwärtig?" },
    { id: 32, question: "Was denken Sie, inwieweit sind die Ziele Ihres Teams auch tatsächlich erreicht werden?" },
    { id: 33, question: "Was denken Sie, inwieweit sind diese Ziele für Sie persönlich von Bedeutung?" },
    { id: 34, question: "Was denken Sie, inwieweit sind diese Ziele für Ihre Unternehmen von Bedeutung?" },
    { id: 35, question: "Was denken Sie, inwieweit sind diese Ziele von gesellschaftlicher Bedeutung?" },
    { id: 36, question: "Was denken Sie, inwieweit sind diese Ziele realistisch und erreichbar?" },
    { id: 37, question: "Was denken Sie, inwieweit fühlen sich die Mitglieder Ihres Teams diesen Zielen verplichtet?" },
   
    { id: 38, question: "Stellen Ihre Teamkollegen Ihnen nützliche und praktische Unterstützung zur Verfügung, die es Ihnen ermöglicht, Ihre Arbeit so gut als möglich zu verrichten?" },
    { id: 39, question: "Geben Sie und Ihre Kollegen aufeinander acht, damit die Arbeit einen hohen Standard behält?" },
    { id: 40, question: "Sind die Teammitglieder bereit, die Grundlagen der eigenen Arbeit in Frage zu stellen?" },
    { id: 41, question: "Ist das Team bereit, potentielle Schwachstellen seiner Arbeit kritisch zu bewerten, um das bestmögliche Endergebnis zu erzielen?" },
    { id: 42, question: "Bauen die Teammitglieder gegenseitig auf Ihren Ideen auf, um das bestmögliche Ergebnis zu erhalten?" },
    { id: 43, question: "Ist es den Teammitgliedern ein echtes Anliegen, dass das Team den höchstmöglichen Leistungsstandard erreicht?" },
    { id: 44, question: "Gibt es im Team klare Kriterien, die von den Mitgliedern angestrebt werden, um als gesamtes Team das Optimale zu erreichen?" }
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // POST Anfrage an den Backend-Server
      const response = await axios.post("/api/tki/save", values);

      if (response.status === 200) {
        message.success("TKI erfolgreich abgesendet!");
        form.resetFields(); // Reset the form after successful submission
      } else {
        message.error("Fehler beim Absenden des TKI.");
      }
    } catch (error) {
      message.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      {questions.map((item) => (
        <Form.Item
          key={item.id}
          label={item.question}
          name={`question_${item.id}`}
          rules={[{ required: true, message: "Bitte wähle eine Option" }]}
        >
          <Radio.Group>
            <Radio value={1}>Trifft gar nicht zu</Radio>
            <Radio value={2}>Trifft wenig zu</Radio>
            <Radio value={3}>Trifft mittelmäßig zu</Radio>
            <Radio value={4}>Trifft überwiegend zu</Radio>
            <Radio value={5}>Trifft völlig zu</Radio>
          </Radio.Group>
        </Form.Item>
      ))}

      <Form.Item label="Anmerkungen (optional)" name="comments">
        <Input.TextArea rows={4} placeholder="Anmerkungen zur Umfrage" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Absenden
        </Button>
      </Form.Item>
    </Form>
  );
};

export default NEOFFIForm;
