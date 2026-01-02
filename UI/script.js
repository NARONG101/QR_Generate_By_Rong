// QR Code Generator JavaScript

// DOM Elements
const qrTypeSelect = document.getElementById('qr-type');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const qrResult = document.querySelector('.qr-result');
const qrCodeContainer = document.getElementById('qr-code');
const loginBtn = document.getElementById('login-btn');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const userInitial = document.getElementById('user-initial');

// Form sections
const wifiForm = document.getElementById('wifi-form');
const urlForm = document.getElementById('url-form');
const phoneForm = document.getElementById('phone-form');
const emailForm = document.getElementById('email-form');
const smsForm = document.getElementById('sms-form');
const contactForm = document.getElementById('contact-form');
const imageForm = document.getElementById('image-form');
const textForm = document.getElementById('text-form');

// Current QR code data
let currentQrData = null;
let currentQrImage = null;

// Show the appropriate form based on QR type selection
qrTypeSelect.addEventListener('change', function() {
    const selectedType = qrTypeSelect.value;
    
    // Hide all forms
    wifiForm.style.display = 'none';
    urlForm.style.display = 'none';
    phoneForm.style.display = 'none';
    emailForm.style.display = 'none';
    smsForm.style.display = 'none';
    contactForm.style.display = 'none';
    imageForm.style.display = 'none';
    textForm.style.display = 'none';
    
    // Show the selected form
    if (selectedType === 'wifi') {
        wifiForm.style.display = 'block';
    } else if (selectedType === 'url') {
        urlForm.style.display = 'block';
    } else if (selectedType === 'phone') {
        phoneForm.style.display = 'block';
    } else if (selectedType === 'email') {
        emailForm.style.display = 'block';
    } else if (selectedType === 'sms') {
        smsForm.style.display = 'block';
    } else if (selectedType === 'contact') {
        contactForm.style.display = 'block';
    } else if (selectedType === 'image') {
        imageForm.style.display = 'block';
    } else if (selectedType === 'text') {
        textForm.style.display = 'block';
    }
});

// Setup image form radio buttons
function setupImageForm() {
    const radioButtons = document.querySelectorAll('input[name="image-source"]');
    const urlSection = document.getElementById('image-url-section');
    const uploadSection = document.getElementById('image-upload-section');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'url') {
                urlSection.style.display = 'block';
                uploadSection.style.display = 'none';
            } else if (this.value === 'upload') {
                urlSection.style.display = 'none';
                uploadSection.style.display = 'block';
            }
        });
    });
    
    // Initialize
    if (document.querySelector('input[name="image-source"]:checked').value === 'url') {
        urlSection.style.display = 'block';
        uploadSection.style.display = 'none';
    }
}

// Generate QR Code button click handler
generateBtn.addEventListener('click', generateQRCode);

// Download QR Code button click handler
downloadBtn.addEventListener('click', downloadQRCode);

// Login button click handler
if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
}

// Check for login credentials in the URL and display them
function checkLoginStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const password = urlParams.get('password');

    // Check if the credentials in the URL match the expected values
    if (email === 'rong@gmail.com' && password === '123456') {
        userInfo.style.display = 'flex';
        userEmail.textContent = email;
        // Extract the first letter of the email for the avatar
        const initial = email.charAt(0).toUpperCase();
        userInitial.textContent = initial;
        document.getElementById('qr-tools').style.display = 'block';
        document.getElementById('login-form-container').style.display = 'none';
    }
}

// Call the function when the page loads
checkLoginStatus();

// Function to generate QR code based on form data
function generateQRCode() {
    const qrType = qrTypeSelect.value;
    let qrData = '';
    
    try {
        if (qrType === 'wifi') {
            qrData = generateWifiQRData();
        } else if (qrType === 'url') {
            qrData = generateUrlQRData();
        } else if (qrType === 'phone') {
            qrData = generatePhoneQRData();
        } else if (qrType === 'email') {
            qrData = generateEmailQRData();
        } else if (qrType === 'sms') {
            qrData = generateSmsQRData();
        } else if (qrType === 'contact') {
            qrData = generateContactQRData();
        } else if (qrType === 'image') {
            qrData = generateImageQRData();
        } else if (qrType === 'text') {
            qrData = generateTextQRData();
        }
        
        if (!qrData) {
            throw new Error('Invalid input data');
        }
        
        // Store the QR data
        currentQrData = qrData;
        
        // Generate and display the QR code
        displayQRCode(qrData);
        
    } catch (error) {
        alert('Error generating QR code: ' + error.message);
        console.error('QR Generation Error:', error);
    }
}

// Function to generate Wi-Fi QR data
function generateWifiQRData() {
    const ssid = document.getElementById('wifi-ssid').value.trim();
    const auth = document.getElementById('wifi-auth').value;
    const password = document.getElementById('wifi-password').value;
    const hidden = document.getElementById('wifi-hidden').checked;
    
    if (!ssid) {
        throw new Error('SSID is required');
    }
    
    // Escape special characters
    const escapeVal = (s) => {
        return s.replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/:/g, '\\:')
                .replace(/"/g, '\\"');
    };
    
    const ssidEscaped = escapeVal(ssid);
    const passwordEscaped = escapeVal(password);
    
    let authField = auth.toUpperCase();
    if (authField === 'NONE') {
        authField = 'nopass';
        return `WIFI:T:${authField};S:${ssidEscaped};H:${hidden};;`;
    } else {
        return `WIFI:T:${authField};S:${ssidEscaped};P:${passwordEscaped};H:${hidden};;`;
    }
}

