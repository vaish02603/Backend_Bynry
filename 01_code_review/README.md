# Part 1 – Code Review & Debugging

This section reviews and fixes issues in the product creation API
to make it production-safe and aligned with business requirements.

---

## Issues Identified
- No input validation, leading to crashes when required fields are missing.
- SKU uniqueness was not enforced, allowing duplicate products.
- Product logic was tightly coupled to a single warehouse, while the business
  requires support for multiple warehouses.
- Separate database commits for product and inventory could leave the system
  in an inconsistent state.
- No proper error handling or rollback mechanism on failure.

---

## Production Impact
- Server crashes on invalid or incomplete requests.
- Duplicate SKUs can cause inventory mismatches and fulfillment issues.
- Same product cannot be tracked across multiple warehouses.
- Orphaned product records may exist if inventory creation fails.
- Users receive unclear 500 errors instead of meaningful responses.

---

## Fixes Applied
- Removed `warehouse_id` from the `Product` model so products are warehouse-agnostic.
- Used a single database transaction with `flush()` and one `commit()` to ensure atomicity.
- Added validation for required and optional fields with clear `400 Bad Request` responses.
- Handled duplicate SKUs by catching integrity errors and returning `409 Conflict`.
- Created inventory records only when `warehouse_id` is provided, allowing flexible onboarding.

---

The corrected implementation ensures data consistency, better error handling,
and proper support for multi-warehouse inventory management.
