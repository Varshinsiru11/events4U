#!/bin/bash

echo "==================================="
echo "EventHub Backend Starter"
echo "==================================="
echo ""
echo "This script will start the EventHub backend server"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed"
    echo "Please install Python from https://www.python.org/downloads/"
    echo ""
    exit 1
fi

# Install required packages if not already installed
echo "Installing required packages..."
pip3 install flask flask-cors

# Run the backend server
echo ""
echo "Starting the backend server..."
echo ""
python3 eventhub_backend.py 