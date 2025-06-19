-- database/init/03_complex_sample_data.sql
-- Complex sample data for CPQ system - Gaming PC Builder

-- Create gaming PC model
INSERT INTO models (id, name, description, version, category, is_active, created_by) VALUES 
('gaming-pc', 'Gaming PC Builder', 'High-performance gaming PC with complex configuration rules', '1.0.0', 'computers', true, '00000000-0000-0000-0000-000000000001');

-- Create groups for gaming PC configuration
INSERT INTO groups (id, model_id, name, description, type, is_required, min_selections, max_selections, display_order) VALUES 
('grp_cpu_gaming', 'gaming-pc', 'Processor', 'Choose your gaming processor', 'single-select', true, 1, 1, 1),
('grp_gpu', 'gaming-pc', 'Graphics Card', 'Choose your GPU', 'single-select', true, 1, 1, 2),
('grp_motherboard', 'gaming-pc', 'Motherboard', 'Choose your motherboard', 'single-select', true, 1, 1, 3),
('grp_ram_gaming', 'gaming-pc', 'Memory', 'Choose your RAM', 'single-select', true, 1, 1, 4),
('grp_storage_gaming', 'gaming-pc', 'Storage', 'Choose storage options', 'multi-select', true, 1, 3, 5),
('grp_psu', 'gaming-pc', 'Power Supply', 'Choose your PSU', 'single-select', true, 1, 1, 6),
('grp_cooling', 'gaming-pc', 'Cooling', 'Choose cooling solution', 'single-select', true, 1, 1, 7),
('grp_case', 'gaming-pc', 'Case', 'Choose your PC case', 'single-select', true, 1, 1, 8),
('grp_peripherals', 'gaming-pc', 'Gaming Peripherals', 'Optional gaming accessories', 'multi-select', false, 0, 6, 9);

-- Create CPU options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_cpu_amd_5600x', 'gaming-pc', 'grp_cpu_gaming', 'AMD Ryzen 5 5600X', '6-core, 12-thread processor - Great for gaming', 299.99, 'processor', 'CPU-AMD-5600X', 1),
('opt_cpu_amd_5800x', 'gaming-pc', 'grp_cpu_gaming', 'AMD Ryzen 7 5800X', '8-core, 16-thread processor - Excellent gaming & streaming', 449.99, 'processor', 'CPU-AMD-5800X', 2),
('opt_cpu_amd_5900x', 'gaming-pc', 'grp_cpu_gaming', 'AMD Ryzen 9 5900X', '12-core, 24-thread processor - Ultimate performance', 549.99, 'processor', 'CPU-AMD-5900X', 3),
('opt_cpu_intel_12600k', 'gaming-pc', 'grp_cpu_gaming', 'Intel Core i5-12600K', '10-core processor - Intel gaming option', 319.99, 'processor', 'CPU-INTEL-12600K', 4),
('opt_cpu_intel_12700k', 'gaming-pc', 'grp_cpu_gaming', 'Intel Core i7-12700K', '12-core processor - High-end Intel', 419.99, 'processor', 'CPU-INTEL-12700K', 5);

-- Create GPU options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_gpu_rtx3060', 'gaming-pc', 'grp_gpu', 'NVIDIA RTX 3060', '12GB VRAM - 1080p gaming', 329.99, 'graphics', 'GPU-RTX3060', 1),
('opt_gpu_rtx3070', 'gaming-pc', 'grp_gpu', 'NVIDIA RTX 3070', '8GB VRAM - 1440p gaming', 499.99, 'graphics', 'GPU-RTX3070', 2),
('opt_gpu_rtx3080', 'gaming-pc', 'grp_gpu', 'NVIDIA RTX 3080', '10GB VRAM - 4K gaming', 699.99, 'graphics', 'GPU-RTX3080', 3),
('opt_gpu_rtx4070', 'gaming-pc', 'grp_gpu', 'NVIDIA RTX 4070', '12GB VRAM - Latest gen', 599.99, 'graphics', 'GPU-RTX4070', 4),
('opt_gpu_rtx4080', 'gaming-pc', 'grp_gpu', 'NVIDIA RTX 4080', '16GB VRAM - Ultimate gaming', 1199.99, 'graphics', 'GPU-RTX4080', 5);

