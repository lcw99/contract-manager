<template>
	<div>
		<header class="header">
			<div class="jumbotron">
			  <h1 class="display-5">{{ $t('jumbo-title-manage-token') }}</h1>
			  <p class="lead">{{ $t('jumbo-text-manage-token') }}</p>
			</div>
			<web3compo ref="web3Compo" 
				@accountInfo="accountInfo" @callResult="callResult" @web3InitCompleted="web3InitCompleted"
				@sendTxResult="sendTxResult" @signRequestError="signRequestError" @signRequestToHookedWallet="signRequestToHookedWallet"/>
			<div class="dropdown">
			  <a class="btn btn-primary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			    {{ contract.tokenName }} - {{ contract.contractAddress }}
			  </a>
			  <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
					<a v-for="contract in contracts" class="dropdown-item" :key="contract.id" :href="'#/manage-token/' + contract.id">
				    {{ contract.tokenName }} - {{ contract.contractAddress }}
					</a>
			  </div>
			</div>			
		</header>
		<main style="margin-top: 1em">
			<div class="card border-primary mb-3">
			  <div class="card-header">
			    {{ contract.tokenSymbol }}
			  </div>
			  <ul class="list-group list-group-flush">
			    <li class="list-group-item">{{ contract.tokenName }} <span class="badge badge-info">Name</span></li>
			    <li class="list-group-item">{{ contract.tokenDecimals }} <span class="badge badge-info">Decimals</span></li>
			    <li class="list-group-item">
			    	<a :href="networkToEtherscanUrl(contract.network) + 'address/' + contract.contractAddress" target="_blank">
			    		{{ contract.contractAddress }}
			    	</a>
			    	<span class="badge badge-info">Contarct Address</span>
			    </li>
			    <li class="list-group-item">
			    	<a :href="networkToEtherscanUrl(contract.network) + 'address/' + owner" target="_blank">
			    		{{ owner }}
			    	</a>
			    	<span class="badge badge-info">Owner</span>
			    </li>
			    <li class="list-group-item">{{ tokenSupply }} <span class="badge badge-info">Total Supply</span></li>
			    <li class="list-group-item">{{ accountBalance }} <span class="badge badge-info">Account Balance</span></li>
			  </ul>
			</div>			

			<!-- Nav tabs -->
			<ul class="nav nav-tabs" id="myTab" role="tablist">
			  <li class="nav-item">
			    <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">
			    	{{ $t('tab-mint') }}
			    </a>
			  </li>
			  <li class="nav-item">
			    <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">	{{ $t('tab-transfer') }}
			    </a>
			  </li>
			</ul>

			<!-- Tab panes -->
			<div class="tab-content">
			  <div class="tab-pane active" id="home" role="tabpanel" aria-labelledby="home-tab">
					<div class="input-group mb-3">
					  <div class="input-group-prepend">
					    <span class="input-group-text" id="basic-addon1">T</span>
					  </div>
					  <input type="text" class="form-control" aria-label="Token Name" aria-describedby="basic-addon1"
					      autofocus autocomplete="off"
					      placeholder="To Address"
					      v-model="mintTo">
					</div>
					<div class="input-group mb-3">
					  <div class="input-group-prepend">
					    <span class="input-group-text" id="basic-addon1">A</span>
					  </div>
					  <input type="text" class="form-control" aria-label="Token Symbol" aria-describedby="basic-addon1"
					      autofocus autocomplete="off"
					      placeholder="Mint Amount"
					      v-model="mintAmount">
					</div>
			    <button @click="mintToken" class="btn btn-outline-primary">
			      {{ $t('mint-token') }}
			    </button>

			    <transition name="bounce">
						<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
							v-show="hashUrl">
						  <a :href="hashUrl" target="_blank" rel="noopener noreferrer">Minting started, view transaction in etherscan</a>
						</div>			
					</transition>
			    <transition name="bounce">
						<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
							v-show="txMessage">
						  {{ txMessage }}
						</div>			
					</transition>
			  </div>

			  <div class="tab-pane" id="profile" role="tabpanel" aria-labelledby="profile-tab">
					<div class="input-group mb-3">
					  <div class="input-group-prepend">
					    <span class="input-group-text" id="basic-addon1">T</span>
					  </div>
					  <input type="text" class="form-control" aria-label="Token Name" aria-describedby="basic-addon1"
					      autofocus autocomplete="off"
					      placeholder="To Address"
					      v-model="transferTo">
					</div>
					<div class="input-group mb-3">
					  <div class="input-group-prepend">
					    <span class="input-group-text" id="basic-addon1">A</span>
					  </div>
					  <input type="text" class="form-control" aria-label="Token Symbol" aria-describedby="basic-addon1"
					      autofocus autocomplete="off"
					      placeholder="Transfer Amount"
					      v-model="transferAmount">
					</div>
			    <button @click="transferToken" class="btn btn-outline-primary">
						{{ $t('transfer-token') }}
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
			  </div>
			</div>			


		</main>
	</div>
