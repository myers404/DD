-- database/init/02_sample_data.sql
-- Sample data for CPQ system demonstration

-- Create demo user (password: 'demo123')
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@cpq.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlZqCOsqRAWnKca', 'Demo User', 'admin', true),
('00000000-0000-0000-0000-000000000002', 'user@cpq.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlZqCOsqRAWnKca', 'Regular User', 'user', true);

-- Create sample laptop model
INSERT INTO models (id, name, description, version, category, is_active, created_by) VALUES 
('sample-laptop', 'Business Laptop', 'Configurable business laptop for SMB customers', '1.0.0', 'computers', true, '00000000-0000-0000-0000-000000000001');

-- Create groups for laptop configuration
INSERT INTO groups (id, model_id, name, description, type, is_required, min_selections, max_selections, display_order) VALUES 
('grp_processor', 'sample-laptop', 'Processor', 'Choose your processor', 'single-select', true, 1, 1, 1),
('grp_memory', 'sample-laptop', 'Memory', 'Choose your RAM configuration', 'single-select', true, 1, 1, 2),
('grp_storage', 'sample-laptop', 'Storage', 'Choose your storage option', 'single-select', true, 1, 1, 3),
('grp_accessories', 'sample-laptop', 'Accessories', 'Optional accessories', 'multi-select', false, 0, 5, 4);

-- Create processor options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_cpu_basic', 'sample-laptop', 'grp_processor', 'Intel i5 Basic', 'Intel Core i5 processor - good for basic business tasks', 0.00, 'processor', 'CPU-I5-BASIC', 1),
('opt_cpu_mid', 'sample-laptop', 'grp_processor', 'Intel i5 Performance', 'Intel Core i5 processor - enhanced performance', 200.00, 'processor', 'CPU-I5-PERF', 2),
('opt_cpu_high', 'sample-laptop', 'grp_processor', 'Intel i7 Professional', 'Intel Core i7 processor - maximum performance', 500.00, 'processor', 'CPU-I7-PRO', 3);

-- Create memory options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_ram_8gb', 'sample-laptop', 'grp_memory', '8GB RAM', '8GB DDR4 memory - sufficient for basic tasks', 0.00, 'memory', 'RAM-8GB', 1),
('opt_ram_16gb', 'sample-laptop', 'grp_memory', '16GB RAM', '16GB DDR4 memory - recommended for business use', 300.00, 'memory', 'RAM-16GB', 2),
('opt_ram_32gb', 'sample-laptop', 'grp_memory', '32GB RAM', '32GB DDR4 memory - for demanding applications', 700.00, 'memory', 'RAM-32GB', 3);

-- Create storage options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_ssd_256gb', 'sample-laptop', 'grp_storage', '256GB SSD', '256GB solid state drive - fast boot and applications', 0.00, 'storage', 'SSD-256GB', 1),
('opt_ssd_512gb', 'sample-laptop', 'grp_storage', '512GB SSD', '512GB solid state drive - ample storage with speed', 200.00, 'storage', 'SSD-512GB', 2),
('opt_ssd_1tb', 'sample-laptop', 'grp_storage', '1TB SSD', '1TB solid state drive - maximum storage and speed', 500.00, 'storage', 'SSD-1TB', 3);

-- Create accessory options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_mouse', 'sample-laptop', 'grp_accessories', 'Wireless Mouse', 'Wireless optical mouse', 25.00, 'accessories', 'ACC-MOUSE', 1),
('opt_keyboard', 'sample-laptop', 'grp_accessories', 'Wireless Keyboard', 'Wireless full-size keyboard', 75.00, 'accessories', 'ACC-KEYBOARD', 2),
('opt_monitor', 'sample-laptop', 'grp_accessories', '24" Monitor', '24-inch LED monitor', 300.00, 'accessories', 'ACC-MONITOR-24', 3),
('opt_bag', 'sample-laptop', 'grp_accessories', 'Laptop Bag', 'Professional laptop carrying bag', 50.00, 'accessories', 'ACC-BAG', 4),
('opt_warranty', 'sample-laptop', 'grp_accessories', 'Extended Warranty', '3-year extended warranty', 150.00, 'accessories', 'ACC-WARRANTY', 5);

-- Create constraint rules
INSERT INTO rules (id, model_id, name, description, type, expression, message, priority) VALUES 
('rule_cpu_ram_compatibility', 'sample-laptop', 'CPU-RAM Compatibility', 'High-end CPU requires sufficient RAM', 'requires', 'opt_cpu_high -> (opt_ram_16gb OR opt_ram_32gb)', 'Intel i7 processor requires at least 16GB RAM for optimal performance', 100),
('rule_storage_performance', 'sample-laptop', 'Storage Performance', 'High-end CPU should have adequate storage', 'requires', 'opt_cpu_high -> (opt_ssd_512gb OR opt_ssd_1tb)', 'High-performance processor works best with 512GB+ storage', 90),
('rule_monitor_space', 'sample-laptop', 'Monitor Workspace', 'Monitor requires keyboard for productive setup', 'requires', 'opt_monitor -> opt_keyboard', 'External monitor works best with a full-size keyboard', 80);

-- Create pricing rules
INSERT INTO pricing_rules (id, model_id, name, description, type, expression, discount_percent, priority) VALUES 
('pricing_volume_5', 'sample-laptop', 'Volume Discount 5+', '5% discount for 5+ accessories', 'volume_tier', 'accessory_count >= 5', 5.00, 100),
('pricing_volume_10', 'sample-laptop', 'Volume Discount 10+', '10% discount for 10+ total items', 'volume_tier', 'total_quantity >= 10', 10.00, 90),
('pricing_bundle_pro', 'sample-laptop', 'Professional Bundle', '15% discount for high-end CPU + 32GB RAM + 1TB SSD', 'bundle', 'opt_cpu_high AND opt_ram_32gb AND opt_ssd_1tb', 15.00, 110);

-- Create a sample configuration
INSERT INTO configurations (id, model_id, user_id, name, description, is_valid, total_price, status) VALUES 
('00000000-0000-0000-0000-000000000100', 'sample-laptop', '00000000-0000-0000-0000-000000000002', 'My Business Laptop', 'Professional laptop configuration', true, 1200.00, 'draft');

-- Add selections to the sample configuration
INSERT INTO selections (configuration_id, option_id, quantity, unit_price, total_price) VALUES 
('00000000-0000-0000-0000-000000000100', 'opt_cpu_mid', 1, 200.00, 200.00),
('00000000-0000-0000-0000-000000000100', 'opt_ram_16gb', 1, 300.00, 300.00),
('00000000-0000-0000-0000-000000000100', 'opt_ssd_512gb', 1, 200.00, 200.00),
('00000000-0000-0000-0000-000000000100', 'opt_mouse', 1, 25.00, 25.00),
('00000000-0000-0000-0000-000000000100', 'opt_keyboard', 1, 75.00, 75.00);