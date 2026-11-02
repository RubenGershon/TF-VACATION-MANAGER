<script setup>
// Table of vacation requests, with optional user column and approve, reject and cancel buttons.
import StatusBadge from './StatusBadge.vue'

defineProps({
  requests: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  showUser: { type: Boolean, default: false },
  showActions: { type: Boolean, default: false },
  canCancel: { type: Boolean, default: false },
})

defineEmits(['approve', 'reject', 'cancel'])
</script>

<template>
  <div class="card overflow-x-auto">
    <p v-if="loading" class="py-6 text-center text-sm text-slate-500">Loading...</p>
    <p v-else-if="requests.length === 0" class="py-6 text-center text-sm text-slate-500">No requests found.</p>

    <table v-else class="w-full text-left text-sm">
      <thead class="border-b border-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
        <tr>
          <th v-if="showUser" class="py-2 pr-4">User</th>
          <th class="py-2 pr-4">Dates</th>
          <th class="py-2 pr-4">Days</th>
          <th class="py-2 pr-4">Reason</th>
          <th class="py-2 pr-4">Status</th>
          <th class="py-2 pr-4">Comment</th>
          <th v-if="showActions || canCancel" class="py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in requests" :key="request.id" class="border-b border-slate-100 last:border-0 hover:bg-slate-50">
          <td v-if="showUser" class="py-2 pr-4">{{ request.userName }}</td>
          <td class="py-2 pr-4 whitespace-nowrap">{{ request.startDate }} to {{ request.endDate }}</td>
          <td class="py-2 pr-4">{{ request.days }}</td>
          <td class="py-2 pr-4">{{ request.reason || '-' }}</td>
          <td class="py-2 pr-4"><StatusBadge :status="request.status" /></td>
          <td class="py-2 pr-4">{{ request.comments || '-' }}</td>
          <td v-if="showActions || canCancel" class="py-2 whitespace-nowrap">
            <div class="flex h-9 items-center gap-2" :class="{ 'invisible': request.status !== 'PENDING' }">
              <template v-if="request.status === 'PENDING'">
                <template v-if="showActions">
                  <button class="btn-success" @click="$emit('approve', request)">Approve</button>
                  <button class="btn-danger" @click="$emit('reject', request)">Reject</button>
                </template>
                <button v-if="canCancel" class="btn-secondary" @click="$emit('cancel', request)">Cancel</button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
