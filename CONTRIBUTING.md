# Contributing to StadiumPulse AI 🏟️

Thank you for your interest in contributing to StadiumPulse AI, the premier Smart Stadium companion for the FIFA World Cup 2026. We welcome contributions that improve features, security, testing, performance, or accessibility.

---

## 🗺️ How to Contribute

1. **Fork & Clone**: Fork the repository and clone it to your local machine.
2. **Create a Feature Branch**: Use descriptive branch names:
   - `feature/your-feature-name`
   - `bugfix/your-bugfix-name`
   - `security/your-security-patch`
3. **Write Code**: Ensure your changes adhere to our coding standards, security constraints, and accessibility requirements.
4. **Run Quality Checks**:
   - Format: `npm run format` (using prettier)
   - Lint: `npm run lint`
   - Test: `npm run test` (aim for 98%+ coverage)
5. **Commit**: Use [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat(concierge): add voice recognition fallback`, `fix(security): sanitize user prompt input`).
6. **Pull Request**: Open a PR targeting the `main` branch. Provide a comprehensive summary in our PR template.

---

## 🎨 Coding Standards & Conventions

- **TypeScript**: Strictly type everything. Avoid using `any`.
- **SOLID Principles**: Keep components small, modular, and focused on a single responsibility.
- **Tailwind CSS**: Use utility classes directly. Ensure correct focus-state styling (`focus:ring-2`) and contrast compliance.
- **Gemini SDK**: Always perform model calls in server-side controller pathways; never expose API keys to the browser context.

---

## 🧪 Testing Guidelines

Every new feature must include comprehensive test coverage under `src/tests/`:
- **Unit Tests**: For utility functions, helper logic, and custom components.
- **Integration Tests**: For server routing endpoints and stateful API simulations.
- **Security Tests**: Validate that input validation, rate limit configurations, and prompt escaping operate correctly.
