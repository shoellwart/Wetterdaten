import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'; // eslint-disable-line

createApp(
  {
    data() {
      return {
        username: '',
        password: '',
        errMsg: '',
      };
    },
    methods: {
      async registerFunc() {
        this.errMsg = '';
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });
        const text = await res.text();
        if (res.status === 400) {
          this.errMsg = text;
        }
        if (res.redirected) {
          window.location.href = res.url;
        }
      },
      async loginFunc() {
        this.errMsg = '';
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });
        const text = await res.text();
        if (res.status === 400) {
          this.errMsg = text;
        }
        if (res.redirected) {
          window.location.href = res.url;
        }
      },
    },
    mounted() {
      setInterval(() => {
        const cookie = document.cookie.split('userid=')[1];
        this.loginCookie = cookie;
      }, 1000);
    },
  },
).mount('#login');
