"""
Firestore database operations and utilities.

This module handles all interactions with Google Cloud Firestore:
- CRUD operations (Create, Read, Update, Delete)
- Batch operations
- Query operations
- Array field operations
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def init_firebase():
    """Initialize Firebase with service account credentials"""
    try:
        # Get credentials path from environment
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")

        # Initialize Firebase with credentials
        cred = credentials.Certificate(creds_path)
        firebase_admin.initialize_app(cred, {
            "projectId": os.getenv("FIREBASE_PROJECT_ID", "test-99u1b3")
        })

        logger.info("Firebase initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise


# Initialize Firebase
try:
    init_firebase()
    db = firestore.client()
except:
    # For local development/testing without credentials
    logger.warning("Firebase not initialized - service account credentials may be missing")
    db = None


# ==================== Basic CRUD Operations ====================

def get_document(collection: str, doc_id: str) -> Optional[Dict]:
    """
    Fetch a single document by ID.

    Args:
        collection: Collection name
        doc_id: Document ID

    Returns:
        Document data with 'id' field, or None if not found
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        doc = db.collection(collection).document(doc_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            logger.debug(f"Retrieved document from {collection}/{doc_id}")
            return data
        return None
    except Exception as e:
        logger.error(f"Error fetching {collection}/{doc_id}: {str(e)}")
        raise


def get_all_documents(
    collection: str,
    limit: int = 50,
    offset: int = 0
) -> List[Dict]:
    """
    Fetch all documents from a collection with pagination.

    Args:
        collection: Collection name
        limit: Maximum number of documents to return
        offset: Number of documents to skip

    Returns:
        List of documents with 'id' field
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        docs = db.collection(collection).offset(offset).limit(limit).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        logger.debug(f"Retrieved {len(results)} documents from {collection}")
        return results
    except Exception as e:
        logger.error(f"Error fetching all {collection}: {str(e)}")
        raise


def add_document(
    collection: str,
    data: Dict,
    doc_id: Optional[str] = None
) -> str:
    """
    Add a new document to a collection.

    Args:
        collection: Collection name
        data: Document data
        doc_id: Optional custom document ID (auto-generated if not provided)

    Returns:
        Document ID of created document
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        if doc_id:
            db.collection(collection).document(doc_id).set(data)
            logger.info(f"Added document {doc_id} to {collection}")
            return doc_id
        else:
            _, doc_ref = db.collection(collection).add(data)
            logger.info(f"Added document {doc_ref.id} to {collection}")
            return doc_ref.id
    except Exception as e:
        logger.error(f"Error adding to {collection}: {str(e)}")
        raise


def update_document(collection: str, doc_id: str, data: Dict) -> None:
    """
    Update an existing document.

    Args:
        collection: Collection name
        doc_id: Document ID
        data: Fields to update
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        db.collection(collection).document(doc_id).update(data)
        logger.info(f"Updated {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error updating {collection}/{doc_id}: {str(e)}")
        raise


def delete_document(collection: str, doc_id: str) -> None:
    """
    Delete a document.

    Args:
        collection: Collection name
        doc_id: Document ID
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        db.collection(collection).document(doc_id).delete()
        logger.info(f"Deleted {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error deleting {collection}/{doc_id}: {str(e)}")
        raise


# ==================== Query Operations ====================

def query_documents(
    collection: str,
    field: str,
    operator: str,
    value: Any
) -> List[Dict]:
    """
    Query documents with a single condition.

    Args:
        collection: Collection name
        field: Field name to filter on
        operator: Comparison operator ('==', '<', '<=', '>', '>=', '!=', 'array-contains')
        value: Value to compare

    Returns:
        List of matching documents with 'id' field
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        docs = db.collection(collection).where(field, operator, value).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        logger.debug(f"Query returned {len(results)} results from {collection}")
        return results
    except Exception as e:
        logger.error(f"Error querying {collection}: {str(e)}")
        raise


def query_multiple_conditions(
    collection: str,
    conditions: List[tuple]
) -> List[Dict]:
    """
    Query documents with multiple conditions.

    Args:
        collection: Collection name
        conditions: List of (field, operator, value) tuples

    Returns:
        List of matching documents with 'id' field
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        query = db.collection(collection)
        for field, operator, value in conditions:
            query = query.where(field, operator, value)

        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        logger.debug(f"Multi-condition query returned {len(results)} results")
        return results
    except Exception as e:
        logger.error(f"Error querying {collection}: {str(e)}")
        raise


# ==================== Batch Operations ====================

def batch_update_documents(collection: str, updates: Dict[str, Dict]) -> None:
    """
    Update multiple documents in a single batch operation.

    Args:
        collection: Collection name
        updates: Dictionary mapping doc_id to update data
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        batch = db.batch()
        for doc_id, data in updates.items():
            batch.update(db.collection(collection).document(doc_id), data)
        batch.commit()
        logger.info(f"Batch updated {len(updates)} documents in {collection}")
    except Exception as e:
        logger.error(f"Error in batch update: {str(e)}")
        raise


def batch_delete_documents(collection: str, doc_ids: List[str]) -> None:
    """
    Delete multiple documents in a single batch operation.

    Args:
        collection: Collection name
        doc_ids: List of document IDs to delete
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        batch = db.batch()
        for doc_id in doc_ids:
            batch.delete(db.collection(collection).document(doc_id))
        batch.commit()
        logger.info(f"Batch deleted {len(doc_ids)} documents from {collection}")
    except Exception as e:
        logger.error(f"Error in batch delete: {str(e)}")
        raise


# ==================== Array Operations ====================

def add_to_array(collection: str, doc_id: str, field: str, value: Any) -> None:
    """
    Add a value to an array field (creates field if doesn't exist).

    Args:
        collection: Collection name
        doc_id: Document ID
        field: Array field name
        value: Value to add
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        db.collection(collection).document(doc_id).update({
            field: firestore.ArrayUnion([value])
        })
        logger.debug(f"Added to array {field} in {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error adding to array: {str(e)}")
        raise


def remove_from_array(collection: str, doc_id: str, field: str, value: Any) -> None:
    """
    Remove a value from an array field.

    Args:
        collection: Collection name
        doc_id: Document ID
        field: Array field name
        value: Value to remove
    """
    if db is None:
        raise RuntimeError("Firestore not initialized")

    try:
        db.collection(collection).document(doc_id).update({
            field: firestore.ArrayRemove([value])
        })
        logger.debug(f"Removed from array {field} in {collection}/{doc_id}")
    except Exception as e:
        logger.error(f"Error removing from array: {str(e)}")
        raise


# ==================== Helper Functions ====================

def get_server_timestamp():
    """Get server timestamp for use in documents"""
    return firestore.SERVER_TIMESTAMP


def document_exists(collection: str, doc_id: str) -> bool:
    """Check if a document exists"""
    if db is None:
        raise RuntimeError("Firestore not initialized")

    doc = db.collection(collection).document(doc_id).get()
    return doc.exists
