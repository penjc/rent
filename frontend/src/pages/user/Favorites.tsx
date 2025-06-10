import React from 'react';
import { Card, Empty, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Favorites: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Title level={2} className="mb-6">
        <HeartOutlined className="mr-2" />
        我的收藏
      </Title>
      
      <Card>
        <Empty
          description="暂无收藏商品"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    </div>
  );
};

export default Favorites; 