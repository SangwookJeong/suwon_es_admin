<script setup>
import { ROLE_OPTIONS, firstErrorMessage, roleLabel, useAccountStore } from '@/views/apps/account/useAccountStore'
import { requiredValidator } from '@validators'

const accountStore = useAccountStore()

const accounts = ref([])
const teacherOptions = ref([])
const isLoading = ref(false)

// 본인 계정은 삭제 버튼을 비활성화합니다. (서버에서도 한 번 더 막습니다)
const myId = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userData') || 'null')?.id ?? null
  }
  catch {
    return null
  }
})

const adminCount = computed(() => accounts.value.filter(a => a.role === 'admin').length)

// 👉 알림
const snackbar = ref({ show: false, color: 'success', text: '' })

const notify = (text, color = 'success') => {
  snackbar.value = { show: true, color, text }
}

// 👉 목록 조회
const fetchAccounts = async () => {
  isLoading.value = true
  try {
    const { data } = await accountStore.fetchAccounts()

    accounts.value = data.accounts
  }
  catch (error) {
    notify(firstErrorMessage(error, '계정 목록을 불러올 수 없습니다'), 'error')
  }
  finally {
    isLoading.value = false
  }
}

const fetchTeacherOptions = async () => {
  try {
    const { data } = await accountStore.fetchTeacherOptions()

    teacherOptions.value = data.teachers.map(t => ({
      title: `${t.fullName} (${t.department})`,
      value: t.id,
    }))
  }
  catch {
    teacherOptions.value = []
  }
}

onMounted(() => {
  fetchAccounts()
  fetchTeacherOptions()
})

const minLength = n => v => (String(v ?? '').length >= n) || `${n}자 이상 입력하세요`

// ─────────────────────────────────────────────────────────
// 계정 발급
// ─────────────────────────────────────────────────────────
const createDialog = ref(false)
const createForm = ref()
const createBusy = ref(false)

const newAccount = ref({ username: '', password: '', role: 'client', teacherId: null })

const openCreate = () => {
  newAccount.value = { username: '', password: '', role: 'client', teacherId: null }
  createDialog.value = true
}

const submitCreate = async () => {
  const { valid } = await createForm.value.validate()
  if (!valid) return

  createBusy.value = true
  try {
    await accountStore.createAccount(newAccount.value)
    createDialog.value = false
    notify(`계정 "${newAccount.value.username}" 을 발급했습니다`)
    await fetchAccounts()
  }
  catch (error) {
    notify(firstErrorMessage(error, '계정을 발급할 수 없습니다'), 'error')
  }
  finally {
    createBusy.value = false
  }
}

// ─────────────────────────────────────────────────────────
// 계정 수정 (권한 / 연결 교사)
// ─────────────────────────────────────────────────────────
const editDialog = ref(false)
const editBusy = ref(false)
const editTarget = ref(null)
const editValues = ref({ role: 'client', teacherId: null })

const openEdit = account => {
  editTarget.value = account
  editValues.value = { role: account.role, teacherId: account.teacherId }
  editDialog.value = true
}

const submitEdit = async () => {
  editBusy.value = true
  try {
    await accountStore.updateAccount(editTarget.value.id, editValues.value)
    editDialog.value = false
    notify('계정 정보를 변경했습니다')
    await fetchAccounts()
  }
  catch (error) {
    notify(firstErrorMessage(error, '계정을 변경할 수 없습니다'), 'error')
  }
  finally {
    editBusy.value = false
  }
}

// ─────────────────────────────────────────────────────────
// 비밀번호 재발급 (관리자가 새 비밀번호를 정해 당사자에게 전달)
// ─────────────────────────────────────────────────────────
const pwDialog = ref(false)
const pwForm = ref()
const pwBusy = ref(false)
const pwTarget = ref(null)
const newPassword = ref('')
const isPwVisible = ref(false)

const openResetPassword = account => {
  pwTarget.value = account
  newPassword.value = ''
  isPwVisible.value = false
  pwDialog.value = true
}

const submitResetPassword = async () => {
  const { valid } = await pwForm.value.validate()
  if (!valid) return

  pwBusy.value = true
  try {
    await accountStore.resetPassword(pwTarget.value.id, newPassword.value)
    pwDialog.value = false
    notify(`"${pwTarget.value.username}" 의 비밀번호를 변경했습니다`)
  }
  catch (error) {
    notify(firstErrorMessage(error, '비밀번호를 변경할 수 없습니다'), 'error')
  }
  finally {
    pwBusy.value = false
  }
}

// ─────────────────────────────────────────────────────────
// 계정 삭제
// ─────────────────────────────────────────────────────────
const deleteDialog = ref(false)
const deleteBusy = ref(false)
const deleteTarget = ref(null)

