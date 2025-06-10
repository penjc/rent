import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Avatar, 
  Row, 
  Col, 
  Typography,
  Divider,
  Space,
  message,
  Modal,
  Tabs
} from 'antd';
import { 
  UserOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

interface UserInfo {
  id: number;
  phone: string;
  nickname: string;
  realName: string;
  email: string;
  avatar: string;
  createdAt: string;
  isVerified: boolean;
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [avatar, setAvatar] = useState<string>('');

  // 模拟用户数据
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 1,
    phone: '13800138000',
    nickname: '张三',
    realName: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://via.placeholder.com/100x100?text=张三',
    createdAt: '2025-01-01',
    isVerified: true
  });

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // 模拟上传成功
      const newAvatarUrl = 'https://via.placeholder.com/100x100?text=New+Avatar';
      setAvatar(newAvatarUrl);
      setUserInfo({ ...userInfo, avatar: newAvatarUrl });
      setLoading(false);
      message.success('头像更新成功');
    }
  };

  const handleSaveProfile = (values: any) => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setUserInfo({ ...userInfo, ...values });
      setEditMode(false);
      setLoading(false);
      message.success('个人信息更新成功');
    }, 1000);
  };

  const handleChangePassword = (values: any) => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      setLoading(false);
      message.success('密码修改成功');
    }, 1000);
  };

  const uploadButton = (
    <div className="text-center">
      <CameraOutlined className="text-2xl text-gray-400 mb-2" />
      <div className="text-gray-600">更换头像</div>
    </div>
  );

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Card>
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Avatar 
                size={100} 
                src={userInfo.avatar} 
                icon={<UserOutlined />}
                className="mb-4"
              />
              <Upload
                name="avatar"
                listType="picture"
                showUploadList={false}
                beforeUpload={() => false} // 阻止自动上传
                onChange={handleAvatarChange}
                className="absolute bottom-0 right-0"
              >
                <Button 
                  shape="circle" 
                  icon={<CameraOutlined />} 
                  size="small"
                  className="bg-blue-500 text-white border-none"
                />
              </Upload>
            </div>
            <div>
              <Title level={4} className="mb-2">{userInfo.nickname}</Title>
              <Space>
                <Text type="secondary">
                  <PhoneOutlined className="mr-1" />
                  {userInfo.phone}
                </Text>
                {userInfo.isVerified && (
                  <Text className="text-green-500">
                    <SafetyCertificateOutlined className="mr-1" />
                    已认证
                  </Text>
                )}
              </Space>
            </div>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            initialValues={userInfo}
            onFinish={handleSaveProfile}
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="nickname"
                  label="昵称"
                  rules={[{ required: true, message: '请输入昵称' }]}
                >
                  <Input 
                    placeholder="请输入昵称"
                    disabled={!editMode}
                    prefix={<UserOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="realName"
                  label="真实姓名"
                  rules={[{ required: true, message: '请输入真实姓名' }]}
                >
                  <Input 
                    placeholder="请输入真实姓名"
                    disabled={!editMode}
                    prefix={<UserOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input 
                    placeholder="请输入手机号"
                    disabled={!editMode}
                    prefix={<PhoneOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { type: 'email', message: '请输入正确的邮箱格式' }
                  ]}
                >
                  <Input 
                    placeholder="请输入邮箱"
                    disabled={!editMode}
                    prefix={<MailOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="text-center mt-6">
              {editMode ? (
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存修改
                  </Button>
                  <Button onClick={() => {
                    setEditMode(false);
                    form.setFieldsValue(userInfo);
                  }}>
                    取消
                  </Button>
                </Space>
              ) : (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                >
                  编辑资料
                </Button>
              )}
            </div>
          </Form>
        </Card>
      )
    },
    {
      key: 'security',
      label: '安全设置',
      children: (
        <Card>
          <div className="space-y-6">
            {/* 修改密码 */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <div className="font-medium mb-1">登录密码</div>
                <Text type="secondary">定期更改密码可以提高账户安全性</Text>
              </div>
              <Button 
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
              >
                修改密码
              </Button>
            </div>

            {/* 手机验证 */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <div className="font-medium mb-1">手机验证</div>
                <Text type="secondary">
                  已绑定手机：{userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                </Text>
              </div>
              <Button>更换手机</Button>
            </div>

            {/* 邮箱验证 */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <div className="font-medium mb-1">邮箱验证</div>
                <Text type="secondary">
                  {userInfo.email ? `已绑定邮箱：${userInfo.email}` : '未绑定邮箱'}
                </Text>
              </div>
              <Button>{userInfo.email ? '更换邮箱' : '绑定邮箱'}</Button>
            </div>

            {/* 实名认证 */}
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <div className="font-medium mb-1">实名认证</div>
                <Text type="secondary">
                  {userInfo.isVerified ? '已完成实名认证' : '提高账户安全性，享受更多服务'}
                </Text>
              </div>
              <Button type={userInfo.isVerified ? 'default' : 'primary'}>
                {userInfo.isVerified ? '查看认证信息' : '立即认证'}
              </Button>
            </div>
          </div>
        </Card>
      )
    },
    {
      key: 'stats',
      label: '账户统计',
      children: (
        <Card>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-2">12</div>
                <div className="text-gray-600">总订单数</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-2">¥3,240</div>
                <div className="text-gray-600">累计消费</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-orange-500 mb-2">8</div>
                <div className="text-gray-600">收藏商品</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-purple-500 mb-2">4.9</div>
                <div className="text-gray-600">信用评分</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">365</div>
                <div className="text-gray-600">注册天数</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-cyan-500 mb-2">VIP</div>
                <div className="text-gray-600">会员等级</div>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div className="mt-6">
            <Title level={5} className="mb-4">最近活动</Title>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">租赁了 iPhone 15 Pro</div>
                  <Text type="secondary" className="text-sm">2025-06-09 10:30</Text>
                </div>
                <Text className="text-green-500">+10 积分</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">完成了 MacBook Pro 订单</div>
                  <Text type="secondary" className="text-sm">2025-06-08 16:20</Text>
                </div>
                <Text className="text-green-500">+50 积分</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">评价了 iPad Pro</div>
                  <Text type="secondary" className="text-sm">2025-06-07 14:15</Text>
                </div>
                <Text className="text-green-500">+20 积分</Text>
              </div>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="user-profile">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Title level={2} className="mb-6">个人中心</Title>
        
        <Tabs items={tabItems} />

        {/* 修改密码弹窗 */}
        <Modal
          title="修改密码"
          open={passwordModalVisible}
          onCancel={() => setPasswordModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password placeholder="请输入当前密码" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setPasswordModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  确认修改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile; 