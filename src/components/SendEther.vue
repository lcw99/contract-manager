<template>
	<div>
		<header class="header">
			<div class="jumbotron">
			  <h1 class="display-5">{{ $t('jumbo-title-send-ether') }}</h1>
			  <p class="lead">{{ $t('jumbo-text-send-ether') }}</p>
			</div>
			<web3compo ref="web3Compo" 
				@accountInfo="accountInfo" @sendEtherResult="sendEtherResult" @web3InitCompleted="web3InitCompleted"
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
			      v-model="toAddress">
			</div>
			<div class="input-group mb-3">
			  <div class="input-group-prepend">
			    <span class="input-group-text" id="basic-addon1">A</span>
			  </div>
			  <input type="text" class="form-control" aria-label="Token Symbol" aria-describedby="basic-addon1"
			      autofocus autocomplete="off"
			      placeholder="Amount"
			      v-model="ethAmount">
			</div>
	    <button @click="sendEther" class="btn btn-outline-primary">
	      {{ $t('send-ether') }}
	    </button>

	    <transition name="bounce">
				<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
					v-show="hookedWalletMessage" >
				  {{ hookedWalletMessage }}
				</div>			
			</transition>
	    <transition name="bounce">
				<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
					v-show="hashUrl" >
				  <a :href="hashUrl" target="_blank" rel="noopener noreferrer">Transfer started, view transaction in etherscan</a>
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
		name: 'SendEther',

		components: {
			'web3compo': Web3Compo
		},

	  data() {
	  	return {
        env: process.env.NODE_ENV,
	  		toAddress: '',
	  		ethAmount: '',
		    account: '',
		    network: '',
		    hashUrl: '',
		    txMessage: '',
		    hookedWalletMessage: '',
		    visibility: 'all'
		  }
	  },

	  created() {
	    if (this.env == 'development') {
	    	this.toAddress = "0x2bC471eF0E259aB41f578A540a45f8f64c598882";
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

      sendEther() {
	      this.txMessage = '';
	      this.hashUrl = '';
	      this.hookedWalletMessage = '';
	      this.$refs.web3Compo.sendEther(this.toAddress, this.ethAmount);
      },

      signRequestToHookedWallet(message) {
      	this.hookedWalletMessage = message;
      },

    	sendEtherResult(transactionHash, txMessage, toAddress) {
    		if (transactionHash != "") 
    			this.hashUrl = this.etherscanUrl + "tx/" + transactionHash;
    		if (txMessage != "") 
    			this.txMessage = txMessage;
  			if (toAddress != "") {
  				console.log("toAddress=" + toAddress);
  			}
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