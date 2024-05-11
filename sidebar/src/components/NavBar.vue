<script setup>
import { onMounted, ref } from 'vue';
import { NButton, NGrid, NGridItem, NTabs, NTab, NImage, NDropdown, NModal, NSelect, NA, NP, NSpin, NForm, NFormItem, NRadio, NRadioGroup, NSpace, NInput, useMessage } from 'naive-ui';
import settingSvgUrl from '@/assets/img/setting.svg?url';

import storage from '@/utils/storage';
import cookies from '@/utils/cookies';

const iframe = document.getElementById("underside-iframe-container");

const darkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const colorSchemeParam = darkMode ? "darkschemeovr" : "lightschemeovr";
let chromeRuntimeId;

const settingIconStyle = ref({
  filter: 'invert(70%)',
  position: 'fixed',
  top: '8px',
  right: '12px',
})

const message = useMessage();

const isShowSettingModal = ref(false);
const isShowLoginModal = ref(false);

const navType = {
  login: 'login',
  setting: 'setting',
  reset: 'reset',
  about: 'about',
};

let navConfigs = ref([
  {
    key: navType.setting,
    label: '设置',
  },
  {
    key: navType.login,
    label: '登录',
  },
  {
    key: navType.reset,
    label: '一键重置',
  },
  {
    key: navType.about,
    label: '关于'
  },
]);

const baseUrl = ref('');

const isShowIframe = ref(false);
const oneKeyLogin = ref('false');
const loginTypeOptions = ref([
  {
    label: '账号登录',
    value: 'false',
  },
  {
    label: '一键登录',
    value: 'true',
  }
]);
const msLoginAccount = ref('');
const msLoginPassword = ref('');
const msLoginType = ref('passwd');
const msLoginCode = ref('');
const msLogining = ref(false);
const msContinueing = ref(false);
const msLoginTypeOptions = ref([
{
    label: '密码登录',
    value: 'passwd',
  },
  {
    label: '邮箱验证码登录',
    value: 'email',
  },
  {
    label: '2FA登录',
    value: 'device',
  }
])
const msLoginContext = ref({
  cookies: '',
  context: {}
});
const bingUrl = base58Decode('7RYHpA38gs3NAby2mkvoRMwjncBpS');

const getCookieTip = ref('获取 Cookie 中, 请稍后...');

onMounted(async () => {
  if (chrome.runtime == null || chrome.runtime == undefined) {
    chromeRuntimeId = "db6d6a1c638032840c4b6316877d1cb138698964";
  } else {
    chromeRuntimeId =chrome.runtime.id;
  }

  if (darkMode) {
    settingIconStyle.value = {
      filter: 'invert(70%)',
      position: 'fixed',
      top: '8px',
      right: '12px',
    }
  } else {
    settingIconStyle.value = {
      filter: 'invert(0%)',
      position: 'fixed',
      top: '8px',
      right: '12px',
    }
  }

  baseUrl.value = await storage.get('baseUrl') || '';

  iframe.src = `https://${baseUrl.value}/edgesvc/shell?&${colorSchemeParam}=1&FORM=SHORUN&udscs=1&udsnav=1&setlang=${navigator.language}&clientscopes=noheader,coauthor,chat,visibilitypm,docvisibility,channelstable,&udsframed=1&loadsource=unknown&extension=${chromeRuntimeId}`;
});

const tabChange = (tab) => {
  // console.log(tab);
  switch (tab) {
    case "chat":
      iframe.src = `https://${baseUrl.value}/edgesvc/shell?&${colorSchemeParam}=1&FORM=SHORUN&udscs=1&udsnav=1&setlang=${navigator.language}&clientscopes=noheader,coauthor,chat,visibilitypm,docvisibility,channelstable,&udsframed=1&loadsource=unknown&extension=${chromeRuntimeId}`;
      break;
    case "compose":
      iframe.src = `https://${baseUrl.value}/edgesvc/compose?udsframed=1&form=SHORUN&clientscopes=chat,noheader,coauthor,channelstable,&${colorSchemeParam}=1&shellsig=${chromeRuntimeId}`;
      break;
  }
}

const handleSelect = async (key) => {
  switch (key) {
    case navType.setting:
      isShowSettingModal.value = true;
      break;
    case navType.login:
      isShowLoginModal.value = true;
      break;
    default:
      break;
  }
}

