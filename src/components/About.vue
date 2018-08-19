<template>
  <div class="about">
		<div class="card border-primary mb-3">
		  <div class="card-header">About</div>
		  <div class="card-body text-primary">
		    <h5 class="card-title">{{ $t('about-title') }}</h5>
		    <p class="card-text">
		    	{{ $t('about-text1')}}
		    </p>
		    <p class="card-text" v-html="$t('about-text2')"/>
		  </div>
		</div>		
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

