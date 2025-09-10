-- Sample Data for Black Tie Menswear Internal Web App
-- This file populates the database with realistic test data

-- Clear existing data (in reverse dependency order)
DELETE FROM member_sizes;
DELETE FROM member_garments;
DELETE FROM order_members;
DELETE FROM orders;
DELETE FROM customers;
DELETE FROM garments;
DELETE FROM garment_categories;

-- Insert Garment Categories
INSERT INTO garment_categories (id, name, description, sort_order, active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Jackets', 'Formal jackets and blazers', 1, TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'Trousers', 'Formal trousers and dress pants', 2, TRUE),
  ('550e8400-e29b-41d4-a716-446655440003', 'Shirts', 'Dress shirts and formal shirts', 3, TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', 'Waistcoats', 'Formal waistcoats and vests', 4, TRUE),
  ('550e8400-e29b-41d4-a716-446655440005', 'Ties & Accessories', 'Ties, bow ties, pocket squares', 5, TRUE),
  ('550e8400-e29b-41d4-a716-446655440006', 'Shoes', 'Formal footwear', 6, TRUE),
  ('550e8400-e29b-41d4-a716-446655440007', 'Cufflinks', 'Formal cufflinks and accessories', 7, TRUE);

-- Insert Sample Garments
INSERT INTO garments (id, category_id, name, description, color, material, brand, sku, rental_price, purchase_price, active, sort_order) VALUES
  -- Jackets
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Classic Black Tuxedo Jacket', 'Traditional peak lapel tuxedo jacket', 'Black', 'Wool', 'Savile Row', 'TUX-BLACK-001', 45.00, 299.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Navy Blue Morning Coat', 'Traditional morning wear coat', 'Navy Blue', 'Wool', 'Gieves & Hawkes', 'MORN-NAVY-001', 55.00, 399.00, TRUE, 2),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Grey Tailcoat', 'Formal evening tailcoat', 'Charcoal Grey', 'Wool', 'Huntsman', 'TAIL-GREY-001', 65.00, 450.00, TRUE, 3),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Midnight Blue Dinner Jacket', 'Modern slim-fit dinner jacket', 'Midnight Blue', 'Wool', 'Tom Ford', 'DIN-MIDBL-001', 50.00, 349.00, TRUE, 4),
  
  -- Trousers
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Black Tuxedo Trousers', 'Classic satin stripe tuxedo trousers', 'Black', 'Wool', 'Savile Row', 'TUX-TRS-001', 25.00, 149.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Grey Striped Morning Trousers', 'Traditional striped morning trousers', 'Grey/Black', 'Wool', 'Gieves & Hawkes', 'MORN-TRS-001', 30.00, 179.00, TRUE, 2),
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Navy Formal Trousers', 'Modern formal trousers', 'Navy', 'Wool', 'Hugo Boss', 'FORM-TRS-001', 20.00, 129.00, TRUE, 3),
  
  -- Shirts
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Wing Collar Dress Shirt', 'Traditional wing collar shirt', 'White', 'Cotton', 'Turnbull & Asser', 'WING-WHT-001', 15.00, 85.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Standard Collar Dress Shirt', 'Classic formal shirt', 'White', 'Cotton', 'Charles Tyrwhitt', 'STD-WHT-001', 12.00, 65.00, TRUE, 2),
  ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'French Cuff Dress Shirt', 'Elegant French cuff shirt', 'Ivory', 'Cotton', 'Jermyn Street', 'FR-IVY-001', 18.00, 95.00, TRUE, 3),
  
  -- Waistcoats
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', 'Black Silk Waistcoat', 'Classic black silk waistcoat', 'Black', 'Silk', 'Anderson & Sheppard', 'WAIST-BLK-001', 20.00, 129.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'Ivory Silk Waistcoat', 'Elegant ivory waistcoat', 'Ivory', 'Silk', 'Kilgour', 'WAIST-IVY-001', 22.00, 139.00, TRUE, 2),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Grey Morning Waistcoat', 'Traditional morning waistcoat', 'Light Grey', 'Wool', 'Huntsman', 'WAIST-GRY-001', 25.00, 149.00, TRUE, 3),
  
  -- Ties & Accessories
  ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Black Silk Bow Tie', 'Classic black bow tie', 'Black', 'Silk', 'Charvet', 'BOW-BLK-001', 8.00, 45.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'White Silk Bow Tie', 'Traditional white bow tie', 'White', 'Silk', 'Charvet', 'BOW-WHT-001', 8.00, 45.00, TRUE, 2),
  ('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', 'Ivory Silk Tie', 'Elegant ivory necktie', 'Ivory', 'Silk', 'Hermès', 'TIE-IVY-001', 10.00, 65.00, TRUE, 3),
  
  -- Shoes
  ('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440006', 'Black Patent Leather Shoes', 'Classic patent leather dress shoes', 'Black', 'Patent Leather', 'Church\'s', 'SHOE-PAT-001', 25.00, 189.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440006', 'Black Oxford Shoes', 'Traditional Oxford dress shoes', 'Black', 'Leather', 'Loake', 'SHOE-OXF-001', 20.00, 149.00, TRUE, 2),
  
  -- Cufflinks
  ('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440007', 'Mother of Pearl Cufflinks', 'Classic mother of pearl cufflinks', 'White', 'Mother of Pearl', 'Asprey', 'CUFF-MOP-001', 5.00, 85.00, TRUE, 1),
  ('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440007', 'Silver Oval Cufflinks', 'Elegant silver cufflinks', 'Silver', 'Sterling Silver', 'Tiffany & Co', 'CUFF-SLV-001', 8.00, 125.00, TRUE, 2);

-- Insert Sample Customers
INSERT INTO customers (id, first_name, last_name, email, phone, address_line_1, city, county, postcode, country, notes) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'James', 'Wellington', 'james.wellington@email.com', '07701 234567', '15 Kensington Gardens', 'London', 'Greater London', 'SW7 2AR', 'United Kingdom', 'Regular customer, prefers classic styles'),
  ('770e8400-e29b-41d4-a716-446655440002', 'William', 'Ashford', 'w.ashford@gmail.com', '07702 345678', '42 Victoria Street', 'Bath', 'Somerset', 'BA1 1EX', 'United Kingdom', 'Getting married at Bath Abbey'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Thomas', 'Hartwell', 'thomas.hartwell@outlook.com', '07703 456789', '28 Regent Street', 'Oxford', 'Oxfordshire', 'OX1 2BX', 'United Kingdom', 'Large wedding party - 8 groomsmen'),
  ('770e8400-e29b-41d4-a716-446655440004', 'Charles', 'Pemberton', 'charles.pemb@yahoo.co.uk', '07704 567890', '33 High Street', 'Windsor', 'Berkshire', 'SL4 1PB', 'United Kingdom', 'Royal connections - high profile wedding'),
  ('770e8400-e29b-41d4-a716-446655440005', 'Oliver', 'Blackwood', 'oliver.blackwood@icloud.com', '07705 678901', '67 Piccadilly', 'Manchester', 'Greater Manchester', 'M1 2HY', 'United Kingdom', 'Modern style preferences'),
  ('770e8400-e29b-41d4-a716-446655440006', 'Henry', 'Fairfield', 'h.fairfield@gmail.com', '07706 789012', '19 Castle Street', 'Edinburgh', 'Lothian', 'EH2 3AH', 'United Kingdom', 'Scottish wedding traditions');

-- Insert Sample Orders
INSERT INTO orders (id, customer_id, order_number, wedding_date, wedding_venue, wedding_time, function_type, status, total_members, special_requirements, internal_notes) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'BT2024-001', '2024-09-15', 'Savoy Hotel, London', '14:00', 'Wedding', 'confirmed', 6, 'Traditional black tie required', 'VIP customer - ensure perfect fit'),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'BT2024-002', '2024-10-08', 'Bath Abbey', '15:30', 'Wedding', 'in_progress', 4, 'Morning dress preferred', 'Historic venue - traditional styling'),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'BT2024-003', '2024-11-22', 'Oxford Town Hall', '16:00', 'Wedding', 'draft', 10, 'Large party - coordinated colors', 'Biggest order this season'),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'BT2024-004', '2024-12-31', 'Windsor Castle Grounds', '17:00', 'Wedding', 'confirmed', 8, 'Royal protocol required', 'High security clearance needed'),
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'BT2024-005', '2024-08-10', 'The Lowry Hotel, Manchester', '13:00', 'Wedding', 'ready', 5, 'Modern styling requested', 'Contemporary venue choice'),
  ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', 'BT2024-006', '2024-07-20', 'Edinburgh Castle', '14:30', 'Wedding', 'completed', 7, 'Scottish Highland dress elements', 'Traditional Scottish ceremony');

