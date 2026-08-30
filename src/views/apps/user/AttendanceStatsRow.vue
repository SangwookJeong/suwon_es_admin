<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
})

const userListStore = useUserListStore()

const monthly = ref({ total: 0, present: 0, rate: 0, label: '' })
const quarterly = ref({ total: 0, present: 0, rate: 0, label: '' })
const yearly = ref({ total: 0, present: 0, rate: 0, label: '' })
const loading = ref(true)

const fetchStats = () => {
  loading.value = true
  userListStore.fetchUserAttendanceStats(props.userId).then(response => {
    monthly.value = response.data.monthly
    quarterly.value = response.data.quarterly
    yearly.value = response.data.yearly
  }).finally(() => {
    loading.value = false
  })
}

watch(() => props.userId, fetchStats, { immediate: true })

const rateColor = rate => {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'

  return 'error'
}

const stats = computed(() => [
  { title: '월간 출석률', data: monthly.value },
  { title: '분기 출석률', data: quarterly.value },
  { title: '연간 출석률', data: yearly.value },
])
</script>

<template>
  <div
    v-if="loading"
    class="text-center py-6"
  >
    <VProgressCircular
      indeterminate
      color="primary"
      size="32"
    />
  </div>
  <VRow v-else>
    <VCol
      v-for="stat in stats"
      :key="stat.title"
      cols="12"
      sm="4"
    >
      <div class="d-flex align-center gap-4">
        <VProgressCircular
          :model-value="stat.data.rate"
          :size="64"
          :width="6"
          :color="rateColor(stat.data.rate)"
        >
          <span class="text-body-2 font-weight-bold">{{ stat.data.rate }}%</span>
        </VProgressCircular>
        <div>
          <div class="d-flex align-center gap-2">
            <span class="text-sm font-weight-medium">{{ stat.title }}</span>
            <span class="text-xs text-medium-emphasis">{{ stat.data.label }}</span>
          </div>
          <span class="text-xs text-medium-emphasis">{{ stat.data.present }}/{{ stat.data.total }}회 출석</span>
        </div>
      </div>
    </VCol>
  </VRow>
</template>
