<script setup>
// Requester page: balance, new request form, and the list of my requests with cancel.
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { errorMessage } from '../api/http'
import AlertMessage from '../components/AlertMessage.vue'
import BalanceCard from '../components/BalanceCard.vue'
import PaginationBar from '../components/PaginationBar.vue'
import RequestForm from '../components/RequestForm.vue'
import RequestTable from '../components/RequestTable.vue'

const PAGE_SIZE = 10
const store = useStore()

const page = ref(1)
const error = ref('')

const list = computed(() => store.state.requests.list)
const loading = computed(() => store.state.requests.loading)
const balance = computed(() => store.state.requests.balance)

// The list and the balance change together, so they are always reloaded together.
async function load() {
  try {
    await Promise.all([
      store.dispatch('requests/loadRequests', { page: page.value, limit: PAGE_SIZE }),
      store.dispatch('requests/loadBalance'),
    ])
  } catch (e) {
    error.value = errorMessage(e)
  }
}

function changePage(newPage) {
  page.value = newPage
  load()
}

async function cancel(request) {
  if (!window.confirm(`Cancel your request from ${request.startDate} to ${request.endDate}?`)) return
  try {
    await store.dispatch('requests/cancelRequest', request.id)
    store.dispatch('toasts/show', { message: 'Request cancelled.' })
  } catch (e) {
    store.dispatch('toasts/show', { message: errorMessage(e), type: 'error' })
  }
  load()
}

onMounted(load)
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-4 p-4">
    <BalanceCard v-if="balance" :balance="balance" />
    <RequestForm @created="changePage(1)" />

    <h2 class="font-semibold">My requests</h2>
    <AlertMessage :message="error" />
    <RequestTable :requests="list.items" :loading="loading" can-cancel @cancel="cancel" />
    <PaginationBar :page="list.page" :limit="list.limit" :total="list.total" @change="changePage" />
  </main>
</template>
