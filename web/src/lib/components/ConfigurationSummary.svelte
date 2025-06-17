<!-- web/src/lib/components/ConfigurationSummary.svelte -->
<script>
    let {
        configuration,
        model,
        onEdit
    } = $props();

    function formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    }

    function formatPrice(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    // Group selections by group
    let groupedSelections = $derived(() => {
        const groups = new Map();

        if (Array.isArray(configuration?.selections)) {
            configuration.selections.forEach(sel => {
                const groupName = sel.group_name || 'Other Options';
                if (!groups.has(groupName)) {
                    groups.set(groupName, []);
                }
                groups.get(groupName).push(sel);
            });
        }

        return Array.from(groups.entries());
    });
</script>

<div class="configuration-summary">
    <!-- Header -->
    <div class="summary-header">
        <div class="header-info">
            <h3>Configuration Summary</h3>
            <p class="config-id">ID: {configuration?.id || 'Not saved'}</p>
        </div>

        <div class="header-status">
            {#if configuration?.validation?.is_valid}
                <span class="status-badge valid">✅ Valid</span>
            {:else}
                <span class="status-badge invalid">⚠️ Issues</span>
            {/if}
        </div>
    </div>

    <!-- Model Information -->
    <div class="summary-section">
        <h4 class="section-title">Product Model</h4>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Model</span>
                <span class="value">{configuration?.model_name || model?.name || 'Unknown'}</span>
            </div>
            <div class="info-item">
                <span class="label">Created</span>
                <span class="value">{formatDate(configuration?.metadata?.created)}</span>
            </div>
            <div class="info-item">
                <span class="label">Last Updated</span>
                <span class="value">{formatDate(configuration?.metadata?.updated)}</span>
            </div>
        </div>
    </div>

    <!-- Selected Options -->
    <div class="summary-section">
        <div class="section-header">
            <h4 class="section-title">Selected Options ({configuration?.selections?.length || 0})</h4>
            {#if onEdit}
                <button class="edit-btn" onclick={() => onEdit(0)}>
                    Edit Selections
                </button>
            {/if}
        </div>

        {#if groupedSelections.length > 0}
            <div class="selections-list">
                {#each groupedSelections as [groupName, selections]}
                    <div class="selection-group">
                        <h5 class="group-name">{groupName}</h5>
                        <div class="group-items">
                            {#each selections as selection}
                                <div class="selection-item">
                                    <div class="item-info">
                                        <span class="item-name">{selection.option_name}</span>
                                        {#if selection.quantity > 1}
                                            <span class="item-quantity">×{selection.quantity}</span>
                                        {/if}
                                    </div>
                                    <span class="item-price">{formatPrice(selection.total_price)}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="empty-message">No options selected</p>
        {/if}
    </div>

    <!-- Validation Summary -->
    {#if configuration?.validation?.violations?.length > 0}
        <div class="summary-section">
            <div class="section-header">
                <h4 class="section-title validation-title">
                    Validation Issues ({configuration.validation.violations.length})
                </h4>
                {#if onEdit}
                    <button class="edit-btn" onclick={() => onEdit(1)}>
                        Review Issues
                    </button>
                {/if}
            </div>

            <div class="violations-summary">
                {#each configuration.validation.violations.slice(0, 3) as violation}
                    <div class="violation-summary">
            <span class="violation-icon">
              {violation.severity === 'critical' ? '🚫' : '⚠️'}
            </span>
                        <span class="violation-text">{violation.message}</span>
                    </div>
                {/each}
                {#if configuration.validation.violations.length > 3}
                    <p class="more-violations">
                        +{configuration.validation.violations.length - 3} more issues
                    </p>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Pricing Summary -->
    <div class="summary-section">
        <div class="section-header">
            <h4 class="section-title">Pricing Summary</h4>
            {#if onEdit}
                <button class="edit-btn" onclick={() => onEdit(2)}>
                    View Details
                </button>
            {/if}
        </div>

        <div class="pricing-summary">
            <div class="price-line">
                <span class="label">Base Price</span>
                <span class="value">{formatPrice(configuration?.pricing?.base_price)}</span>
            </div>

            {#if configuration?.pricing?.discounts?.length > 0}
                <div class="price-line discount">
                    <span class="label">Discounts Applied</span>
                    <span class="value">
            -{formatPrice(
                        configuration.pricing.discounts.reduce((sum, d) => sum + d.amount, 0)
                    )}
          </span>
                </div>
            {/if}

            <div class="price-line total">
                <span class="label">Total Price</span>
                <span class="value">{formatPrice(configuration?.pricing?.total_price)}</span>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div class="summary-actions">
        <button class="action-btn secondary" onclick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 3V1h6v2H5zM4 3H2.5A1.5 1.5 0 001 4.5V10h2V8h10v2h2V4.5A1.5 1.5 0 0013.5 3H12v2H4V3zm9 7h-2v4H5v-4H3v4.5A1.5 1.5 0 004.5 16h7a1.5 1.5 0 001.5-1.5V10z"/>
            </svg>
            Print Summary
        </button>

        <button class="action-btn secondary" onclick={() => {
      const data = JSON.stringify(configuration, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configuration-${configuration?.id || 'draft'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm10-1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V2a1 1 0 00-1-1z"/>
                <path d="M8 3.5a.5.5 0 01.5.5v4.793l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L7.5 8.793V4a.5.5 0 01.5-.5z"/>
            </svg>
            Export Configuration
        </button>
    </div>
</div>

<style>
    .configuration-summary {
        background: var(--bg-primary, #ffffff);
        border-radius: 8px;
        overflow: hidden;
    }

    .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.5rem;
        background: var(--bg-secondary, #f9fafb);
        border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .header-info h3 {
        margin: 0 0 0.25rem;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .config-id {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
        font-family: monospace;
    }

    .status-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 999px;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .status-badge.valid {
        background: var(--success-bg, #d1fae5);
        color: var(--success-text, #065f46);
    }

    .status-badge.invalid {
        background: var(--warning-bg, #fef3c7);
        color: var(--warning-text, #92400e);
    }

    .summary-section {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .summary-section:last-of-type {
        border-bottom: none;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .section-title {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text-secondary, #6b7280);
    }

    .section-title.validation-title {
        color: var(--warning-text, #92400e);
    }

    .edit-btn {
        padding: 0.25rem 0.75rem;
        border: 1px solid var(--primary-color, #3b82f6);
        background: transparent;
        color: var(--primary-color, #3b82f6);
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .edit-btn:hover {
        background: var(--primary-color, #3b82f6);
        color: white;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-item .label {
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
    }

    .info-item .value {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary, #111827);
    }

    .selections-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .selection-group {
        background: var(--bg-tertiary, #f9fafb);
        border-radius: 6px;
        padding: 1rem;
    }

    .group-name {
        margin: 0 0 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
    }

    .group-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .selection-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: var(--bg-primary, #ffffff);
        border-radius: 4px;
    }

    .item-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .item-name {
        font-size: 0.875rem;
        color: var(--text-primary, #111827);
    }

    .item-quantity {
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
        font-weight: 500;
    }

    .item-price {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--primary-color, #3b82f6);
    }

    .violations-summary {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .violation-summary {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--warning-bg, #fef3c7);
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .violation-icon {
        flex-shrink: 0;
    }

    .violation-text {
        color: var(--warning-text, #92400e);
    }

    .more-violations {
        margin: 0.5rem 0 0;
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
        font-style: italic;
    }

    .pricing-summary {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .price-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
    }

    .price-line.discount {
        color: var(--success-color, #10b981);
    }

    .price-line.total {
        padding-top: 0.5rem;
        margin-top: 0.5rem;
        border-top: 1px solid var(--border-color, #e5e7eb);
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary, #111827);
    }

    .empty-message {
        text-align: center;
        color: var(--text-secondary, #6b7280);
        padding: 2rem;
        font-style: italic;
    }

    .summary-actions {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        background: var(--bg-secondary, #f9fafb);
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-radius: 6px;
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-primary, #ffffff);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover {
        background: var(--bg-tertiary, #f3f4f6);
    }

    @media (max-width: 640px) {
        .summary-header {
            flex-direction: column;
            gap: 1rem;
        }

        .info-grid {
            grid-template-columns: 1fr;
        }

        .summary-actions {
            flex-direction: column;
        }

        .action-btn {
            width: 100%;
            justify-content: center;
        }
    }
</style>