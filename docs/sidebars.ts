import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
        'getting-started/docker-setup',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/code-quality',
        'development/project-notes',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      items: [
        'testing/unit-tests',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/endpoints',
      ],
    },
    {
      type: 'category',
      label: 'Database',
      items: [
        'database/schema',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/guide',
      ],
    },
  ],
};

export default sidebars;
