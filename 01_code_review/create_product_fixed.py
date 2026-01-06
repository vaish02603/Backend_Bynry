from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from decimal import Decimal

from your_app import app, db
from your_app.models import Product, Inventory


@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json 

    # 1. Basic input validation
    if not data or 'name' not in data or 'sku' not in data:
        return {"error": "name and sku are required"}, 400

    try:
        # 2. Create product (warehouse-agnostic)
        product = Product(
            name=data['name'],
            sku=data['sku'],
            price=Decimal(data['price']) if 'price' in data else None
        )

        db.session.add(product)
        db.session.flush()  # ensures product.id is available

        # 3. Create inventory only if warehouse data is provided
        if 'warehouse_id' in data and 'initial_quantity' in data:
            inventory = Inventory(
                product_id=product.id,
                warehouse_id=data['warehouse_id'],
                quantity=data['initial_quantity']
            )
            db.session.add(inventory)

        # 4. Single commit for atomicity
        db.session.commit()

        return {
            "message": "Product created successfully",
            "product_id": product.id
        }, 201

    # 5. Handle duplicate SKU
    except IntegrityError:
        db.session.rollback()
        return {"error": "SKU must be unique"}, 409

    # 6. Handle unexpected errors
    except Exception:
        db.session.rollback()
        return {"error": "Failed to create product"}, 400
