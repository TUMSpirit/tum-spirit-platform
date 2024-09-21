import React, { useState } from 'react';
import { Modal, Button, Checkbox } from 'antd';
import axios from 'axios';  // Assuming you are using axios for API calls
import { useAuthHeader } from 'react-auth-kit';

const ImprintModal = ({ isVisible, setIsVisible }) => {
  const [isCheckedAccept, setIsCheckedAccept] = useState(false); // State for accept checkbox
  const [isCheckedDecline, setIsCheckedDecline] = useState(false); // State for decline checkbox
  const authHeader = useAuthHeader();

  const onClose = () => {
    setIsVisible(false);
  };

  const onAcceptOrDecline = async (accepted) => {
    try {
      // Send the accept_study status to the backend (true for accept, false for decline)
      await axios.post('/api/accept-study', { accept_study: accepted },{
        headers: {
             "Authorization": authHeader()
        }
    });
      console.log(`Terms ${accepted ? 'accepted' : 'declined'}`);
      setIsVisible(false); // Close the modal
    } catch (error) {
      console.error('Error updating accept_study:', error);
      message.error('Problems with connecting to the backend to update your study acceptance');
    }
  };

  const handleAcceptCheckboxChange = (e) => {
    setIsCheckedAccept(e.target.checked); // Update accept checkbox state
    if (e.target.checked) {
      setIsCheckedDecline(false); // Uncheck decline if accept is checked
    }
  };

  const handleDeclineCheckboxChange = (e) => {
    setIsCheckedDecline(e.target.checked); // Update decline checkbox state
    if (e.target.checked) {
      setIsCheckedAccept(false); // Uncheck accept if decline is checked
    }
  };

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} className="bg-blue-500 text-white hover:bg-blue-600">
          Close
        </Button>,
        <Button
          key="decline"
          type="primary"
          onClick={() => onAcceptOrDecline(false)}
          disabled={!isCheckedDecline} // Disable button until decline checkbox is checked
          className={`${isCheckedDecline ? 'bg-red-500' : 'bg-gray-300'} text-white hover:bg-red-600`}
        >
          Decline
        </Button>,
        <Button
          key="accept"
          type="primary"
          onClick={() => onAcceptOrDecline(true)}
          disabled={!isCheckedAccept} // Disable button until accept checkbox is checked
          className={`${isCheckedAccept ? 'bg-green-500' : 'bg-gray-300'} text-white hover:bg-green-600`}
        >
          Accept
        </Button>,
      ]}
      width="80%"
      bodyStyle={{ fontFamily: 'Josefin Sans, sans-serif', padding: '2rem', maxWidth: '100%' }}
      style={{ maxWidth: '100%', margin: '0 auto' }}
    >
      <div className="text-base leading-relaxed space-y-6 w-full">
        <h3 className="font-bold text-2xl mb-6">Information</h3>
        <p className="w-full">
          Dear interested reader,
          <br />
          We would like to ask you if you are willing to take part in a scientific study. In this information document, you will find all the essential information about the study. Please read this information carefully. We will additionally talk to you about the study and answer your questions.
          <br />
          At our facility, 30 individuals are planned to participate in the study. This study is planned and conducted by <strong className="font-semibold">TUM Chair of Ergonomics</strong>. Our institution finances the study itself. The study was submitted to the responsible ethics committee. The ethics committee raised no objections.
          <br />
          Your participation in this study is voluntary. If you do not want to participate or if you later withdraw your consent, you will not face any disadvantages as a result. You also do not have to justify your decision. If you have further questions about the study now or later, please feel free to contact us. To do so, please turn to <a href="mailto:jonas.bender@tum.de" className="text-blue-600 underline">Jonas Bender</a>.
        </p>
        <h4 className="font-bold text-xl mt-6 mb-4">Why is this study being conducted?</h4>
        <p className="w-full">
          Many people want to understand their personality better, especially the "Big Five" traits like openness and conscientiousness. Traditional tests can be time-consuming and hard to access, and it's often unclear how accurate they are.
          <br />
          Our study aims to solve this by testing a new, easy-to-use platform called <strong className="font-semibold">TUMSpirit</strong>. This platform uses artificial intelligence to quickly predict your personality traits. If successful, it could offer a simple way for people to gain valuable insights into their personality, helping them in areas like work and relationships.
          <br />
          We have developed the <strong className="font-semibold">TUMSpirit</strong> platform, which uses artificial intelligence to predict the "Big Five" personality traits quickly and easily. This study will test the accuracy of these predictions by comparing them to results from a standard personality test. If successful, <strong className="font-semibold">TUMSpirit</strong> could provide a reliable and accessible way for people to better understand their personality traits.
        </p>
        <h4 className="font-bold text-xl mt-6 mb-4">What is the process of the study?</h4>
        <p className="w-full">
          The study is expected to last 4 months for each participant.
          <br />
          In this semester-long study, you’ll engage with the <strong className="font-semibold">TUMSpirit</strong> platform to explore your personality traits. After receiving a unique username and password for anonymous access, you’ll use the platform regularly over the course of the semester. <strong className="font-semibold">TUMSpirit</strong> will guide you through tasks designed to assess your "Big Five" personality traits, and you’ll have the opportunity to collaborate with other participants using tools like chat, Kanban boards, and a shared calendar.
          <br />
          After two months, you’ll be asked to complete the NEO-FFI personality test online, which takes about 30 minutes. This test will provide a detailed assessment of your traits. Finally, you’ll gain access to compare the platform’s predictions with your NEO-FFI results, allowing you to see how accurately <strong className="font-semibold">TUMSpirit</strong> reflects your personality. This process is entirely flexible, with no required in-person meetings, and is designed to fit into your schedule throughout the semester.
        </p>
        <h4 className="font-bold text-xl mt-6 mb-4">Is there a personal benefit from participating in the study?</h4>
        <p className="w-full">
          By participating, you'll receive insights into your own personality traits from the initial test, which could enhance your self-awareness. Additionally, using the app may help you gain a deeper understanding of your emotional patterns and moods.
          <br />
          It is possible that you will not get any direct benefit from your participation. However, the results of the study may help other people in the future.
        </p>
        <h4 className="font-bold text-xl mt-6 mb-4">What are the risks of participating in the study?</h4>
        <p className="w-full">
          Participation in the study is not associated with any medical risks.
        </p>
        <h4 className="font-bold text-xl mt-6 mb-4">Will there be any additional costs?</h4>
        <p className="w-full">
          You will not have any additional costs as a result of participating in the study.
        </p>
        <h4 className="font-bold text-xl mt-6 mb-4">Data protection information</h4>
        <p className="w-full">
          In this study, <strong className="font-semibold">Leibniz Rechenzentrum (LRZ)</strong> is responsible for the data processing. The legal basis for processing is personal consent (Art. 6 Abs. 1 lit. a, Art. 9 Abs. 2 lit. a DSGVO). The data will be treated confidentially at all times.
          <br />
          Further processing of your data can take place beyond this study in order to be able to answer the research question more precisely in further studies. For example, the data can be compared with data from another study at a later date. Only the scientists involved have access to this data. The raw data is not made accessible to third parties.
          <br />
          All data collected is stored anonymously, making it impossible for unauthorized persons to identify it. The data will be stored by <strong className="font-semibold">Leibniz Rechenzentrum (LRZ)</strong>. We keep the personal data only as long as this is necessary for the above-mentioned purpose. The data will be deleted after 10 years at the latest.
          <br />
          We do not transfer the personal data to other institutions in Germany, the EU, or to a third country outside the EU or to an international organization.
          <br />
          The consent to the processing of your data is voluntary. You can revoke the consent at any time without giving reasons and without disadvantages for you. After that, no more data will be collected. The legality of the processing carried out on the basis of the consent until the revocation is not affected by this.
          <br />
          In the event of revocation, you may request the deletion of the collected data. The data can also be further used in anonymized form if you agree to this at the time of your revocation.
          <br />
          You have the right to obtain information about the data, also in the form of a free copy. In addition, you can request the correction, blocking, restriction of processing or deletion and, if necessary, a transfer of the data.
          <br />
          In these cases, for further questions about data protection and the handling of data or in the event of revocation, please contact:
          <br />
          <strong className="font-semibold">Jonas Bender</strong>
          <br />
          <a href="mailto:jonas.bender@tum.de" className="text-blue-600 underline">jonas.bender@tum.de</a>
          <br />
          <strong className="font-semibold">Boltzmannstraße 13</strong>
          <br />
          <strong className="font-semibold">85748 Garching</strong>
          <br />
          If you have any queries regarding data processing and compliance with data protection, please contact the data protection officer (Datenschutzbeauftragten):
          <br />
          <strong className="font-semibold">Behördlicher Datenschutzbeauftragter der Technischen Universität München</strong>
          <br />
          Postanschrift: <strong className="font-semibold">Arcisstr. 21, 80333 München</strong>
          <br />
          Telefon: <strong className="font-semibold">089/289-17052</strong>
          <br />
          E-Mail: <a href="mailto:beauftragter@datenschutz.tum.de" className="text-blue-600 underline">beauftragter@datenschutz.tum.de</a>
          <br />
          You also have the right to make a complaint to any data protection supervisory authority (Datenaufsichtsbehörde). You can find a list of supervisory authorities in Germany at: <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">BFDI</a>
          <br />
          You can reach the supervisory authority responsible for you at:
          <br />
          <strong className="font-semibold">Bayerischer Landesbeauftragter für den Datenschutz</strong>
          <br />
          Postanschrift: <strong className="font-semibold">Postfach 22 12 19, 80502 München</strong>
          <br />
          Hausanschrift: <strong className="font-semibold">Wagmüllerstraße 18, 80538 München</strong>
          <br />
          E-Mail: <a href="mailto:poststelle@datenschutz-bayern.de" className="text-blue-600 underline">poststelle@datenschutz-bayern.de</a>
        </p>
        {/* Checkbox to confirm reading and acceptance */}
        <div className="mt-6">
          <Checkbox checked={isCheckedAccept} onChange={handleAcceptCheckboxChange}>
            I have read and accept the terms and conditions.
          </Checkbox>
          <Checkbox checked={isCheckedDecline} onChange={handleDeclineCheckboxChange} className="ml-4">
            I decline the terms and conditions.
          </Checkbox>
        </div>
      </div>
    </Modal>
  );
};

export default ImprintModal;