const openDelete = account => {
  deleteTarget.value = account
  deleteDialog.value = true
}

const submitDelete = async () => {
  deleteBusy.value = true
  try {
    await accountStore.deleteAccount(deleteTarget.value.id)
    deleteDialog.value = false
    notify(`계정 "${deleteTarget.value.username}" 을 삭제했습니다`)
    await fetchAccounts()
  }
  catch (error) {
    notify(firstErrorMessage(error, '계정을 삭제할 수 없습니다'), 'error')
  }
  finally {
    deleteBusy.value = false
  }
}

// ─────────────────────────────────────────────────────────
// 본인 비밀번호 변경
// ─────────────────────────────────────────────────────────
const myPwDialog = ref(false)
const myPwForm = ref()
const myPwBusy = ref(false)
const myPw = ref({ current: '', next: '' })

const openMyPassword = () => {
  myPw.value = { current: '', next: '' }
  myPwDialog.value = true
}

const submitMyPassword = async () => {
  const { valid } = await myPwForm.value.validate()
  if (!valid) return

  myPwBusy.value = true
  try {
    await accountStore.changeMyPassword(myPw.value.current, myPw.value.next)
    myPwDialog.value = false
    notify('비밀번호를 변경했습니다')
  }
  catch (error) {
    notify(firstErrorMessage(error, '비밀번호를 변경할 수 없습니다'), 'error')
  }
  finally {
    myPwBusy.value = false
  }
}

// 마지막 관리자는 삭제/권한변경이 막혀 있음을 미리 안내합니다.
const isLastAdmin = account => account.role === 'admin' && adminCount.value <= 1

