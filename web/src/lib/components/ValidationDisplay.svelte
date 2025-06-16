<!-- web/src/lib/components/ValidationDisplay.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';

    let { compact = false } = $props();

    let groupedErrors = $derived(() => {
        const groups = {
            error: [],
            warning: [],
            info: []
        };

        for (const result of configStore.validationResults) {
            const severity = result.severity || 'error';
            groups[severity].push(result);
        }

        return groups;
    });

    const icons = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        error: '#dc2626',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
</script>

<div class="validation-display" class:compact>
    {#if configStore.isValidating}
        <div class="validating">
            <span class="spinner"></span>
            Validating configuration...
        </div>
    {:else if configStore.validationResults.length === 0}
        <div class="valid-state">
            <span class="icon">✅</span>
            <div class="message">
                <h4>Configuration Valid</h4>
                {#if !compact}
                    <p>Your current selection meets all requirements.</p>
                {/if}
            </div>
        </div>
    {:else}
        <div class="validation-results">
            {#each Object.entries(groupedErrors()) as [severity, errors]}
                {#if errors.length > 0}
                    <div class="severity-group">
                        {#if !compact}
                            <h4 class="severity-header" style="color: {colors[severity]}">
                                {icons[severity]} {severity.charAt(0).toUpperCase() + severity.slice(1)}s
                            </h4>
                        {/if}

                        <ul class="error-list">
                            {#each errors as error}
                                <li class="error-item {severity}">
                                    {#if compact}
                                        <span class="compact-icon">{icons[severity]}</span>
                                    {/if}
                                    <span class="error-message">{error.message}</span>
                                    {#if error.field && !compact}
                                        <span class="error-field">({error.field})</span>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            {/each}

            {#if !compact && configStore.validationResults.some(r => r.suggestion)}
                <div class="suggestions">
                    <h4>Suggestions</h4>
                    <ul>
                        {#each configStore.validationResults.filter(r => r.suggestion) as result}
                            <li>{result.suggestion}</li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .validation-display {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
    }

    .validation-display.compact {
        padding: 0.75rem;
    }

    .validating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
    }

    .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid var(--border-color, #e5e7eb);
        border-top-color: var(--primary-color, #3b82f6);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .valid-state {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--success-bg, #d1fae5);
        border-radius: 6px;
    }

    .valid-state .icon {
        font-size: 2rem;
    }

    .valid-state h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--success-dark, #047857);
    }

    .valid-state p {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--success-dark, #047857);
    }

    .validation-results {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .severity-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .severity-header {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .error-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .error-item {
        display: flex;
        align-items: start;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
    }

    .error-item.error {
        background: var(--error-bg, #fee2e2);
        color: var(--error-dark, #991b1b);
    }

    .error-item.warning {
        background: var(--warning-bg, #fef3c7);
        color: var(--warning-dark, #92400e);
    }

    .error-item.info {
        background: var(--info-bg, #dbeafe);
        color: var(--info-dark, #1e40af);
    }

    .compact-icon {
        flex-shrink: 0;
    }

    .error-message {
        flex: 1;
    }

    .error-field {
        font-size: 0.75rem;
        opacity: 0.7;
    }

    .suggestions {
        padding: 1rem;
        background: var(--bg-secondary, #f9fafb);
        border-radius: 6px;
    }

    .suggestions h4 {
        margin: 0 0 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-secondary, #6b7280);
    }

    .suggestions ul {
        margin: 0;
        padding-left: 1.25rem;
    }

    .suggestions li {
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
        margin-bottom: 0.25rem;
    }

    .compact .error-list {
        gap: 0.25rem;
    }

    .compact .error-item {
        padding: 0.5rem;
        font-size: 0.75rem;
    }
</style>