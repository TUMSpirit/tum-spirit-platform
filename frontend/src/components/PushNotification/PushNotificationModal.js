import { triggerFocus } from 'antd/es/input/Input';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography } from "antd";

const PushNotificationModal = ({ modalIsOpen, setModalIsOpen }) => {
  const [subscription, setSubscription] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const { Title, Text } = Typography;

  useEffect(() => {
    if (navigator.serviceWorker) {
      initServiceWorker();
    }
  }, []);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const initServiceWorker = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      let swRegistration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      let pushManager = swRegistration.pushManager;

      if (!isPushManagerActive(pushManager)) {
        return;
      }

      let permissionState = await pushManager.permissionState({ userVisibleOnly: true });
      switch (permissionState) {
        case 'prompt':
          setSubscribed(false);
          break;
        case 'granted':
          setSubscribed(true);
          displaySubscriptionInfo(await pushManager.getSubscription());
          break;
        case 'denied':
          setSubscribed(false);
          alert('User denied push permission');
      }
    }
  };

  const isPushManagerActive = (pushManager) => {
    if (!pushManager) {
      if (!window.navigator.standalone) {
        alert("Add this page to your home screen for WebPush to work.");
      } else {
        console.error('PushManager is not active');
      }
      return false;
    } else {
      return true;
    }
  };

  const subscribeToPush = async () => {
    const VAPID_PUBLIC_KEY = 'BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM';

    let swRegistration = await navigator.serviceWorker.getRegistration();
    let pushManager = swRegistration.pushManager;
    if (!isPushManagerActive(pushManager)) {
      return;
    }
    let subscriptionOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    };
    try {
      let subscription = await pushManager.subscribe(subscriptionOptions);
      displaySubscriptionInfo(subscription);
      setSubscribed(true);
    } catch (error) {
      alert('User denied push permission');
    }
  };

  const displaySubscriptionInfo = (subscription) => {
    setSubscription(subscription);
    console.log('Active subscription:', subscription);
  };

  /*const testSend = () => {
    const title = "Push title";
    const options = {
      body: "Additional text with some description",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      data: {
        url: "https://andreinwald.github.io/webpush-ios-example/?page=success",
        message_id: "your_internal_unique_message_id_for_tracking"
      },
    };
    navigator.serviceWorker.ready.then(async function (serviceWorker) {
      await serviceWorker.showNotification(title, options);
    });
  };*/

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  return (
    <div>
      <Modal
        open={modalIsOpen}
        title={"Settings"}
        closable={false} // Remove the X button
        footer={[
          <Button key="ok" type="primary" onClick={closeModal}>
            OK
          </Button>
        ]}
      >
        <Button onClick={subscribeToPush}>Subscribe to notifications</Button>
        <div>
          <Title level={5} style={{ marginTop: "15px" }}><strong>Active Subscription:</strong></Title>
          <pre>{JSON.stringify(subscription?.toJSON(), null, 2)}</pre>
        </div>
      </Modal>
    </div>
  );
};

export default PushNotificationModal;