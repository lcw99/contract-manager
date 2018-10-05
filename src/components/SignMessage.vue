<template>
	<div>
		<header class="header">
			<div class="jumbotron">
			  <h1 class="display-5">{{ $t('jumbo-title-sign-message') }}</h1>
			  <p class="lead">{{ $t('jumbo-text-sign-message') }}</p>
			</div>
			<web3compo ref="web3Compo" 
				@accountInfo="accountInfo" @signMessageResult="signMessageResult" @web3InitCompleted="web3InitCompleted"
				@signRequestToHookedWallet="signRequestToHookedWallet"/>
		</header>
		<section>
			<div class="input-group mb-3">
			  <div class="input-group-prepend">
			    <span class="input-group-text" id="basic-addon1">T</span>
			  </div>
			  <input type="text" class="form-control" aria-label="Token Name" aria-describedby="basic-addon1"
			      autofocus autocomplete="off"
			      placeholder="To Address"
			      v-model="messageToSign">
			</div>
	    <button @click="signMessage" class="btn btn-outline-primary">
	      {{ $t('sign-message') }}
	    </button>

	    <transition name="bounce">
				<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
					v-show="hookedWalletMessage" >
				  {{ hookedWalletMessage }}
				</div>			
			</transition>
	    <transition name="bounce">
				<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
					v-show="txMessage">
				  {{ txMessage }}
				</div>			
			</transition>
	    
		</section>
	</div>
</template>

<script>
	import Web3Compo from '@/components/Web3'
	const etherscanUrl = ["https://etherscan.io/", "https://ropsten.etherscan.io/", "https://kovan.etherscan.io/", "https://rinkeby.etherscan.io/"];

  export default {
		name: 'SignMessage',

		components: {
			'web3compo': Web3Compo
		},

	  data() {
	  	return {
        env: process.env.NODE_ENV,
	  		messageToSign: '',
		    account: '',
		    network: '',
		    txMessage: '',
		    hookedWalletMessage: '',
		    visibility: 'all'
		  }
	  },

	  created() {
	    if (this.env == 'development') {
	    	this.messageToSign = "Test Message 111";
	    }
	  },

	  computed: {
	  	etherscanUrl: function () {
	  		return etherscanUrl[this.network];
	  	}
	  },

	  methods: {
    	web3InitCompleted() {
    	},

    	accountInfo(accountInfo, network) {
   			this.account = accountInfo;
    		this.network = network;
      },

      signMessage() {
	      this.txMessage = '';
	      this.hookedWalletMessage = '';
	      this.$refs.web3Compo.signMessage(this.messageToSign);
      },

      signRequestToHookedWallet(message) {
      	this.hookedWalletMessage = message;
      },

    	signMessageResult(signedMessage) {
 				console.log("signedMessage=" + signedMessage);
   			this.txMessage = signedMessage;
      },

    }
  }

</script>

<style>
.jumbotron
{
    background: url('./img/antique-black-and-white-clock-210590.jpg') no-repeat center center; 
    background-size: cover;
    color: #fff;    
}	
</style>