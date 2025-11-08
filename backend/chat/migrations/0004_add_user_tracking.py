"""
Migration to add user tracking to conversations.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_message_bookmarking_reactions_threading'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='user_id',
            field=models.CharField(default='default_user', max_length=255, db_index=True),
        ),
        migrations.AddIndex(
            model_name='conversation',
            index=models.Index(fields=['user_id', '-start_timestamp'], name='chat_conver_user_id_idx'),
        ),
    ]
