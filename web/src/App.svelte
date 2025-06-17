<!-- web/src/App.svelte -->
<script>
    import { onMount } from 'svelte';
    import { configStore } from './lib/stores/configuration.svelte.js';
    import ConfiguratorApp from './lib/ConfiguratorApp.svelte';
    import './app.css';

    // Get initial configuration from URL params
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('model');
    const theme = params.get('theme') || 'light';
    const configId = params.get('config'); // Support loading existing config

    // Initialize store on mount
    onMount(() => {
        configStore.initialize();
    });

    // Handle completion
    function handleComplete(config) {
        console.log('Configuration completed:', config);

        // Show success message
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
      <div class="message-content">
        <h3>✅ Configuration Complete!</h3>
        <p>Configuration ID: <code>${config.id}</code></p>
        <p>Total Price: <strong>$${config.pricing.total_price.toFixed(2)}</strong></p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
        document.body.appendChild(message);
    }

    // Handle errors
    function handleError(error) {
        console.error('Configuration error:', error);
    }

    // Handle changes
    function handleChange(config) {
        console.log('Configuration changed:', config);
    }
</script>

{#if modelId}
    <ConfiguratorApp
            {modelId}
            {theme}
            configurationId={configId}
            onComplete={handleComplete}
            onError={handleError}
            onConfigurationChange={handleChange}
    />
{:else}
    <div class="cpq-configurator">
        <div class="no-model-selected">
            <div class="icon">🛠️</div>
            <h1>CPQ Configurator</h1>
            <p>Please provide a model ID in the URL parameters to start configuring.</p>

            <div class="example-box">
                <h3>Example URLs:</h3>
                <code>?model=laptop-model-123</code>
                <code>?model=server-config-456&theme=dark</code>
                <code>?model=desktop-789&config=existing-config-id</code>
            </div>

            <div class="demo-models">
                <h3>Try a demo model:</h3>
                <div class="demo-links">
                    <a href="?model=laptop-model-123" class="demo-link">
                        💻 Laptop Configuration
                    </a>
                    <a href="?model=server-model-456" class="demo-link">
                        🖥️ Server Configuration
                    </a>
                    <a href="?model=network-model-789" class="demo-link">
                        🌐 Network Setup
                    </a>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.completion-message) {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    }

    :global(.message-content) {
        padding: 2rem;
        text-align: center;
        min-width: 300px;
    }

    :global(.message-content h3) {
        margin: 0 0 1rem;
        font-size: 1.5rem;
        color: #10b981;
    }

    :global(.message-content p) {
        margin: 0.5rem 0;
        color: #6b7280;
    }

    :global(.message-content code) {
        background: #f3f4f6;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: monospace;
    }

    :global(.message-content button) {
        margin-top: 1.5rem;
        padding: 0.75rem 2rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    :global(.message-content button:hover) {
        background: #2563eb;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -60%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    .no-model-selected {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
        background: var(--bg-secondary, #f9fafb);
    }

    .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .no-model-selected h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 1rem;
        color: var(--text-primary, #111827);
    }

    .no-model-selected p {
        color: var(--text-secondary, #6b7280);
        margin: 0 0 2rem;
        font-size: 1.125rem;
    }

    .example-box {
        background: var(--bg-primary, #ffffff);
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        text-align: left;
        max-width: 500px;
    }

    .example-box h3 {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
    }

    .example-box code {
        display: block;
        background: var(--bg-tertiary, #f3f4f6);
        padding: 0.75rem 1rem;
        border-radius: 4px;
        margin: 0.5rem 0;
        font-family: monospace;
        font-size: 0.875rem;
        color: var(--text-code, #111827);
    }

    .demo-models {
        max-width: 500px;
    }

    .demo-models h3 {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
    }

    .demo-links {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .demo-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--primary-color, #3b82f6);
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.2s;
    }

    .demo-link:hover {
        background: var(--primary-hover, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    @media (max-width: 640px) {
        .demo-links {
            flex-direction: column;
            width: 100%;
        }

        .demo-link {
            width: 100%;
            justify-content: center;
        }
    }
</style>