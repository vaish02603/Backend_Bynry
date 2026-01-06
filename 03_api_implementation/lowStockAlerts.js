const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path if needed

// GET /api/companies/:company_id/alerts/low-stock
router.get('/api/companies/:company_id/alerts/low-stock', async (req, res) => {
  const companyId = Number(req.params.company_id);

  // 1. Validate company_id
  if (!companyId || companyId <= 0) {
    return res.status(400).json({ error: 'Invalid company_id' });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    // 2. Fetch low-stock products with recent sales
    const rows = await db.query(
      `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        i.quantity AS current_stock,
        p.low_stock_threshold AS threshold,
        SUM(s.quantity) AS total_sold,
        COUNT(DISTINCT DATE(s.sale_date)) AS sale_days,
        sup.id AS supplier_id,
        sup.name AS supplier_name,
        sup.contact_email
      FROM products p
      JOIN inventory i 
        ON p.id = i.product_id
      JOIN warehouses w 
        ON i.warehouse_id = w.id
      JOIN sales s 
        ON s.product_id = p.id
       AND s.warehouse_id = w.id
       AND s.sale_date >= ?
      LEFT JOIN product_suppliers ps 
        ON ps.product_id = p.id
      LEFT JOIN suppliers sup 
        ON sup.id = ps.supplier_id
      WHERE p.company_id = ?
        AND w.company_id = ?
        AND i.quantity < p.low_stock_threshold
      GROUP BY p.id, w.id, sup.id
      ORDER BY i.quantity ASC
      `,
      [thirtyDaysAgo, companyId, companyId]
    );

    // 3. Build response
    const alerts = rows.map(row => {
      let days_until_stockout = null;

      if (row.sale_days > 0 && row.total_sold > 0) {
        const avgDailySales = row.total_sold / row.sale_days;
        days_until_stockout = Math.ceil(row.current_stock / avgDailySales);
      }

      return {
        product_id: row.product_id,
        product_name: row.product_name,
        sku: row.sku,
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name,
        current_stock: row.current_stock,
        threshold: row.threshold,
        days_until_stockout,
        supplier: row.supplier_id
          ? {
              id: row.supplier_id,
              name: row.supplier_name,
              contact_email: row.contact_email
            }
          : null
      };
    });

    // 4. Success response
    return res.json({
      alerts,
      total_alerts: alerts.length
    });

  } catch (err) {
    console.error('Low-stock alert error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
