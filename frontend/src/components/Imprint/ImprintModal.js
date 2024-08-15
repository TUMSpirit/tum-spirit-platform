import React from 'react';
import { Modal } from 'antd';

const ImprintModal = ({ visible, setVisible }) => {

  const onClose = () => {
    setVisible(false);
  };

  return (
    <Modal
      title="Impressum"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <p>Hier könnte Ihr Impressum stehen.</p>
      <p>Firmenname</p>
      <p>Adresse</p>
      <p>Kontaktinformationen</p>
      <p>Weitere rechtliche Angaben...</p>
    </Modal>
  );
};

export default ImprintModal;
