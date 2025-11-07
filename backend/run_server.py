#!/usr/bin/env python
"""
Simple script to run Django development server.
This ensures cross-platform compatibility when called from npm scripts.
"""
import os
import sys
import platform

# Fix Windows console encoding for emoji support
if platform.system() == 'Windows':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Activate virtual environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
venv_dir = os.path.join(backend_dir, 'venv')

if platform.system() == 'Windows':
    python_path = os.path.join(venv_dir, 'Scripts', 'python.exe')
    activate_script = os.path.join(venv_dir, 'Scripts', 'activate_this.py')
else:
    python_path = os.path.join(venv_dir, 'bin', 'python')
    activate_script = os.path.join(venv_dir, 'bin', 'activate_this.py')

# Add venv site-packages to path
if platform.system() == 'Windows':
    site_packages = os.path.join(venv_dir, 'Lib', 'site-packages')
else:
    python_version = f"python{sys.version_info.major}.{sys.version_info.minor}"
    site_packages = os.path.join(venv_dir, 'lib', python_version, 'site-packages')

if os.path.exists(site_packages):
    sys.path.insert(0, site_packages)

# Add the backend directory to Python path
sys.path.insert(0, backend_dir)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from django.core.management import execute_from_command_line
except ImportError as exc:
    print("=" * 70)
    print("ERROR: Couldn't import Django.")
    print("=" * 70)
    print("\nPlease ensure:")
    print("1. Python dependencies are installed: pip install -r requirements.txt")
    print("2. Virtual environment is activated")
    print(f"3. Virtual environment exists at: {venv_dir}")
    print("\nOr run: npm run setup:backend")
    print("=" * 70)
    sys.exit(1)

if __name__ == '__main__':
    # Run migrations first
    print("🔄 Running database migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        print("✅ Migrations complete")
    except Exception as e:
        print(f"⚠️  Warning: Migrations failed - {e}")
        print("   Continuing with server startup...\n")
    
    # Start the server
    print("\n🚀 Starting Django development server on http://localhost:8000")
    print("   Press Ctrl+C to stop the server\n")
    execute_from_command_line(['manage.py', 'runserver'])
