-- 清理并插入测试数据脚本
USE rent;

-- 清理现有数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE merchants;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 插入测试用户
INSERT INTO `users` (`phone`, `password`, `nickname`, `avatar`, `real_name`, `id_card`, `status`, `verified`) VALUES
('13800138001', '111111', '张三', 'avatar1.jpg', '张三', '110101199001011234', 1, 1),
('13800138002', '111111', '李四', 'avatar2.jpg', '李四', '110101199002021235', 1, 1),
('13800138003', '111111', '王五', 'avatar3.jpg', '王五', '110101199003031236', 1, 0);

-- ---------- 商家表（出借者） ----------
INSERT INTO `merchants`
(`phone`, `password`, `company_name`, `contact_name`,
 `id_card_front`, `id_card_back`, `business_license`, `status`)
VALUES
    ('13900000001', '111111',
     '北京好物租赁有限公司', '王老板',
     'https://example.com/id_front1.jpg', 'https://example.com/id_back1.jpg',
     'https://example.com/license1.jpg', 1),
    ('13900000002', '111111',
     '上海乐租科技', '赵经理',
     'https://example.com/id_front2.jpg', 'https://example.com/id_back2.jpg',
     'https://example.com/license2.jpg', 0);


-- 插入测试商品
INSERT INTO `products` (`merchant_id`, `category_id`, `name`, `description`, `images`, `daily_price`, `weekly_price`, `monthly_price`, `deposit`, `stock`, `status`, `audit_status`) VALUES
-- 数码产品
(1, 1, 'iPhone 15 Pro', '最新款iPhone 15 Pro，128GB，深空黑色，全新未拆封，配原装充电器和数据线。', '["iphone15pro_1.jpg","iphone15pro_2.jpg","iphone15pro_3.jpg"]', 120.00, 700.00, 2800.00, 8000.00, 5, 1, 1),
(1, 1, 'MacBook Pro 14', 'M3芯片MacBook Pro 14英寸，16GB内存，512GB存储，适合办公和开发。', '["macbook_1.jpg","macbook_2.jpg","macbook_3.jpg"]', 200.00, 1200.00, 4800.00, 15000.00, 3, 1, 1),
(1, 1, 'iPad Air', 'iPad Air 第5代，64GB，WiFi版，配Apple Pencil，适合绘画和学习。', '["ipad_1.jpg","ipad_2.jpg","ipad_3.jpg"]', 80.00, 480.00, 1920.00, 4000.00, 8, 1, 1),
(1, 1, 'Sony WH-1000XM5', '索尼旗舰级降噪耳机，30小时续航，适合音乐爱好者。', '["sony_headphone_1.jpg","sony_headphone_2.jpg"]', 30.00, 180.00, 720.00, 2000.00, 10, 1, 1),
(1, 1, 'Canon EOS R6', '佳能全画幅微单相机，2010万像素，4K视频，适合摄影师。', '["canon_camera_1.jpg","canon_camera_2.jpg","canon_camera_3.jpg"]', 180.00, 1080.00, 4320.00, 12000.00, 2, 1, 1),

-- 家用电器
(2, 2, 'Dyson V15吸尘器', '戴森V15无线吸尘器，激光检测微尘，60分钟续航。', '["dyson_v15_1.jpg","dyson_v15_2.jpg"]', 50.00, 300.00, 1200.00, 3000.00, 6, 1, 1),
(2, 2, '小米洗衣机10kg', '小米10公斤变频洗衣机，22种洗涤程序，静音设计。', '["xiaomi_washer_1.jpg","xiaomi_washer_2.jpg"]', 40.00, 240.00, 960.00, 2500.00, 4, 1, 1),
(2, 2, '海尔冰箱双开门', '海尔451升双开门冰箱，变频节能，保鲜效果好。', '["haier_fridge_1.jpg","haier_fridge_2.jpg"]', 60.00, 360.00, 1440.00, 4000.00, 3, 1, 1),
(2, 2, '格力空调1.5匹', '格力1.5匹变频空调，一级能效，制冷制热效果佳。', '["gree_ac_1.jpg","gree_ac_2.jpg"]', 45.00, 270.00, 1080.00, 3000.00, 5, 1, 1),

-- 运动器材
(3, 3, '动感单车', '家用动感单车，静音飞轮，可调节阻力，带心率监测。', '["bike_1.jpg","bike_2.jpg"]', 35.00, 210.00, 840.00, 1500.00, 8, 1, 1),
(3, 3, '跑步机家用款', '家用跑步机，最高时速16km/h，可折叠设计，节省空间。', '["treadmill_1.jpg","treadmill_2.jpg"]', 55.00, 330.00, 1320.00, 3000.00, 4, 1, 1),
(3, 3, '哑铃套装', '专业哑铃套装，5-50kg可调节，适合家庭健身。', '["dumbbell_1.jpg","dumbbell_2.jpg"]', 25.00, 150.00, 600.00, 800.00, 10, 1, 1),
(3, 3, '瑜伽垫套装', '专业瑜伽垫+瑜伽球+拉力带，适合瑜伽和拉伸运动。', '["yoga_set_1.jpg","yoga_set_2.jpg"]', 15.00, 90.00, 360.00, 300.00, 15, 1, 1),

-- 乐器
(4, 4, '雅马哈电钢琴', '雅马哈88键重锤电钢琴，真实钢琴触感，适合练习。', '["yamaha_piano_1.jpg","yamaha_piano_2.jpg"]', 80.00, 480.00, 1920.00, 5000.00, 3, 1, 1),
(4, 4, '马丁吉他', '马丁D-28经典民谣吉他，音色温暖，手感舒适。', '["martin_guitar_1.jpg","martin_guitar_2.jpg"]', 60.00, 360.00, 1440.00, 3000.00, 5, 1, 1),
(4, 4, '架子鼓套装', '专业5鼓4镲架子鼓套装，适合练习和小型演出。', '["drum_set_1.jpg","drum_set_2.jpg"]', 100.00, 600.00, 2400.00, 6000.00, 2, 1, 1),
(4, 4, '电子小提琴', '电子小提琴，可插耳机练习，不扰民，音质清晰。', '["e_violin_1.jpg","e_violin_2.jpg"]', 40.00, 240.00, 960.00, 1500.00, 6, 1, 1);

-- 插入测试订单
INSERT INTO `orders` (`order_no`, `user_id`, `merchant_id`, `product_id`, `product_name`, `product_image`, `rent_type`, `rent_days`, `unit_price`, `deposit`, `total_amount`, `start_date`, `end_date`, `status`) VALUES
('ORD20241201001', 1, 1, 1, 'iPhone 15 Pro', 'iphone15pro_1.jpg', 1, 7, 120.00, 8000.00, 840.00, '2024-12-01', '2024-12-08', 3),
('ORD20241201002', 1, 2, 6, 'Dyson V15吸尘器', 'dyson_v15_1.jpg', 2, 14, 300.00, 3000.00, 300.00, '2024-12-01', '2024-12-15', 2),
('ORD20241202001', 2, 3, 10, '动感单车', 'bike_1.jpg', 3, 30, 840.00, 1500.00, 840.00, '2024-12-02', '2025-01-01', 4),
('ORD20241202002', 2, 4, 15, '雅马哈电钢琴', 'yamaha_piano_1.jpg', 1, 5, 80.00, 5000.00, 400.00, '2024-12-02', '2024-12-07', 1),
('ORD20241203001', 3, 1, 2, 'MacBook Pro 14', 'macbook_1.jpg', 2, 14, 1200.00, 15000.00, 1200.00, '2024-12-03', '2024-12-17', 1);

-- 显示插入结果
SELECT '用户数据插入完成' as message, COUNT(*) as count FROM users;
SELECT '商家数据插入完成' as message, COUNT(*) as count FROM merchants;
SELECT '商品数据插入完成' as message, COUNT(*) as count FROM products;
SELECT '订单数据插入完成' as message, COUNT(*) as count FROM orders;