import React, { useState } from 'react';
import { Button, Modal, List, Avatar, notification, Tooltip } from 'antd';
import { ShoppingCartOutlined, TrophyOutlined } from '@ant-design/icons';

const items = [
  { id: 1, name: 'React Sticker', price: 20, description: 'A cool sticker for your laptop.' },
  { id: 2, name: 'Ant Design Mug', price: 50, description: 'A stylish mug with Ant Design logo.' },
  { id: 3, name: 'Framer Motion T-Shirt', price: 80, description: 'A comfy t-shirt with Framer Motion logo.' },
  { id: 4, name: 'JavaScript Book', price: 100, description: 'A book to master JavaScript.' },
];

const ShopPopup = ({ coins, setCoins, activities, setActivities }) => {
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const onBuyItem = (item) => {
    if (coins >= item.price) {
      setCoins(coins - item.price);
      const newActivity = {
        type: 'shop',
        title: `Bought ${item.name}`,
        description: `You spent ${item.price} Tutorial Coins.`,
      };
      setActivities((prevActivities) => [...prevActivities, newActivity]);
      notification.success({
        message: 'Purchase Successful!',
        description: `You bought ${item.name} for ${item.price} Tutorial Coins.`,
        icon: <ShoppingCartOutlined style={{ color: '#108ee9' }} />,
      });
    } else {
      notification.error({
        message: 'Purchase Failed',
        description: 'You do not have enough Tutorial Coins.',
      });
    }
  };

  return (
    <div>
      <Modal
        title="Tutorial Shop"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Close"
        cancelText="Cancel"
      >
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item) => (
            <List.Item actions={[<Button type="primary" onClick={() => onBuyItem(item)}>Buy</Button>]}>
              <List.Item.Meta
                avatar={<Avatar icon={<TrophyOutlined />} />}
                title={item.name}
                description={`${item.description} - ${item.price} Tutorial Coins`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ShopPopup;
