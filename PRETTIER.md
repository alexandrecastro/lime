# Prettier Configuration

This project uses [Prettier](https://prettier.io/) to ensure consistent code formatting across the codebase.

## Configuration

The Prettier configuration is defined in `.prettierrc` at the root of the project with the following settings:

- **Semicolons**: Enabled
- **Single Quotes**: Enabled
- **Trailing Commas**: ES5 compatible
- **Print Width**: 80 characters
- **Tab Width**: 2 spaces
- **Arrow Parens**: Avoid parentheses when possible
- **End of Line**: LF (Unix-style)

## Usage

### Frontend

Format all files:
```bash
cd frontend
npm run format
```

Check formatting without modifying files:
```bash
cd frontend
npm run format:check
```

### Backend

Format all files:
```bash
cd backend
npm run format
```

## IDE Integration

### VS Code

1. Install the Prettier extension
2. Add the following to your VS Code settings:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Other IDEs

Please refer to the [Prettier documentation](https://prettier.io/docs/en/editors.html) for setup instructions for your specific IDE.

## Pre-commit Hooks (Optional)

To automatically format code before committing, consider adding a pre-commit hook using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged).

## Ignored Files

The following files/directories are excluded from formatting (see `.prettierignore`):

- `node_modules`
- `dist` / `build` outputs
- Log files
- Minified files
- OS-specific files

