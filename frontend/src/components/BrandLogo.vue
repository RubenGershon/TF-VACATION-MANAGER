<script setup>
// The app logo: a gradient calendar badge with the app name. "large" is used on the login page.
defineProps({ large: { type: Boolean, default: false } })
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span
      class="flex items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-300"
      :class="large ? 'h-11 w-11' : 'h-8 w-8'"
    >
      <svg :class="large ? 'h-6 w-6' : 'h-5 w-5'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M8 3v4M16 3v4M3.5 10h17" />
        <path d="m9.5 15 2 2 3.5-3.5" />
      </svg>
    </span>
    <span class="font-semibold tracking-tight text-slate-900" :class="large ? 'text-2xl' : 'text-lg'">
      Away
    </span>
  </span>
</template>
