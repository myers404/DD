-- database/init/01_schema.sql
-- CPQ Database Schema for SMB deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for basic authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'viewer'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Models table - main CPQ product models
CREATE TABLE models (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    category VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table - logical groupings of options
CREATE TABLE groups (
    id VARCHAR(100) PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'single-select', 'multi-select', 'optional'
    is_required BOOLEAN NOT NULL DEFAULT false,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER,
    display_order INTEGER DEFAULT 0,
    default_option_id VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_selection_limits CHECK (
        min_selections >= 0 AND 
        (max_selections IS NULL OR max_selections >= min_selections)
    )
);

-- Options table - individual configurable options
CREATE TABLE options (
    id VARCHAR(100) PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    group_id VARCHAR(100) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(10,2) DEFAULT 0.00,
    category VARCHAR(100),
    sku VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rules table - constraint rules
CREATE TABLE rules (
    id VARCHAR(100) PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'requires', 'excludes', 'validation'
    expression TEXT NOT NULL, -- MTBDD expression
    message TEXT, -- User-friendly error message
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing rules table - pricing calculations
CREATE TABLE pricing_rules (
    id VARCHAR(100) PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'volume_tier', 'discount', 'markup'
    expression TEXT NOT NULL, -- Arithmetic expression
    discount_percent DECIMAL(5,2) DEFAULT 0.00, -- For percentage discounts
    discount_amount DECIMAL(10,2) DEFAULT 0.00, -- For fixed amount discounts
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_discount_percent CHECK (
        discount_percent >= 0.00 AND discount_percent <= 100.00
    )
);

-- Configurations table - user configurations
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) NOT NULL REFERENCES models(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255),
    description TEXT,
    is_valid BOOLEAN NOT NULL DEFAULT false,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    session_id VARCHAR(255), -- For anonymous users
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'quoted', 'ordered'
    expires_at TIMESTAMP WITH TIME ZONE, -- For session management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Selections table - user option selections
CREATE TABLE selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
    option_id VARCHAR(100) NOT NULL REFERENCES options(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT unique_selection_per_config UNIQUE (configuration_id, option_id)
);

-- Indexes for performance
CREATE INDEX idx_models_active ON models(is_active);
CREATE INDEX idx_models_category ON models(category);
CREATE INDEX idx_groups_model ON groups(model_id);
CREATE INDEX idx_groups_active ON groups(model_id, is_active);
CREATE INDEX idx_options_model ON options(model_id);
CREATE INDEX idx_options_group ON options(group_id);
CREATE INDEX idx_options_active ON options(model_id, is_active);
CREATE INDEX idx_rules_model ON rules(model_id);
CREATE INDEX idx_rules_active ON rules(model_id, is_active);
CREATE INDEX idx_pricing_rules_model ON pricing_rules(model_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(model_id, is_active);
CREATE INDEX idx_configurations_model ON configurations(model_id);
CREATE INDEX idx_configurations_user ON configurations(user_id);
CREATE INDEX idx_configurations_session ON configurations(session_id);
CREATE INDEX idx_configurations_status ON configurations(status);
CREATE INDEX idx_selections_config ON selections(configuration_id);
CREATE INDEX idx_selections_option ON selections(option_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_selections_updated_at BEFORE UPDATE ON selections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for default_option_id
ALTER TABLE groups ADD CONSTRAINT fk_default_option 
    FOREIGN KEY (default_option_id) REFERENCES options(id) ON DELETE SET NULL;