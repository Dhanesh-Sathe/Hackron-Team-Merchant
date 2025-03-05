from Crypto.Cipher import AES
import base64
import json
from Crypto.Util.Padding import unpad

# Function to decrypt content
def decrypt_content(encrypted_data, key):
    cipher = AES.new(key, AES.MODE_ECB)
    
    # Decode the base64 encoded data
    encrypted_data_bytes = base64.b64decode(encrypted_data)
    
    # Decrypt the data
    decrypted_data = cipher.decrypt(encrypted_data_bytes)
    
    # Remove padding
    try:
        decrypted_data = unpad(decrypted_data, AES.block_size).decode('utf-8')
    except ValueError:
        raise ValueError("Invalid padding. Decryption may have failed.")

    return decrypted_data

# Example usage
encrypted_data = '0FrMGgTgiFSAtZx/k1JGGOHirkD77nlp9yo4O1Kwmgx2RIOp+EVqOtpIhqxeOxhPe/zCpfyDSR7OMAL1fBk='
key = b'SixteenByteKey12'  # Ensure your key is the same

try:
    decrypted_data = decrypt_content(encrypted_data, key)
    print(f'Decrypted Data: {decrypted_data}')
    
    # Save the decrypted data to a JSON file
    with open('decrypted_data.json', 'w') as json_file:
        json.dump({'decrypted_content': decrypted_data}, json_file)
except Exception as e:
    print(f"Error during decryption: {e}")
