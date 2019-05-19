<template>
  <footer class="footer">
    <div class="container-fluid">
      <ul class="nav">
        <li class="nav-item">
          <a class="nav-link"
             href="https://github.com/si9ma">
            <font-awesome-icon :icon="['fab','github']"
                               size="lg"
                               :color="$theme.isDark ? 'white' : 'black'" />
          </a>
        </li>
      </ul>
      <div class="copyright">
        © {{year}} made by
        <a href="https://si9ma.com"
           target="_blank"
           rel="noopener">si9ma</a>
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  data () {
    return {
      year: new Date().getFullYear()
    }
  }
};
</script>
<style>
</style>
