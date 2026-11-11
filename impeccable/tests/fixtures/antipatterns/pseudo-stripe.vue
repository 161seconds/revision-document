<template>
  <div class="card">
    <div class="body">Component with a pseudo-element stripe in its style block</div>
  </div>
</template>

<script setup>
const label = 'pseudo-stripe fixture';
</script>

<style scoped>
/* FLAG: same silhouette as a border side-tab, drawn as a ::before bar on a
   rounded card */
.card[data-case="Component Left Edge"] {
  border-radius: 12px;
}
.card[data-case="Component Left Edge"]::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: #7c3aed;
}

/* PASS: the same bar on a square host */
.card[data-case="Component Square Host"] {
  border-radius: 0;
}
.card[data-case="Component Square Host"]::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: #7c3aed;
}

/* PASS: neutral hairline divider */
.card[data-case="Component Neutral Divider"]::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 1px;
  background: #e5e7eb;
}
</style>
