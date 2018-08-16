<template>
<div id="app">
  <header class="app-header">
    <nav class="navbar navbar-expand-sm navbar-dark bg-dark"  style="margin-bottom: 20px">
      <a class="navbar-brand" href="#"><img src="./assets/smallet_icon.svg" width="30" height="30" alt=""></a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mr-auto" >
          <li class="nav-item">
            <router-link class="nav-link" exact-active-class="active" to="/token-contract">Token Contract</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/manage-token">Manage Token</router-link>
          </li>
        </ul>  
      </div>
    </nav>
  </header>
  <main class="container">
    <router-view></router-view>
  </main>
</div>
</template>

<script>
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap/dist/js/bootstrap.min.js'

  export default {
    name: 'App'
  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
