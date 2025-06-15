import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, Button } from 'antd';
import { showMessage } from '@/hooks/useMessage';
import type { Address } from '@/types';

const { Option } = Select;

interface AddressFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  address?: Address | null;
  onSubmit: (addressData: Partial<Address>) => Promise<void>;
  title?: string;
}

// 省份数据
const provinces = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
  '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
  '海南省', '重庆市', '四川省', '贵州省', '云南省',
  '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
  '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'
];

// 城市数据（简化版，实际项目中应该使用完整的省市区数据）
const cityMap: Record<string, string[]> = {
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
  '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  // 其他省份可以继续添加...
};

// 区县数据（简化版）
const districtMap: Record<string, string[]> = {
  '广州市': ['荔湾区', '越秀区', '海珠区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区'],
  '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区', '光明区', '大鹏新区'],
  '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市'],
  '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区'],
  // 其他城市可以继续添加...
};

const AddressForm: React.FC<AddressFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  address,
  onSubmit,
  title = '添加地址'
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // 当地址数据变化时，更新表单
  useEffect(() => {
    if (visible) {
      if (address) {
        form.setFieldsValue({
          contactName: address.contactName,
          contactPhone: address.contactPhone,
          province: address.province,
          city: address.city,
          district: address.district,
          detailAddress: address.detailAddress,
          isDefault: address.isDefault === 1
        });
        
        // 设置对应的城市和区县选项
        if (address.province && cityMap[address.province]) {
          setCities(cityMap[address.province]);
        }
        if (address.city && districtMap[address.city]) {
          setDistricts(districtMap[address.city]);
        }
      } else {
        form.resetFields();
        setCities([]);
        setDistricts([]);
      }
    }
  }, [visible, address, form]);

  // 省份变化时更新城市选项
  const handleProvinceChange = (province: string) => {
    const provinceCities = cityMap[province] || [];
    setCities(provinceCities);
    setDistricts([]);
    
    // 清空城市和区县字段
    form.setFieldsValue({
      city: undefined,
      district: undefined
    });
  };

  // 城市变化时更新区县选项
  const handleCityChange = (city: string) => {
    const cityDistricts = districtMap[city] || [];
    setDistricts(cityDistricts);
    
    // 清空区县字段
    form.setFieldsValue({
      district: undefined
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const addressData: Partial<Address> = {
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        province: values.province,
        city: values.city,
        district: values.district,
        detailAddress: values.detailAddress,
        isDefault: values.isDefault ? 1 : 0
      };

      await onSubmit(addressData);
      showMessage.success(address ? '地址更新成功' : '地址添加成功');
      onSuccess();
    } catch (error) {
      console.error('提交地址失败:', error);
      // 错误消息已在API拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {address ? '更新' : '添加'}
        </Button>
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isDefault: false
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="联系人"
              name="contactName"
              rules={[
                { required: true, message: '请输入联系人姓名' },
                { min: 2, max: 10, message: '联系人姓名长度为2-10个字符' }
              ]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="联系电话"
              name="contactPhone"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
              ]}
            >
              <Input placeholder="请输入11位手机号码" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="省份"
              name="province"
              rules={[{ required: true, message: '请选择省份' }]}
            >
              <Select
                placeholder="请选择省份"
                onChange={handleProvinceChange}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {provinces.map(province => (
                  <Option key={province} value={province}>
                    {province}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="城市"
              name="city"
              rules={[{ required: true, message: '请选择城市' }]}
            >
              <Select
                placeholder="请选择城市"
                onChange={handleCityChange}
                disabled={cities.length === 0}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {cities.map(city => (
                  <Option key={city} value={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="区县"
              name="district"
              rules={[{ required: true, message: '请选择区县' }]}
            >
              <Select
                placeholder="请选择区县"
                disabled={districts.length === 0}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {districts.map(district => (
                  <Option key={district} value={district}>
                    {district}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="详细地址"
          name="detailAddress"
          rules={[
            { required: true, message: '请输入详细地址' },
            { min: 5, max: 100, message: '详细地址长度为5-100个字符' }
          ]}
        >
          <Input.TextArea
            placeholder="请输入详细地址，如街道、门牌号、楼层等"
            rows={3}
            showCount
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          label="设为默认地址"
          name="isDefault"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddressForm; 