const loginHandel = async ()=> {
  isShowIframe.value = true;
  getCookieTip.value = '获取 Cookie 中, 请稍后...';
  window.addEventListener('message', function (e) {
    const d = e.data
    if (d.cookies != "" && d.cookies != null && d.cookies != undefined) {
      saveCookies(d.cookies);
      message.success('登录成功');
    }
  })
  await sleep(1500);
  getCookieTimeoutHandel();
  const ciframe = document.getElementById('login');
  const S = base58Decode(_G.S);
  let tmpA = [];
  for (let i = 0; i < _G.SP.length; i++) {
    tmpA.push(S[_G.SP[i]]);
  }
  const e = base58Decode(tmpA.join(''));
  ciframe.contentWindow.postMessage({
    IG: _G.IG,
    T: await aesEncrypt(e, _G.IG),
  }, '*');
}

const msLoginHandel = async () => {
  msLogining.value = true;
  switch (msLoginType.value) {
    case 'passwd':
      {
        if (!msLoginAccount.value) {
          message.warning('请先填入账号');
          msLogining.value = false;
          break;
        } else if (!msLoginPassword.value) {
          message.warning('请先填入密码');
          msLogining.value = false;
          break;
        }
        const res = await fetch('https://'+baseUrl.value+'/api/ms/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: msLoginAccount.value,
            password: msLoginPassword.value,
            type: msLoginType.value,
          })
        })
        if (!res.ok) {
          message.error('登录失败, 请重试');
          msLogining.value = false;
          break;
        }
        isShowLoginModal.value = false;
        const resData = await res.json();
        saveCookies(resData.data.cookies);
        message.success('登录成功');
      }
      break;
    case 'email':
      {
        if (!msLoginAccount.value) {
          message.warning('请先填入账号');
          msLogining.value = false;
          break;
        }
        const res = await fetch('https://'+baseUrl.value+'/api/ms/login', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: msLoginAccount.value,
            type: msLoginType.value,
            verify_code: msLoginCode.value,
            cookies: msLoginContext.value.cookies,
            context: msLoginContext.value.context,
          }),
        })
        if (!res.ok) {
          message.error('登录失败, 请重试');
          msLogining.value = false;
          break;
        }
        isShowLoginModal.value = false;
        const resData = await res.json();
        saveCookies(resData.data.cookies);
        message.success('登录成功');
      }
      break;
    case 'device':
      {
        if (!msLoginAccount.value) {
          message.warning('请先填入账号');
          msLogining.value = true;
          break;
        }
        const res = await fetch('https://'+baseUrl.value+'/api/ms/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: msLoginAccount.value,
            type: msLoginType.value,
          })
        })
        const resData = await res.json();
        if (res.status != 201) {
          message.error('获取2FA失败, 请重试');
          msLogining.value = false;
          break;
        }
        message.success('获取2FA成功, 请在手机上查看并输入验证码');
        msLoginCode.value = resData.data.code;
        msLoginContext.value.cookies = resData.data.cookies;
        msLoginContext.value.context = resData.data.context;
        await msLoginContinueHandel();
      }
      break;
    default:
      msLogining.value = false;
      break;
  }
}

const msLoginContinueHandel = async () => {
  msContinueing.value = true;
  switch (msLoginType.value) {
    case 'email':
      {
        if (!msLoginAccount.value) {
          message.warning('请先填入账号');
          msLogining.value = true;
          break;
        }
        const res = await fetch('https://'+baseUrl.value+'/api/ms/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: msLoginAccount.value,
            type: msLoginType.value,
          })
        })
        if (res.status != 201) {
          message.error('获取邮箱验证码失败, 请重试');
          msContinueing.value = false;
          break;
        }
        message.success('获取邮箱验证码成功, 请检查邮箱');
        msContinueing.value = false;
        const resData = await res.json();
        msLoginContext.value.cookies = resData.data.cookies;
        msLoginContext.value.context = resData.data.context;
      }
      break;
    case 'device':
      {
        if (!msLoginAccount.value) {
          message.warning('请先填入账号');
          msLogining.value = true;
          break;
        }
        const res = await fetch('https://'+baseUrl.value+'/api/ms/login', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: msLoginAccount.value,
            type: msLoginType.value,
            cookies: msLoginContext.value.cookies,
            context: msLoginContext.value.context,
          }),
        })
        if (!res.ok) {
          message.error('获取2FA失败, 请重试');
          msLogining.value = false;
          break;
        }
        isShowLoginModal.value = false;
        const resData = await res.json();
        saveCookies(resData.data.cookies);
        message.success('登录成功');
      }
      break;
    default:
      msContinueing.value = false;
      break;
  }
}

