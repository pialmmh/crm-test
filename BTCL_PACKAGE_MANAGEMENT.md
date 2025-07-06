# BTCL ISP Package Management System

## Overview

This ERP/CRM system has been enhanced with comprehensive ISP package management features specifically designed for BTCL (Bangladesh Telecommunications Company Limited) to manage internet packages and customer subscriptions.

## New Features Added

### 1. Package Management

- **Create, Read, Update, Delete (CRUD) operations** for ISP packages
- **Package Details**: Name, description, speed (Mbps), validity period (days), price (BDT), and status
- **Sample Packages**: Pre-loaded with 8 different packages ranging from basic to enterprise levels
- **Beautiful UI**: Modern card-based layout with gradients and responsive design
- **Search and Pagination**: Easy browsing through packages
- **Toast Notifications**: Beautiful success/error messages for all operations

### 2. Customer Package Management

- **Package Purchasing**: Site admins can purchase packages on behalf of customers
- **Package Browsing**: View all available packages with pricing and specifications
- **Purchase History**: Track all purchased packages for each customer
- **Package Status Management**: Active, Expired, Suspended status tracking
- **Payment Methods**: Support for Cash, Card, Bank Transfer, Mobile Banking
- **Date Tracking**: Purchase date, start date, end date with automatic calculation
- **Notes**: Optional notes for each package purchase

### 3. Integration with Partner Management

- **Customer-Only Feature**: Package management is only available for customers (not vendors)
- **Easy Access**: Package management button directly in the Partners page
- **Modal Interface**: Full-screen modal for seamless package management
- **Real-time Updates**: Automatic refresh of data after operations

## Database Schema

### Packages Table

```sql
CREATE TABLE packages (
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
```

### Customer Packages Table

```sql
CREATE TABLE customer_packages (
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
```

## API Endpoints

### Package Management

- `GET /packages` - Get all active packages
- `GET /packages/:id` - Get specific package
- `POST /packages` - Create new package
- `PUT /packages/:id` - Update package
- `DELETE /packages/:id` - Soft delete package (set inactive)

### Customer Package Management

- `GET /customers/:customerId/packages` - Get customer's purchased packages
- `POST /customers/:customerId/packages` - Purchase package for customer
- `PUT /customers/:customerId/packages/:packageId` - Update package status

## How to Use

### 1. Managing Packages

1. Navigate to the "Packages" section in the sidebar
2. View all available packages in a beautiful card layout
3. Click "Add Package" to create new packages
4. Use the edit/delete buttons on each package card
5. Search through packages using the search bar

### 2. Purchasing Packages for Customers

1. Go to the "Partners" section
2. Find a customer (partners with type "customer")
3. Click the purple package icon in the actions column
4. This opens the Package Management modal
5. Use the "Browse Packages" tab to see available packages
6. Click "Purchase Package" on any package
7. Fill in the purchase details (start date, payment method, notes)
8. Click "Purchase Package" to complete the transaction

### 3. Managing Customer Packages

1. In the Package Management modal, switch to "Purchased Packages" tab
2. View all packages purchased by the customer
3. See package details, dates, payment information
4. Use status buttons to Activate, Suspend, or Mark as Expired
5. All changes are tracked with timestamps

## Features Highlights

### Beautiful UI/UX

- Modern gradient designs
- Responsive layout for all screen sizes
- Professional color scheme with blue/purple gradients
- Smooth animations and hover effects
- Card-based layouts for better visual organization

### Toast Notifications

- Success messages with emojis (🎉 for creation, ✅ for updates, 🗑️ for deletion)
- Error messages with clear descriptions
- Loading states during API calls
- File upload feedback with validation

### Data Validation

- Required field validation
- File size limits (5MB)
- File type validation (JPG, PNG, PDF)
- Price and numeric validations
- Date validations for package validity

### Performance Optimizations

- Database indexes on frequently queried columns
- Efficient SQL queries with JOINs
- Proper error handling and logging
- Optimized React components with proper state management

## Sample Data

The system comes pre-loaded with 8 sample packages:

1. **Basic Internet** - 10 Mbps, 30 days, 1,500 BDT
2. **Standard Internet** - 25 Mbps, 30 days, 2,500 BDT
3. **Premium Internet** - 50 Mbps, 30 days, 4,000 BDT
4. **Ultra Speed** - 100 Mbps, 30 days, 6,500 BDT
5. **Enterprise** - 200 Mbps, 30 days, 12,000 BDT
6. **Student Package** - 15 Mbps, 30 days, 1,800 BDT
7. **Family Package** - 40 Mbps, 30 days, 3,200 BDT
8. **Gaming Package** - 75 Mbps, 30 days, 5,500 BDT

## Setup Instructions

1. **Database Setup**:

   ```bash
   # Run the SQL script to create tables
   mysql -u root -p crm < server/create_packages_tables.sql
   ```

2. **Start the Application**:

   ```bash
   # Start the React frontend
   npm run dev

   # Start the Express backend (in another terminal)
   npm run dev:server
   ```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, MySQL2
- **UI Library**: react-hot-toast for notifications
- **Routing**: React Router DOM
- **File Upload**: Multer (for NID/passport documents)

## Security Features

- Input validation and sanitization
- File type and size restrictions
- SQL injection prevention with parameterized queries
- CORS protection
- Error handling without exposing sensitive information

This comprehensive package management system transforms the basic CRM into a full-featured ISP management platform suitable for BTCL's customer and package management needs.
