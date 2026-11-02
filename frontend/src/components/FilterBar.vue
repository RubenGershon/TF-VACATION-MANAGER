<script setup>
// Status and user filters of the validator dashboard.
const status = defineModel('status', { default: '' })
const userId = defineModel('userId', { default: '' })

defineProps({
  users: { type: Array, required: true },
})
</script>

<template>
  <div class="card flex flex-wrap gap-3">
    <label class="text-sm">
      Status
      <select v-model="status" class="input mt-1">
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </label>

    <label class="text-sm">
      User
      <select v-model="userId" class="input mt-1">
        <option value="">All</option>
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </label>
  </div>
</template>
