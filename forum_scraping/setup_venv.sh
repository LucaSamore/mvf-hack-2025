#!/bin/bash

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install requests beautifulsoup4

# Print confirmation
echo "Virtual environment created and packages installed!"
echo "To activate the virtual environment, run: source venv/bin/activate" 