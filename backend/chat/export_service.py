"""
Service for exporting conversations in various formats.
"""
import json
from datetime import datetime
from typing import List, Dict
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from .models import Conversation, Message


class ExportService:
    """Service for exporting conversations in multiple formats."""
    
    @staticmethod
    def export_to_json(conversation: Conversation) -> str:
        """Export conversation to JSON format."""
        messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        
        data = {
            'conversation': {
                'id': conversation.id,
                'title': conversation.title,
                'start_timestamp': conversation.start_timestamp.isoformat(),
                'end_timestamp': conversation.end_timestamp.isoformat() if conversation.end_timestamp else None,
                'status': conversation.status,
                'summary': conversation.ai_summary,
                'metadata': conversation.metadata,
            },
            'messages': [
                {
                    'id': msg.id,
                    'sender': msg.sender,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat(),
                }
                for msg in messages
            ],
            'export_metadata': {
                'exported_at': datetime.now().isoformat(),
                'format': 'json',
                'version': '1.0'
            }
        }
        
        return json.dumps(data, indent=2)
    
    @staticmethod
    def export_to_markdown(conversation: Conversation) -> str:
        """Export conversation to Markdown format."""
        messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        
        md = f"# {conversation.title}\n\n"
        md += f"**Conversation ID:** {conversation.id}  \n"
        md += f"**Started:** {conversation.start_timestamp.strftime('%Y-%m-%d %H:%M:%S')}  \n"
        
        if conversation.end_timestamp:
            md += f"**Ended:** {conversation.end_timestamp.strftime('%Y-%m-%d %H:%M:%S')}  \n"
        
        md += f"**Status:** {conversation.status}  \n\n"
        
        if conversation.ai_summary:
            md += f"## Summary\n\n{conversation.ai_summary}\n\n"
        
        md += "---\n\n## Messages\n\n"
        
        for msg in messages:
            sender_emoji = "👤" if msg.sender == 'user' else "🤖"
            sender_label = "User" if msg.sender == 'user' else "AI Assistant"
            timestamp = msg.timestamp.strftime('%H:%M:%S')
            
            md += f"### {sender_emoji} {sender_label} - {timestamp}\n\n"
            md += f"{msg.content}\n\n"
            md += "---\n\n"
        
        md += f"\n*Exported on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
        
        return md
    
    @staticmethod
    def export_to_pdf(conversation: Conversation) -> BytesIO:
        """Export conversation to PDF format."""
        messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor='#2563eb',
            spaceAfter=30,
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor='#1e40af',
            spaceAfter=12,
        )
        
        user_style = ParagraphStyle(
            'UserMessage',
            parent=styles['Normal'],
            fontSize=11,
            leftIndent=20,
            rightIndent=20,
            spaceAfter=12,
            borderColor='#3b82f6',
            borderWidth=1,
            borderPadding=10,
        )
        
        ai_style = ParagraphStyle(
            'AIMessage',
            parent=styles['Normal'],
            fontSize=11,
            leftIndent=20,
            rightIndent=20,
            spaceAfter=12,
            borderColor='#10b981',
            borderWidth=1,
            borderPadding=10,
        )
        
        story = []
        
        # Title
        story.append(Paragraph(conversation.title or 'Untitled Conversation', title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Metadata
        metadata_text = f"<b>ID:</b> {conversation.id}<br/>"
        metadata_text += f"<b>Started:</b> {conversation.start_timestamp.strftime('%Y-%m-%d %H:%M:%S')}<br/>"
        if conversation.end_timestamp:
            metadata_text += f"<b>Ended:</b> {conversation.end_timestamp.strftime('%Y-%m-%d %H:%M:%S')}<br/>"
        metadata_text += f"<b>Status:</b> {conversation.status}<br/>"
        story.append(Paragraph(metadata_text, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Summary
        if conversation.ai_summary:
            story.append(Paragraph("Summary", heading_style))
            story.append(Paragraph(conversation.ai_summary, styles['Normal']))
            story.append(Spacer(1, 0.3*inch))
        
        # Messages
        story.append(Paragraph("Messages", heading_style))
        story.append(Spacer(1, 0.2*inch))
        
        for msg in messages:
            sender_label = "👤 User" if msg.sender == 'user' else "🤖 AI Assistant"
            timestamp = msg.timestamp.strftime('%H:%M:%S')
            
            header = f"<b>{sender_label}</b> - {timestamp}"
            story.append(Paragraph(header, styles['Heading3']))
            
            message_style = user_style if msg.sender == 'user' else ai_style
            story.append(Paragraph(msg.content, message_style))
            story.append(Spacer(1, 0.15*inch))
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        footer_text = f"<i>Exported on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</i>"
        story.append(Paragraph(footer_text, styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
