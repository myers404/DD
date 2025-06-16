<!-- web/src/lib/components/ConfigurationSummary.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';
    import { formatCurrency } from '../utils/format.js';

    async function handleSave() {
        try {
            await configStore.saveConfiguration();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    }

    function handleExport() {
        const data = {
            modelId: configStore.modelId,
            modelName: configStore.model?.name,
            selections: configStore.selections,
            pricing: configStore.pricingData,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `configuration-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="configuration-summary">
    <h3>Configuration Summary</h3>

    <div class="summary-stats">
        <div class="stat">
            <span class="stat-value">{configStore.selectedOptions.length}</span>
            <span class="stat-label">Options Selected</span>
        </div>
        <div class="stat">
            <span class="stat-value">{formatCurrency(configStore.totalPrice)}</span>
            <span class="stat-label">Total Price</span>
        </div>
    </div>

    <div class="summary-actions">
        <button class="action-btn primary" onclick={handleSave}>
            Save Configuration
        </button>
        <button class="action-btn secondary" onclick={handleExport}>
            Export
        </button>
    </div>
</div>

<style>
    .configuration-summary {
        background: var(--bg-secondary);
        border-radius: 0.75rem;
        padding: 1.25rem;
        border: 1px solid var(--border);
    }

    h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 1rem;
    }

    .summary-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .stat {
        text-align: center;
        padding: 1rem;
        background: var(--bg);
        border-radius: 0.5rem;
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
    }

    .stat-label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
    }

    .summary-actions {
        display: flex;
        gap: 0.75rem;
    }

    .action-btn {
        flex: 1;
        padding: 0.75rem;
        border-radius: 0.5rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn.primary {
        background: var(--primary);
        color: white;
    }

    .action-btn.primary:hover {
        background: var(--primary-hover);
    }

    .action-btn.secondary {
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
    }

    .action-btn.secondary:hover {
        background: var(--bg-secondary);
    }
</style>