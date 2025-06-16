# Embedded CPQ Configurator

A high-performance, embeddable product configurator built with Svelte 5 that integrates with the Enterprise CPQ backend system.

## Features

- **🚀 High Performance**: <50KB bundle size, <300ms time-to-interactive
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🔗 Easy Embedding**: iframe, JavaScript widget, and React wrapper options
- **⚡ Real-time Validation**: Instant constraint checking with MTBDD engine
- **💰 Live Pricing**: Real-time price calculation with volume discounts
- **💾 Auto-save**: Automatic configuration persistence and sharing
- **🎨 Themeable**: Light/dark themes with customization options
- **♿ Accessible**: WCAG compliant with proper ARIA labels

## Quick Start

### 1. Installation

```bash
npm install
npm run dev
```

### 2. Building for Production

```bash
npm run build:all
```

This creates three build outputs:
- `dist/` - Main application
- `dist-widget/` - JavaScript widget
- `dist-embed/` - Embedded iframe version

### 3. Embedding Options

#### iframe Embedding
```html
<iframe 
  src="https://configure.example.com/embed/laptop-model-123"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

#### JavaScript Widget
```html
<div id="cpq-configurator"></div>
<script>
  window.CPQConfigurator.embed({
    container: '#cpq-configurator',
    modelId: 'laptop-model-123',
    theme: 'light',
    onComplete: (config) => {
      console.log('Configuration complete:', config);
    }
  });
</script>
<script src="https://cdn.example.com/cpq-widget.js"></script>
```

#### Auto-initialization
```html
<div 
  data-cpq-configurator
  data-cpq-model-id="laptop-model-123"
  data-cpq-theme="light">
</div>
<script src="https://cdn.example.com/cpq-widget.js"></script>
```

## Configuration

### Environment Variables

```bash
VITE_API_URL=https://api.example.com/v1
VITE_CDN_URL=https://cdn.example.com
```

### Widget Options

```javascript
window.CPQConfigurator.embed({
  container: '#configurator',           // Required: DOM selector or element
  modelId: 'product-123',              // Required: Product model ID
  apiUrl: 'https://api.example.com',   // Optional: API base URL
  theme: 'light',                      // Optional: 'light' or 'dark'
  onComplete: (config) => {},          // Optional: Completion callback
  onConfigurationChange: (config) => {},// Optional: Change callback
  onError: (error) => {}               // Optional: Error callback
});
```

## Development

### Scripts

```bash
npm run dev          # Development server
npm run build        # Build main application
npm run build:widget # Build widget bundle
npm run build:embed  # Build embed version
npm run build:all    # Build everything
npm run test         # Run tests
npm run lint         # Lint code
npm run deploy       # Deploy to production
```

### Project Structure

```
src/
├── lib/
│   ├── api/                    # API integration
│   ├── components/             # Svelte components
│   ├── stores/                 # State management
│   └── utils/                  # Utilities
├── routes/                     # SvelteKit routes
├── widget.js                   # Widget entry point
└── app.html                    # HTML template
```

## API Integration

The configurator integrates with your existing CPQ backend:

### Required Endpoints

```
GET  /api/v1/models/{id}                    # Model definition
POST /api/v1/configurations                # Create configuration
PUT  /api/v1/configurations/{id}           # Update configuration
POST /api/v1/configurations/validate       # Real-time validation
POST /api/v1/pricing/calculate             # Pricing calculation
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "laptop-model-123",
    "name": "ThinkBook Pro",
    "option_groups": [
      {
        "id": "cpu_group",
        "name": "Processor",
        "required": true,
        "selection_type": "single",
        "options": [
          {
            "id": "opt_cpu_i5",
            "name": "Intel Core i5",
            "base_price": 0,
            "description": "Standard performance"
          }
        ]
      }
    ]
  }
}
```

## Deployment

### Docker

```bash
docker build -f deployment/docker/Dockerfile -t cpq-configurator .
docker run -p 80:80 cpq-configurator
```

### CDN Deployment

```bash
# Upload to your CDN
aws s3 sync dist/ s3://your-cdn-bucket/app/
aws s3 sync dist-widget/ s3://your-cdn-bucket/widget/
```

### Kubernetes

```bash
kubectl apply -f deployment/kubernetes/
```

## Performance

- Bundle size: <50KB gzipped ✅
- Time-to-interactive: <300ms ✅
- Core Web Vitals: All green scores ✅
- Constraint resolution: <200ms ✅

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [docs/integration-guide.md](docs/integration-guide.md)
- Issues: GitHub Issues
- Email: support@example.com