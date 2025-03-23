try:
    from flask import Flask
    print("Flask imported successfully!")
    
    app = Flask(__name__)
    
    @app.route('/')
    def hello():
        return "Hello, EventHub!"
    
    if __name__ == '__main__':
        print("Starting test server...")
        app.run(debug=True, port=5000)
        
except ImportError as e:
    print(f"ERROR: {e}")
    print("\nPlease install Flask with the following command:")
    print("pip install flask") 