<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'
import UserBioPanel from '@/views/apps/user/view/UserBioPanel.vue'
import UserTabOverview from '@/views/apps/user/view/UserTabOverview.vue'
import UserTabSpecial from '@/views/apps/user/view/UserTabSpecial.vue'

const userListStore = useUserListStore()
const route = useRoute()
const router = useRouter()
const userData = ref()
const activeTab = ref('overview')
const isEditDialogVisible = ref(false)

// 수정 폼 데이터
const editForm = ref({})
const editAvatarPreview = ref('')
const refEditFileInput = ref()

const departments = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']
const serviceGroups = ['봉사회', '어머니회', '청년회']
const bsOptions = [
  { title: '형제 (B)', value: 'B' },
  { title: '자매 (S)', value: 'S' },
]
const occupations = ['직장인', '대학생', '주부']
const statuses = ['현직', '휴직', '퇴직', '전배']

userListStore.fetchUser(Number(route.params.id)).then(response => {
  userData.value = response.data
})

const onOpenEdit = () => {
  editForm.value = { ...userData.value }
  editAvatarPreview.value = userData.value.avatar || ''
  isEditDialogVisible.value = true
}

const onEditAvatarClick = () => {
  refEditFileInput.value?.click()
}

const onEditFileChange = e => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    editAvatarPreview.value = ev.target.result
    editForm.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

const onSaveEdit = () => {
  userListStore.updateUser(userData.value.id, editForm.value).then(response => {
    userData.value = response.data
    isEditDialogVisible.value = false
  })
}

</script>

<template>
  <div>
    <!-- 상단 액션 바 -->
    <div class="d-flex align-center mb-6">
      <VBtn
        variant="text"
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="router.push({ name: 'apps-user-list' })"
      >
        교사 목록
      </VBtn>
    </div>

    <VRow v-if="userData">
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <UserBioPanel
          :user-data="userData"
          @edit="onOpenEdit"
        />
      </VCol>

      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <VTabs
          v-model="activeTab"
          class="mb-6"
        >
          <VTab value="overview">
            <VIcon
              icon="mdi-account-details-outline"
              class="me-2"
            />
            상세정보
          </VTab>
          <VTab value="history">
            <VIcon
              icon="mdi-history"
              class="me-2"
            />
            연도별 봉사현황
          </VTab>
        </VTabs>

        <VWindow v-model="activeTab">
          <VWindowItem value="overview">
            <UserTabOverview :user-data="userData" />
          </VWindowItem>
          <VWindowItem value="history">
            <UserTabSpecial :user-data="userData" />
          </VWindowItem>
        </VWindow>
      </VCol>
    </VRow>

    <!-- 로딩 상태 -->
    <VRow v-else>
      <VCol
        cols="12"
        class="text-center py-10"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <p class="mt-4 text-medium-emphasis">
          교사 정보를 불러오는 중...
        </p>
      </VCol>
    </VRow>

    <!-- 수정 다이얼로그 -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="600"
    >
      <VCard title="교사 정보 수정">
        <VCardText>
          <VRow>
            <!-- 사진 -->
            <VCol
              cols="12"
              class="d-flex justify-center"
            >
              <div
                class="d-flex flex-column align-center gap-2"
                style="cursor: pointer;"
                @click="onEditAvatarClick"
              >
                <VAvatar
                  :size="100"
                  rounded="sm"
                  color="primary"
                  variant="tonal"
                >
                  <VImg
                    v-if="editAvatarPreview"
                    :src="editAvatarPreview"
                    cover
                  />
                  <VIcon
                    v-else
                    size="48"
                    icon="mdi-camera-plus-outline"
                  />
                </VAvatar>
                <span class="text-sm text-medium-emphasis">사진 변경 (클릭)</span>
              </div>
              <input
                ref="refEditFileInput"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="onEditFileChange"
              >
            </VCol>

            <!-- 이름 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.fullName"
                label="이름"
              />
            </VCol>

            <!-- 부서 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editForm.department"
                label="부서"
                :items="departments"
              />
            </VCol>

            <!-- 직분 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.position"
                label="직분"
              />
            </VCol>

            <!-- 담당 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.assignedClass"
                label="담당"
              />
            </VCol>

            <!-- 부가역할 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.extraRole"
                label="부가역할"
              />
            </VCol>

            <!-- 연락처 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.contact"
                label="연락처"
              />
            </VCol>

            <!-- 소속 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editForm.serviceGroup"
                label="소속"
                :items="serviceGroups"
              />
            </VCol>

            <!-- B/S -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editForm.bs"
                label="B/S"
                :items="bsOptions"
              />
            </VCol>

            <!-- 직업 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editForm.occupation"
                label="직업"
                :items="occupations"
                clearable
                clear-icon="mdi-close"
              />
            </VCol>

            <!-- 상태 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editForm.status"
                label="상태"
                :items="statuses"
              />
            </VCol>

            <!-- 구원생일 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.salvationBirthday"
                label="구원생일"
                placeholder="YY.MM.DD"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isEditDialogVisible = false"
          >
            취소
          </VBtn>
          <VBtn
            variant="elevated"
            color="primary"
            @click="onSaveEdit"
          >
            저장
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

  </div>
</template>
