<template>
	<div>
  <header class="header">
		<div class="jumbotron">
		  <h1 class="display-5">{{ $t('jumbo-title-create-token') }}</h1>
		  <p class="lead">{{ $t('jumbo-text-create-token') }}</p>
		</div>
		<web3compo ref="web3Compo" @accountInfo="accountInfo" @createContractResult="createContractResult" @signRequestError="signRequestError"/>
		<div class="input-group mb-3">
		  <div class="input-group-prepend">
		    <span class="input-group-text" id="basic-addon1">N</span>
		  </div>
		  <input type="text" class="form-control" aria-label="Token Name" aria-describedby="basic-addon1"
		      autofocus autocomplete="off"
		      placeholder="Name"
		      v-model="name">
		</div>
		<div class="input-group mb-3">
		  <div class="input-group-prepend">
		    <span class="input-group-text" id="basic-addon1">S</span>
		  </div>
		  <input type="text" class="form-control" aria-label="Token Symbol" aria-describedby="basic-addon1"
		      autofocus autocomplete="off"
		      placeholder="Symbol"
		      v-model="symbol">
		</div>
		<div class="input-group mb-3">
		  <div class="input-group-prepend">
		    <span class="input-group-text" id="basic-addon1">D</span>
		  </div>
		  <input type="text" class="form-control" aria-label="Token Decimals" aria-describedby="basic-addon1"
		      autofocus autocomplete="off"
		      placeholder="Decimals"
		      v-model="decimals">
		</div>
    <button @click="createContract" class="btn btn-outline-primary btn-lg" :disabled="account==='No account'">
      {{ $t('menu-create-token') }}
    </button>
    <transition name="bounce">
			<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
				v-show="hashUrl">
			  <a :href="hashUrl" target="_blank" rel="noopener noreferrer">Contract creation started, view transaction in etherscan</a>
			</div>			
		</transition>
    <transition name="bounce">
			<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
				v-show="txMessage">
			  {{ txMessage }}
			</div>			
		</transition>
  </header>

  <section class="main2" v-show="contracts.length" v-cloak style="margin-top: 1em">
		<div class="alert alert-primary" role="alert">
		  Your Contracts
		</div>
    <div class="card-columns">
			<div v-for="contract in contracts" class="card shadow" :key="contract.id">
			  <img class="card-img-top" src="./img/coins.png" v-bind:alt="contract.tokenName"/>
			  <div class="card-body">
			    <h5 class="card-title">{{ contract.tokenSymbol }}</h5>
					<h6 class="card-subtitle mb-2 text-muted">{{ contract.tokenName }}({{ contract.tokenDecimals }})</h6>
			    <p class="card-text"><small>
			    	<a :href="networkToEtherscanUrl(contract.network) + 'address/' + contract.contractAddress" target="_blank">
			    		{{ contract.contractAddress }}
			    	</a>
			   	</small></p>
			    <p class="card-text"><small>
			    	<a :href="networkToEtherscanUrl(contract.network) + 'address/' + contract.creator" target="_blank">
			    		{{ contract.creator }}
			    	</a>
			   	</small></p>
			    <div class="card-body">
				    <button class="btn btn-outline-primary" style="width: 6em" @click="manageContract(contract)">{{ $t('run') }}</button>
				    <button class="btn btn-outline-primary" style="width: 6em" @click="removeContract(contract)">{{ $t('delete') }}</button>
				  </div>
			  </div>
  		</div>
	  </div>
  </section>
</div>
</template>

<script>
	import Web3Compo from '@/components/Web3'
	const etherscanUrl = ["https://etherscan.io/", "https://ropsten.etherscan.io/", "https://kovan.etherscan.io/", "https://rinkeby.etherscan.io/"];

	// localStorage persistence
	var STORAGE_KEY = 'token-contracts-v1'
	var contractStorage = {
	  fetch: function () {
	    var contracts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
	    contracts.forEach(function (contract, index) {
	      contract.id = index;
	    })
	    contractStorage.uid = contracts.length
	    return contracts
	  },
	  save: function (contracts) {
	    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts))
	  }
	}

	var web3local = null;
	var web3Functions = {
	}

  export default {
		name: 'TokenContract',

		components: {
			'web3compo': Web3Compo
		},

	  data() {
	  	return {
	      env: process.env.NODE_ENV,
		    contracts: contractStorage.fetch(),
		    name: '',
		    symbol: '',
		    decimals: '',
		    account: '',
		    network: '',
		    hashUrl: '',
		    txMessage: '',
		    editedContract: null,
		    visibility: 'all'
		  }
	  },

    created() {
    },

    mounted() {
    	this.setupTestData();
    },

		beforeDestroy() {
		},


	  // watch contracts change for localStorage persistence
	  watch: {
	    contracts: {
	      handler: function (contracts) {
	        contractStorage.save(contracts)
	      },
	      deep: true
	    }
	  },


	  computed: {
	  	etherscanUrl: function () {
	  		return this.networkToEtherscanUrl(this.network);
	  	}
	  },

	  methods: {
	  	networkToEtherscanUrl(network) {
	  		return etherscanUrl[network];
	  	},

    	accountInfo(accountInfo, network) {
    		console.log("accountInfo=" + accountInfo + "," + network);
    		this.account = accountInfo;
    		this.network = network;
      },

    	createContractResult(transactionHash, txMessage, contractAddress) {
    		if (transactionHash != "") 
    			this.hashUrl = "https://" + this.network + ".etherscan.io/tx/" + transactionHash;
    		if (txMessage != "") 
    			this.txMessage = txMessage;
  			if (contractAddress != "") {
  				console.log("addContract=" + contractAddress);
  				this.addContract(contractAddress);
  			}
      },

      signRequestError(error) {
    		this.txMessage = "Sign request error: " + error;
    	},

	  	setupTestData: function () {
		    if (this.env == 'development') {
		    	this.name = "My First Token";
		    	this.symbol = "MFT";
		    	this.decimals = "18";
		    }
	  	},

	    createContract: function () {
	      var tokenName = this.name && this.name.trim()
	      var tokenSymbol = this.symbol && this.symbol.trim()
	      var tokenDecimals = this.decimals && this.decimals.trim()
	      if (!tokenName || !tokenSymbol || !tokenDecimals) {
	        return
	      }
	      this.txMessage = '';
	      this.hashUrl = '';

	      this.name = tokenName;
	      this.symbol = tokenSymbol;
	      this.decimals = tokenDecimals;
	      this.$refs.web3Compo.createContract(this.name, this.symbol, this.decimals);
	    },

	    addContract: function (contractAddress) {
        this.contracts.push({
          id: contractStorage.uid++,
          tokenName: this.name,
          tokenSymbol: this.symbol,
          tokenDecimals: this.decimals,
          contractAddress: contractAddress,
          creator: this.account,
          network: this.network
        })

	    },

	    removeContract: function (contract) {
	      this.contracts.splice(this.contracts.indexOf(contract), 1);
	    },

	    manageContract: function (contract) {
	    	window.location = "#/manage-token/" + this.contracts.indexOf(contract);
	    }

	  },

	  // a custom directive to wait for the DOM to be updated
	  // before focusing on the input field.
	  // http://vuejs.org/guide/custom-directive.html
	  directives: {
	    'contract-focus': function (el, binding) {
	      if (binding.value) {
	        el.focus()
	      }
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