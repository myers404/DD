<!-- web/src/lib/components/ValidationDisplay.svelte -->
<!-- Matching ConstraintTester style with violations, satisfied rules, and rule list -->
<script>
    let {
        validationResults
    } = $props();

    let violations = $derived(validationResults?.violations || []);
    let hasSelections = $derived(validationResults !== null);
</script>

<div class="validation-container">
    <!-- Validation Status Section -->
    <div class="validation-section">
        <h4 class="section-title">Configuration Status</h4>
        
        {#if !hasSelections}
            <div class="no-selections">
                <p>Select options to see validation status</p>
            </div>
        {:else}
            <!-- Overall Status -->
            <div class="overall-status {violations.length === 0 ? 'valid' : 'invalid'}">
                <div class="status-content">
                    {#if violations.length === 0}
                        <span class="status-icon">✅</span>
                        <span class="status-text">Configuration Valid</span>
                    {:else}
                        <span class="status-icon">❌</span>
                        <span class="status-text">Configuration Invalid</span>
                    {/if}
                </div>
            </div>

            <!-- Rule Violations (only show if there are any) -->
            {#if violations.length > 0}
                <div class="violations-section">
                    <h5 class="subsection-title">
                        <span class="error-icon">⚠️</span>
                        Issues to resolve:
                    </h5>
                    <div class="rules-list">
                        {#each violations as violation}
                            <div class="rule-item violation">
                                <div class="rule-message">{violation.message}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>

<style>
    .validation-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .validation-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
    }

    .section-title {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
    }

    .subsection-title {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .violations-section {
        margin-bottom: 16px;
    }

    .violations-section .subsection-title {
        color: #dc2626;
    }

    .error-icon, .status-icon {
        font-size: 16px;
    }

    .rules-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .rule-item {
        padding: 12px;
        border-radius: 6px;
        border: 1px solid;
    }

    .rule-item.violation {
        background: #fee2e2;
        border-color: #fecaca;
    }

    .rule-message {
        font-size: 14px;
        color: #dc2626;
        line-height: 1.5;
    }

    .overall-status {
        margin-top: 16px;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid;
    }

    .overall-status.valid {
        background: #d1fae5;
        border-color: #10b981;
    }

    .overall-status.invalid {
        background: #fee2e2;
        border-color: #ef4444;
    }

    .status-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 500;
        font-size: 16px;
    }

    .overall-status.valid .status-content {
        color: #065f46;
    }

    .overall-status.invalid .status-content {
        color: #991b1b;
    }

    .no-selections {
        padding: 24px;
        text-align: center;
        color: #6b7280;
    }
</style>