"""
Product data import script.

Reads products from CSV and imports them into Firestore.
Run this script after setting up Firebase credentials.

Usage:
    python scripts/import_products.py
"""

import csv
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firestore import add_document
from config import settings


def import_products_from_csv(csv_file: str):
    """
    Import products from CSV file into Firestore.

    Args:
        csv_file: Path to CSV file containing product data

    Returns:
        Number of products imported
    """
    imported_count = 0
    errors = []

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                try:
                    product_data = {
                        "name": row.get("name", ""),
                        "description": row.get("description", ""),
                        "price": float(row.get("price", 0)),
                        "image_url": row.get("image_url", ""),
                        "stock": int(row.get("stock", 0)),
                        "category": row.get("category", ""),
                        "created_at": datetime.utcnow().isoformat() + "Z"
                    }

                    # Use product_id from CSV or let Firestore auto-generate
                    product_id = row.get("product_id", None)

                    # Add to Firestore
                    doc_id = add_document("products", product_data, doc_id=product_id)
                    print(f"✓ Imported: {product_data['name']} (ID: {doc_id})")
                    imported_count += 1

                except ValueError as e:
                    error_msg = f"Error converting data for {row.get('name', 'Unknown')}: {str(e)}"
                    print(f"✗ {error_msg}")
                    errors.append(error_msg)
                except Exception as e:
                    error_msg = f"Error importing {row.get('name', 'Unknown')}: {str(e)}"
                    print(f"✗ {error_msg}")
                    errors.append(error_msg)

        # Print summary
        print(f"\n{'='*60}")
        print(f"Import Summary")
        print(f"{'='*60}")
        print(f"✓ Successfully imported: {imported_count} products")
        if errors:
            print(f"✗ Errors: {len(errors)}")
            for error in errors:
                print(f"  - {error}")
        print(f"{'='*60}")

        return imported_count

    except FileNotFoundError:
        print(f"Error: CSV file not found: {csv_file}")
        return 0
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return 0


def main():
    """Main function to run import"""
    print(f"E-Commerce Product Importer")
    print(f"{'='*60}")
    print(f"Environment: {settings.environment}")
    print(f"Project ID: {settings.firebase_project_id}")
    print(f"Credentials: {settings.google_application_credentials}")
    print(f"{'='*60}\n")

    # Get CSV file path
    csv_file = os.path.join(
        os.path.dirname(__file__),
        "..",
        "data",
        "products.csv"
    )

    print(f"Reading products from: {csv_file}\n")

    if not os.path.exists(csv_file):
        print(f"Error: File not found: {csv_file}")
        sys.exit(1)

    # Import products
    try:
        imported = import_products_from_csv(csv_file)
        if imported > 0:
            print("\n✓ Import completed successfully!")
            sys.exit(0)
        else:
            print("\n✗ No products were imported")
            sys.exit(1)
    except Exception as e:
        print(f"\n✗ Import failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
