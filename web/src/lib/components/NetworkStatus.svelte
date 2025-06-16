<!-- web/src/lib/components/NetworkStatus.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';

    let showBanner = $state(false);

    $effect(() => {
        showBanner = !configStore.isOnline;
    });
</script>

{#if showBanner}
    <div class="network-banner offline">
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
        <span>You're offline - changes will be saved when connection is restored</span>
    </div>
{/if}

<style>
    .network-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1000;
    }

    .network-banner.offline {
        background: var(--warning);
        color: white;
    }

    .icon {
        width: 1.25rem;
        height: 1.25rem;
    }
</style>