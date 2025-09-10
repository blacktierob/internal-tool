-- Black Tie Menswear Internal Web App Database Schema
-- This file contains the complete database schema for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for better data validation
CREATE TYPE order_status AS ENUM ('draft', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled');
CREATE TYPE member_role AS ENUM ('groom', 'best_man', 'groomsman', 'father_of_bride', 'father_of_groom', 'usher', 'page_boy', 'other');
CREATE TYPE activity_action AS ENUM ('create', 'update', 'delete', 'view', 'login', 'logout');
CREATE TYPE size_type AS ENUM ('chest', 'waist', 'inside_leg', 'trouser_waist', 'jacket_length', 'shirt_collar', 'shoe_size', 'height', 'weight');

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    county VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United Kingdom',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for search performance
    CONSTRAINT customers_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Orders table (includes wedding group information)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "BT2024-001"
    
    -- Wedding/Function Details
    wedding_date DATE,
    wedding_venue VARCHAR(255),
    wedding_time TIME,
    function_type VARCHAR(100) DEFAULT 'Wedding', -- Wedding, Corporate Event, etc.
    
    -- Order Details
    status order_status DEFAULT 'draft',
    total_members INTEGER DEFAULT 1,
    special_requirements TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(order_number, '') || ' ' ||
            COALESCE(wedding_venue, '') || ' ' ||
            COALESCE(function_type, '') || ' ' ||
            COALESCE(special_requirements, '')
        )
    ) STORED
);

-- Order members table (wedding party members)
CREATE TABLE order_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Member Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role member_role NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Order within the group (1 = groom, 2 = best man, etc.)
    sort_order INTEGER DEFAULT 1,
    
    -- Status
    measurements_taken BOOLEAN DEFAULT FALSE,
    outfit_assigned BOOLEAN DEFAULT FALSE,
    fitting_completed BOOLEAN DEFAULT FALSE,
    
    -- Member-specific notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(order_id, sort_order),
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Garment categories table
CREATE TABLE garment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garments table
CREATE TABLE garments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES garment_categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(100),
    material VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    rental_price DECIMAL(10,2),
    purchase_price DECIMAL(10,2),
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member garment assignments
CREATE TABLE member_garments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES order_members(id) ON DELETE CASCADE,
    garment_id UUID NOT NULL REFERENCES garments(id) ON DELETE RESTRICT,
    quantity INTEGER DEFAULT 1,
    is_rental BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique assignment per member per garment
    UNIQUE(member_id, garment_id)
);

-- Member measurements/sizes table
CREATE TABLE member_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES order_members(id) ON DELETE CASCADE,
    size_type size_type NOT NULL,
    measurement VARCHAR(20) NOT NULL, -- e.g., "42", "M", "10.5", "6'2\""
    measurement_unit VARCHAR(10), -- inches, cm, UK, EU, etc.
    notes TEXT,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    measured_by VARCHAR(100), -- Staff member who took measurement
    
    -- Allow multiple measurements of same type (for updates/corrections)
    UNIQUE(member_id, size_type, measured_at)
);

