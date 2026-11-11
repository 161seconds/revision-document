<script>
  import { onMount } from 'svelte';

  let expenses = $state([]);

  onMount(() => {
    window.__impeccableStatefulMounts = (window.__impeccableStatefulMounts || 0) + 1;
  });

  const CATALOG = [
    { name: 'Design snack', amount: '$12', doc: '/receipts/snack' },
    { name: 'Studio coffee', amount: '$8', doc: '/receipts/coffee' },
    { name: 'Type license', amount: '$44', doc: '/receipts/type' },
  ];

  function addExpense() {
    const next = CATALOG[expenses.length % CATALOG.length];
    expenses = [...expenses, { id: expenses.length + 1, ...next }];
  }
</script>

<main class="page">
  <header class="expense-header">
    <h1 class="hero-title">Offene Ausgaben</h1>
    <span class="open-count" data-testid="open-count">{expenses.length} offen</span>
    <button class="add-button" data-testid="add-expense" type="button" onclick={addExpense}>
      Ausgabe hinzufügen
    </button>
  </header>

  <section class="expense-panel">
    {#if expenses.length === 0}
      <article class="empty-card">
        <strong>Keine offenen Ausgaben.</strong>
        <p>Fügt die nächste gemeinsame Ausgabe hinzu, dann landet sie hier.</p>
      </article>
    {:else}
      <ul class="expense-list" data-testid="expense-list">
        {#each expenses as expense, i}
          <li class="expense-row" data-testid="expense-row" data-index={i}>
            <strong class="expense-name">{expense.name}</strong>
            <span class="expense-amount">{expense.amount}</span>
            <a class="expense-doc" href={expense.doc}>Beleg</a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <aside class="detect-target" data-testid="detect-target">
    <strong>Audit edge case</strong>
    <p>This deliberately keeps a one-sided accent border for the Detect smoke test.</p>
  </aside>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #102923;
    color: #f4f7f3;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .page {
    width: min(920px, calc(100vw - 48px));
    margin: 40px auto;
  }

  .expense-header {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 18px;
  }

  .hero-title {
    margin: 0;
    font-size: 34px;
    line-height: 1;
  }

  .open-count {
    border-radius: 999px;
    background: #eef4ef;
    color: #162820;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 700;
  }

  .add-button {
    border: 0;
    border-radius: 999px;
    background: #f8fbf8;
    color: #142720;
    padding: 12px 18px;
    font-weight: 700;
  }

  .expense-panel {
    margin-top: 24px;
    border-radius: 28px;
    background: #9bbfad;
    padding: 46px;
    color: #1b3329;
  }

  .empty-card {
    border: 1px solid #16332b;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.62);
    padding: 26px;
  }

  /* The padding is what the E2E picker aims at: a container whose centre is
     covered by a child can never be hovered, so the list keeps a band of its
     own around the rows. */
  .expense-list {
    display: grid;
    gap: 14px;
    margin: 0;
    padding: 24px;
    list-style: none;
    font-weight: 500;
  }

  .expense-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #16332b;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.62);
    padding: 26px;
  }

  .detect-target {
    margin-top: 28px;
    border-left: 6px solid #f4c430;
    border-radius: 0 14px 14px 0;
    background: rgba(255, 255, 255, 0.62);
    padding: 16px 18px;
    color: #1b3329;
  }

  .detect-target strong,
  .detect-target p {
    margin: 0;
  }

  .detect-target p {
    margin-top: 6px;
    font-size: 14px;
  }
</style>
