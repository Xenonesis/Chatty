# Generated migration for new Message fields

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_conversationinsight_learningevent_userintelligence'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='reactions',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='message',
            name='is_bookmarked',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='message',
            name='bookmarked_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='parent_message',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='replies',
                to='chat.message'
            ),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['is_bookmarked'], name='chat_messag_is_book_idx'),
        ),
    ]
