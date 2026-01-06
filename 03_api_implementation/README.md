# Part 3 – Low-Stock Alerts API

This section describes the implementation of the low-stock alerts API,
which identifies products that require restocking across company warehouses.

---

## Assumptions
- The database schema defined in Part 2 is used.
- “Recent sales” refers to sales activity within the last 30 days.
- Days until stockout is calculated as:
  
  `CEIL(current_stock / avg_daily_sales)`
  
- Only one supplier is returned per product (first match from `product_suppliers`).
- Database access is available via a `db.query()` method.
- Authentication and authorization are handled outside this endpoint.

---

## Edge Cases Handled
- Invalid `company_id` results in a `400 Bad Request` response.
- Products without recent sales activity are excluded from alerts.
- Products with zero sales rate return `days_until_stockout = null`.
- Products without suppliers return `supplier: null`.
- Database failures return a safe `500 Internal Server Error` with logging.

---

## Implementation Approach
- Implemented as an Express route for clarity and simplicity.
- Uses a single SQL query with joins to fetch all required data efficiently.
- Applies low-stock and recent-sales filters at the database level.
- Keeps business logic readable and maintainable for production use.

---

The API is designed to be reliable, efficient, and easy to extend as
business requirements evolve.
