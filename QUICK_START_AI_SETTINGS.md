# Quick Start: AI Settings with Auto-Fetch Models

## 🚀 Setup in 3 Minutes

### Step 1: Open Settings (10 seconds)
```
1. Start the application (npm run dev)
2. Click the ⚙️ Settings icon in top-right corner
3. Settings modal opens
```

### Step 2: Configure Provider (1 minute)

#### Option A: OpenAI (Recommended for testing)
```
1. Select "OpenAI (GPT-4, GPT-3.5)"
2. Paste your API key: sk-proj-...
3. Wait 1 second - models auto-fetch automatically!
4. See: ✅ API key is valid! Found 15 models.
5. Select model from dropdown (e.g., gpt-4-turbo-preview)
6. Click "Save Settings"
```

#### Option B: LM Studio (Best for local/offline)
```
1. Start LM Studio application
2. Go to "Local Server" tab → Start Server
3. In ChatSumm settings, select "LM Studio (Local)"
4. Enter URL: http://localhost:1234/v1
5. Wait 1 second - models auto-fetch automatically!
6. See: ✅ Connected to LM Studio! Found X local models.
7. Select your loaded model
8. Click "Save Settings"
```

#### Option C: Anthropic Claude
```
1. Select "Anthropic (Claude)"
2. Paste your API key: sk-ant-...
3. Wait 1 second - models auto-fetch automatically!
4. See: ✅ API key is valid! Available models loaded.
5. Select model (claude-3-opus, sonnet, or haiku)
6. Click "Save Settings"
```

#### Option D: Google Gemini
```
1. Select "Google (Gemini)"
2. Paste your API key: AIza...
3. Wait 1 second - models auto-fetch automatically!
4. See: ✅ API key is valid! Found X models.
5. Select model (gemini-pro recommended)
6. Click "Save Settings"
```

### Step 3: Start Chatting (30 seconds)
```
1. Go to "Chat" tab
2. Click "New Chat" (if needed)
3. Type your message
4. Click "Send"
5. AI responds using your configured provider!
```

## 📊 What You'll See

### During Auto-Fetch (after typing):
```
🔄 Validating API key and fetching models...
[Spinner animation]
```

### On Success:
```
✅ API key is valid! Found 15 models.

[Dropdown now enabled with models:]
▼ Select a model
  gpt-4-turbo-preview
  gpt-4
  gpt-4-32k
  gpt-3.5-turbo
  gpt-3.5-turbo-16k
  ...
```

### On Error:
```
❌ Invalid API key: Authentication failed

[Dropdown remains disabled]
Enter API key to fetch models
```

## 🎯 Common Scenarios

### Scenario 1: Testing Different Models
```
1. API key auto-validates and fetches all models
2. Try different models from dropdown
3. No need to re-fetch
4. Save after each change
```

### Scenario 2: Switching Providers
```
1. Select new provider
2. Enter new credentials
3. Wait 1 second - auto-validates
4. Select model from new list
5. Save
```

### Scenario 3: API Key Expired
```
1. Old validation shows error
2. Get new API key from provider
3. Paste new key
4. System auto-validates after 1 second
5. Success! Models loaded automatically
```

## 🔍 Visual Guide

```
┌─────────────────────────────────────────┐
│  AI Settings                      [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Select AI Provider                     │
│  ┌───────────┐  ┌───────────┐         │
│  │ OpenAI ✓  │  │ Anthropic │         │
│  └───────────┘  └───────────┘         │
│  ┌───────────┐  ┌───────────┐         │
│  │  Google   │  │ LM Studio │         │
│  └───────────┘  └───────────┘         │
│                                         │
│  OpenAI Configuration                   │
│  ┌─────────────────────────────────┐   │
│  │ API Key *                       │   │
│  │ [sk-proj-abc123...]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🔄 Validating API key and fetching... │
│                                         │
│  ✅ API key is valid! Found 15 models. │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Model                           │   │
│  │ ▼ gpt-4-turbo-preview          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ℹ️ How it works:                      │
│  • Enter your API key                  │
│  • Click validate to fetch models      │
│  • Select from dropdown                │
│                                         │
│         [Cancel]  [Save Settings]       │
└─────────────────────────────────────────┘
```

## ⚡ Pro Tips

1. **Auto-Fetch is Smart**
   - Just enter your API key and wait 1 second
   - System automatically validates and fetches models
   - No extra button clicks needed!

2. **Model Dropdown Disabled?**
   - Normal! It stays disabled until auto-fetch completes
   - This prevents selecting invalid model names

3. **Getting Latest Models**
   - Simply re-enter or update your API key
   - System will re-fetch models automatically
   - Providers add new models regularly

4. **LM Studio Not Working?**
   - Make sure LM Studio app is open
   - Check server is started (green indicator)
   - Verify at least one model is loaded

5. **Network Issues?**
   - Validation requires internet (except LM Studio)
   - Check firewall/VPN settings
   - Try again after connectivity restored

## 🎨 Validation Message Guide

| Icon | Color | Meaning | Action |
|------|-------|---------|--------|
| ✅ | Green | Success! Key valid, models loaded | Select model and save |
| ❌ | Red | Error - Invalid key or connection | Check credentials |
| ⚠️ | Yellow | Warning - Using fallback | May still work, but verify |

## 📱 Mobile Usage

The settings modal is fully responsive:
- Works on phones and tablets
- Touch-friendly buttons
- Scrollable content
- Same functionality as desktop

## 🆘 Quick Troubleshooting

### Problem: Models not loading after entering API key
**Solution:** Wait 1-2 seconds after typing - auto-fetch has a 1 second delay

### Problem: Auto-fetch takes too long
**Solution:** 
- Normal wait: 1-3 seconds after typing stops
- If >10 seconds: Check network connection
- If times out: API might be down or key invalid

### Problem: Models dropdown empty after entering key
**Solution:** 
- Wait for validation message to appear
- Check validation message for errors
- If error, verify API key is correct
- Try a different provider to test

### Problem: Save button doesn't work
**Solution:**
- Ensure model is selected
- Check for error messages
- Verify backend is running (port 8000)

## 🎉 Success Indicators

You know it's working when:
1. ⏱️ You see "Validating..." message after entering key
2. ✅ Validation shows green success message
3. 📋 Dropdown populates with models automatically
4. 💾 Save shows "Settings saved successfully!"
5. 💬 Chat responds with your chosen model

## 📚 Next Steps

After successful setup:
1. **Test the chat** - Send a message to verify it works
2. **Try different models** - Compare responses
3. **Read full guide** - See AI_API_INTEGRATION_GUIDE.md
4. **Check docs** - Review FEATURE_GUIDE.md for all features

---

**Total Setup Time:** ~3 minutes  
**Difficulty:** Easy ⭐  
**Prerequisites:** Just an API key!  

Ready? Let's go! 🚀