-- Insert Sample Order Members (Wedding Party)
INSERT INTO order_members (id, order_id, first_name, last_name, role, email, phone, sort_order, measurements_taken, outfit_assigned, fitting_completed, notes) VALUES
  -- Order BT2024-001 (James Wellington's wedding)
  ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'James', 'Wellington', 'groom', 'james.wellington@email.com', '07701 234567', 1, TRUE, TRUE, TRUE, 'Groom - classic tuxedo'),
  ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Michael', 'Thompson', 'best_man', 'mike.thompson@email.com', '07701 345678', 2, TRUE, TRUE, FALSE, 'Best man - same style as groom'),
  ('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'David', 'Collins', 'groomsman', 'david.collins@email.com', '07701 456789', 3, FALSE, TRUE, FALSE, 'Groomsman 1'),
  ('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Andrew', 'Miller', 'groomsman', 'andrew.miller@email.com', '07701 567890', 4, FALSE, FALSE, FALSE, 'Groomsman 2'),
  ('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'Robert', 'Wellington', 'father_of_groom', 'robert.wellington@email.com', '07701 678901', 5, TRUE, TRUE, TRUE, 'Father of groom'),
  ('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', 'George', 'Harrison', 'father_of_bride', 'george.harrison@email.com', '07701 789012', 6, FALSE, FALSE, FALSE, 'Father of bride'),
  
  -- Order BT2024-002 (William Ashford's wedding)
  ('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', 'William', 'Ashford', 'groom', 'w.ashford@gmail.com', '07702 345678', 1, TRUE, TRUE, TRUE, 'Groom - morning dress'),
  ('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440002', 'Jonathan', 'Clarke', 'best_man', 'jon.clarke@email.com', '07702 456789', 2, TRUE, TRUE, FALSE, 'Best man'),
  ('990e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440002', 'Simon', 'Richards', 'groomsman', 'simon.richards@email.com', '07702 567890', 3, FALSE, FALSE, FALSE, 'Groomsman'),
  ('990e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440002', 'Edward', 'Ashford', 'father_of_groom', 'edward.ashford@email.com', '07702 678901', 4, TRUE, TRUE, TRUE, 'Father of groom'),
  
  -- Order BT2024-003 (Thomas Hartwell's wedding - draft status, fewer members added)
  ('990e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440003', 'Thomas', 'Hartwell', 'groom', 'thomas.hartwell@outlook.com', '07703 456789', 1, FALSE, FALSE, FALSE, 'Groom - large wedding party'),
  ('990e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440003', 'Matthew', 'Johnson', 'best_man', 'matt.johnson@email.com', '07703 567890', 2, FALSE, FALSE, FALSE, 'Best man');

-- Insert Sample Member Garment Assignments
INSERT INTO member_garments (id, member_id, garment_id, quantity, is_rental, notes) VALUES
  -- James Wellington (Groom) - Full tuxedo
  ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, TRUE, 'Classic black tuxedo jacket'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', 1, TRUE, 'Matching tuxedo trousers'),
  ('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440008', 1, TRUE, 'Wing collar dress shirt'),
  ('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011', 1, TRUE, 'Black silk waistcoat'),
  ('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440014', 1, TRUE, 'Black bow tie'),
  ('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440017', 1, TRUE, 'Patent leather shoes'),
  
  -- Michael Thompson (Best Man) - Similar to groom
  ('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 1, TRUE, 'Black tuxedo jacket'),
  ('aa0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 1, TRUE, 'Black tuxedo trousers'),
  ('aa0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440009', 1, TRUE, 'Standard collar dress shirt'),
  
  -- William Ashford (Groom) - Morning dress
  ('aa0e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 1, TRUE, 'Navy morning coat'),
  ('aa0e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440006', 1, TRUE, 'Grey striped trousers'),
  ('aa0e8400-e29b-41d4-a716-446655440012', '990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440013', 1, TRUE, 'Grey morning waistcoat');

-- Insert Sample Member Sizes/Measurements
INSERT INTO member_sizes (id, member_id, size_type, measurement, measurement_unit, measured_at, notes) VALUES
  -- James Wellington measurements
  ('bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'chest', '42', 'inches', '2024-08-01 10:30:00+00', 'Athletic build'),
  ('bb0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'waist', '34', 'inches', '2024-08-01 10:30:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'inside_leg', '32', 'inches', '2024-08-01 10:30:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', 'shoe_size', '9', 'UK', '2024-08-01 10:30:00+00', NULL),
  
  -- Michael Thompson measurements
  ('bb0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', 'chest', '40', 'inches', '2024-08-02 14:15:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440002', 'waist', '32', 'inches', '2024-08-02 14:15:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440002', 'inside_leg', '34', 'inches', '2024-08-02 14:15:00+00', NULL),
  
  -- William Ashford measurements
  ('bb0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440007', 'chest', '38', 'inches', '2024-08-05 09:00:00+00', 'Slim build'),
  ('bb0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440007', 'waist', '30', 'inches', '2024-08-05 09:00:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440007', 'inside_leg', '30', 'inches', '2024-08-05 09:00:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440007', 'shoe_size', '8.5', 'UK', '2024-08-05 09:00:00+00', NULL),
  
  -- Robert Wellington (Father) measurements
  ('bb0e8400-e29b-41d4-a716-446655440012', '990e8400-e29b-41d4-a716-446655440005', 'chest', '44', 'inches', '2024-08-03 16:00:00+00', 'Regular build'),
  ('bb0e8400-e29b-41d4-a716-446655440013', '990e8400-e29b-41d4-a716-446655440005', 'waist', '38', 'inches', '2024-08-03 16:00:00+00', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440014', '990e8400-e29b-41d4-a716-446655440005', 'inside_leg', '31', 'inches', '2024-08-03 16:00:00+00', NULL);

-- Update order statistics based on members added
UPDATE orders SET 
  total_members = (
    SELECT COUNT(*) 
    FROM order_members 
    WHERE order_members.order_id = orders.id
  )
WHERE id IN (
  '880e8400-e29b-41d4-a716-446655440001',
  '880e8400-e29b-41d4-a716-446655440002',
  '880e8400-e29b-41d4-a716-446655440003'
);

-- Add some indexes for better performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '')));
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(wedding_date);
CREATE INDEX IF NOT EXISTS idx_order_members_order ON order_members(order_id);
CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category_id);
CREATE INDEX IF NOT EXISTS idx_member_garments_member ON member_garments(member_id);
CREATE INDEX IF NOT EXISTS idx_member_sizes_member ON member_sizes(member_id);

-- Add a view for order summaries (used by the application)
CREATE OR REPLACE VIEW order_summaries AS
SELECT 
    o.id,
    o.order_number,
    o.wedding_date,
    o.wedding_venue,
    o.status,
    o.total_members,
    o.created_at,
    c.first_name || ' ' || c.last_name AS customer_name,
    COUNT(om.id) AS actual_members
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_members om ON o.id = om.order_id
GROUP BY o.id, o.order_number, o.wedding_date, o.wedding_venue, o.status, o.total_members, o.created_at, c.first_name, c.last_name
ORDER BY o.created_at DESC;

-- Success message
SELECT 'Sample data has been successfully inserted!' AS message;