# Contributing to Chatty

Thank you for your interest in contributing to Chatty! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists in the [Issues](https://github.com/Xenonesis/Chatty/issues) section
2. If not, create a new issue with:
   - A clear, descriptive title
   - Detailed description of the problem or feature
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, browser, versions)

### Development Process

1. **Fork the Repository**
   - Fork the project to your GitHub account
   - Clone your fork locally:
     ```bash
     git clone https://github.com/your-username/Chatty.git
     cd Chatty
     ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   Use descriptive branch names like:
   - `feature/add-new-provider`
   - `bugfix/fix-conversation-list`
   - `docs/update-readme`

3. **Set Up Development Environment**
   ```bash
   npm install      # Install dependencies
   npm run dev      # Start development servers
   ```

4. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Keep changes focused and atomic

5. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend
   python manage.py test
   
   # Frontend linting
   npm run lint
   ```

6. **Commit Your Changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add new AI provider support
     fix: resolve conversation list bug
     docs: update installation guide
     style: format code with prettier
     refactor: simplify message handling
     test: add tests for chat interface
     ```

7. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue numbers
     - Testing performed
     - Screenshots (for UI changes)

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guide
- Use meaningful variable and function names
- Add docstrings to functions and classes
- Keep functions focused and single-purpose
- Use type hints where appropriate

### TypeScript/React (Frontend)
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use functional components over class components
- Keep components small and reusable
- Use meaningful component and variable names
- Format with ESLint

### General Guidelines
- Write self-documenting code
- Add comments only when necessary
- Avoid code duplication (DRY principle)
- Keep functions and files reasonably sized
- Use environment variables for configuration
- Never commit secrets or API keys

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Tests pass (`npm run lint`, `python manage.py test`)
- [ ] Documentation updated if needed
- [ ] No merge conflicts with main branch
- [ ] Commit messages are clear and descriptive

### PR Description Should Include
- Summary of changes
- Motivation and context
- Related issue numbers (Fixes #123)
- Type of change (bugfix, feature, docs, etc.)
- Testing performed
- Screenshots for UI changes

### Review Process
- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## Development Tips

### Running Individual Components
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Full stack
npm run dev
```

### Database Changes
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Adding New Dependencies

**Python:**
```bash
cd backend
pip install package-name
pip freeze > requirements.txt
```

**JavaScript:**
```bash
npm install package-name
```

## AI Provider Integration

When adding new AI provider support:

1. Add provider configuration in `backend/chat/ai_service.py`
2. Update environment variable documentation
3. Add provider to settings modal in `components/SettingsModal.tsx`
4. Update README with provider setup instructions
5. Add tests for the new provider

## Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct
- Ask questions if you're unsure

## Getting Help

- Check existing documentation first
- Search closed issues for similar problems
- Ask questions in new issues
- Join community discussions

## Recognition

Contributors will be acknowledged in:
- Release notes
- GitHub contributors list
- Project documentation

Thank you for contributing to make Chatty better! 🎉
