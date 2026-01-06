# Part 2 – Database Design

This section describes the database schema design for the StockFlow
inventory management system and explains the key design decisions.

---

## Design Approach
The schema is normalized to support the following requirements:
- Companies with multiple warehouses
- Products stored across multiple warehouses (via the `inventory` table)
- Complete audit trail of inventory changes (via `inventory_history`)
- Supplier relationships using a many-to-many mapping (`product_suppliers`)
- Support for bundle products (`product_bundles`)

---

## Key Constraints
- `(company_id, sku)` is unique in the `products` table, ensuring SKU uniqueness per company.
- `(product_id, warehouse_id)` is unique in the `inventory` table, ensuring a single stock record per product per warehouse.
- All foreign keys use `ON DELETE CASCADE` to maintain data ownership and prevent orphan records.

---

## Missing Requirements / Open Questions
The following points would need clarification from the product team:
- Should SKUs be globally unique or only unique within a company?
- Can a supplier serve multiple companies?
- Which actions should create an `inventory_history` entry (sales, restocks, adjustments)?
- Are nested bundles (bundles containing other bundles) allowed?
- Do we need to track who changed inventory (user or system)?
- How is “recent sales activity” defined for low-stock alerts?

---

This design prioritizes data integrity, scalability, and support for
real-world inventory workflows.
