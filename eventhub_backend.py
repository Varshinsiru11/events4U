from flask import Flask, request, jsonify, redirect, session, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'eventhub_secret_key'
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow cross-origin requests from any origin

# In-memory database for development
event_db = {}
booking_db = {}
user_db = {}
session_db = {}

# Sample data initialization
def initialize_sample_data():
    # Sample events
    event_db['event1'] = {
        'id': 'event1',
        'name': 'Music Festival 2025',
        'date': '2025-07-15',
        'time': '19:00',
        'venue': 'Grand Arena',
        'location': 'New York',
        'price': 50.00,
        'description': 'Join us for the biggest music festival of the year featuring top artists!',
        'image': 'music_festival.jpg'
    }
    
    event_db['event2'] = {
        'id': 'event2',
        'name': 'Tech Conference 2025',
        'date': '2025-09-20',
        'time': '10:00',
        'venue': 'Tech Center',
        'location': 'San Francisco',
        'price': 120.00,
        'description': 'Experience the latest in technology with industry leaders and innovators!',
        'image': 'tech_conference.jpg'
    }
    
    # Sample user
    user_db['user1'] = {
        'id': 'user1',
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '123-456-7890',
        'password': 'hashed_password'  # In a real app, this would be properly hashed
    }
    
    print("Sample data initialized")

# Initialize data
initialize_sample_data()

# API Endpoints for Session Management
@app.route('/api/session', methods=['POST'])
def create_session():
    session_id = str(uuid.uuid4())
    session_data = {}
    session_db[session_id] = session_data
    return jsonify({
        'success': True,
        'session_id': session_id
    })

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    if session_id not in session_db:
        return jsonify({
            'success': False,
            'message': 'Session not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': session_db[session_id]
    })

@app.route('/api/session/<session_id>', methods=['PUT'])
def update_session(session_id):
    if session_id not in session_db:
        return jsonify({
            'success': False,
            'message': 'Session not found'
        }), 404
    
    data = request.json
    session_db[session_id].update(data)
    
    return jsonify({
        'success': True,
        'data': session_db[session_id]
    })

# API Endpoints for Events
@app.route('/api/events', methods=['GET'])
def get_events():
    return jsonify({
        'success': True,
        'data': list(event_db.values())
    })

@app.route('/api/events/<event_id>', methods=['GET'])
def get_event(event_id):
    if event_id not in event_db:
        return jsonify({
            'success': False,
            'message': 'Event not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': event_db[event_id]
    })

# API Endpoints for Booking Flow
@app.route('/api/booking/seats', methods=['POST'])
def save_seat_selection():
    data = request.json
    session_id = data.get('session_id')
    selected_seats = data.get('selected_seats', [])
    event_id = data.get('event_id')
    
    if not session_id or session_id not in session_db:
        return jsonify({
            'success': False,
            'message': 'Invalid session'
        }), 400
    
    if not event_id or event_id not in event_db:
        return jsonify({
            'success': False,
            'message': 'Invalid event'
        }), 400
    
    # Calculate pricing
    event = event_db[event_id]
    base_price = event['price']
    
    # Calculate pricing for each seat type
    subtotal = 0
    seat_type_totals = {
        'Standard': {'count': 0, 'total': 0},
        'Premium': {'count': 0, 'total': 0},
        'VIP': {'count': 0, 'total': 0}
    }
    
    for seat in selected_seats:
        seat_type = seat.get('type', 'Standard')
        seat_price = seat.get('price', base_price)
        
        seat_type_totals[seat_type]['count'] += 1
        seat_type_totals[seat_type]['total'] += seat_price
        subtotal += seat_price
    
    # Calculate booking fee and total
    booking_fee_percent = 10
    booking_fee = subtotal * (booking_fee_percent / 100)
    total_price = subtotal + booking_fee
    
    # Create a booking record
    booking_id = str(uuid.uuid4())
    booking = {
        'id': booking_id,
        'event_id': event_id,
        'session_id': session_id,
        'selected_seats': selected_seats,
        'pricing': {
            'subtotal': subtotal,
            'booking_fee_percent': booking_fee_percent,
            'booking_fee': booking_fee,
            'total_price': total_price,
            'seat_type_totals': seat_type_totals
        },
        'status': 'pending',
        'created_at': datetime.now().isoformat()
    }
    
    booking_db[booking_id] = booking
    
    # Update session with booking info
    session_db[session_id]['current_booking'] = booking_id
    session_db[session_id]['selected_seats'] = selected_seats
    session_db[session_id]['pricing_info'] = booking['pricing']
    
    return jsonify({
        'success': True,
        'booking_id': booking_id,
        'redirect': '/payment-method/index.html',
        'data': booking
    })