-- Create Motherboard options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_mobo_b550', 'gaming-pc', 'grp_motherboard', 'MSI B550 Gaming', 'AMD B550 chipset - Good value', 149.99, 'motherboard', 'MOBO-B550', 1),
('opt_mobo_x570', 'gaming-pc', 'grp_motherboard', 'ASUS X570 Pro', 'AMD X570 chipset - Premium features', 249.99, 'motherboard', 'MOBO-X570', 2),
('opt_mobo_z690', 'gaming-pc', 'grp_motherboard', 'MSI Z690 Gaming', 'Intel Z690 chipset - For Intel CPUs', 199.99, 'motherboard', 'MOBO-Z690', 3),
('opt_mobo_z790', 'gaming-pc', 'grp_motherboard', 'ASUS Z790 Hero', 'Intel Z790 chipset - High-end Intel', 399.99, 'motherboard', 'MOBO-Z790', 4);

-- Create RAM options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_ram_16gb_3200', 'gaming-pc', 'grp_ram_gaming', '16GB DDR4 3200MHz', 'Corsair Vengeance - Basic gaming', 79.99, 'memory', 'RAM-16GB-3200', 1),
('opt_ram_32gb_3200', 'gaming-pc', 'grp_ram_gaming', '32GB DDR4 3200MHz', 'Corsair Vengeance - Streaming & gaming', 149.99, 'memory', 'RAM-32GB-3200', 2),
('opt_ram_32gb_3600', 'gaming-pc', 'grp_ram_gaming', '32GB DDR4 3600MHz', 'G.Skill Trident Z - High performance', 189.99, 'memory', 'RAM-32GB-3600', 3),
('opt_ram_64gb_3600', 'gaming-pc', 'grp_ram_gaming', '64GB DDR4 3600MHz', 'G.Skill Trident Z - Content creation', 349.99, 'memory', 'RAM-64GB-3600', 4);

-- Create Storage options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_ssd_500gb_nvme', 'gaming-pc', 'grp_storage_gaming', '500GB NVMe SSD', 'Samsung 980 - OS drive', 69.99, 'storage', 'SSD-500GB-NVME', 1),
('opt_ssd_1tb_nvme', 'gaming-pc', 'grp_storage_gaming', '1TB NVMe SSD', 'Samsung 980 Pro - Fast gaming storage', 129.99, 'storage', 'SSD-1TB-NVME', 2),
('opt_ssd_2tb_nvme', 'gaming-pc', 'grp_storage_gaming', '2TB NVMe SSD', 'Samsung 980 Pro - Large game library', 249.99, 'storage', 'SSD-2TB-NVME', 3),
('opt_hdd_2tb', 'gaming-pc', 'grp_storage_gaming', '2TB HDD', 'Seagate Barracuda - Bulk storage', 49.99, 'storage', 'HDD-2TB', 4),
('opt_hdd_4tb', 'gaming-pc', 'grp_storage_gaming', '4TB HDD', 'Seagate Barracuda - Media storage', 89.99, 'storage', 'HDD-4TB', 5);

-- Create PSU options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_psu_650w', 'gaming-pc', 'grp_psu', '650W Bronze', 'EVGA BR - Basic gaming', 59.99, 'power', 'PSU-650W-BR', 1),
('opt_psu_750w', 'gaming-pc', 'grp_psu', '750W Gold', 'Corsair RM750 - Efficient & quiet', 109.99, 'power', 'PSU-750W-GOLD', 2),
('opt_psu_850w', 'gaming-pc', 'grp_psu', '850W Gold', 'Corsair RM850x - High-end builds', 139.99, 'power', 'PSU-850W-GOLD', 3),
('opt_psu_1000w', 'gaming-pc', 'grp_psu', '1000W Platinum', 'Seasonic Prime - Ultimate efficiency', 219.99, 'power', 'PSU-1000W-PLAT', 4);

-- Create Cooling options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_cool_stock', 'gaming-pc', 'grp_cooling', 'Stock Cooler', 'CPU included cooler', 0.00, 'cooling', 'COOL-STOCK', 1),
('opt_cool_air', 'gaming-pc', 'grp_cooling', 'Noctua NH-U12S', 'Premium air cooler', 69.99, 'cooling', 'COOL-AIR', 2),
('opt_cool_aio_240', 'gaming-pc', 'grp_cooling', 'Corsair H100i 240mm', 'All-in-one liquid cooler', 119.99, 'cooling', 'COOL-AIO-240', 3),
('opt_cool_aio_360', 'gaming-pc', 'grp_cooling', 'Corsair H150i 360mm', 'Large radiator AIO', 179.99, 'cooling', 'COOL-AIO-360', 4);

