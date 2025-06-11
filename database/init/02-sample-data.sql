-- Sample data for inventory_db
\c inventory_db;

CREATE TABLE IF NOT EXISTS "InventoryItems" (
    "Id" SERIAL PRIMARY KEY,
    "ProductId" INTEGER NOT NULL,
    "SKU" VARCHAR(50) NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "ReservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "MinimumStock" INTEGER NOT NULL DEFAULT 0,
    "MaximumStock" INTEGER NOT NULL DEFAULT 1000,
    "Location" VARCHAR(100) NOT NULL,
    "LastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "InventoryItems" ("ProductId", "SKU", "Quantity", "MinimumStock", "MaximumStock", "Location") VALUES
(1, 'SAMPLE-001', 100, 10, 500, 'A1-B2-C3'),
(2, 'SAMPLE-002', 50, 5, 200, 'A2-B1-C1'),
(3, 'SAMPLE-003', 75, 15, 300, 'B1-C2-D1');

-- Sample data for order_db
\c order_db;

CREATE TABLE IF NOT EXISTS "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "OrderNumber" VARCHAR(50) NOT NULL UNIQUE,
    "CustomerId" INTEGER NOT NULL,
    "Status" VARCHAR(20) NOT NULL,
    "TotalAmount" DECIMAL(18,2) NOT NULL,
    "SubTotal" DECIMAL(18,2) NOT NULL,
    "TaxAmount" DECIMAL(18,2) NOT NULL,
    "ShippingAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "OrderDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OrderItems" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "ProductId" INTEGER NOT NULL,
    "SKU" VARCHAR(50) NOT NULL,
    "ProductName" VARCHAR(200) NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(18,2) NOT NULL,
    "TotalPrice" DECIMAL(18,2) NOT NULL
);

INSERT INTO "Orders" ("OrderNumber", "CustomerId", "Status", "TotalAmount", "SubTotal", "TaxAmount", "ShippingAmount", "OrderDate") VALUES
('ORD-001', 1, 'PENDING', 129.99, 99.99, 10.00, 20.00, CURRENT_TIMESTAMP),
('ORD-002', 2, 'CONFIRMED', 89.99, 79.99, 8.00, 2.00, CURRENT_TIMESTAMP);

INSERT INTO "OrderItems" ("OrderId", "ProductId", "SKU", "ProductName", "Quantity", "UnitPrice", "TotalPrice") VALUES
(1, 1, 'SAMPLE-001', 'Sample Product 1', 1, 99.99, 99.99),
(2, 2, 'SAMPLE-002', 'Sample Product 2', 2, 39.99, 79.98);

-- Sample data for customer_db
\c customer_db;

CREATE TABLE IF NOT EXISTS "Customers" (
    "Id" SERIAL PRIMARY KEY,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(200) NOT NULL UNIQUE,
    "Phone" VARCHAR(20),
    "Address" VARCHAR(200),
    "City" VARCHAR(100),
    "PostalCode" VARCHAR(20),
    "Country" VARCHAR(100),
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "LoyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "CustomerType" VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Customers" ("FirstName", "LastName", "Email", "Phone", "Address", "City", "PostalCode", "Country", "LoyaltyPoints") VALUES
('John', 'Doe', 'john.doe@example.com', '+1234567890', '123 Main St', 'New York', '10001', 'USA', 100),
('Jane', 'Smith', 'jane.smith@example.com', '+1234567891', '456 Oak Ave', 'Los Angeles', '90001', 'USA', 250);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO warehouse_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO warehouse_user;
