# Database Migration Instructions

## Step 1: Add Passport Field to Partners Table

Before running the updated application, you need to add the passport field to your MySQL database.

### Option 1: Using MySQL Command Line

```bash
mysql -u root -p
USE crm;
ALTER TABLE partners ADD COLUMN passport_filename VARCHAR(255) NULL AFTER nid_filename;
```

### Option 2: Using MySQL Workbench or phpMyAdmin

Run this SQL command:

```sql
ALTER TABLE partners ADD COLUMN passport_filename VARCHAR(255) NULL AFTER nid_filename;
```

### Option 3: Using the provided SQL file

```bash
mysql -u root -p crm < server/add_passport_field.sql
```

## Step 2: Verify the Changes

```sql
DESCRIBE partners;
```

The table should now have the following structure:

- id
- name
- email
- phone
- address
- partner_type
- nid_filename
- passport_filename (NEW)
- created_at
- updated_at

## Step 3: Start the Application

After the database migration is complete, you can run the application:

```bash
npm run dev:server  # In one terminal
npm run dev         # In another terminal
```

The partners page now supports both NID and Passport document uploads with a two-column form layout.