-- Create Case options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_case_compact', 'gaming-pc', 'grp_case', 'Fractal Core 1000', 'Compact micro-ATX case', 49.99, 'case', 'CASE-COMPACT', 1),
('opt_case_mid', 'gaming-pc', 'grp_case', 'NZXT H510', 'Popular mid-tower', 79.99, 'case', 'CASE-MID', 2),
('opt_case_full', 'gaming-pc', 'grp_case', 'Corsair 4000D', 'Airflow-focused mid-tower', 109.99, 'case', 'CASE-FULL', 3),
('opt_case_premium', 'gaming-pc', 'grp_case', 'Lian Li O11 Dynamic', 'Premium showcase case', 159.99, 'case', 'CASE-PREMIUM', 4);

-- Create Peripheral options
INSERT INTO options (id, model_id, group_id, name, description, base_price, category, sku, display_order) VALUES 
('opt_monitor_1080p', 'gaming-pc', 'grp_peripherals', '24" 1080p 144Hz Monitor', 'ASUS VG248QG - Competitive gaming', 199.99, 'peripherals', 'MON-1080P-144', 1),
('opt_monitor_1440p', 'gaming-pc', 'grp_peripherals', '27" 1440p 165Hz Monitor', 'LG 27GP850 - Sweet spot gaming', 399.99, 'peripherals', 'MON-1440P-165', 2),
('opt_monitor_4k', 'gaming-pc', 'grp_peripherals', '32" 4K 144Hz Monitor', 'ASUS PG32UQ - Ultimate gaming', 999.99, 'peripherals', 'MON-4K-144', 3),
('opt_keyboard_mech', 'gaming-pc', 'grp_peripherals', 'Mechanical Gaming Keyboard', 'Corsair K70 RGB', 129.99, 'peripherals', 'KB-MECH-RGB', 4),
('opt_mouse_gaming', 'gaming-pc', 'grp_peripherals', 'Gaming Mouse', 'Logitech G Pro Wireless', 149.99, 'peripherals', 'MOUSE-GPRO', 5),
('opt_headset_gaming', 'gaming-pc', 'grp_peripherals', 'Gaming Headset', 'SteelSeries Arctis 7P', 169.99, 'peripherals', 'HEADSET-A7P', 6);

-- Create complex constraint rules
INSERT INTO rules (id, model_id, name, description, type, expression, message, priority) VALUES 
-- CPU and Motherboard compatibility
('rule_amd_cpu_mobo', 'gaming-pc', 'AMD CPU Compatibility', 'AMD CPUs require AMD motherboards', 'requires', 
'(opt_cpu_amd_5600x OR opt_cpu_amd_5800x OR opt_cpu_amd_5900x) -> (opt_mobo_b550 OR opt_mobo_x570)', 
'AMD Ryzen processors require AMD compatible motherboards (B550 or X570)', 1000),

('rule_intel_cpu_mobo', 'gaming-pc', 'Intel CPU Compatibility', 'Intel CPUs require Intel motherboards', 'requires', 
'(opt_cpu_intel_12600k OR opt_cpu_intel_12700k) -> (opt_mobo_z690 OR opt_mobo_z790)', 
'Intel Core processors require Intel compatible motherboards (Z690 or Z790)', 1000),

-- Power supply requirements based on GPU
('rule_gpu_power_basic', 'gaming-pc', 'Basic GPU Power', 'RTX 3060/3070 need adequate power', 'requires', 
'(opt_gpu_rtx3060 OR opt_gpu_rtx3070) -> NOT opt_psu_650w', 
'RTX 3060/3070 require at least 750W power supply for stable operation', 900),

('rule_gpu_power_high', 'gaming-pc', 'High-End GPU Power', 'RTX 3080/4080 need high wattage', 'requires', 
'(opt_gpu_rtx3080 OR opt_gpu_rtx4080) -> (opt_psu_850w OR opt_psu_1000w)', 
'RTX 3080/4080 require at least 850W power supply', 900),

-- Cooling requirements for high-end CPUs
('rule_cpu_cooling', 'gaming-pc', 'CPU Cooling Requirements', 'High-end CPUs need better cooling', 'requires', 
'(opt_cpu_amd_5900x OR opt_cpu_intel_12700k) -> NOT opt_cool_stock', 
'High-performance CPUs require aftermarket cooling solutions', 800),

-- Case size compatibility with cooling
('rule_case_aio_360', 'gaming-pc', 'Large AIO Compatibility', '360mm radiator needs large case', 'requires', 
'opt_cool_aio_360 -> (opt_case_full OR opt_case_premium)', 
'360mm AIO coolers require full-size or premium cases', 700),

