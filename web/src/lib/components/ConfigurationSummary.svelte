<!-- web/src/lib/components/ConfigurationSummary.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';
    import PricingDisplay from './PricingDisplay.svelte';
    import ValidationDisplay from './ValidationDisplay.svelte';

    let showExportDialog = $state(false);
    let copySuccess = $state(false);
    let exportFormat = $state('json');

    async function copyToClipboard() {
        try {
            const config = configStore.exportConfiguration();
            await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
            copySuccess = true;
            setTimeout(() => copySuccess = false, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    function exportConfiguration() {
        const config = configStore.exportConfiguration();
        let content, mimeType, extension;

        if (exportFormat === 'json') {
            content = JSON.stringify(config, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } else {
            // CSV format
            const headers = ['Option', 'Quantity', 'Unit Price', 'Total Price'];
            const rows = configStore.selectedOptions.map(opt => [
                opt.name,
                opt.quantity,
                opt.base_price.toFixed(2),
                (opt.quantity * opt.base_price).toFixed(2)
            ]);

            content = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            mimeType = 'text/csv';
            extension = 'csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `configuration-${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        showExportDialog = false;
    }

    async function saveConfiguration() {
        if (!configStore.configurationId) {
            await configStore.createConfiguration();
        } else {
            await configStore.saveConfiguration();
        }
    }
</script>

<div class="configuration-summary">
    <!-- Summary header -->
    <div class="summary-header">
        <h2>Configuration Summary</h2>
        <div class="actions">
            <button onclick={() => showExportDialog = true} class="btn btn-secondary">
                Export
            </button>
            <button onclick={saveConfiguration} class="btn btn-primary">
                Save Configuration
            </button>
        </div>
    </div>

    <!-- Key metrics -->
    <div class="metrics-grid">
        <div class="metric">
            <div class="metric-value">{configStore.selectedOptions.length}</div>
            <div class="metric-label">Options Selected</div>
        </div>
        <div class="metric">
            <div class="metric-value">{configStore.completionPercentage}%</div>
            <div class="metric-label">Complete</div>
        </div>
        <div class="metric">
            <div class="metric-value status" class:valid={configStore.isValid}>
                {configStore.isValid ? '✓ Valid' : '✗ Invalid'}
            </div>
            <div class="metric-label">Status</div>
        </div>
    </div>

    <!-- Selected options -->
    <section class="section">
        <h3>Selected Options</h3>
        <div class="options-table">
            <table>
                <thead>
                <tr>
                    <th>Option</th>
                    <th>Group</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
                </thead>
                <tbody>
                {#if configStore.selectedOptions.length > 0}
                    {#each configStore.selectedOptions as option}
                        <tr>
                            <td>{option.name}</td>
                            <td class="muted">{option.group_name}</td>
                            <td class="center">{option.quantity}</td>
                            <td class="right">${(option.base_price || 0).toFixed(2)}</td>
                            <td class="right bold">${((option.quantity || 0) * (option.base_price || 0)).toFixed(2)}</td>
                        </tr>
                    {/each}
                {:else}
                    <tr>
                        <td colspan="5" class="no-data">No options selected</td>
                    </tr>
                {/if}
                </tbody>
            </table>
        </div>
    </section>

    <!-- Pricing breakdown -->
    <section class="section">
        <h3>Pricing Details</h3>
        <PricingDisplay detailed={true} />
    </section>

    <!-- Validation status -->
    {#if configStore.validationResults.length > 0}
        <section class="section">
            <h3>Validation Results</h3>
            <ValidationDisplay />
        </section>
    {/if}

    <!-- Action buttons -->
    <div class="summary-actions">
        <button onclick={copyToClipboard} class="btn btn-secondary">
            {copySuccess ? '✓ Copied!' : 'Copy Configuration'}
        </button>

        {#if configStore.lastSaved}
      <span class="save-status">
        Last saved: {configStore.lastSaved.toLocaleTimeString()}
      </span>
        {/if}
    </div>

    <!-- Export dialog -->
    {#if showExportDialog}
        <div class="dialog-overlay" onclick={() => showExportDialog = false}>
            <div class="dialog" onclick={(e) => e.stopPropagation()}>
                <h3>Export Configuration</h3>

                <div class="export-options">
                    <label>
                        <input
                                type="radio"
                                value="json"
                                bind:group={exportFormat}
                        />
                        JSON (Complete configuration data)
                    </label>
                    <label>
                        <input
                                type="radio"
                                value="csv"
                                bind:group={exportFormat}
                        />
                        CSV (Selected options only)
                    </label>
                </div>

                <div class="dialog-actions">
                    <button onclick={() => showExportDialog = false} class="btn btn-secondary">
                        Cancel
                    </button>
                    <button onclick={exportConfiguration} class="btn btn-primary">
                        Export
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .configuration-summary {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .summary-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .actions {
        display: flex;
        gap: 0.75rem;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .metric {
        background: var(--bg-secondary, #f9fafb);
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
    }

    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color, #3b82f6);
        margin-bottom: 0.5rem;
    }

    .metric-value.status.valid {
        color: var(--success-color, #10b981);
    }

    .metric-value.status:not(.valid) {
        color: var(--error-color, #dc2626);
    }

    .metric-label {
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }

    .section {
        background: white;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        padding: 1.5rem;
    }

    .section h3 {
        margin: 0 0 1rem;
        font-size: 1.125rem;
        font-weight: 600;
    }

    .options-table {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 2px solid var(--border-color, #e5e7eb);
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }

    td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--border-light, #f3f4f6);
    }

    td.muted {
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
    }

    td.center {
        text-align: center;
    }

    td.right {
        text-align: right;
    }

    td.bold {
        font-weight: 600;
    }

    td.no-data {
        text-align: center;
        color: var(--text-secondary, #6b7280);
        padding: 2rem;
    }

    .summary-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .save-status {
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }

    /* Dialog styles */
    .dialog-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .dialog h3 {
        margin: 0 0 1rem;
    }

    .export-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .export-options label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .dialog-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
    }

    /* Button styles */
    .btn {
        padding: 0.625rem 1.25rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        background: var(--primary-color, #3b82f6);
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--primary-hover, #2563eb);
    }

    .btn-secondary {
        background: var(--secondary-color, #e5e7eb);
        color: var(--text-primary, #1a1a1a);
    }

    .btn-secondary:hover:not(:disabled) {
        background: var(--secondary-hover, #d1d5db);
    }
</style>