@app.route('/api/booking/payment', methods=['POST'])
def process_payment():
    data = request.json
    session_id = data.get('session_id')
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method')
    
    if not session_id or session_id not in session_db:
        return jsonify({
            'success': False,
            'message': 'Invalid session'
        }), 400
    
    if not booking_id or booking_id not in booking_db:
        return jsonify({
            'success': False,
            'message': 'Invalid booking'
        }), 400
    
    # Simulate payment processing
    booking = booking_db[booking_id]
    
    # Update booking status
    booking['status'] = 'paid'
    booking['payment'] = {
        'method': payment_method,
        'transaction_id': f'TXN{uuid.uuid4().hex[:8].upper()}',
        'amount': booking['pricing']['total_price'],
        'timestamp': datetime.now().isoformat()
    }
    
    # Update session with payment info
    session_db[session_id]['transaction_info'] = booking['payment']
    
    return jsonify({
        'success': True,
        'redirect': '/ticket/index.html',
        'transaction_id': booking['payment']['transaction_id'],
        'data': booking
    })

# API Endpoints for Backend-Assisted Redirects
@app.route('/api/redirect/to-payment', methods=['POST'])
def redirect_to_payment():
    data = request.json
    session_id = data.get('session_id')
    selected_seats = data.get('selected_seats', [])
    
    if not session_id or session_id not in session_db:
        return jsonify({
            'success': False,
            'message': 'Invalid session'
        }), 400
    
    # Store data in session
    session_db[session_id]['selected_seats'] = selected_seats
    
    # Return the redirect URL
    return jsonify({
        'success': True,
        'redirect_url': '../payment-method/index.html'
    })

@app.route('/redirect/<path>', methods=['GET'])
def redirect_proxy(path):
    # This endpoint serves as a server-side redirect
    # It can solve client-side navigation issues
    valid_paths = {
        'payment': '../payment-method/index.html',
        'ticket': '../ticket/index.html',
        'dashboard': '../event-dashboard/index.html'
    }
    
    if path not in valid_paths:
        return jsonify({
            'success': False,
            'message': 'Invalid redirect path'
        }), 400
    
    return redirect(valid_paths[path])

# Serve Static Files
@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory('.', filename)
    except Exception as e:
        return str(e), 404

@app.route('/')
def serve_index():
    try:
        return send_from_directory('.', 'index.html')
    except Exception as e:
        return str(e), 404

# Add a test route to verify the server is running
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({
        'success': True,
        'message': 'EventHub API is running!',
        'timestamp': datetime.now().isoformat()
    })

# Main function to run the server
if __name__ == '__main__':
    print("=" * 50)
    print("EventHub Backend Server")
    print("=" * 50)
    print("Starting server on http://127.0.0.1:5000")
    print("Press Ctrl+C to stop the server")
    print("\nAPI Endpoints:")
    print("- Session: /api/session")
    print("- Events: /api/events")
    print("- Booking: /api/booking/seats, /api/booking/payment")
    print("- Redirects: /redirect/<path>, /api/redirect/to-payment")
    print("- Test: /api/test")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000) 