# WorkTime Leave Manager - Technical Documentation

This directory contains the complete technical documentation for the WorkTime Leave Manager API, built with [Docusaurus](https://docusaurus.io/).

## 📚 Documentation Contents

- **Introduction** - Project overview and key features
- **Getting Started** - Quick start guide and Docker setup
- **Architecture** - System design and technical architecture
- **API Reference** - Complete endpoint documentation
- **Database** - Schema and data model documentation

## 🚀 Running the Documentation

### Prerequisites

- Node.js 20+
- npm

### Development Server

```bash
cd docs
npm install
npm start
```

The documentation site will open at **http://localhost:3000**

### Build for Production

```bash
cd docs
npm run build
```

The static files will be generated in the `build/` directory.

### Serve Production Build

```bash
cd docs
npm run serve
```

## 📖 Documentation Structure

```
docs/
├── docs/                       # Markdown documentation files
│   ├── intro.md               # Homepage
│   ├── getting-started/       # Setup guides
│   │   ├── quick-start.md
│   │   └── docker-setup.md
│   ├── architecture/          # Technical architecture
│   │   └── overview.md
│   ├── api/                   # API documentation
│   │   └── endpoints.md
│   └── database/              # Database documentation
│       └── schema.md
├── src/                       # React components (if needed)
├── static/                    # Static assets
├── docusaurus.config.ts       # Docusaurus configuration
├── sidebars.ts                # Sidebar navigation
└── package.json               # Dependencies

```

## 🎨 Customization

### Updating Site Config

Edit `docusaurus.config.ts`:

```typescript
const config: Config = {
  title: 'WorkTime Leave Manager',
  tagline: 'Technical Documentation',
  url: 'https://your-domain.com',
  // ... more config
};
```

### Adding New Pages

1. Create a new `.md` file in `docs/`
2. Add frontmatter:

```markdown
---
sidebar_position: 1
---

# Your Page Title

Content here...
```

3. Update `sidebars.ts` if needed

### Customizing Theme

Edit theme settings in `docusaurus.config.ts`:

```typescript
themeConfig: {
  navbar: {
    title: 'WTLM Docs',
    // ... navbar config
  },
  // ... more theme config
}
```

## 📝 Writing Documentation

### Markdown Features

Docusaurus supports:
- **Standard Markdown**
- **MDX** (Markdown + JSX)
- **Code blocks** with syntax highlighting
- **Admonitions** (notes, warnings, etc.)
- **Tabs**
- **Mermaid diagrams**

### Code Blocks

\`\`\`typescript
// Code with syntax highlighting
const example = "Hello World";
\`\`\`

### Admonitions

\`\`\`markdown
:::note
Important information
:::

:::tip
Helpful tip
:::

:::warning
Warning message
:::
\`\`\`

## 🔍 Search

Search functionality is built-in with Docusaurus. No additional configuration needed for local search.

For production, consider:
- [Algolia DocSearch](https://docsearch.algolia.com/)
- [Local Search Plugin](https://github.com/easyops-cn/docusaurus-search-local)

## 🚢 Deployment

### GitHub Pages

```bash
npm run deploy
```

### Netlify / Vercel

Simply connect your repository and set:
- Build command: `cd docs && npm run build`
- Publish directory: `docs/build`

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY docs/package*.json ./
RUN npm ci
COPY docs/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing to Docs

1. Follow the existing documentation structure
2. Use clear, concise language
3. Include code examples where appropriate
4. Test locally before committing
5. Update the sidebar if adding new pages

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [MDX Documentation](https://mdxjs.com/)

## 📧 Questions?

For questions about the documentation:
- Create an issue in the repository
- Check existing documentation
- Review Docusaurus guides

---

**Note**: The main application code is in the parent directory (`../`). This `docs/` directory is solely for documentation.
