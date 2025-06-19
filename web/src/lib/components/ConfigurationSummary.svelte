<!-- web/src/lib/components/ConfigurationSummary.svelte -->
<!-- Configuration summary display component -->
<script>
    import { sanitizeText } from '../utils/sanitizer.js';
    
    let {
        selections = {},
        options = [],
        groups = [],
        compact = false,
        configuration = null,
        model = null,
        onEdit = null
    } = $props();

    // Get selected options with their details
    const selectedOptions = $derived(options
        .filter(option => selections[option.id] > 0)
        .map(option => ({
            ...option,
            quantity: selections[option.id],
            group: groups.find(g => g.id === option.group_id)
        }))
        .sort((a, b) => (a.group_id || '').localeCompare(b.group_id || '')));
    
    // Calculate total price
    const totalPrice = $derived(selectedOptions.reduce((sum, option) => 
        sum + (option.base_price || 0) * option.quantity, 0
    ));
    
    // Group selected options by group
    const groupedSelections = $derived(selectedOptions.reduce((grouped, option) => {
        const groupName = option.group?.name || 'Other Options';
        if (!grouped[groupName]) {
            grouped[groupName] = [];
        }
        grouped[groupName].push(option);
        return grouped;
    }, {}));
</script>

<div class="configuration-summary" class:compact>
    {#if selectedOptions.length === 0}
        <p class="empty-state">No options selected yet</p>
    {:else if compact}
        <!-- Compact view for sidebar -->
        <div class="compact-list">
            {#each selectedOptions as option}
                <div class="summary-item">
                    <span class="item-name">{sanitizeText(option.name)}</span>
                    {#if option.base_price > 0}
                        <span class="item-price">+${option.base_price.toFixed(2)}</span>
                    {/if}
                </div>
            {/each}
        </div>
        
        <div class="summary-total">
            <span>Total:</span>
            <span class="total-price">${totalPrice.toFixed(2)}</span>
        </div>
    {:else}
        <!-- Full view for detailed summary -->
        <div class="full-summary">
            {#if configuration}
                <!-- Configuration header -->
                <div class="summary-header">
                    <div class="header-info">
                        <h3>Configuration Summary</h3>
                        <p class="config-id">ID: {configuration.id || 'Not saved'}</p>
                    </div>
                    
                    <div class="header-status">
                        {#if configuration.validation?.is_valid}
                            <span class="status-badge valid">✅ Valid</span>
                        {:else}
                            <span class="status-badge invalid">⚠️ Issues</span>
                        {/if}
                    </div>
                </div>
            {/if}
            
            <!-- Selected options by group -->
            <div class="selections-section">
                <h4 class="section-title">Selected Options ({selectedOptions.length})</h4>
                
                {#each Object.entries(groupedSelections) as [groupName, groupOptions]}
                    <div class="group-section">
                        <h5 class="group-name">{groupName}</h5>
                        {#each groupOptions as option}
                            <div class="option-row">
                                <div class="option-details">
                                    <span class="option-name">{sanitizeText(option.name)}</span>
                                    {#if option.sku}
                                        <span class="option-sku">SKU: {option.sku}</span>
                                    {/if}
                                </div>
                                <div class="option-pricing">
                                    {#if option.quantity > 1}
                                        <span class="quantity">{option.quantity}x</span>
                                    {/if}
                                    {#if option.base_price > 0}
                                        <span class="price">${(option.base_price * option.quantity).toFixed(2)}</span>
                                    {:else}
                                        <span class="included">Included</span>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
            
            <!-- Total -->
            <div class="summary-footer">
                <div class="total-row">
                    <span class="total-label">Configuration Total</span>
                    <span class="total-amount">${totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .configuration-summary {
        font-size: 0.875rem;
    }
    
    .configuration-summary.compact {
        background: transparent;
    }
    
    .empty-state {
        text-align: center;
        color: var(--text-secondary, #6b7280);
        padding: 1rem;
        margin: 0;
    }
    
    /* Compact view styles */
    .compact-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.375rem 0;
        border-bottom: 1px solid var(--border-light, #f3f4f6);
    }
    
    .summary-item:last-child {
        border-bottom: none;
    }
    
    .item-name {
        color: var(--text-primary, #111827);
        font-weight: 500;
        flex: 1;
        margin-right: 0.5rem;
        font-size: 0.875rem;
    }
    
    .item-price {
        color: var(--primary-color, #3b82f6);
        font-weight: 600;
        white-space: nowrap;
        font-size: 0.875rem;
    }
    
    .summary-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.75rem;
        margin-top: 0.75rem;
        border-top: 2px solid var(--border-color, #e5e7eb);
        font-weight: 600;
    }
    
    .total-price {
        color: var(--primary-color, #3b82f6);
        font-size: 1rem;
    }
    
    /* Full view styles */
    .full-summary {
        background: var(--bg-primary, #ffffff);
        border-radius: 0.5rem;
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
    
    .selections-section {
        padding: 1.5rem;
    }
    
    .section-title {
        margin: 0 0 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #6b7280);
    }
    
    .group-section {
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        margin-bottom: 1rem;
    }
    
    .group-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .group-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
        margin: 0 0 0.5rem;
    }
    
    .option-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
    }
    
    .option-details {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        flex: 1;
    }
    
    .option-name {
        font-weight: 500;
        color: var(--text-primary, #111827);
    }
    
    .option-sku {
        font-size: 0.75rem;
        color: var(--text-tertiary, #9ca3af);
    }
    
    .option-pricing {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quantity {
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }
    
    .price {
        font-weight: 600;
        color: var(--primary-color, #3b82f6);
    }
    
    .included {
        font-size: 0.875rem;
        color: var(--success-color, #10b981);
    }
    
    .summary-footer {
        padding: 1.5rem;
        background: var(--bg-secondary, #f9fafb);
        border-top: 1px solid var(--border-color, #e5e7eb);
    }
    
    .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .total-label {
        font-weight: 600;
        color: var(--text-primary, #111827);
    }
    
    .total-amount {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary-color, #3b82f6);
    }
    
    @media (max-width: 640px) {
        .summary-header {
            flex-direction: column;
            gap: 1rem;
        }
    }
</style>