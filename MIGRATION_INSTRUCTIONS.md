# Database Migration Instructions

## Important: New Features Require Database Migration

The following new features have been added and require database schema updates:

1. **Message Reactions**
2. **Message Bookmarking**
3. **Message Threading/Branching**

## Migration Steps

### Step 1: Ensure Backend Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if you have one)
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 2: Install New Dependency

```bash
pip install reportlab
```

### Step 3: Run Migration

```bash
# Create migration file (if needed)
python manage.py makemigrations chat

# Apply migration
python manage.py migrate
```

### Expected Output

You should see something like:

```
Operations to perform:
  Apply all migrations: admin, auth, chat, contenttypes, sessions
Running migrations:
  Applying chat.0003_message_bookmarking_reactions_threading... OK
```

## What Gets Added to Database

The migration adds these fields to the `Message` model:

```python
# Reactions - stores count of each reaction type
reactions = JSONField(default=dict, blank=True)

# Bookmarking
is_bookmarked = BooleanField(default=False)
bookmarked_at = DateTimeField(blank=True, null=True)

# Threading/Branching
parent_message = ForeignKey('self', on_delete=SET_NULL, null=True, blank=True)
```

## Troubleshooting

### Issue: "No module named 'django'"

**Solution**: Make sure you're in the backend directory and have activated your virtual environment.

```bash
cd backend
# Install dependencies
pip install -r requirements.txt
```

### Issue: Migration already exists

**Solution**: Just run `python manage.py migrate` to apply it.

### Issue: reportlab installation fails

**Solution**: Try installing with specific version:
```bash
pip install reportlab==4.0.4
```

## Verify Migration Success

After migration, verify in Django shell:

```bash
python manage.py shell
```

```python
from chat.models import Message
# Check if new fields exist
Message._meta.get_field('reactions')
Message._meta.get_field('is_bookmarked')
Message._meta.get_field('parent_message')
# If no errors, migration was successful!
exit()
```

## Next Steps After Migration

1. Restart your backend server
2. Test new features:
   - Try bookmarking a message
   - Add a reaction to a message
   - View analytics dashboard
   - Export a conversation
   - Create a share link

## Important Notes

- **Existing data is safe**: The migration only adds new fields with default values
- **No data loss**: All existing conversations and messages remain unchanged
- **Backward compatible**: Old API calls still work as before
- **New features are optional**: The app works fine even if you don't use the new features

## If You Encounter Issues

If you face any issues during migration:

1. Backup your database first (if you have important data)
2. Check backend logs for detailed error messages
3. Ensure all dependencies are installed: `pip install -r requirements.txt`
4. Make sure you're using Python 3.8 or higher
