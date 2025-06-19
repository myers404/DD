<!-- web/src/lib/components/ValidationDisplay.svelte -->
<!-- Matching ConstraintTester style with violations, satisfied rules, and rule list -->
<script>
    let {
        validationResults,
        model,
        onFix
    } = $props();

    let violations = $derived(validationResults?.violations || []);
    let allRules = $derived(model?.rules || []);
    
    // Derive satisfied rules by checking which rules are not violated
    let satisfiedRules = $derived(
        !allRules || !validationResults 
            ? []
            : (() => {
                const violatedRuleIds = new Set(violations.map(v => v.rule_id));
                return allRules
                    .filter(rule => !violatedRuleIds.has(rule.id))
                    .map(rule => ({
                        rule_id: rule.id,
                        rule_name: rule.name,
                        message: `${rule.name} constraint satisfied`
                    }));
              })()
    );

    // Check if configuration has selections
    let hasSelections = $derived(validationResults !== null);
</script>

<div class="validation-container">
    <!-- Constraint Evaluation Section -->
    <div class="evaluation-section">
        <h4 class="section-title">Constraint Evaluation</h4>
        
        {#if !hasSelections}
            <div class="no-selections">
                <p>Select options to see constraint evaluation</p>
            </div>
        {:else}
            <!-- Rule Violations -->
            {#if violations.length > 0}
                <div class="violations-section">
                    <h5 class="subsection-title">
                        <span class="error-icon">❌</span>
                        Rule Violations ({violations.length})
                    </h5>
                    <div class="rules-list">
                        {#each violations as violation}
                            <div class="rule-item violation">
                                <div class="rule-name">{violation.rule_name || 'Constraint Rule'}</div>
                                <div class="rule-message">{violation.message}</div>
                                {#if violation.expression}
                                    <div class="rule-expression">{violation.expression}</div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Satisfied Rules -->
            {#if satisfiedRules.length > 0}
                <div class="satisfied-section">
                    <h5 class="subsection-title">
                        <span class="success-icon">✅</span>
                        Satisfied Rules ({satisfiedRules.length})
                    </h5>
                    <div class="rules-list">
                        {#each satisfiedRules as rule}
                            <div class="rule-item satisfied">
                                <div class="rule-name-small">{rule.rule_name || rule.name}</div>
                                <div class="rule-message-small">{rule.message || 'Rule satisfied'}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

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
        {/if}
    </div>

    <!-- Active Constraint Rules Section -->
    <div class="rules-info-section">
        <h4 class="section-title">Active Constraint Rules</h4>
        
        {#if allRules.length > 0}
            <div class="constraint-rules-list">
                {#each allRules as rule}
                    <div class="constraint-rule-card">
                        <h5 class="rule-title">{rule.name}</h5>
                        <p class="rule-expression-display">{rule.expression}</p>
                        <p class="rule-description">{rule.message || rule.description}</p>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="no-rules">No constraint rules defined for this model</p>
        {/if}
    </div>
</div>

<style>
    .validation-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .evaluation-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
    }

    .rules-info-section {
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

    .satisfied-section .subsection-title {
        color: #059669;
    }

    .error-icon, .success-icon, .status-icon {
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
        border-color: #ef4444;
    }

    .rule-item.satisfied {
        background: #d1fae5;
        border-color: #10b981;
        padding: 8px 12px;
    }

    .rule-name {
        font-weight: 500;
        color: #991b1b;
        margin-bottom: 4px;
    }

    .rule-message {
        font-size: 13px;
        color: #dc2626;
        line-height: 1.4;
    }

    .rule-expression {
        font-family: monospace;
        font-size: 11px;
        color: #7f1d1d;
        margin-top: 4px;
    }

    .rule-name-small {
        font-weight: 500;
        font-size: 13px;
        color: #065f46;
    }

    .rule-message-small {
        font-size: 12px;
        color: #059669;
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

    .constraint-rules-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .constraint-rule-card {
        padding: 16px;
        border: 1px solid;
        border-radius: 8px;
    }

    .constraint-rule-card:nth-child(1) {
        background: #dbeafe;
        border-color: #3b82f6;
    }

    .constraint-rule-card:nth-child(2) {
        background: #e0e7ff;
        border-color: #6366f1;
    }

    .constraint-rule-card:nth-child(3) {
        background: #dcfce7;
        border-color: #22c55e;
    }

    .rule-title {
        margin: 0 0 8px 0;
        font-weight: 500;
        font-size: 14px;
    }

    .constraint-rule-card:nth-child(1) .rule-title {
        color: #1e40af;
    }

    .constraint-rule-card:nth-child(2) .rule-title {
        color: #4338ca;
    }

    .constraint-rule-card:nth-child(3) .rule-title {
        color: #16a34a;
    }

    .rule-expression-display {
        margin: 0 0 4px 0;
        font-family: monospace;
        font-size: 12px;
        color: #374151;
    }

    .rule-description {
        margin: 0;
        font-size: 12px;
        color: #4b5563;
        line-height: 1.4;
    }

    .no-rules {
        text-align: center;
        color: #6b7280;
        padding: 16px;
    }
</style>