-- Memory requirements for content creation
('rule_high_gpu_ram', 'gaming-pc', 'High-End GPU Memory', 'RTX 4080 benefits from more RAM', 'requires', 
'opt_gpu_rtx4080 -> (opt_ram_32gb_3200 OR opt_ram_32gb_3600 OR opt_ram_64gb_3600)', 
'RTX 4080 performs best with at least 32GB of RAM', 600),

-- Monitor resolution matching GPU capability
('rule_4k_monitor_gpu', 'gaming-pc', '4K Gaming Requirements', '4K monitor needs powerful GPU', 'requires', 
'opt_monitor_4k -> (opt_gpu_rtx3080 OR opt_gpu_rtx4070 OR opt_gpu_rtx4080)', 
'4K 144Hz gaming requires RTX 3080 or better', 500),

-- Storage requirements
('rule_min_nvme', 'gaming-pc', 'NVMe Boot Drive', 'System requires at least one NVMe SSD', 'validation', 
'opt_ssd_500gb_nvme OR opt_ssd_1tb_nvme OR opt_ssd_2tb_nvme', 
'Please select at least one NVMe SSD for the operating system', 400);

-- Create pricing rules
INSERT INTO pricing_rules (id, model_id, name, description, type, expression, discount_percent, priority) VALUES 
('pricing_enthusiast_bundle', 'gaming-pc', 'Enthusiast Bundle', '10% off high-end CPU + GPU combo', 'bundle', 
'(opt_cpu_amd_5900x OR opt_cpu_intel_12700k) AND (opt_gpu_rtx3080 OR opt_gpu_rtx4070 OR opt_gpu_rtx4080)', 
10.00, 200),

('pricing_complete_setup', 'gaming-pc', 'Complete Gaming Setup', '15% off when buying all peripherals', 'bundle', 
'opt_monitor_1080p OR opt_monitor_1440p OR opt_monitor_4k AND opt_keyboard_mech AND opt_mouse_gaming AND opt_headset_gaming', 
15.00, 190),

('pricing_storage_bundle', 'gaming-pc', 'Storage Bundle', '5% off multiple storage devices', 'bundle', 
'(opt_ssd_500gb_nvme OR opt_ssd_1tb_nvme OR opt_ssd_2tb_nvme) AND (opt_hdd_2tb OR opt_hdd_4tb)', 
5.00, 180),

('pricing_volume_build', 'gaming-pc', 'System Builder Discount', '8% off orders over $3000', 'volume_tier', 
'total_price >= 3000', 8.00, 170);

-- Create a sample high-end gaming configuration
INSERT INTO configurations (id, model_id, user_id, name, description, is_valid, total_price, status) VALUES 
('00000000-0000-0000-0000-000000000200', 'gaming-pc', '00000000-0000-0000-0000-000000000001', 'Ultimate Gaming Rig', 'High-end gaming PC build', true, 3899.92, 'draft');

-- Add selections to the gaming configuration
INSERT INTO selections (configuration_id, option_id, quantity, unit_price, total_price) VALUES 
('00000000-0000-0000-0000-000000000200', 'opt_cpu_amd_5900x', 1, 549.99, 549.99),
('00000000-0000-0000-0000-000000000200', 'opt_gpu_rtx4080', 1, 1199.99, 1199.99),
('00000000-0000-0000-0000-000000000200', 'opt_mobo_x570', 1, 249.99, 249.99),
('00000000-0000-0000-0000-000000000200', 'opt_ram_32gb_3600', 1, 189.99, 189.99),
('00000000-0000-0000-0000-000000000200', 'opt_ssd_2tb_nvme', 1, 249.99, 249.99),
('00000000-0000-0000-0000-000000000200', 'opt_psu_1000w', 1, 219.99, 219.99),
('00000000-0000-0000-0000-000000000200', 'opt_cool_aio_360', 1, 179.99, 179.99),
('00000000-0000-0000-0000-000000000200', 'opt_case_premium', 1, 159.99, 159.99),
('00000000-0000-0000-0000-000000000200', 'opt_monitor_1440p', 1, 399.99, 399.99),
('00000000-0000-0000-0000-000000000200', 'opt_keyboard_mech', 1, 129.99, 129.99),
('00000000-0000-0000-0000-000000000200', 'opt_mouse_gaming', 1, 149.99, 149.99),
('00000000-0000-0000-0000-000000000200', 'opt_headset_gaming', 1, 169.99, 169.99);