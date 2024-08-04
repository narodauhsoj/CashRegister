<script setup lang="ts">
import CashRegister from './CashRegister.vue'
import { ref } from 'vue'

let register = ref<typeof CashRegister>()
</script>

<template>
  <CashRegister ref="register"></CashRegister>
</template>
