<template>
<div id="app">
  <header class="app-header">
    <nav class="navbar navbar-expand-sm navbar-dark bg-dark"  style="margin-bottom: 20px">
      <a class="navbar-brand" href="#">
        <img src="./assets/smallet_icon.svg" width="30" height="30" alt="">
        Smallet
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mr-auto" >
          <li class="nav-item">
            <router-link class="nav-link" exact-active-class="active" to="/token-contract">{{ $t('menu-create-token') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/manage-token">{{ $t('menu-manage-token') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/send-ether">{{ $t('send-ether') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/about">About</router-link>
          </li>
        </ul>  
      </div>

      <form class="form-inline my-2 my-lg-0">
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{ localeDisp }}
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
            <button class="dropdown-item" type="button" @click="locale='en'">English</button>
            <button class="dropdown-item" type="button" @click="locale='ko'">Korean</button>
          </div>
        </div>
      </form>

    </nav>
  </header>
  <main class="container">
    <router-view></router-view>
    <div class="shadow p-3 mb-5 bg-white rounded" style="margin-top: 5em; text-align: right;">
      <small>&#169; <a href="https://smallet.co" target="_blank" rel="noopener noreferrer">Smallet Networks Inc</a>, 2018, {{env}}</small> 
    </div>
  </main>
</div>
</template>

<script>
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap/dist/js/bootstrap.min.js'

  const etherscanUrl = ["https://etherscan.io/", "https://ropsten.etherscan.io/", "https://kovan.etherscan.io/", "https://rinkeby.etherscan.io/"];

  export default {
    name: 'App',
    data() {
      return {
        env: process.env.NODE_ENV,
        locale: 'en',
        etherscanUrl: ["https://etherscan.io/", "https://ropsten.etherscan.io/", "https://kovan.etherscan.io/", "https://rinkeby.etherscan.io/"]
      }
    },

    mounted() {
      var userLang = navigator.language || navigator.userLanguage; 
      console.log("language=" + userLang);
      this.locale = userLang.substring(0, 2);
    },

    computed: {
      localeDisp: function () {
        if (this.locale == 'ko')
          return "Korean";
        else 
          return "English";
      }
    },

    watch: {
      locale (val) {
        this.$i18n.locale = val
      }
    },

  }
</script>

<style>
#app {
  font-family: "Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 20px;
}

.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

</style>
