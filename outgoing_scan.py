import cv2
import json
from datetime import datetime
import os
import sys
import traceback
from Crypto.Cipher import AES
import base64
import re

# Encryption Key (Make sure to use the same key that was used during encryption)
KEY = b'SixteenByteKey12'

def decrypt_data(encrypted_text):
    """Decrypt the encrypted data using AES."""
    try:
        encrypted_bytes = base64.b64decode(encrypted_text)  # Base64 decode
        nonce = encrypted_bytes[:16]  # First 16 bytes are the nonce (Initialization Vector)
        ciphertext = encrypted_bytes[16:]  # The rest is the ciphertext
        
        # Initialize AES cipher in EAX mode with the given nonce
        cipher = AES.new(KEY, AES.MODE_EAX, nonce=nonce)
        
        # Decrypt the data
        decrypted_text = cipher.decrypt(ciphertext).decode('utf-8')
        return decrypted_text
    except Exception as e:
        print(f"Decryption Error: {e}")
        print(f"Encrypted Text: {encrypted_text}")
        return None

class OutgoingProductScanner:
    def __init__(self, product_file='product_inventory.json', outgoing_log='outgoing_transactions.json'):
        """
        Initialize Outgoing Product Scanner
        """
        self.product_file = os.path.abspath(product_file)
        self.outgoing_log = os.path.abspath(outgoing_log)
        
        # Create files if they don't exist
        self._ensure_file_exists(self.product_file)
        self._ensure_file_exists(self.outgoing_log)

    def _ensure_file_exists(self, file_path):
        """
        Ensure the specified file exists, creating it if necessary
        """
        try:
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    json.dump([], f)
            
            print(f"File will be saved at: {file_path}")
        except Exception as e:
            print(f"Error creating file {file_path}: {e}")
            print(f"Full traceback: {traceback.format_exc()}")

    def scan_outgoing_product(self):
        """
        Scan QR code for outgoing product
        """
        try:
            # Open camera
            cap = cv2.VideoCapture(0)
            
            # Check if camera opened successfully
            if not cap.isOpened():
                print("Error: Could not open camera.")
                return None
            
            # Create QR code detector
            detector = cv2.QRCodeDetector()
            
            while True:
                # Read frame from camera
                ret, frame = cap.read()
                
                if not ret:
                    print("Failed to grab frame")
                    break
                
                # Detect and decode QR code
                data, vertices_array, _ = detector.detectAndDecode(frame)
                
                # If QR code is detected
                if len(data) > 0:
                    # Draw rectangle around QR code
                    vertices = vertices_array[0].astype(int)
                    cv2.polylines(frame, [vertices], True, (0, 255, 0), 5)
                    
                    # Add text to frame
                    cv2.putText(frame, f"QR Code: {data}", (10, 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                # Display the frame
                try:
                    cv2.imshow('Outgoing Product Scanner', frame)
                except Exception as display_error:
                    print(f"Display error: {display_error}")
                    print("Your system might have issues with GUI rendering.")
                
                # Wait for key press
                key = cv2.waitKey(1) & 0xFF
                
                # If QR code detected, process and save
                if len(data) > 0:
                    try:
                        # Attempt to decrypt first
                        decrypted_data = decrypt_data(data)
                        
                        # If decryption fails, use raw data
                        if decrypted_data is None:
                            decrypted_data = data
                        
                        # Parse the product information
                        product_info = self.parse_product_data(decrypted_data)
                        
                        # If parsing successful, process outgoing product
                        if product_info:
                            result = self.process_outgoing_product(product_info)
                            
                            print(f"Processed Product: {product_info}")
                            print(f"Outgoing Transaction Result: {'Success' if result else 'Failed'}")
                        else:
                            print(f"Invalid QR Code Data: {decrypted_data}")
                        break
                    except Exception as process_error:
                        print(f"Error processing QR code: {process_error}")
                        print(f"Full traceback: {traceback.format_exc()}")
                
                # Exit if 'q' is pressed
                if key == ord('q'):
                    break
            
            # Clean up
            cap.release()
            cv2.destroyAllWindows()
            
            return product_info if product_info else None
        
        except Exception as e:
            print(f"An error occurred: {e}")
            print(f"Full traceback: {traceback.format_exc()}")
            return None

    def parse_product_data(self, data):
        """
        Parse product data from the QR code
        """
        try:
            # Print raw data for debugging
            print(f"Raw QR Code Data: {data}")
            
            # Remove any leading/trailing whitespace
            data = data.strip()
            
            # Parse key-value pairs
            parsed_data = dict(re.findall(r'(\w+):([^:]+)(?=\s\w+:|$)', data))
            
            # Validate and prepare product information
            if 'ProductID' not in parsed_data:
                raise ValueError("No ProductID found in QR code data")
            
            # Construct product info
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
            print(f"Original data: {data}")
            return None

    def process_outgoing_product(self, product_info):
        """
        Process outgoing product by reducing stock and logging transaction
        """
        try:
            # Read existing inventory
            with open(self.product_file, 'r') as f:
                inventory = json.load(f)
            
            # Find product in inventory
            product_to_update = next((p for p in inventory if p['unique_id'] == product_info['unique_id']), None)
            
            if not product_to_update:
                print(f"Product not found in inventory: {product_info['unique_id']}")
                return False
            
            # Check current stock
            current_stock = product_to_update.get('stock', 0)
            if current_stock <= 0:
                print(f"No stock available for product: {product_info['unique_id']}")
                return False
            
            # Reduce stock
            product_to_update['stock'] -= 1
            product_to_update['last_outgoing'] = product_info['timestamp']
            
            # Write updated inventory
            with open(self.product_file, 'w') as f:
                json.dump(inventory, f, indent=4)
            
            # Log outgoing transaction
            self._log_outgoing_transaction(product_info)
            
            print("Outgoing product processed successfully!")
            return True
        
        except Exception as e:
            print(f"Error processing outgoing product: {e}")
            return False

    def _log_outgoing_transaction(self, product_info):
        """
        Log outgoing transaction
        """
        try:
            # Read existing transactions
            with open(self.outgoing_log, 'r') as f:
                transactions = json.load(f)
            
            # Create transaction entry
            transaction = {
                'unique_id': product_info['unique_id'],
                'product_code': product_info['code'],
                'batch': product_info['batch'],
                'warehouse': product_info['warehouse'],
                'timestamp': product_info['timestamp']
            }
            
            # Add to transactions
            transactions.append(transaction)
            
            # Write updated transactions
            with open(self.outgoing_log, 'w') as f:
                json.dump(transactions, f, indent=4)
        
        except Exception as e:
            print(f"Error logging outgoing transaction: {e}")

    def view_outgoing_transactions(self):
        """
        View all outgoing transactions
        """
        try:
            with open(self.outgoing_log, 'r') as f:
                transactions = json.load(f)
            
            if not transactions:
                print("No outgoing transactions found.")
                return
            
            print("\n--- Outgoing Transactions ---")
            for transaction in transactions:
                print(f"Product Code: {transaction['product_code']}")
                print(f"Batch: {transaction.get('batch', 'N/A')}")
                print(f"Warehouse: {transaction.get('warehouse', 'N/A')}")
                print(f"Timestamp: {transaction['timestamp']}")
                print("---")
        
        except json.JSONDecodeError:
            print("Outgoing transactions file is empty or corrupted.")
        except FileNotFoundError:
            print(f"File not found: {self.outgoing_log}")
        except Exception as e:
            print(f"Error reading outgoing transactions: {e}")

def main():
    # Create outgoing product scanner
    scanner = OutgoingProductScanner()
    
    while True:
        print("\n--- Outgoing Product Management ---")
        print("1. Scan Outgoing Product")
        print("2. View Outgoing Transactions")
        print("3. Exit")
        
        try:
            choice = input("Enter your choice (1-3): ")
            
            if choice == '1':
                print("Hold Outgoing Product QR Code in front of camera. Press 'q' to quit.")
                result = scanner.scan_outgoing_product()
                if result:
                    print(f"Processed Product: {result}")
            
            elif choice == '2':
                scanner.view_outgoing_transactions()
            
            elif choice == '3':
                break
            
            else:
                print("Invalid choice. Try again.")
        
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()