</template>

<script>
	import Web3Compo from '@/components/Web3'
	const etherscanUrl = ["https://etherscan.io/", "https://ropsten.etherscan.io/", "https://kovan.etherscan.io/", "https://rinkeby.etherscan.io/"];
	var bigdecimal = require("bigdecimal");
	var $ = require('jquery');

	var STORAGE_KEY = 'token-contracts-v1'
	var contractStorage = {
	  fetch: function () {
	    var contracts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
	    contracts.forEach(function (contract, index) {
	      contract.id = index
	    })
	    contractStorage.uid = contracts.length
	    return contracts
	  }
	}

  export default {
		name: 'ManageToken',

		components: {
			'web3compo': Web3Compo
		},

	  data() {
	  	return {
        env: process.env.NODE_ENV,
		    contracts: contractStorage.fetch(),
		    contract: {},
		    account: '',
		    network: '',
		    tokenSupply: 0,
		    mintTo: '',
		    mintAmount: '',
		    transferTo: '',
		    transferAmount: '',
		    accountBalance: '0',
		    owner: '',
		    hashUrl: '',
		    txMessage: '',
		    hookedWalletMessage: '',
		    visibility: 'all'
		  }
	  },

    watch: {
      '$route': 'fetchData',
    },

	  created() {
    	var vm = this;
			$(document).ready(function(){
			  $('#myTab a').click(function (link) {
			    vm.txMessage = "";
			    vm.hashUrl = "";
			  })
			});
    },

		beforeDestroy() {
		},

    mounted() {
    },

	  computed: {
	  	etherscanUrl: function () {
	  		return etherscanUrl[this.network];
	  	}
	  },

    methods: {
    	web3InitCompleted() {
  	  	var vm = this;
				setTimeout(function(){ vm.fetchData() }, 500);
    	},

	  	networkToEtherscanUrl(network) {
	  		return etherscanUrl[network];
	  	},

    	accountInfo(accountInfo, network) {
    		//console.log("accountInfo=" + accountInfo);
    		if (this.account != accountInfo) {
    			this.account = accountInfo;
	      	this.getBalanceOf();
    		}
    		this.network = network;
      },

      signRequestToHookedWallet(message) {
      	this.hookedWalletMessage = message;
      },

    	callResult(method, result) { 
    		console.log(method + " callResult=" + result);
    		if (method == "totalSupply") {
	    		this.tokenSupply = this.getAmountDivDecimals(result);
		   	} else if (method == "balanceOf") {
		   		this.accountBalance = this.getAmountDivDecimals(result);
		   	} else if (method == "owner") {
		   		this.owner = '0x' + result.replace('0x', '').replace(/^0+/, '');
		   	}
      },

    	sendTxResult(method, transactionHash, txMessage, completed) {
    		console.log("sendTxResult=" + transactionHash + "," + txMessage);
    		if (transactionHash != "")
    			this.hashUrl = this.etherscanUrl + "tx/" + transactionHash;
    		if (txMessage != "")
    			this.txMessage = txMessage;
    		if (completed) {
	      	this.getTotalSupply();
	      	this.getBalanceOf();
    		}
      },

      signRequestError(error) {
    		this.txMessage = "Sign request error: " + error;
    	},

      fetchData() {
      	this.contract = this.contracts[parseInt(this.$route.params.id)];
      	this.getTotalSupply();
      	this.getOwner();
	      if (this.account != '')
		     	this.getBalanceOf();
		    if (this.env == 'development') {
		    	this.mintTo = "0x2bC471eF0E259aB41f578A540a45f8f64c598882";
		    	this.transferTo = "0xF6791CB4A2037Ddb58221b84678a6ba992cda11d";
		    }
      },

      getTotalSupply: function() {
      	this.$refs.web3Compo.callContractMethod(this.contract.contractAddress, "totalSupply", []);
	    	//this.$emit('callContractMethod', this.contract.contractAddress, "totalSupply", []);
      },

      getBalanceOf: function() {
      	this.$refs.web3Compo.callContractMethod(this.contract.contractAddress, "balanceOf", [this.account]);
	    	//this.$emit('callContractMethod', this.contract.contractAddress, "balanceOf", [this.account]);
      },

      getOwner: function() {
      	this.$refs.web3Compo.callContractMethod(this.contract.contractAddress, "owner", []);
	    	//this.$emit('callContractMethod', this.contract.contractAddress, "totalSupply", []);
      },

      getAmountMulDecimals: function (amount) {
    		var big = new bigdecimal.BigDecimal(amount);
    		var big10 = new bigdecimal.BigInteger("10");
    		var big10Pow = big10.pow(new bigdecimal.BigInteger(this.contract.tokenDecimals));
    		var amountWithDecimals = big.multiply(new bigdecimal.BigDecimal(big10Pow)).toString();
    		var dotIndex = amountWithDecimals.indexOf('.');
    		if (dotIndex >= 0)
    			amountWithDecimals = amountWithDecimals.substring(0, dotIndex);
    		return amountWithDecimals;
      },

      getAmountDivDecimals: function (amount) {
      	var big;
      	if (amount == "0x")
      		amount = "0x0";
      	if (amount.startsWith("0x")) 
    			big = new bigdecimal.BigInteger(amount.substring(2), 16);
    		else
    			big = new bigdecimal.BigInteger(amount);
    		var big10 = new bigdecimal.BigInteger("10");
    		var big10Pow = big10.pow(new bigdecimal.BigInteger(this.contract.tokenDecimals));
    		return new bigdecimal.BigDecimal(big).divide(new bigdecimal.BigDecimal(big10Pow)).toString();
    	},

      mintToken() {
	      var mintTo = this.mintTo && this.mintTo.trim()
	      var mintAmount = this.mintAmount && this.mintAmount.trim()
	      if (!mintTo || !mintAmount) {
	        return;
	      }
	      this.txMessage = '';
	      this.hashUrl = '';
	      this.mintTo = mintTo;
	      this.mintAmount = mintAmount;
	      this.$refs.web3Compo.sendContractMethod(this.contract.contractAddress, 
	      	"mint", [this.mintTo, this.getAmountMulDecimals(mintAmount)]);
	    	//this.$emit('sendContractMethod', this.contract.contractAddress, 
	    	//	"mint", [this.mintTo, this.getAmountMulDecimals(mintAmount)]);
      },

      transferToken() {
	      var transferTo = this.transferTo && this.transferTo.trim()
	      var transferAmount = this.transferAmount && this.transferAmount.trim()
	      if (!transferTo || !transferAmount) {
	        return
	      }
	      this.txMessage = '';
	      this.hashUrl = '';
	      this.transferTo = transferTo;
	      this.transferAmount = transferAmount;
	      this.$refs.web3Compo.sendContractMethod(this.contract.contractAddress, 
	    		"transfer", [this.transferTo, this.getAmountMulDecimals(transferAmount)]);
	    	//this.$emit('sendContractMethod', this.contract.contractAddress, 
	    	//	"transfer", [this.transferTo, this.getAmountMulDecimals(transferAmount)]);
      }

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

.tab-content {
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding: 1em;
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