"""
Management command to verify database integrity for conversations and messages.
"""
from django.core.management.base import BaseCommand
from chat.models import Conversation, Message
from django.db.models import Count


class Command(BaseCommand):
    help = 'Verify database integrity and show conversation/message statistics'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('DATABASE INTEGRITY VERIFICATION'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        
        # Get overall statistics
        total_conversations = Conversation.objects.count()
        total_messages = Message.objects.count()
        
        self.stdout.write(f'\n📊 Overall Statistics:')
        self.stdout.write(f'   Total Conversations: {total_conversations}')
        self.stdout.write(f'   Total Messages: {total_messages}')
        
        # Conversations with and without messages
        convs_with_messages = Conversation.objects.annotate(
            msg_count=Count('messages')
        ).filter(msg_count__gt=0)
        
        convs_without_messages = Conversation.objects.annotate(
            msg_count=Count('messages')
        ).filter(msg_count=0)
        
        self.stdout.write(f'\n📝 Conversation Analysis:')
        self.stdout.write(self.style.SUCCESS(
            f'   ✓ Conversations with messages: {convs_with_messages.count()}'
        ))
        
        if convs_without_messages.count() > 0:
            self.stdout.write(self.style.WARNING(
                f'   ⚠ Conversations without messages: {convs_without_messages.count()}'
            ))
            self.stdout.write(self.style.WARNING(
                '     (These are empty conversation shells that may need cleanup)'
            ))
        
        # Show detailed information for conversations
        self.stdout.write(f'\n📋 Conversation Details:')
        
        all_conversations = Conversation.objects.annotate(
            msg_count=Count('messages')
        ).order_by('-start_timestamp')
        
        for conv in all_conversations:
            status_icon = '✓' if conv.msg_count > 0 else '✗'
            status_color = self.style.SUCCESS if conv.msg_count > 0 else self.style.WARNING
            
            self.stdout.write(status_color(
                f'   {status_icon} ID {conv.id}: "{conv.title}" '
                f'({conv.msg_count} messages, {conv.status})'
            ))
            
            # Show first and last message for conversations with messages
            if conv.msg_count > 0:
                first_msg = conv.messages.first()
                last_msg = conv.messages.last()
                
                first_preview = first_msg.content[:50] + '...' if len(first_msg.content) > 50 else first_msg.content
                self.stdout.write(f'      First: [{first_msg.sender}] {first_preview}')
                
                if conv.msg_count > 1:
                    last_preview = last_msg.content[:50] + '...' if len(last_msg.content) > 50 else last_msg.content
                    self.stdout.write(f'      Last:  [{last_msg.sender}] {last_preview}')
        
        # Check for orphaned messages (shouldn't happen with CASCADE delete)
        orphaned_messages = Message.objects.filter(conversation__isnull=True).count()
        if orphaned_messages > 0:
            self.stdout.write(self.style.ERROR(
                f'\n❌ WARNING: Found {orphaned_messages} orphaned messages!'
            ))
        
        # Verify message count consistency
        self.stdout.write(f'\n🔍 Verifying message count consistency...')
        inconsistencies = 0
        
        for conv in Conversation.objects.all():
            db_count = conv.messages.count()
            method_count = conv.get_message_count()
            
            if db_count != method_count:
                inconsistencies += 1
                self.stdout.write(self.style.ERROR(
                    f'   ❌ Conversation {conv.id}: DB count ({db_count}) != '
                    f'Method count ({method_count})'
                ))
        
        if inconsistencies == 0:
            self.stdout.write(self.style.SUCCESS('   ✓ All message counts are consistent'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 70))
        
        if convs_without_messages.count() == 0 and orphaned_messages == 0 and inconsistencies == 0:
            self.stdout.write(self.style.SUCCESS('✅ DATABASE INTEGRITY: EXCELLENT'))
            self.stdout.write(self.style.SUCCESS('   All conversations have messages and data is consistent'))
        elif convs_without_messages.count() > 0 and orphaned_messages == 0 and inconsistencies == 0:
            self.stdout.write(self.style.WARNING('⚠️  DATABASE INTEGRITY: GOOD'))
            self.stdout.write(self.style.WARNING(
                f'   {convs_without_messages.count()} empty conversations exist but no data corruption'
            ))
        else:
            self.stdout.write(self.style.ERROR('❌ DATABASE INTEGRITY: NEEDS ATTENTION'))
            self.stdout.write(self.style.ERROR('   Data inconsistencies or corruption detected'))
        
        self.stdout.write(self.style.SUCCESS('=' * 70))