// 삭제를 막아야 하는 이유. 없으면 null. (서버에서도 같은 규칙으로 한 번 더 검증합니다)
const deleteBlockReason = account => {
  if (account.id === myId.value) return '본인 계정은 삭제할 수 없습니다'
  if (isLastAdmin(account)) return '마지막 관리자는 삭제할 수 없습니다'

  return null
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <div>
          <h5 class="text-h5 mb-1">
            계정관리
          </h5>
          <span class="text-body-2 text-disabled">
            로그인 계정을 발급하고 권한·비밀번호를 관리합니다
          </span>
        </div>

        <VSpacer />

        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="mdi-lock-reset"
          @click="openMyPassword"
        >
          내 비밀번호 변경
        </VBtn>

        <VBtn
          prepend-icon="mdi-account-plus-outline"
          @click="openCreate"
        >
          계정 발급
        </VBtn>
      </VCardText>

      <VDivider />

      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th>아이디</th>
            <th>연결 교사</th>
            <th>권한</th>
            <th>생성일</th>
            <th class="text-center">
              작업
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="account in accounts"
            :key="account.id"
          >
            <td class="font-weight-medium">
              {{ account.username }}
              <VChip
                v-if="account.id === myId"
                size="x-small"
                color="info"
                class="ms-2"
              >
                본인
              </VChip>
            </td>

            <td>
              <span v-if="account.teacherName">{{ account.teacherName }}</span>
              <span
                v-else
                class="text-disabled"
              >연결 없음</span>
            </td>

            <td>
              <VChip
                size="small"
                :color="account.role === 'admin' ? 'primary' : 'secondary'"
              >
                {{ roleLabel(account.role) }}
              </VChip>
            </td>

            <td class="text-body-2 text-disabled">
              {{ (account.createdAt || '').slice(0, 10) }}
            </td>

            <td class="text-center">
              <VBtn
                icon
                size="small"
                variant="text"
                color="secondary"
                @click="openEdit(account)"
              >
                <VIcon icon="mdi-pencil-outline" />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  권한 · 연결 교사 변경
                </VTooltip>
              </VBtn>

              <VBtn
                icon
                size="small"
                variant="text"
                color="secondary"
                @click="openResetPassword(account)"
              >
                <VIcon icon="mdi-lock-reset" />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  비밀번호 재발급
                </VTooltip>
              </VBtn>

              <!--
                disabled 버튼은 포인터 이벤트를 받지 않아 툴팁이 뜨지 않습니다.
                비활성 "이유"를 보여줘야 하므로 툴팁을 감싸는 span 에 붙입니다. 
              -->
              <span>
                <VBtn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  :disabled="deleteBlockReason(account) !== null"
                  @click="openDelete(account)"
                >
                  <VIcon icon="mdi-delete-outline" />
                </VBtn>

                <VTooltip
                  activator="parent"
                  location="top"
                >
                  {{ deleteBlockReason(account) ?? '삭제' }}
                </VTooltip>
              </span>
            </td>
          </tr>

          <tr v-if="!accounts.length && !isLoading">
            <td
              colspan="5"
              class="text-center text-disabled py-8"
            >
              계정이 없습니다
            </td>
          </tr>
        </tbody>
      </VTable>

      <VProgressLinear
        v-if="isLoading"
        indeterminate
      />
    </VCard>

    <!-- 👉 계정 발급 -->
    <VDialog
      v-model="createDialog"
      max-width="480"
    >
      <VCard>
        <VCardItem>
          <VCardTitle>계정 발급</VCardTitle>
        </VCardItem>

        <VCardText>
          <VForm
            ref="createForm"
            @submit.prevent="submitCreate"
          >
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="newAccount.username"
                  label="아이디"
                  placeholder="예) seungjin"
                  autocomplete="off"
                  hint="영문 소문자/숫자 3~30자 (., _, - 사용 가능)"
                  persistent-hint
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="newAccount.password"
                  label="초기 비밀번호"
                  autocomplete="new-password"
                  :rules="[requiredValidator, minLength(4)]"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="newAccount.role"
                  label="권한"
                  :items="ROLE_OPTIONS"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="newAccount.teacherId"
                  label="연결 교사 (선택)"
                  :items="teacherOptions"
                  clearable
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="createDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            :loading="createBusy"
            @click="submitCreate"
          >
            발급
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 권한 · 연결 교사 변경 -->
    <VDialog
      v-model="editDialog"
      max-width="480"
    >
      <VCard v-if="editTarget">
        <VCardItem>
          <VCardTitle>{{ editTarget.username }} 계정 변경</VCardTitle>
        </VCardItem>

        <VCardText>
          <VAlert
            v-if="isLastAdmin(editTarget)"
            color="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            마지막 관리자 계정이므로 권한을 내릴 수 없습니다.
          </VAlert>

          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="editValues.role"
                label="권한"
                :items="ROLE_OPTIONS"
                :disabled="isLastAdmin(editTarget)"
              />
            </VCol>

            <VCol cols="12">
              <VSelect
                v-model="editValues.teacherId"
                label="연결 교사"
                :items="teacherOptions"
                clearable
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="editDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            :loading="editBusy"
            @click="submitEdit"
          >
            저장
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 비밀번호 재발급 -->
    <VDialog
      v-model="pwDialog"
      max-width="480"
    >
      <VCard v-if="pwTarget">
        <VCardItem>
          <VCardTitle>{{ pwTarget.username }} 비밀번호 재발급</VCardTitle>
        </VCardItem>

        <VCardText>
          <VAlert
            color="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            새 비밀번호를 정해서 당사자에게 직접 전달하세요. 기존 비밀번호는 즉시 사용할 수 없습니다.
          </VAlert>

          <VForm
            ref="pwForm"
            @submit.prevent="submitResetPassword"
          >
            <VTextField
              v-model="newPassword"
              label="새 비밀번호"
              autocomplete="new-password"
              :type="isPwVisible ? 'text' : 'password'"
              :append-inner-icon="isPwVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :rules="[requiredValidator, minLength(4)]"
              @click:append-inner="isPwVisible = !isPwVisible"
            />
          </VForm>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="pwDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            :loading="pwBusy"
            @click="submitResetPassword"
          >
            변경
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 삭제 확인 -->
    <VDialog
      v-model="deleteDialog"
      max-width="440"
    >
      <VCard v-if="deleteTarget">
        <VCardItem>
          <VCardTitle>계정 삭제</VCardTitle>
        </VCardItem>

        <VCardText>
          <strong>{{ deleteTarget.username }}</strong> 계정을 삭제합니다.
          되돌릴 수 없으며 해당 사용자는 즉시 로그인할 수 없게 됩니다.
          <div class="text-body-2 text-disabled mt-2">
            교사 정보(명부)는 삭제되지 않습니다.
          </div>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="deleteDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            :loading="deleteBusy"
            @click="submitDelete"
          >
            삭제
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 내 비밀번호 변경 -->
    <VDialog
      v-model="myPwDialog"
      max-width="480"
    >
      <VCard>
        <VCardItem>
          <VCardTitle>내 비밀번호 변경</VCardTitle>
        </VCardItem>

        <VCardText>
          <VForm
            ref="myPwForm"
            @submit.prevent="submitMyPassword"
          >
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="myPw.current"
                  label="현재 비밀번호"
                  type="password"
                  autocomplete="current-password"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="myPw.next"
                  label="새 비밀번호"
                  type="password"
                  autocomplete="new-password"
                  :rules="[requiredValidator, minLength(4)]"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="myPwDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            :loading="myPwBusy"
            @click="submitMyPassword"
          >
            변경
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom end"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </div>
</template>

<route lang="yaml">
meta:
  action: manage
  subject: all
</route>