const saveCookies = (cookiesRaw) => {
  const cookiesArr = cookiesRaw.split(';');
  for (const cookie of cookiesArr) {
    console.log(cookie);
    const cookieArr = cookie.split('=');
    const key = cookieArr[0].trim();
    const val = cookieArr.length > 1 ? cookieArr.slice(1, cookieArr.length).join('=').trim() : null ;
    if (key && val) {
      cookies.set(key, val, 7 * 24 * 60, '/', baseUrl.value);
    }
  }
};

const saveSetting = () => {
  storage.set('baseUrl', baseUrl.value);
  isShowSettingModal.value = false;
}
</script>

<template>
  <NTabs justify-content="space-evenly" animated @update:value="tabChange" style="margin-top: 6px;">
    <NTab name="chat" tab="聊天"></NTab>
    <NTab name="compose" tab="撰写"></NTab>
  </NTabs>
  <NDropdown trigger="hover" :options="navConfigs" @select="handleSelect">
    <NImage :src="settingSvgUrl" alt="设置菜单" :preview-disabled="true" :style="settingIconStyle"></NImage>
  </NDropdown>

  <NModal v-model:show="isShowSettingModal" preset="dialog" :show-icon="false">
    <template #header>
      <div class="text-3xl py-2">设置</div>
    </template>
    <NForm ref="formRef" label-placement="left" label-width="auto" require-mark-placement="right-hanging" style="margin-top: 16px;">
      <NFormItem path="baseUrl" label="基础域">
        <NInput size="large" v-model:value="baseUrl" type="text" placeholder="基础域" />
      </NFormItem>
    </NForm>
    <template #action>
      <NButton size="large" type="info" @click="saveSetting">保存</NButton>
      <NButton size="large" @click="isShowSettingModal = false">取消</NButton>
    </template>
  </NModal>

  <NModal v-model:show="isShowLoginModal" preset="dialog" :show-icon="false">
    <template #header>
      <div class="text-3xl py-2">账号登录</div>
    </template>
    <NSelect v-model:value="oneKeyLogin" :options="loginTypeOptions" size="large" placeholder="选择登录方式" />
    <div v-if="oneKeyLogin == 'true'">
      <div v-if="!isShowIframe" style="margin-top:12px; margin-bottom:24px">
        <NP>
          使用此功能前, 请先安装<NA href="https://www.tampermonkey.net/">油猴插件</NA>, 并安装<NA href="https://greasyfork.org/zh-CN/scripts/487409-go-proxy-bingai">此脚本</NA>
          <br>
          请点击下面「打开登录页面」按钮, 在新打开登录页面中登录账号, 登录成功后点击确定
        </NP>
      </div>
      <div v-else>
        <NSpin size="large" :description="getCookieTip" style="margin: 0 auto; width: 100%" />
        <iframe id="login" :src="bingUrl" style="border: none; width: 0; height: 0" />
      </div>
    </div>
    <div v-else>
      <NForm ref="formRef" label-placement="left" label-width="auto" require-mark-placement="right-hanging" style="margin-top: 16px;">
        <NFormItem path="cookiesEnable" label="登录方式">
          <NRadioGroup v-model:value="msLoginType">
            <NSpace vertical>
              <NRadio v-for="item in msLoginTypeOptions" size="large" :key="item.value" :value="item.value">{{ item.label }}</NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem path="account" label="账号">
          <NInput size="large" v-model:value="msLoginAccount" type="text" placeholder="账号" />
        </NFormItem>
        <NFormItem v-show="msLoginType === 'passwd'" path="password" label=" 密码">
          <NInput size="large" v-model:value="msLoginPassword" type="password" show-password-on="click" placeholder="密码" />
        </NFormItem>
        <NFormItem v-show="msLoginType !== 'passwd'" path="verify_code" label="验证码">
          <NInput size="large" v-model:value="msLoginCode" type="text" placeholder="验证码" :disabled="msLoginType === 'device'" />
        </NFormItem>
      </NForm>
    </div>
    <template #action>
      <NButton v-show="oneKeyLogin == 'true'" size="large" type="info" @click="newWindow">打开登录页面</NButton>
      <NButton v-show="oneKeyLogin == 'true'" size="large" @click="isShowLoginModal = false">取消</NButton>
      <NButton v-show="oneKeyLogin == 'true'" ghost size="large" type="info" @click="loginHandel">确定</NButton>
      <NButton v-show="oneKeyLogin != 'true' && msLoginType === 'email'" size="large" type="info" :loading="msContinueing" @click="msLoginContinueHandel">获取邮箱验证码</NButton>
      <NButton v-show="oneKeyLogin != 'true'" ghost size="large" type="info" :loading="msLogining" @click="msLoginHandel">确定</NButton>
    </template>
  </NModal>
</template>