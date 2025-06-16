<!-- web/src/lib/components/ValidationDisplay.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';

    let showDetails = $state(true);
    let filterSeverity = $state('all');

    // Group violations by severity
    let groupedViolations = $derived(() => {
        const violations = configStore.validationResults.violations || [];
        const groups = {
            error: [],
            warning: [],
            info: []
        };

        violations.forEach(v => {
            const severity = v.severity || 'error';
            if (groups[severity]) {
                groups[severity].push(v);
            }
        });

        return groups;
    });

    let filteredViolations = $derived(() => {
        if (filterSeverity === 'all') {
            return configStore.validationResults.violations || [];
        }
        return groupedViolations()[filterSeverity] || [];
    });

    function getViolationIcon(severity) {
        switch (severity) {
            case 'warning':
                return `<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />`;
            case 'info':
                return `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />`;
            default:
                return `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`;
        }
    }

    function getSeverityColor(severity) {
        switch (severity) {
            case 'warning': return 'var(--warning)';
            case 'info': return 'var(--primary)';
            default: return 'var(--error)';
        }
    }

    function handleAutoFix(violation) {
        if (violation.auto_fix_action) {
            // Apply the auto-fix action
            const action = violation.auto_fix_action;
            if (action.type === 'add_selection') {
                configStore.updateSelection(action.option_id, action.quantity || 1);
            } else if (action.type === 'remove_selection') {
                configStore.updateSelection(action.option_id, 0);
            }
        }
    }
</script>

