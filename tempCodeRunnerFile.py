import cv2
import json
from datetime import datetime
import os
import sys
import traceback
from Crypto.Cipher import AES
import base64
import re
import pymongo
from pymongo import MongoClient

class InventoryManager:
    def __init__(self, connection_string='mongodb+srv://rohannso14:QlYsnE5wdNQ0V2LX@cluster0.0mpzu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', database_name='inventory_db'):
        """
        Initialize MongoDB connection for inventory management
        
        Args:
            connection_string (str): MongoDB connection string
            database_name (str): Name of the database
        """
        try:
            # Connect to MongoDB
            self.client = MongoClient(connection_string)
            self.db = self.client[database_name]
            
            # Create collections
            self.inventory_collection = self.db['inventory_items']
            self.incoming_collection = self.db['incoming_transactions']
            self.outgoing_collection = self.db['outgoing_transactions']
            
            # Create indexes
            self.inventory_collection.create_index('unique_id', unique=True)
            self.incoming_collection.create_index('unique_id')
            self.outgoing_collection.create_index('unique_id')
            
            print("MongoDB connection established successfully!")
        
        except pymongo.errors.ConnectionFailure as e:
            print(f"MongoDB Connection Error: {e}")
            raise

    def decrypt_data(self, encrypted_text, key=b'SixteenByteKey12'):
        """
        Decrypt the encrypted data using AES
        
        Args:
            encrypted_text (str): Encrypted text to decrypt
            key (bytes): Encryption key
        
        Returns:
            str: Decrypted text or None if decryption fails
        """
        try:
            encrypted_bytes = base64.b64decode(encrypted_text)
            nonce = encrypted_bytes[:16]
            ciphertext = encrypted_bytes[16:]
            
            cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
            decrypted_text = cipher.decrypt(ciphertext).decode('utf-8')
            return decrypted_text
        except Exception as e:
            print(f"Decryption Error: {e}")
            return None

    def parse_product_data(self, data):
        """
        Parse product data from QR code
        
        Args:
            data (str): Raw QR code data
        
        Returns:
            dict: Parsed product information
        """
        try:
            print(f"Raw QR Code Data: {data}")
            data = data.strip()
            
            # Parse key-value pairs
            parsed_data = dict(re.findall(r'(\w+):([^:]+)(?=\s\w+:|$)', data))
            
            if 'ProductID' not in parsed_data:
                raise ValueError("No ProductID found in QR code data")
            
            product_info = {
                'name': parsed_data.get('ProductID', 'Unknown Product'),
                'code': parsed_data.get('ProductID', 'N/A'),
                'batch': parsed_data.get('Batch', 'N/A'),
                'warehouse': parsed_data.get('Warehouse', 'N/A'),
                'unique_id': parsed_data.get('UniqueID', ''),
                'timestamp': datetime.now().isoformat()
            }
            
            return product_info
        
        except Exception as e:
            print(f"Error parsing product data: {e}")
            return None

    def scan_qr_code(self):
        """
        Scan QR code using camera
        
        Returns:
            dict: Scanned product information or None
        """
        try:
            cap = cv2.VideoCapture(0)
            
            if not cap.isOpened():
                print("Error: Could not open camera.")
                return None
            
            detector = cv2.QRCodeDetector()
            
            while True:
                ret, frame = cap.read()
                
                if not ret:
                    print("Failed to grab frame")
                    break
                
                data, vertices_array, _ = detector.detectAndDecode(frame)
                
                if len(data) > 0:
                    vertices = vertices_array[0].astype(int)
                    cv2.polylines(frame, [vertices], True, (0, 255, 0), 5)
                    
                    cv2.putText(frame, f"QR Code: {data}", (10, 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                try:
                    cv2.imshow('Product QR Code Scanner', frame)
                except Exception as display_error:
                    print(f"Display error: {display_error}")
                
                key = cv2.waitKey(1) & 0xFF
                
                if len(data) > 0:
                    try:
                        # Attempt to decrypt first
                        decrypted_data = self.decrypt_data(data)
                        
                        if decrypted_data is None:
                            decrypted_data = data
                        
                        product_info = self.parse_product_data(decrypted_data)
                        
                        if product_info:
                            return product_info
                        else:
                            print(f"Invalid QR Code Data: {decrypted_data}")
                        break
                    except Exception as save_error:
                        print(f"Error processing QR code: {save_error}")
                
                if key == ord('q'):
                    break
            
            cap.release()
            cv2.destroyAllWindows()
            
            return None
        
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def incoming_product(self, product_info):
        """
        Process incoming product
        
        Args:
            product_info (dict): Product information
        
        Returns:
            bool: Success status of incoming product processing
        """
        try:
            # Check if product already exists
            existing_product = self.inventory_collection.find_one(
                {'unique_id': product_info['unique_id']}
            )
            
            if existing_product:
                # Update existing product
                update_result = self.inventory_collection.update_one(
                    {'unique_id': product_info['unique_id']},
                    {'$inc': {'stock': 1},
                     '$set': {'last_scanned': product_info['timestamp']}}
                )
            else:
                # Insert new product
                product_info['stock'] = 1
                insert_result = self.inventory_collection.insert_one(product_info)
            
            # Log incoming transaction
            self.incoming_collection.insert_one({
                'unique_id': product_info['unique_id'],
                'product_code': product_info['code'],
                'batch': product_info['batch'],
                'warehouse': product_info['warehouse'],
                'timestamp': product_info['timestamp']
            })
            
            print("Incoming product processed successfully!")
            return True
        
        except Exception as e:
            print(f"Error processing incoming product: {e}")
            return False

    def outgoing_product(self, product_info):
        """
        Process outgoing product
        
        Args:
            product_info (dict): Product information
        
        Returns:
            bool: Success status of outgoing product processing
        """
        try:
            # Find product in inventory
            product_to_update = self.inventory_collection.find_one(
                {'unique_id': product_info['unique_id']}
            )
            
            if not product_to_update:
                print(f"Product not found in inventory: {product_info['unique_id']}")
                return False
            
            # Check current stock
            current_stock = product_to_update.get('stock', 0)
            if current_stock <= 0:
                print(f"No stock available for product: {product_info['unique_id']}")
                return False
            
            # Reduce stock
            update_result = self.inventory_collection.update_one(
                {'unique_id': product_info['unique_id']},
                {'$inc': {'stock': -1},
                 '$set': {'last_outgoing': product_info['timestamp']}}
            )
            
            # Log outgoing transaction
            self.outgoing_collection.insert_one({
                'unique_id': product_info['unique_id'],
                'product_code': product_info['code'],
                'batch': product_info['batch'],
                'warehouse': product_info['warehouse'],
                'timestamp': product_info['timestamp']
            })
            
            print("Outgoing product processed successfully!")
            return True
        
        except Exception as e:
            print(f"Error processing outgoing product: {e}")
            return False

    def view_inventory(self):
        """
        View current product inventory
        """
        try:
            inventory = list(self.inventory_collection.find())
            
            if not inventory:
                print("Product inventory is empty.")
                return
            
            print("\n--- Current Product Inventory ---")
            for product in inventory:
                print(f"Product ID: {product['code']}")
                print(f"Batch: {product.get('batch', 'N/A')}")
                print(f"Warehouse: {product.get('warehouse', 'N/A')}")
                print(f"Unique ID: {product.get('unique_id', 'N/A')}")
                print(f"Stock: {product.get('stock', 0)}")
                print(f"Last Scanned: {product.get('last_scanned', 'N/A')}")
                print("---")
        
        except Exception as e:
            print(f"Error reading product inventory: {e}")

    def view_transactions(self, transaction_type='incoming'):
        """
        View transactions
        
        Args:
            transaction_type (str): Type of transactions to view
        """
        try:
            if transaction_type == 'incoming':
                collection = self.incoming_collection
                print("\n--- Incoming Transactions ---")
            else:
                collection = self.outgoing_collection
                print("\n--- Outgoing Transactions ---")
            
            transactions = list(collection.find())
            
            if not transactions:
                print(f"No {transaction_type} transactions found.")
                return
            
            for transaction in transactions:
                print(f"Product Code: {transaction['product_code']}")
                print(f"Batch: {transaction.get('batch', 'N/A')}")
                print(f"Warehouse: {transaction.get('warehouse', 'N/A')}")
                print(f"Timestamp: {transaction['timestamp']}")
                print("---")
        
        except Exception as e:
            print(f"Error reading {transaction_type} transactions: {e}")

    def close_connection(self):
        """Close MongoDB connection"""
        self.client.close()

def main():
    # MongoDB connection string - replace with your actual connection details
    CONNECTION_STRING = "mongodb://localhost:27017"
    
    # Create inventory manager
    manager = InventoryManager(CONNECTION_STRING)
    
    while True:
        print("\n--- Inventory Management System ---")
        print("1. Scan Incoming Product")
        print("2. Scan Outgoing Product")
        print("3. View Inventory")
        print("4. View Incoming Transactions")
        print("5. View Outgoing Transactions")
        print("6. Exit")
        
        try:
            choice = input("Enter your choice (1-6): ")
            
            if choice == '1':
                print("Hold Incoming Product QR Code in front of camera. Press 'q' to quit.")
                result = manager.scan_qr_code()
                if result:
                    manager.incoming_product(result)
            
            elif choice == '2':
                print("Hold Outgoing Product QR Code in front of camera. Press 'q' to quit.")
                result = manager.scan_qr_code()
                if result:
                    manager.outgoing_product(result)
            
            elif choice == '3':
                manager.view_inventory()
            
            elif choice == '4':
                manager.view_transactions('incoming')
            
            elif choice == '5':
                manager.view_transactions('outgoing')
            
            elif choice == '6':
                manager.close_connection()
                break
            
            else:
                print("Invalid choice. Try again.")
        
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()