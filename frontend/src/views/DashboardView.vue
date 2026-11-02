<script setup>
// Validator page: all requests with filters, pagination, and approve and reject actions.
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { errorMessage } from '../api/http'
import AlertMessage from '../components/AlertMessage.vue'
import FilterBar from '../components/FilterBar.vue'
import PaginationBar from '../components/PaginationBar.vue'
import RejectModal from '../components/RejectModal.vue'
import RequestTable from '../components/RequestTable.vue'

const PAGE_SIZE = 10
const store = useStore()

const status = ref('')
const userId = ref('')
const page = ref(1)
const error = ref('')
const requestToReject = ref(null)

const list = computed(() => store.state.requests.list)
const loading = computed(() => store.state.requests.loading)
const requesters = computed(() => store.state.requests.requesters)

async function load() {
  try {
    await store.dispatch('requests/loadRequests', {
      page: page.value,
      limit: PAGE_SIZE,
      status: status.value || undefined,
      userId: userId.value || undefined,
    })
    // If the last row of a later page was just actioned, that page no longer exists: go back to the last one.
    const lastPage = Math.max(1, Math.ceil(list.value.total / PAGE_SIZE))
    if (page.value > lastPage) {
      page.value = lastPage
      await load()
    }
  } catch (e) {
    error.value = errorMessage(e)
  }
}

function changePage(newPage) {
  page.value = newPage
  load()
}

// A new filter always starts again from the first page
watch([status, userId], () => changePage(1))

// Runs an approve or reject call, shows the result as a toast, then refreshes the list
async function runAction(action, successMessage) {
  try {
    await action()
    store.dispatch('toasts/show', { message: successMessage })
  } catch (e) {
    store.dispatch('toasts/show', { message: errorMessage(e), type: 'error' })
  }
  await load()
}

function approve(request) {
  return runAction(() => store.dispatch('requests/approveRequest', request.id), 'Request approved.')
}

function reject(comment) {
  const { id } = requestToReject.value
  requestToReject.value = null
  return runAction(() => store.dispatch('requests/rejectRequest', { id, comment }), 'Request rejected.')
}

onMounted(() => {
  store.dispatch('requests/loadRequesters')
  load()
})
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-4 p-4">
    <h1 class="text-xl font-semibold text-slate-900">All vacation requests</h1>

    <FilterBar v-model:status="status" v-model:user-id="userId" :users="requesters" />

    <AlertMessage :message="error" />

    <RequestTable
      :requests="list.items"
      :loading="loading"
      show-user
      show-actions
      @approve="approve"
      @reject="requestToReject = $event"
    />
    <PaginationBar :page="list.page" :limit="list.limit" :total="list.total" @change="changePage" />

    <RejectModal
      v-if="requestToReject"
      :request="requestToReject"
      @confirm="reject"
      @cancel="requestToReject = null"
    />
  </main>
</template>