<div class="validation-display">
    <div class="validation-header">
        <h3 class="validation-title">
            Configuration Validation
            {#if configStore.isValidating}
        <span class="validating-indicator">
          <span class="spinner"></span>
          Checking...
        </span>
            {/if}
        </h3>

        {#if !configStore.isValidating}
            <div class="validation-status" class:valid={configStore.isValid}>
                {#if configStore.isValid}
                    <svg class="status-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Valid
                {:else}
                    <svg class="status-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    {filteredViolations.length} Issues
                {/if}
            </div>
        {/if}
    </div>

    {#if !configStore.isValid && filteredViolations.length > 0}
        <div class="validation-filters">
            <button
                    class="filter-btn"
                    class:active={filterSeverity === 'all'}
                    onclick={() => filterSeverity = 'all'}
            >
                All ({configStore.validationResults.violations.length})
            </button>
            {#if groupedViolations().error.length > 0}
                <button
                        class="filter-btn error"
                        class:active={filterSeverity === 'error'}
                        onclick={() => filterSeverity = 'error'}
                >
                    Errors ({groupedViolations().error.length})
                </button>
            {/if}
            {#if groupedViolations().warning.length > 0}
                <button
                        class="filter-btn warning"
                        class:active={filterSeverity === 'warning'}
                        onclick={() => filterSeverity = 'warning'}
                >
                    Warnings ({groupedViolations().warning.length})
                </button>
            {/if}
            {#if groupedViolations().info.length > 0}
                <button
                        class="filter-btn info"
                        class:active={filterSeverity === 'info'}
                        onclick={() => filterSeverity = 'info'}
                >
                    Info ({groupedViolations().info.length})
                </button>
            {/if}
        </div>

        <div class="violations-list">
            {#each filteredViolations as violation, index}
                <div class="violation-item severity-{violation.severity || 'error'}">
                    <div class="violation-header">
                        <svg
                                class="violation-icon"
                                viewBox="0 0 20 20"
                                fill={getSeverityColor(violation.severity || 'error')}
                        >
                            {@html getViolationIcon(violation.severity || 'error')}
                        </svg>
                        <div class="violation-content">
                            <div class="violation-message">{violation.message}</div>

                            {#if violation.details}
                                <div class="violation-details">{violation.details}</div>
                            {/if}

                            {#if violation.affected_options && violation.affected_options.length > 0}
                                <div class="affected-options">
                                    Affects:
                                    {#each violation.affected_options as optionId, i}
                    <span class="affected-option">
                      {configStore.model?.option_groups
                          .flatMap(g => g.options)
                          .find(o => o.id === optionId)?.name || optionId}
                    </span>
                                        {#if i < violation.affected_options.length - 1}, {/if}
                                    {/each}
                                </div>
                            {/if}

                            {#if violation.rule_expression && showDetails}
                                <div class="rule-expression">
                                    Rule: <code>{violation.rule_expression}</code>
                                </div>
                            {/if}
                        </div>
                    </div>

                    {#if violation.suggestions && violation.suggestions.length > 0}
                        <div class="violation-suggestions">
                            <div class="suggestions-title">Suggestions:</div>
                            <ul class="suggestions-list">
                                {#each violation.suggestions as suggestion}
                                    <li>{suggestion}</li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                    {#if violation.auto_fix_action}
                        <button
                                class="auto-fix-btn"
                                onclick={() => handleAutoFix(violation)}
                        >
                            <svg class="fix-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                            </svg>
                            Auto-fix
                        </button>
                    {/if}
                </div>
            {/each}
        </div>
    {:else if configStore.isValid && !configStore.isValidating}
        <div class="valid-message">
            <svg class="valid-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <p>Your configuration is valid and meets all requirements.</p>
        </div>
    {/if}
</div>

<style>
    .validation-display {
        background: var(--bg-secondary);
        border-radius: 0.75rem;
        padding: 1.25rem;
        border: 1px solid var(--border);
    }

    .validation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .validation-title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .validating-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--text-secondary);
    }

    .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid var(--border);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .validation-status {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--error);
    }

    .validation-status.valid {
        color: var(--success);
    }

    .status-icon {
        width: 1.25rem;
        height: 1.25rem;
    }

    .validation-filters {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .filter-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 500;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .filter-btn:hover {
        background: var(--bg-secondary);
    }

    .filter-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }

    .filter-btn.error.active {
        background: var(--error);
        border-color: var(--error);
    }

    .filter-btn.warning.active {
        background: var(--warning);
        border-color: var(--warning);
    }

    .filter-btn.info.active {
        background: var(--primary);
        border-color: var(--primary);
    }

    .violations-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .violation-item {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        padding: 1rem;
    }

    .violation-item.severity-error {
        border-color: rgba(239, 68, 68, 0.2);
        background: rgba(239, 68, 68, 0.05);
    }

    .violation-item.severity-warning {
        border-color: rgba(245, 158, 11, 0.2);
        background: rgba(245, 158, 11, 0.05);
    }

    .violation-item.severity-info {
        border-color: rgba(59, 130, 246, 0.2);
        background: rgba(59, 130, 246, 0.05);
    }

    .violation-header {
        display: flex;
        gap: 0.75rem;
    }

    .violation-icon {
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
        margin-top: 0.125rem;
    }

    .violation-content {
        flex: 1;
    }

    .violation-message {
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }

    .violation-details {
        font-size: 0.813rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .affected-options {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .affected-option {
        font-weight: 500;
        color: var(--text);
    }

    .rule-expression {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 0.5rem;
    }

    .rule-expression code {
        background: var(--bg-secondary);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-family: monospace;
    }

    .violation-suggestions {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border);
    }

    .suggestions-title {
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.375rem;
    }

    .suggestions-list {
        margin: 0;
        padding-left: 1.25rem;
        font-size: 0.813rem;
        color: var(--text-secondary);
    }

    .auto-fix-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-top: 0.75rem;
        padding: 0.375rem 0.75rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .auto-fix-btn:hover {
        background: var(--primary-hover);
    }

    .fix-icon {
        width: 1rem;
        height: 1rem;
    }

    .valid-message {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 0.5rem;
    }

    .valid-icon {
        width: 1.5rem;
        height: 1.5rem;
        color: var(--success);
    }

    .valid-message p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--success);
        font-weight: 500;
    }
</style>