-- Activity logging table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User information (using PIN-based auth, so storing user identifier)
    user_identifier VARCHAR(50) NOT NULL, -- PIN or user ID
    user_name VARCHAR(100), -- Display name if available
    
    -- Activity details
    action activity_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'customer', 'order', 'member', etc.
    entity_id UUID, -- ID of the affected entity
    entity_name VARCHAR(200), -- Human-readable name of entity
    
    -- Activity description
    description TEXT NOT NULL,
    details JSONB, -- Additional structured data
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customers_name ON customers(first_name, last_name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_wedding_date ON orders(wedding_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_search_vector ON orders USING gin(search_vector);

CREATE INDEX idx_order_members_order_id ON order_members(order_id);
CREATE INDEX idx_order_members_role ON order_members(role);
CREATE INDEX idx_order_members_name ON order_members(first_name, last_name);

CREATE INDEX idx_garments_category_id ON garments(category_id);
CREATE INDEX idx_garments_active ON garments(active);
CREATE INDEX idx_garments_name ON garments(name);

CREATE INDEX idx_member_garments_member_id ON member_garments(member_id);
CREATE INDEX idx_member_garments_garment_id ON member_garments(garment_id);

CREATE INDEX idx_member_sizes_member_id ON member_sizes(member_id);
CREATE INDEX idx_member_sizes_type ON member_sizes(size_type);

CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_user_identifier ON activity_logs(user_identifier);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_details ON activity_logs USING gin(details);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_order_members_updated_at BEFORE UPDATE ON order_members 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_garments_updated_at BEFORE UPDATE ON garments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial garment categories
INSERT INTO garment_categories (name, description, sort_order) VALUES
    ('Jackets', 'Suit jackets, dinner jackets, tailcoats', 1),
    ('Trousers', 'Dress trousers, formal trousers', 2),
    ('Waistcoats', 'Vests and waistcoats', 3),
    ('Shirts', 'Dress shirts, wing collar shirts', 4),
    ('Accessories', 'Ties, bow ties, cufflinks, pocket squares', 5),
    ('Footwear', 'Formal shoes, dress shoes', 6),
    ('Other', 'Miscellaneous formal wear items', 7);

-- Insert sample garments (can be expanded later)
INSERT INTO garments (category_id, name, description, color, material, rental_price, purchase_price, sort_order)
SELECT 
    gc.id,
    'Sample ' || gc.name,
    'Sample garment for ' || gc.name || ' category',
    'Black',
    'Wool',
    50.00,
    200.00,
    1
FROM garment_categories gc;

-- Create row level security policies (can be enabled when authentication is fully implemented)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE member_garments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE member_sizes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create helpful views for common queries
CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.wedding_date,
    o.wedding_venue,
    o.function_type,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    o.total_members,
    COUNT(om.id) as actual_members,
    o.created_at,
    o.updated_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_members om ON o.id = om.order_id
GROUP BY o.id, c.id;

CREATE VIEW member_details AS
SELECT 
    om.id,
    om.order_id,
    om.first_name || ' ' || om.last_name as member_name,
    om.role,
    om.email,
    om.phone,
    om.sort_order,
    om.measurements_taken,
    om.outfit_assigned,
    om.fitting_completed,
    COUNT(mg.id) as assigned_garments,
    COUNT(ms.id) as recorded_measurements
FROM order_members om
LEFT JOIN member_garments mg ON om.id = mg.member_id
LEFT JOIN member_sizes ms ON om.id = ms.member_id
GROUP BY om.id;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
    order_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'BT' || current_year || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM orders 
    WHERE order_number LIKE 'BT' || current_year || '-%';
    
    order_number := 'BT' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
    p_user_identifier VARCHAR(50),
    p_user_name VARCHAR(100),
    p_action activity_action,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_name VARCHAR(200),
    p_description TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_identifier, user_name, action, entity_type, entity_id,
        entity_name, description, details
    ) VALUES (
        p_user_identifier, p_user_name, p_action, p_entity_type, p_entity_id,
        p_entity_name, p_description, p_details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE customers IS 'Customer information and contact details';
COMMENT ON TABLE orders IS 'Orders containing wedding/function details and overall status';
COMMENT ON TABLE order_members IS 'Wedding party members within each order';
COMMENT ON TABLE garment_categories IS 'Categories for organizing garments';
COMMENT ON TABLE garments IS 'Available garments for rental/purchase';
COMMENT ON TABLE member_garments IS 'Assignment of garments to specific members';
COMMENT ON TABLE member_sizes IS 'Size measurements for each member';
COMMENT ON TABLE activity_logs IS 'Audit trail of all user actions';

COMMENT ON FUNCTION generate_order_number() IS 'Generates sequential order numbers in format BT{YEAR}-{001}';
COMMENT ON FUNCTION log_activity IS 'Logs user activities for audit trail';