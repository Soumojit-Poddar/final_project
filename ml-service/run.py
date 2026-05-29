from app import create_app
import os

print("=" * 50)
print("🚀 Starting ML Service...")
print("=" * 50)

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"\n📊 Configuration:")
    print(f"   Port: {port}")
    print(f"   Debug: {debug}")
    print(f"   Environment: {os.getenv('FLASK_ENV', 'production')}")
    
    print(f"\n📍 Registered Routes:")
    with app.app_context():
        for rule in app.url_map.iter_rules():
            methods = ','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
            print(f"   [{methods:6}] {rule.rule}")
    
    print(f"\n✅ ML Service ready!")
    print(f"🌐 Access at: http://localhost:{port}")
    print("=" * 50)
    print()
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )