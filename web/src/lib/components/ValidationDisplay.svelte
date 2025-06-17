<!-- web/src/lib/components/ValidationDisplay.svelte -->
<script>
    let {
        validationResults,
        compact = false,
        onFix
    } = $props();

    let expandedViolations = $state(new Set());
    let filterSeverity = $state('all');

    let violations = $derived(validationResults?.violations || []);

    let filteredViolations = $derived(() => {
        if (filterSeverity === 'all') return violations;
        return violations.filter(v => v.severity === filterSeverity);
    });

    let violationCounts = $derived(() => {
        const counts = { critical: 0, warning: 0, info: 0 };
        violations.forEach(v => {
            counts[v.severity || 'warning']++;
        });
        return counts;
    });

    function toggleViolation(id) {
        const expanded = new Set(expandedViolations);
        if (expanded.has(id)) {
            expanded.delete(id);
        } else {
            expanded.add(id);
        }
        expandedViolations = expanded;
    }

    function getSeverityIcon(severity) {
        switch (severity) {
            case 'critical': return '🚫';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '⚠️';
        }
    }

    function getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'warning';
        }
    }

    function handleFix(violation) {
        if (onFix && violation.suggestions?.length > 0) {
            // Apply the first suggestion
            onFix(violation.suggestions[0]);
        }
    }
</script>

<div class="validation-display" class:compact>
    {#if validationResults?.is_valid}
        <div class="validation-success">
            <div class="success-icon">✅</div>
            <div class="success-content">
                <h3>Configuration Valid</h3>
                <p>All constraints are satisfied. Your configuration is ready.</p>
            </div>
        </div>
    {:else if violations.length > 0}
        {#if !compact}
            <div class="validation-header">
                <h3>Validation Issues ({violations.length})</h3>

                <div class="severity-filters">
                    <button
                            class="filter-btn"
                            class:active={filterSeverity === 'all'}
                            onclick={() => filterSeverity = 'all'}
                    >
                        All ({violations.length})
                    </button>
                    {#if violationCounts.critical > 0}
                        <button
                                class="filter-btn critical"
                                class:active={filterSeverity === 'critical'}
                                onclick={() => filterSeverity = 'critical'}
                        >
                            Critical ({violationCounts.critical})
                        </button>
                    {/if}
                    {#if violationCounts.warning > 0}
                        <button
                                class="filter-btn warning"
                                class:active={filterSeverity === 'warning'}
                                onclick={() => filterSeverity = 'warning'}
                        >
                            Warning ({violationCounts.warning})
                        </button>
                    {/if}
                    {#if violationCounts.info > 0}
                        <button
                                class="filter-btn info"
                                class:active={filterSeverity === 'info'}
                                onclick={() => filterSeverity = 'info'}
                        >
                            Info ({violationCounts.info})
                        </button>
                    {/if}
                </div>
            </div>
        {/if}

        <div class="violations-list">
            {#each filteredViolations as violation, index}
                {@const isExpanded = expandedViolations.has(violation.rule_id || index)}
                {@const severityColor = getSeverityColor(violation.severity)}

                <div class="violation-item {severityColor}" class:expanded={isExpanded}>
                    <div
                            class="violation-header"
                            onclick={() => toggleViolation(violation.rule_id || index)}
                    >
                        <div class="violation-icon">
                            {getSeverityIcon(violation.severity)}
                        </div>

                        <div class="violation-content">
                            <div class="violation-message">{violation.message}</div>
                            {#if violation.rule_name && !compact}
                                <div class="violation-rule">Rule: {violation.rule_name}</div>
                            {/if}
                        </div>

                        <div class="violation-actions">
                            {#if violation.suggestions?.length > 0 && onFix}
                                <button
                                        class="fix-btn"
                                        onclick={(e) => {
                    e.stopPropagation();
                    handleFix(violation);
                  }}
                                        title="Apply suggested fix"
                                >
                                    Fix
                                </button>
                            {/if}

                            <button class="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                                <svg class="chevron" class:rotated={isExpanded} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {#if isExpanded}
                        <div class="violation-details">
                            {#if violation.details}
                                <div class="detail-section">
                                    <h4>Details</h4>
                                    <p>{violation.details}</p>
                                </div>
                            {/if}

                            {#if violation.affected_options?.length > 0}
                                <div class="detail-section">
                                    <h4>Affected Options</h4>
                                    <ul class="affected-list">
                                        {#each violation.affected_options as option}
                                            <li>{option.name || option.id}</li>
                                        {/each}
                                    </ul>
                                </div>
                            {/if}

                            {#if violation.suggestions?.length > 0}
                                <div class="detail-section">
                                    <h4>Suggested Actions</h4>
                                    <div class="suggestions">
                                        {#each violation.suggestions as suggestion}
                                            <div class="suggestion">
                        <span class="suggestion-text">
                          {#if suggestion.action === 'add'}
                            Add: {suggestion.option_name || suggestion.option_id}
                              {#if suggestion.quantity > 1}
                                  (×{suggestion.quantity})
                              {/if}
                          {:else if suggestion.action === 'remove'}
                            Remove: {suggestion.option_name || suggestion.option_id}
                          {:else if suggestion.action === 'change'}
                            Change: {suggestion.description}
                          {:else}
                            {suggestion.description}
                          {/if}
                        </span>
                                                {#if onFix}
                                                    <button
                                                            class="apply-btn"
                                                            onclick={() => onFix(suggestion)}
                                                    >
                                                        Apply
                                                    </button>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            {#if violation.rule_expression && !compact}
                                <div class="detail-section">
                                    <h4>Rule Expression</h4>
                                    <code class="expression">{violation.rule_expression}</code>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
        <div class="validation-empty">
            <p>Validating configuration...</p>
        </div>
    {/if}
</div>

<style>
    .validation-display {
        background: var(--bg-primary, #ffffff);
        border-radius: 8px;
        overflow: hidden;
    }

    .validation-display.compact {
        background: transparent;
    }

    .validation-success {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        background: var(--success-bg, #d1fae5);
        color: var(--success-text, #065f46);
    }

    .success-icon {
        font-size: 2rem;
    }

    .success-content h3 {
        margin: 0 0 0.25rem;
        font-size: 1.125rem;
        font-weight: 600;
    }

    .success-content p {
        margin: 0;
        font-size: 0.875rem;
    }

    .validation-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .validation-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
    }

    .severity-filters {
        display: flex;
        gap: 0.5rem;
    }

    .filter-btn {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-primary, #ffffff);
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .filter-btn:hover {
        background: var(--bg-secondary, #f9fafb);
    }

    .filter-btn.active {
        background: var(--primary-color, #3b82f6);
        color: white;
        border-color: var(--primary-color, #3b82f6);
    }

    .filter-btn.critical.active {
        background: var(--error-color, #dc2626);
        border-color: var(--error-color, #dc2626);
    }

    .filter-btn.warning.active {
        background: var(--warning-color, #f59e0b);
        border-color: var(--warning-color, #f59e0b);
    }

    .filter-btn.info.active {
        background: var(--info-color, #3b82f6);
        border-color: var(--info-color, #3b82f6);
    }

    .violations-list {
        max-height: 600px;
        overflow-y: auto;
    }

    .violation-item {
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        transition: background 0.2s;
    }

    .violation-item:last-child {
        border-bottom: none;
    }

    .violation-item.error {
        border-left: 4px solid var(--error-color, #dc2626);
    }

    .violation-item.warning {
        border-left: 4px solid var(--warning-color, #f59e0b);
    }

    .violation-item.info {
        border-left: 4px solid var(--info-color, #3b82f6);
    }

    .violation-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .violation-header:hover {
        background: var(--bg-secondary, #f9fafb);
    }

    .violation-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
    }

    .violation-content {
        flex: 1;
    }

    .violation-message {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary, #111827);
        line-height: 1.5;
    }

    .violation-rule {
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
        margin-top: 0.25rem;
    }

    .violation-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .fix-btn,
    .apply-btn {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        border: 1px solid var(--primary-color, #3b82f6);
        background: var(--primary-color, #3b82f6);
        color: white;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .fix-btn:hover,
    .apply-btn:hover {
        background: var(--primary-hover, #2563eb);
    }

    .expand-btn {
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: var(--text-secondary, #6b7280);
    }

    .chevron {
        transition: transform 0.2s;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    .violation-details {
        padding: 0 1.5rem 1rem 3.5rem;
        background: var(--bg-secondary, #f9fafb);
    }

    .detail-section {
        margin-bottom: 1rem;
    }

    .detail-section:last-child {
        margin-bottom: 0;
    }

    .detail-section h4 {
        margin: 0 0 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text-secondary, #6b7280);
    }

    .detail-section p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-primary, #111827);
        line-height: 1.5;
    }

    .affected-list {
        margin: 0;
        padding: 0 0 0 1.25rem;
        font-size: 0.875rem;
        color: var(--text-primary, #111827);
    }

    .suggestions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .suggestion {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: var(--bg-primary, #ffffff);
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .expression {
        display: block;
        padding: 0.5rem 0.75rem;
        background: var(--bg-tertiary, #111827);
        color: var(--text-code, #f3f4f6);
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.75rem;
        overflow-x: auto;
    }

    .validation-empty {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #6b7280);
    }

    @media (max-width: 640px) {
        .validation-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .severity-filters {
            width: 100%;
            overflow-x: auto;
        }

        .violation-details {
            padding-left: 1.5rem;
        }
    }
</style>