<!-- web/src/lib/components/UndoRedo.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';
</script>

<div class="undo-redo">
    <button
            class="action-btn"
            disabled={!configStore.canUndo}
            onclick={() => configStore.undo()}
            title="Undo"
    >
        <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.207 2.293a1 1 0 010 1.414L10.914 5H13a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5h-2.586l1.293 1.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" />
        </svg>
    </button>

    <button
            class="action-btn"
            disabled={!configStore.canRedo}
            onclick={() => configStore.redo()}
            title="Redo"
    >
        <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.793 2.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.086 7H7a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h2.586L7.793 3.707a1 1 0 010-1.414z" />
        </svg>
    </button>
</div>

<style>
    .undo-redo {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        padding: 0.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover:not(:disabled) {
        background: var(--bg);
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .action-btn svg {
        width: 1.25rem;
        height: 1.25rem;
        color: var(--text-secondary);
    }
</style>