// Function to generate URL QR data
function generateUrlQRData() {
    let url = document.getElementById('url-input').value.trim();
    
    if (!url) {
        throw new Error('URL is required');
    }
    
    // Add https:// if no protocol is specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    return url;
}

// Function to generate Phone QR data
function generatePhoneQRData() {
    const phone = document.getElementById('phone-input').value.trim();
    
    if (!phone) {
        throw new Error('Phone number is required');
    }
    
    // Clean phone number
    const phoneClean = phone.replace(/[^\d+\-()]/g, '');
    
    return `tel:${phoneClean}`;
}

// Function to generate Email QR data
function generateEmailQRData() {
    const email = document.getElementById('email-address').value.trim();
    const subject = document.getElementById('email-subject').value.trim();
    const body = document.getElementById('email-body').value.trim();
    
    if (!email || !email.includes('@')) {
        throw new Error('Valid email address is required');
    }
    
    let emailData = `mailto:${email}`;
    
    if (subject) {
        emailData += `?subject=${encodeURIComponent(subject)}`;
        if (body) {
            emailData += `&body=${encodeURIComponent(body)}`;
        }
    } else if (body) {
        emailData += `?body=${encodeURIComponent(body)}`;
    }
    
    return emailData;
}

// Function to generate SMS QR data
function generateSmsQRData() {
    const phone = document.getElementById('sms-phone').value.trim();
    const message = document.getElementById('sms-message').value.trim();
    
    if (!phone) {
        throw new Error('Phone number is required');
    }
    
    // Clean phone number
    const phoneClean = phone.replace(/[^\d+\-()]/g, '');
    
    if (message) {
        return `smsto:${phoneClean}:${encodeURIComponent(message)}`;
    } else {
        return `smsto:${phoneClean}`;
    }
}

// Function to generate Contact QR data
function generateContactQRData() {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const organization = document.getElementById('contact-org').value.trim();
    
    if (!name) {
        throw new Error('Name is required');
    }
    
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n`;
    
    if (phone) {
        const phoneClean = phone.replace(/[^\d+\-()]/g, '');
        vcard += `TEL:${phoneClean}\n`;
    }
    
    if (email) {
        vcard += `EMAIL:${email}\n`;
    }
    
    if (organization) {
        vcard += `ORG:${organization}\n`;
    }
    
    vcard += 'END:VCARD';
    
    return vcard;
}

// Function to generate Image QR data
function generateImageQRData() {
    const imageUrl = document.getElementById('image-url').value.trim();
    const altText = document.getElementById('image-alt').value.trim();
    
    if (!imageUrl) {
        throw new Error('Image URL is required');
    }
    
    // Add https:// if no protocol is specified
    let url = imageUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // For QR codes, we should use the URL directly to avoid length issues
    // The alternative text can be stored separately if needed
    return url;
}

// Function to generate Text QR data
function generateTextQRData() {
    const text = document.getElementById('text-input').value.trim();
    
    if (!text) {
        throw new Error('Text is required');
    }
    
    return text;
}

// Function to display QR code
function displayQRCode(data) {
    // Clear previous QR code
    qrCodeContainer.innerHTML = '';
    
    // Create QR code using qrcode.js library with optimized settings
    try {
        const qrCode = new QRCode(qrCodeContainer, {
            text: data,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M  // Medium error correction for better data capacity
        });
        
        // Show the QR result section
        qrResult.style.display = 'block';
        
        // Store the QR code image by converting the QR code to a data URL
        setTimeout(() => {
            currentQrImage = convertQRCodeToImageData();
        }, 100);
        
    } catch (error) {
        console.error('QR Code generation failed:', error);
        qrCodeContainer.innerHTML = `<p style="color: red;">Error generating QR code. Please try again.</p>`;
        qrResult.style.display = 'block';
    }
}

// Function to convert QR code to image data
function convertQRCodeToImageData() {
    const qrCodeElement = qrCodeContainer.querySelector('canvas');
    if (qrCodeElement) {
        return qrCodeElement.toDataURL('image/png');
    }
    
    // Fallback: create a simple QR code representation
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = 'black';
    ctx.fillRect(50, 50, 100, 100);
    return canvas.toDataURL('image/png');
}

// Function to download QR code
function downloadQRCode() {
    if (!currentQrImage) {
        alert('No QR code to download. Please generate one first.');
        return;
    }

    const link = document.createElement('a');
    link.href = currentQrImage;
    link.download = `qr_code_${new Date().getTime()}.png`;
    link.click();
}

// Function to handle login
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // Simple validation for email format
    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Check if the credentials match the expected values
    if (email === 'rong@gmail.com' && password === '123456') {
        alert('Login successful! You can now use the QR Code Generator tools.');
        // Show user info and QR tools
        userInfo.style.display = 'flex';
        userEmail.textContent = email;
        // Extract the first letter of the email for the avatar
        const initial = email.charAt(0).toUpperCase();
        userInitial.textContent = initial;
        document.getElementById('qr-tools').style.display = 'block';
        document.getElementById('login-form-container').style.display = 'none';
    } else {
        alert('Invalid email or password. Please try again.');
    }

    console.log('Login attempt:', { email, password });
}