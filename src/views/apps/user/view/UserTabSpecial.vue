<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const resolveDeptVariant = dept => {
  if (dept === '교무팀') return { color: 'primary' }
  if (dept === '상담팀') return { color: 'info' }
  if (dept === '초등1반') return { color: 'success' }
  if (dept === '초등2반') return { color: 'warning' }
  if (dept === '초등3반') return { color: 'error' }

  return { color: 'secondary' }
}

const currentYear = new Date().getFullYear()

const sortedHistory = computed(() =>
  [...(props.userData.serviceHistory ?? [])].sort((a, b) => b.year - a.year),
)
</script>

<template>
  <VCard title="연도별 봉사현황">
    <VDivider />
    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th
            scope="col"
            class="text-center"
          >
            연도
          </th>
          <th
            scope="col"
            class="text-center"
          >
            부서
          </th>
          <th
            scope="col"
            class="text-center"
          >
            직분
          </th>
          <th
            scope="col"
            class="text-center"
          >
            담당
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in sortedHistory"
          :key="item.year"
        >
          <td class="text-center font-weight-medium">
            {{ item.year }}
            <VChip
              v-if="item.year === currentYear"
              color="primary"
              size="x-small"
              class="ms-2"
            >
              현재
            </VChip>
          </td>
          <td class="text-center">
            <VChip
              :color="resolveDeptVariant(item.department).color"
              size="small"
            >
              {{ item.department }}
            </VChip>
          </td>
          <td class="text-center text-medium-emphasis">
            {{ item.position || '-' }}
          </td>
          <td class="text-center text-medium-emphasis">
            {{ item.assignedClass || '-' }}
          </td>
        </tr>
      </tbody>

      <tfoot v-show="!sortedHistory.length">
        <tr>
          <td
            colspan="4"
            class="text-center"
          >
            봉사 이력이 없습니다
          </td>
        </tr>
      </tfoot>
    </VTable>
  </VCard>
</template>
