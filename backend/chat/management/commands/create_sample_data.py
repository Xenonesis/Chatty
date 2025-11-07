"""
Management command to create sample conversation data for testing.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from chat.models import Conversation, Message
from datetime import timedelta


class Command(BaseCommand):
    help = 'Creates sample conversation data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create sample conversations
        conversations_data = [
            {
                'title': 'Introduction to Python',
                'messages': [
                    ('user', 'What is Python and why should I learn it?'),
                    ('ai', 'Python is a high-level, interpreted programming language known for its simplicity and readability. You should learn it because it\'s versatile, has a large ecosystem of libraries, and is widely used in web development, data science, AI, and automation.'),
                    ('user', 'How do I get started?'),
                    ('ai', 'Start by installing Python from python.org, then learn the basics: variables, data types, control structures, and functions. Practice with small projects and gradually increase complexity.'),
                ]
            },
            {
                'title': 'Django Web Framework',
                'messages': [
                    ('user', 'Tell me about Django framework'),
                    ('ai', 'Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It follows the Model-View-Template (MVT) architectural pattern and comes with built-in features like an ORM, admin interface, and authentication.'),
                    ('user', 'What are its main features?'),
                    ('ai', 'Key features include: ORM for database operations, built-in admin panel, authentication system, URL routing, template engine, form handling, security features (CSRF, XSS protection), and scalability.'),
                    ('user', 'Is it good for beginners?'),
                    ('ai', 'Yes and no. Django has excellent documentation and includes everything you need, but it can be overwhelming at first. For absolute beginners, starting with Flask might be easier, but Django teaches you best practices from the start.'),
                ]
            },
            {
                'title': 'Machine Learning Basics',
                'messages': [
                    ('user', 'What is machine learning?'),
                    ('ai', 'Machine Learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed. It uses algorithms to identify patterns in data and make predictions or decisions.'),
                    ('user', 'What are the main types?'),
                    ('ai', 'There are three main types: 1) Supervised Learning (labeled data), 2) Unsupervised Learning (unlabeled data), and 3) Reinforcement Learning (learning through rewards and penalties).'),
                ]
            },
        ]

        for conv_data in conversations_data:
            # Create conversation
            conversation = Conversation.objects.create(
                title=conv_data['title'],
                status='ended',
                end_timestamp=timezone.now(),
                ai_summary=f"Discussion about {conv_data['title'].lower()} covering key concepts and practical applications."
            )

            # Create messages
            for i, (sender, content) in enumerate(conv_data['messages']):
                Message.objects.create(
                    conversation=conversation,
                    sender=sender,
                    content=content,
                    timestamp=conversation.start_timestamp + timedelta(minutes=i)
                )

            self.stdout.write(self.style.SUCCESS(f'Created conversation: {conversation.title}'))

        # Create one active conversation
        active_conv = Conversation.objects.create(
            title='Current Discussion',
            status='active'
        )
        Message.objects.create(
            conversation=active_conv,
            sender='user',
            content='Hello! I want to learn about web development.',
        )
        Message.objects.create(
            conversation=active_conv,
            sender='ai',
            content='Great! Web development involves creating websites and web applications. Would you like to focus on frontend, backend, or full-stack development?',
        )

        self.stdout.write(self.style.SUCCESS(f'Created active conversation: {active_conv.title}'))
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
