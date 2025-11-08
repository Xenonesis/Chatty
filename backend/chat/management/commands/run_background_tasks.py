"""
Management command to run background tasks.
"""
from django.core.management.base import BaseCommand
from chat.background_tasks import BackgroundTaskService


class Command(BaseCommand):
    help = 'Run background tasks for conversation processing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--task',
            type=str,
            default='all',
            help='Specific task to run: summarize, cleanup, analyze, or all'
        )

    def handle(self, *args, **options):
        task = options['task']
        
        if task in ['summarize', 'all']:
            self.stdout.write('Running auto-summarization...')
            BackgroundTaskService.auto_summarize_conversations()
            self.stdout.write(self.style.SUCCESS('✓ Auto-summarization complete'))
        
        if task in ['cleanup', 'all']:
            self.stdout.write('Running cleanup...')
            BackgroundTaskService.cleanup_old_conversations()
            self.stdout.write(self.style.SUCCESS('✓ Cleanup complete'))
        
        if task in ['analyze', 'all']:
            self.stdout.write('Running pattern analysis...')
            BackgroundTaskService.analyze_user_patterns()
            self.stdout.write(self.style.SUCCESS('✓ Pattern analysis complete'))
        
        self.stdout.write(self.style.SUCCESS('All background tasks completed!'))
