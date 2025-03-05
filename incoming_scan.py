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

class ProductScanner:
    def __init__(self, product_file='product_inventory.json'):
        """
        Initialize Product Scanner with JSON inventory management
        """
        self.product_file = os.path.abspath(product_file)
        
        # Create file if it doesn't exist
        try:
            if not os.path.exists(self.product_file):
                with open(self.product_file, 'w') as f:
                    json.dump([], f)
            
            print(f"Product inventory file will be saved at: {self.product_file}")
        except Exception as e:
            print(f"Error creating product inventory file: {e}")
            print(f"Full traceback: {traceback.format_exc()}")

    def scan_qr_code(self):
        """
        Scan QR code using camera with product tracking
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
                    cv2.imshow('Product QR Code Scanner', frame)
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
                        
                        # If parsing successful, update inventory
                        if product_info:
                            # Update product inventory
                            self.update_product_inventory(product_info)
                            
                            print(f"Scanned Product: {product_info}")
                        else:
                            print(f"Invalid QR Code Data: {decrypted_data}")
                        break
                    except Exception as save_error:
                        print(f"Error processing QR code: {save_error}")
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
        Handles complex, colon-separated formats
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
                # Default price to 0 if not specified
                'price': 0.00,
                'timestamp': datetime.now().isoformat()
            }
            
            return product_info
        
        except Exception as e:
            print(f"Error parsing product data: {e}")
            print(f"Original data: {data}")
            return None

    def update_product_inventory(self, product_info):
        """
        Update product inventory in JSON file
        More robust error handling
        """
        try:
            # Validate product_info
            if not product_info or not isinstance(product_info, dict):
                print("Invalid product information")
                return
            
            # Read existing inventory
            try:
                with open(self.product_file, 'r') as f:
                    inventory = json.load(f)
            except json.JSONDecodeError:
                print("Inventory file is empty or corrupted. Creating new list.")
                inventory = []
            except Exception as read_error:
                print(f"Error reading inventory file: {read_error}")
                inventory = []
            
            # Find existing product or create new entry
            existing_product = next((p for p in inventory if p['unique_id'] == product_info['unique_id']), None)
            
            if existing_product:
                # Increment stock count
                existing_product['stock'] = existing_product.get('stock', 0) + 1
                existing_product['last_scanned'] = product_info['timestamp']
            else:
                # Add new product with initial stock of 1
                product_info['stock'] = 1
                inventory.append(product_info)
            
            # Write back to file
            try:
                with open(self.product_file, 'w') as f:
                    json.dump(inventory, f, indent=4)
                
                print(f"Product inventory updated successfully!")
            except PermissionError:
                print(f"Permission denied when trying to write to {self.product_file}")
            except Exception as write_error:
                print(f"Error updating product inventory: {write_error}")
        
        except Exception as e:
            print(f"Unexpected error in update_product_inventory: {e}")
            print(f"Full traceback: {traceback.format_exc()}")

    def view_inventory(self):
        """
        Retrieve and display current product inventory
        """
        try:
            with open(self.product_file, 'r') as f:
                inventory = json.load(f)
            
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
        
        except json.JSONDecodeError:
            print("Inventory file is empty or corrupted.")
        except FileNotFoundError:
            print(f"File not found: {self.product_file}")
        except Exception as e:
            print(f"Error reading product inventory: {e}")

def main():
    # Create product scanner
    scanner = ProductScanner()
    
    while True:
        print("\n--- Product QR Code Scanner ---")
        print("1. Scan Product QR Code")
        print("2. View Product Inventory")
        print("3. Exit")
        
        try:
            choice = input("Enter your choice (1-3): ")
            
            if choice == '1':
                print("Hold Product QR Code in front of camera. Press 'q' to quit.")
                result = scanner.scan_qr_code()
                if result:
                    print(f"Scanned Product: {result}")
            
            elif choice == '2':
                scanner.view_inventory()
            
            elif choice == '3':
                break
            
            else:
                print("Invalid choice. Try again.")
        
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()