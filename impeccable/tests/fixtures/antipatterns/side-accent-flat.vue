<template>
  <div class="card" :class="{ active }"><slot /></div>
</template>

<script setup>
defineProps({ active: Boolean });
</script>

<style scoped>
/* FLAG: the card's radius in its own rule, the accent in a compound rule */
.card {
  border-radius: 12px;
  padding: 16px;
}
.card.active {
  border-left: 4px solid #0f766e;
}

/* FLAG: a radius on another class the element may carry */
.panel {
  border-radius: 8px;
}
.panel-accent {
  border-right: 5px solid #0f766e;
}

/* PASS: a box squared off in its own rule */
.note {
  border-radius: 0;
}
.note.active {
  border-left: 6px solid #0f766e;
}
</style>
