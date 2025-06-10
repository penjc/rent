import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  Upload,
  message,
  Popconfirm,
  Image,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 

  ShopOutlined,
  StopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/services/api';
import type { Product, Category } from '@/types';

const { TextArea } = Input;
const { Option } = Select;

const Products: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { user, userType } = useAuthStore();

  // 获取当前商家ID
  const getMerchantId = () => {
    if (userType === 'merchant' && user) {
      return (user as any).id;
    }
    const merchantInfo = localStorage.getItem('merchantInfo');
    if (merchantInfo) {
      return JSON.parse(merchantInfo).id;
    }
    return null;
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // 加载商品列表
  const loadProducts = async () => {
    const merchantId = getMerchantId();
    if (!merchantId) {
      message.error('未找到商家信息');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/merchant/products/${merchantId}?page=1&size=100`);
      if (response.data.code === 200) {
        setProducts(response.data.data.records || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      message.error('加载商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.code === 200) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      message.error('加载分类列表失败');
    }
  };

  // 获取状态标签
  const getStatusTag = (status: number) => {
    return status === 1 ? 
      <Tag color="green">上架</Tag> : 
      <Tag color="red">下架</Tag>;
  };

  // 获取审核状态标签
  const getAuditStatusTag = (auditStatus: number) => {
    const statusMap = {
      0: { color: 'orange', text: '待审核' },
      1: { color: 'green', text: '已通过' },
      2: { color: 'red', text: '已拒绝' }
    };
    const statusInfo = statusMap[auditStatus as keyof typeof statusMap] || { color: 'default', text: '未知' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // 添加商品
  const handleAdd = () => {
    setEditingProduct(null);
    setFileList([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑商品
  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      dailyPrice: Number(record.dailyPrice),
      weeklyPrice: Number(record.weeklyPrice),
      monthlyPrice: Number(record.monthlyPrice),
      deposit: Number(record.deposit)
    });
    
    // 设置文件列表（如果有图片）
    if (record.images) {
      try {
        let imageUrls: string[] = [];
        if (record.images.startsWith('[') && record.images.endsWith(']')) {
          // 处理 JSON 数组格式
          imageUrls = JSON.parse(record.images);
        } else {
          // 处理逗号分隔格式
          imageUrls = record.images.split(',').map(url => url.trim());
        }
        
        setFileList(imageUrls.map((url, index) => ({
          uid: `existing-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: url
        })));
      } catch (error) {
        console.error('解析图片URL失败:', error);
        setFileList([]);
      }
    } else {
      setFileList([]);
    }
    
    setIsModalVisible(true);
  };

  // 删除商品
  const handleDelete = async (record: Product) => {
    const merchantId = getMerchantId();
    if (!merchantId) return;

    try {
      const response = await api.delete(`/products/${record.id}?merchantId=${merchantId}`);
      if (response.data.code === 200) {
        message.success('商品删除成功');
        loadProducts();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      message.error('删除商品失败');
    }
  };

  // 切换上下架状态
  const handleStatusToggle = async (record: Product) => {
    const merchantId = getMerchantId();
    if (!merchantId) return;

    try {
      const newStatus = record.status === 1 ? 0 : 1;
      const response = await api.put(`/merchant/product/${record.id}/status`, {
        status: newStatus,
        merchantId: merchantId
      });
      
      if (response.data.code === 200) {
        message.success(response.data.data);
        loadProducts();
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      message.error('状态更新失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    const merchantId = getMerchantId();
    if (!merchantId) {
      message.error('未找到商家信息');
      return;
    }

    try {
      setLoading(true);
      
      // 处理图片URLs - 确保只获取成功上传的图片
      const imageUrls = fileList
        .filter(file => file.status === 'done')
        .map(file => {
          // 优先使用服务器返回的URL
          if (file.response && file.response.data && file.response.data.url) {
            return file.response.data.url;
          }
          // 其次使用file.url（编辑时的现有图片）
          return file.url || '';
        })
        .filter(url => url);

      console.log('处理后的图片URLs:', imageUrls);

      const productData = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        dailyPrice: values.dailyPrice,
        weeklyPrice: values.weeklyPrice,
        monthlyPrice: values.monthlyPrice,
        deposit: values.deposit || 0,
        stock: values.stock,
        images: JSON.stringify(imageUrls),
        merchantId: merchantId
      };

      let response;
      if (editingProduct) {
        // 编辑商品
        response = await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        // 新增商品
        response = await api.post('/products', productData);
      }

      if (response.data.code === 200) {
        message.success(editingProduct ? '商品更新成功' : '商品发布成功，等待审核');
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        loadProducts();
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error) {
      console.error('Failed to submit product:', error);
      message.error(editingProduct ? '更新商品失败' : '发布商品失败');
    } finally {
      setLoading(false);
    }
  };

  // 自定义上传函数
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 获取token
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/files/upload/product', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });

      const result = await response.json();
      
      if (result.code === 200) {
        onSuccess(result, file);
      } else {
        onError(new Error(result.message || '上传失败'));
      }
    } catch (error) {
      onError(error);
    }
  };

  // 上传配置
  const uploadProps: UploadProps = {
    listType: 'picture-card',
    fileList: fileList,
    customRequest: customUpload,
    multiple: true,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB!');
        return false;
      }
      return true;
    },
    onChange: ({ fileList: newFileList }) => {
      console.log('Upload onChange:', newFileList);
      
      // 处理上传完成的文件
      const updatedFileList = newFileList.map(file => {
        if (file.status === 'done' && file.response) {
          console.log('Upload response for', file.name, ':', file.response);
          if (file.response.code === 200 && file.response.data) {
            // 确保文件有正确的URL
            if (!file.url) {
              file.url = file.response.data.url;
              message.success(`${file.name} 上传成功`);
            }
          } else {
            message.error(`${file.name} 上传失败: ${file.response.message}`);
          }
        } else if (file.status === 'error') {
          message.error(`${file.name} 上传失败`);
        }
        return file;
      });
      
      setFileList(updatedFileList);
    },
    onPreview: async (file) => {
      let src = file.url;
      if (!src) {
        src = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as Blob);
          reader.onload = () => resolve(reader.result as string);
        });
      }
      const image = new window.Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    },
  };

  // 表格列定义
  const columns: ColumnsType<Product> = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string) => {
        if (!images) return <div className="w-16 h-16 bg-gray-200 rounded"></div>;
        
        try {
          let imageUrls: string[] = [];
          if (images.startsWith('[') && images.endsWith(']')) {
            imageUrls = JSON.parse(images);
          } else {
            imageUrls = images.split(',').map(url => url.trim());
          }
          
          const firstImage = imageUrls[0];
          return firstImage ? (
            <Image
              width={64}
              height={64}
              src={firstImage}
              alt="商品图片"
              className="object-cover rounded"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : <div className="w-16 h-16 bg-gray-200 rounded"></div>;
        } catch (error) {
          return <div className="w-16 h-16 bg-gray-200 rounded"></div>;
        }
      },
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 100,
      render: (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '未知分类';
      },
    },
    {
      title: '日租价格',
      dataIndex: 'dailyPrice',
      key: 'dailyPrice',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 100,
      render: (auditStatus: number) => getAuditStatusTag(auditStatus),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            icon={record.status === 1 ? <StopOutlined /> : <ShopOutlined />}
            size="small" 
            type={record.status === 1 ? "default" : "primary"}
            onClick={() => handleStatusToggle(record)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">商品管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            发布商品
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 发布/编辑商品弹窗 */}
      <Modal
        title={editingProduct ? '编辑商品' : '发布商品'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="商品名称"
                name="name"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="商品分类"
                name="categoryId"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select placeholder="请选择商品分类">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="商品描述"
            name="description"
            rules={[{ required: true, message: '请输入商品描述' }]}
          >
            <TextArea rows={4} placeholder="请详细描述商品信息" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="日租价格"
                name="dailyPrice"
                rules={[{ required: true, message: '请输入日租价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="日租价格"
                  style={{ width: '100%' }}
                  addonAfter="元/天"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="周租价格"
                name="weeklyPrice"
                rules={[{ required: true, message: '请输入周租价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="周租价格"
                  style={{ width: '100%' }}
                  addonAfter="元/周"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="月租价格"
                name="monthlyPrice"
                rules={[{ required: true, message: '请输入月租价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="月租价格"
                  style={{ width: '100%' }}
                  addonAfter="元/月"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="押金"
                name="deposit"
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="押金金额"
                  style={{ width: '100%' }}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="库存数量"
                name="stock"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="库存数量"
                  style={{ width: '100%' }}
                  addonAfter="件"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="商品图片">
            <Upload {...uploadProps}>
              {fileList.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
            <div className="text-gray-500 text-sm mt-2">
              最多上传5张图片，支持JPG、PNG格式，单张图片不超过5MB
            </div>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProduct ? '更新商品' : '发布商品'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products; 