<script setup>
import { initialAbility } from '@/plugins/casl/ability'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useUserListStore } from '@/views/apps/user/useUserListStore'
import { avatarText } from '@core/utils/formatters'

const router = useRouter()
const ability = useAppAbility()
const userData = ref(JSON.parse(localStorage.getItem('userData') || '{}'))
const teacherData = ref(null)

const loadTeacher = () => {
  const tid = userData.value?.teacherId
  if (!tid) return

  const userListStore = useUserListStore()

  userListStore.fetchUser(tid).then(response => {
    teacherData.value = response.data
  }).catch(() => {})
}

loadTeacher()

const displayName = computed(() => teacherData.value?.fullName || userData.value?.fullName || '')
const displayDept = computed(() => teacherData.value?.department || '')
const displayAvatar = computed(() => teacherData.value?.avatar || userData.value?.avatar || '')
const profileTeacherId = computed(() => userData.value?.teacherId)

const logout = () => {
  localStorage.removeItem('userData')
  localStorage.removeItem('accessToken')
  router.push('/login').then(() => {
    localStorage.removeItem('userAbilities')
    ability.update(initialAbility)
  })
}

const avatarBadgeProps = {
  dot: true,
  location: 'bottom right',
  offsetX: 3,
  offsetY: 3,
  color: 'success',
  bordered: true,
}
</script>

<template>
  <VBadge v-bind="avatarBadgeProps">
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg
        v-if="displayAvatar"
        :src="displayAvatar"
      />
      <span v-else-if="displayName">{{ avatarText(displayName) }}</span>
      <VIcon
        v-else
        icon="mdi-account-outline"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 교사 정보 -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge v-bind="avatarBadgeProps">
                  <VAvatar
                    color="primary"
                    size="40"
                    variant="tonal"
                  >
                    <VImg
                      v-if="displayAvatar"
                      :src="displayAvatar"
                    />
                    <span v-else-if="displayName">{{ avatarText(displayName) }}</span>
                    <VIcon
                      v-else
                      icon="mdi-account-outline"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-medium">
              {{ displayName }}
            </VListItemTitle>
            <VListItemSubtitle v-if="displayDept">
              {{ displayDept }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 프로필 -->
          <VListItem
            v-if="profileTeacherId"
            :to="{ name: 'apps-user-view-id', params: { id: profileTeacherId } }"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-account-outline"
                size="22"
              />
            </template>

            <VListItemTitle>프로필</VListItemTitle>
          </VListItem>

          <VDivider
            v-if="profileTeacherId"
            class="my-2"
          />

          <!-- 👉 로그아웃 -->
          <VListItem
            link
            @click="logout"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-logout-variant"
                size="22"
              />
            </template>

            <VListItemTitle>로그아웃</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
