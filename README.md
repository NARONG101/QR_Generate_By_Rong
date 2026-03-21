# QR Code Generator

A universal QR code generator that supports multiple data types, available as both a web interface and command-line tool.

## Features

- **Wi-Fi Credentials**: Generate QR codes for Wi-Fi network access
- **URLs**: Create QR codes for websites and links
- **Phone Numbers**: Direct dial QR codes
- **Email Addresses**: Mailto QR codes with optional subject and body
- **SMS**: Text message QR codes
- **Contact Information**: vCard format QR codes
- **Plain Text**: Simple text QR codes

## Requirements

- Python 3.x
- Required packages: `qrcode`, `qrcode_terminal`, `Pillow`

Install dependencies:
```bash
pip install qrcode qrcode_terminal pillow
```

## Usage

### Web Interface

1. Navigate to the `UI` folder
2. Start a local server:
   ```bash
   cd UI
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser
4. Select QR type and fill in the details
5. Generate and download your QR code

### Command-Line Tool

Run interactively:
```bash
python Qr.py
```

Or use command-line arguments for automation:

#### Wi-Fi QR Code
```bash
python Qr.py --type wifi --ssid "MyNetwork" --password "mypass" --auth WPA
```

#### URL QR Code
```bash
python Qr.py --type url --url "https://example.com" --output my_qr
```

#### Phone Number
```bash
python Qr.py --type phone --phone "+1234567890"
```

#### Email
```bash
python Qr.py --type email --email "user@example.com" --subject "Hello" --body "Message"
```

#### SMS
```bash
python Qr.py --type sms --sms-phone "+1234567890" --message "Hello!"
```

#### Contact (vCard)
```bash
python Qr.py --type contact --name "John Doe" --contact-phone "+1234567890" --contact-email "john@example.com"
```

#### Plain Text
```bash
python Qr.py --type text --text "Hello World"
```

## Output

- PNG image file (200x200 pixels)
- ASCII representation in terminal
- Custom filename with `--output` parameter

## Project Structure

```
QR_Code_Generater/
├── Qr.py              # Main Python script
├── docs/              # Web interface (for GitHub Pages)
│   ├── index.html     # Main web page
│   ├── script.js      # JavaScript functionality
│   └── styles.css     # Styling
└── README.md          # This file
```

## Host on GitHub (GitHub Pages)

To host your QR Code Generator UI online:

1. Push this project to a GitHub repository
2. Go to **Settings** → **Pages** (in your repo)
3. Under **Build and deployment**:
   - Source: Select **Deploy from a branch**
   - Branch: Select **main** (or master) and folder: **/(root)**
   - Click **Save**
4. Wait 1-2 minutes, then your site will be available at:
   `https://yourusername.github.io/repository-name`

**Note:** The `docs` folder contains the web interface files for GitHub Pages.