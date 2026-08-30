<script setup>
import AttendanceStatsRow from '@/views/apps/student/AttendanceStatsRow.vue'

const props = defineProps({
  studentData: {
    type: Object,
    required: true,
  },
})

const infoItems = computed(() => [
  {
    label: '학생연락처',
    icon: 'mdi-phone-outline',
    value: props.studentData.contact,
    href: props.studentData.contact ? `tel:${props.studentData.contact}` : '',
  },
  { label: '부모님 성함', icon: 'mdi-account-child-outline', value: props.studentData.parentName },
  {
    label: '부모님 연락처',
    icon: 'mdi-cellphone',
    value: props.studentData.parentContact,
    href: props.studentData.parentContact ? `tel:${props.studentData.parentContact}` : '',
  },
  { label: '부모님 구역', icon: 'mdi-map-outline', value: props.studentData.parentDistrict },
  { label: '부모님 구원여부', icon: 'mdi-hand-heart-outline', value: props.studentData.parentSalvation },
  { label: '주소', icon: 'mdi-home-outline', value: props.studentData.address },
])
</script>

<template>
  <VRow>
    <!-- 개인 정보 -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h6 class="text-h6">
            개인 정보
          </h6>
          <VDivider class="mt-4 mb-4" />
          <VRow>
            <VCol
              v-for="item in infoItems"
              :key="item.label"
              cols="12"
              sm="6"
              md="4"
            >
              <div class="d-flex align-center gap-3">
                <VAvatar
                  rounded
                  color="primary"
                  variant="tonal"
                  size="42"
                >
                  <VIcon :icon="item.icon" />
                </VAvatar>
                <div class="overflow-hidden">
                  <p class="text-xs text-medium-emphasis mb-0">
                    {{ item.label }}
                  </p>
                  <a
                    v-if="item.href"
                    :href="item.href"
                    class="text-sm font-weight-medium"
                  >
                    {{ item.value }}
                  </a>
                  <p
                    v-else
                    class="text-sm font-weight-medium mb-0"
                    :title="item.value"
                  >
                    {{ item.value || '-' }}
                  </p>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 비고 -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h6 class="text-h6">
            비고
          </h6>
          <VDivider class="mt-4 mb-4" />
          <p class="text-sm mb-0">
            {{ props.studentData.note || '등록된 비고가 없습니다.' }}
          </p>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 출석 통계 -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h6 class="text-h6">
            출석 통계
          </h6>
          <VDivider class="mt-4 mb-4" />
          <AttendanceStatsRow :user-id="props.studentData.id" />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
