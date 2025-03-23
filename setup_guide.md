# EventHub Backend Setup Guide

This guide provides step-by-step instructions for setting up and running the EventHub backend server to fix the seat-booking to payment-method redirection issue.

## Quick Start

### Windows Users

1. Double-click on `run_backend.bat`
2. Wait for the server to start
3. The server will be available at http://127.0.0.1:5000

### Mac/Linux Users

1. Open Terminal
2. Navigate to the project directory
3. Run: `chmod +x run_backend.sh`
4. Run: `./run_backend.sh`
5. The server will be available at http://127.0.0.1:5000

## Manual Setup

If the scripts don't work, follow these manual steps:

1. **Install Python 3.6+**:

   - Download from [python.org](https://www.python.org/downloads/)
   - Make sure to check "Add Python to PATH" during installation (Windows)

2. **Install Required Packages**:

   ```
   pip install flask flask-cors
   ```

3. **Run the Backend Server**:

   - Windows: `python eventhub_backend.py`
   - Mac/Linux: `python3 eventhub_backend.py`

4. **Verify the Server is Running**:
   - Open your browser and navigate to: http://127.0.0.1:5000/api/test
   - You should see a JSON response confirming the server is running

## Troubleshooting

### Common Issues:

1. **"Module not found" error**:

   - Make sure you've installed all required packages: `pip install flask flask-cors`

2. **Port already in use**:

   - Check if another program is using port 5000
   - You can change the port in the `eventhub_backend.py` file (look for `app.run`)

3. **CORS issues**:

   - If you see CORS errors in the browser console, make sure the backend is running and properly configured

4. **Connection refused**:
   - Make sure the server is running
   - Check that you're using the correct URL (http://127.0.0.1:5000)
   - Ensure your firewall isn't blocking the connection

## Testing the Integration

1. Start the backend server using the steps above
2. Open `test_backend.html` in your browser
3. Click the buttons to test various API endpoints
4. If all tests pass, proceed to the integration

## Integrating with the Frontend

1. Replace the `proceedToPayment` function in `seat-booking/script.js` with the code from `seat_booking_integration.js`
2. Make sure the `apiUrl` in the integration code points to http://127.0.0.1:5000
3. Test the complete flow:
   - Navigate to the seat-booking page
   - Select some seats
   - Click "Continue to Payment"
   - The backend should handle the redirection to the payment page

## Advanced Options

To make the backend serve your static files directly:

1. Place all your HTML, CSS, and JS files in the same directory as the backend script
2. Access your website through http://127.0.0.1:5000/
3. The backend will serve your frontend files and handle the API endpoints

## Need Help?

If you encounter any issues:

1. Make sure the backend server is running (look for console output)
2. Check the browser console for any errors (press F12)
3. Verify network requests in the browser's Network tab (press F12)
