# Contributing to CodeSnippet Hub

Thank you for your interest in contributing to **CodeSnippet Hub**! We appreciate all contributions, from bug reports and language additions to UI enhancements and documentation improvements.

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful and constructive in all discussions.

## Branch Workflow
We follow the standard GitHub Flow:
1. Fork the repository.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/codesnippet-hub.git
   cd codesnippet-hub
   ```
3. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/syntax-highlighter-elixir
   # or
   git checkout -b fix/storage-quota-warning
   ```
4. Test your changes thoroughly across Chrome, Firefox, and Edge.
5. Commit your changes with clear commit messages:
   ```bash
   git commit -m "feat(syntax): add Elixir language support and icon badge"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/syntax-highlighter-elixir
   ```
7. Open a Pull Request on GitHub.

## Development Guidelines
- **Zero Heavy Build Step**: CodeSnippet Hub is designed to run directly in modern browsers without mandatory npm bundles. Keep ES6+ vanilla modules clean and readable.
- **LocalStorage Performance**: Be mindful of browser quota limits (~5MB). Avoid bloating stored snippets with unnecessary metadata.
- **Accessibility (a11y)**: Ensure all buttons and modal triggers have proper `aria-label`, `role`, and keyboard focus styles.
- **Prism.js Compatibility**: When adding new language syntax components, register them properly in `LANGUAGE_CONFIG` within `js/ui.js` and include their Prism CDN script in `index.html`.
