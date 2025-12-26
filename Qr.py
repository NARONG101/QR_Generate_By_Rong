#!/usr/bin/env python3
"""
qr_generator.py
Universal QR Code generator supporting multiple data types:
- Wi-Fi credentials
- URLs (Facebook, Instagram, etc.)
- Phone numbers
- Email addresses
- Text messages
- Contact information
- Requires: pip install qrcode qrcode_terminal
- Run: python qr_generator.py
"""

import qrcode
import qrcode_terminal
import re
from PIL import Image

def escape_val(s: str) -> str:
    # Escape characters that can break the WIFI: format
    return s.replace('\\', '\\\\') \
            .replace(';', r'\;') \
            .replace(',', r'\,') \
            .replace(':', r'\:') \
            .replace('"', r'\"')

def build_wifi_string(ssid: str, auth: str, password: str, hidden: bool) -> str:
    ssid_e = escape_val(ssid)
    pwd_e  = escape_val(password)
    auth_upper = auth.upper()
    if auth_upper not in ('WPA', 'WEP', 'NOPASS', 'NONE', ''):
        # default to WPA for unknown value
        auth_upper = 'WPA'
    # map some aliases
    if auth_upper in ('NONE','NOPASS',''):
        auth_field = 'nopass'
        # For no password, omit P: field entirely
        wifi = f'WIFI:T:{auth_field};S:{ssid_e};H:{"true" if hidden else "false"};;'
    else:
        wifi = f'WIFI:T:{auth_upper};S:{ssid_e};P:{pwd_e};H:{"true" if hidden else "false"};;'
    return wifi

def main():
    print("=" * 50)
    print("Universal QR Code Generator")
    print("=" * 50)
    print("\nSelect QR Code Type:")
    print("1. Wi-Fi Credentials")
    print("2. URL (Website, Facebook, Instagram, etc.)")
    print("3. Phone Number")
    print("4. Email Address")
    print("5. SMS (Text Message)")
    print("6. Contact Information (vCard)")
    print("7. Plain Text")
    
    choice = input("\nEnter your choice (1-7): ").strip()
    
    if choice == "1":
        generate_wifi_qr()
    elif choice == "2":
        generate_url_qr()
    elif choice == "3":
        generate_phone_qr()
    elif choice == "4":
        generate_email_qr()
    elif choice == "5":
        generate_sms_qr()
    elif choice == "6":
        generate_contact_qr()
    elif choice == "7":
        generate_text_qr()
    else:
        print("Invalid choice. Please try again.")
        main()

def generate_wifi_qr():
    print("\n--- Wi-Fi QR Code Generator ---")
    ssid = input("SSID (network name): ").strip()
    if not ssid:
        print("SSID required. Exiting.")
        return

    print("Authentication type: [WPA] / [WEP] / [NONE]")
    auth = input("Auth (default WPA): ").strip() or "WPA"
    if auth.lower() in ('none','nopass','no',''):
        password = ""
    else:
        # Show password as it is typed
        password = input("Password: ")

    hidden_in = input("Hidden SSID? (y/N): ").strip().lower()
    hidden = hidden_in in ('y','yes','true','1')

    wifi_string = build_wifi_string(ssid, auth, password, hidden)
    generate_and_save_qr(wifi_string, "wifi_qr")

def generate_url_qr():
    print("\n--- URL QR Code Generator ---")
    url = input("Enter URL (e.g., https://www.facebook.com/yourpage): ").strip()
    if not url:
        print("URL required. Exiting.")
        return
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    generate_and_save_qr(url, "url_qr")

def generate_phone_qr():
    print("\n--- Phone Number QR Code Generator ---")
    phone = input("Enter phone number (e.g., +1234567890): ").strip()
    if not phone:
        print("Phone number required. Exiting.")
        return
    
    # Validate and clean phone number
    phone_clean = re.sub(r'[^\d+\-()]', '', phone)
    phone_data = f"tel:{phone_clean}"
    generate_and_save_qr(phone_data, "phone_qr")

def generate_email_qr():
    print("\n--- Email QR Code Generator ---")
    email = input("Enter email address: ").strip()
    if not email or '@' not in email:
        print("Invalid email address. Exiting.")
        return
    
    subject = input("Email subject (optional): ").strip()
    body = input("Email body/message (optional): ").strip()
    
    email_data = f"mailto:{email}"
    if subject:
        email_data += f"?subject={subject}"
        if body:
            email_data += f"&body={body}"
    elif body:
        email_data += f"?body={body}"
    
    generate_and_save_qr(email_data, "email_qr")

def generate_sms_qr():
    print("\n--- SMS/Text Message QR Code Generator ---")
    phone = input("Enter phone number: ").strip()
    if not phone:
        print("Phone number required. Exiting.")
        return
    
    message = input("Enter message (optional): ").strip()
    phone_clean = re.sub(r'[^\d+\-()]', '', phone)
    
    if message:
        sms_data = f"smsto:{phone_clean}:{message}"
    else:
        sms_data = f"smsto:{phone_clean}"
    
    generate_and_save_qr(sms_data, "sms_qr")

def generate_contact_qr():
    print("\n--- Contact Information (vCard) QR Code Generator ---")
    name = input("Full name: ").strip()
    if not name:
        print("Name required. Exiting.")
        return
    
    phone = input("Phone number (optional): ").strip()
    email = input("Email address (optional): ").strip()
    organization = input("Organization (optional): ").strip()
    
    vcard = f"BEGIN:VCARD\nVERSION:3.0\nFN:{name}\n"
    if phone:
        phone_clean = re.sub(r'[^\d+\-()]', '', phone)
        vcard += f"TEL:{phone_clean}\n"
    if email:
        vcard += f"EMAIL:{email}\n"
    if organization:
        vcard += f"ORG:{organization}\n"
    vcard += "END:VCARD"
    
    generate_and_save_qr(vcard, "contact_qr")

def generate_text_qr():
    print("\n--- Plain Text QR Code Generator ---")
    text = input("Enter text: ").strip()
    if not text:
        print("Text required. Exiting.")
        return
    
    generate_and_save_qr(text, "text_qr")

def generate_and_save_qr(data: str, filename_prefix: str):
    """Generate QR code and save as PNG and display ASCII version"""
    try:
        # Generate PNG file with optimized sizing
        filename = f"{filename_prefix}.png"
        qr = qrcode.QRCode(
            version=1,  # Controls the size of the QR code
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
            box_size=10,  # Size of each box in pixels (fixed size)
            border=4,  # Border size in boxes
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Resize image to a reasonable fixed size (400x400 pixels)
        img = img.resize((200, 200), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else 1)
        img.save(filename)
        print(f"\n✓ Saved QR image to: {filename}")
        print(f"  Size: 200x200 pixels")

        # Print ASCII QR in the terminal
        print("\nASCII QR Code (scan from screen):\n")
        qrcode_terminal.draw(data)

        print("\nDone! Scan the PNG or the terminal QR with your phone's camera or QR app.")
    except Exception as e:
        print(f"Error generating QR code: {e}")

if __name__ == "__main__":
    main()
