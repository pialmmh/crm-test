-- ISP Package Management Tables for BTCL
-- Run this SQL script to create the required tables

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    speed_mbps INT NOT NULL,
    validity_days INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customer_packages table (to track purchased packages)
CREATE TABLE IF NOT EXISTS customer_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    package_id INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Insert sample packages
INSERT INTO packages (name, description, speed_mbps, validity_days, price, is_active) VALUES
('Basic Internet', 'Perfect for basic browsing and email', 10, 30, 1500.00, TRUE),
('Standard Internet', 'Great for streaming and video calls', 25, 30, 2500.00, TRUE),
('Premium Internet', 'High speed for heavy usage', 50, 30, 4000.00, TRUE),
('Ultra Speed', 'Ultra-fast internet for businesses', 100, 30, 6500.00, TRUE),
('Enterprise', 'Dedicated line for enterprises', 200, 30, 12000.00, TRUE),
('Student Package', 'Affordable package for students', 15, 30, 1800.00, TRUE),
('Family Package', 'Perfect for families', 40, 30, 3200.00, TRUE),
('Gaming Package', 'Low latency for gaming', 75, 30, 5500.00, TRUE);

-- Create indexes for better performance
CREATE INDEX idx_customer_packages_customer_id ON customer_packages(customer_id);
CREATE INDEX idx_customer_packages_package_id ON customer_packages(package_id);
CREATE INDEX idx_customer_packages_status ON customer_packages(status);
CREATE INDEX idx_customer_packages_end_date ON customer_packages(end_date);
CREATE INDEX idx_packages_is_active ON packages(is_active);
