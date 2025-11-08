"""
Simple scheduler for running background tasks periodically.
Run this script to enable automatic conversation summarization.
"""
import os
import sys
import django
import time
import schedule
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chat.background_tasks import BackgroundTaskService


def run_auto_summarization():
    """Run auto-summarization task."""
    print(f"[{datetime.now()}] Running auto-summarization...")
    try:
        BackgroundTaskService.auto_summarize_conversations()
        print(f"[{datetime.now()}] ✓ Auto-summarization complete")
    except Exception as e:
        print(f"[{datetime.now()}] ✗ Auto-summarization failed: {str(e)}")


def run_pattern_analysis():
    """Run pattern analysis task."""
    print(f"[{datetime.now()}] Running pattern analysis...")
    try:
        BackgroundTaskService.analyze_user_patterns()
        print(f"[{datetime.now()}] ✓ Pattern analysis complete")
    except Exception as e:
        print(f"[{datetime.now()}] ✗ Pattern analysis failed: {str(e)}")


def run_cleanup():
    """Run cleanup task."""
    print(f"[{datetime.now()}] Running cleanup...")
    try:
        BackgroundTaskService.cleanup_old_conversations()
        print(f"[{datetime.now()}] ✓ Cleanup complete")
    except Exception as e:
        print(f"[{datetime.now()}] ✗ Cleanup failed: {str(e)}")


if __name__ == '__main__':
    print("=" * 60)
    print("ChattyAI Background Task Scheduler")
    print("=" * 60)
    print("Starting scheduler...")
    print("- Auto-summarization: Every 30 minutes")
    print("- Pattern analysis: Every 2 hours")
    print("- Cleanup: Daily at 2:00 AM")
    print("=" * 60)
    
    # Schedule tasks
    schedule.every(30).minutes.do(run_auto_summarization)
    schedule.every(2).hours.do(run_pattern_analysis)
    schedule.every().day.at("02:00").do(run_cleanup)
    
    # Run initial tasks
    print("\nRunning initial tasks...")
    run_auto_summarization()
    
    # Keep running
    print("\nScheduler is running. Press Ctrl+C to stop.\n")
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n\nScheduler stopped.")
