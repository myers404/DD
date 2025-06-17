<!-- web/src/lib/components/SafeText.svelte -->
<script>
    import { sanitizeText } from '../utils/sanitizer.js';

    let {
        text = '',
        fallback = '',
        tag = 'span',
        class: className = ''
    } = $props();

    // Ensure text is safe
    let safeContent = $derived(sanitizeText(text, fallback));
</script>

{#if tag === 'p'}
    <p class={className}>{safeContent}</p>
{:else if tag === 'h1'}
    <h1 class={className}>{safeContent}</h1>
{:else if tag === 'h2'}
    <h2 class={className}>{safeContent}</h2>
{:else if tag === 'h3'}
    <h3 class={className}>{safeContent}</h3>
{:else if tag === 'h4'}
    <h4 class={className}>{safeContent}</h4>
{:else if tag === 'div'}
    <div class={className}>{safeContent}</div>
{:else}
    <span class={className}>{safeContent}</span>
{/if}