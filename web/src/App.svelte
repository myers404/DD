<!-- web/src/App.svelte -->
<script>
    import { onMount } from 'svelte';
    import { configStore } from './lib/stores/configuration.svelte.js';
    import ConfiguratorApp from './lib/ConfiguratorApp.svelte';
    import './app.css';

    // Get initial configuration from URL params
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('model'); // Don't default to anything
    const theme = params.get('theme') || 'light';

    // Initialize store on mount
    onMount(() => {
        configStore.initialize();
    });
</script>

{#if modelId}
    <ConfiguratorApp {modelId} {theme} />
{:else}
    <div class="cpq-configurator">
        <div class="no-model-selected">
            <h1>No Model Selected</h1>
            <p>Please provide a model ID in the URL parameters.</p>
            <p class="example">Example: ?model=laptop-model-123</p>
        </div>
    </div>
{/if}

<style>
    .no-model-selected {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
    }

    .no-model-selected h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    .no-model-selected p {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .example {
        font-family: monospace;
        background: var(--bg-secondary);
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        margin-top: 1rem;
    }
</style>