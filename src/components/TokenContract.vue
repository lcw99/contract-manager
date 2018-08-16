<template>
<section class="contractapp">
  <header class="header">
  	<div class="container-fluid">
			<div class="jumbotron">
			  <h1 class="display-5">Create Token Contract</h1>
			  <p class="lead">Publish your own ERC20 token contract, easy and fast.</p>
			</div>
			<web3compo></web3compo>
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
	    <button @click="createContract" class="btn btn-primary btn-lg" :disabled="account==='No account'">
	      Create Contract
	    </button>
			<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
				v-show="hashUrl">
			  <a :href="hashUrl" target="_blank" rel="noopener noreferrer">Contract creation started, view transaction in etherscan</a>
			  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
			    <span aria-hidden="true">&times;</span>
			  </button>
			</div>			
			<div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px" 
				v-show="txMessage">
			  {{ txMessage }}
			  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
			    <span aria-hidden="true">&times;</span>
			  </button>
			</div>			
		</div>
  </header>

  <section class="main2" v-show="contracts.length" v-cloak>
  	<div class="container-fluid" style="margin-top:40px">
			<div class="alert alert-primary" role="alert">
			  Your Contracts
			</div>
      <div class="card-columns">
				<div v-for="contract in contracts" class="card" :key="contract.id">
				  <img class="card-img-top" src="./img/coins.png" v-bind:alt="contract.tokenName"/>
				  <div class="card-body">
				    <h5 class="card-title">{{ contract.tokenSymbol }}</h5>
						<h6 class="card-subtitle mb-2 text-muted">{{ contract.tokenName }}({{ contract.tokenDecimals }})</h6>
				    <p class="card-text"><small>Address: {{ contract.contractAddress }}</small></p>
				    <div class="card-body" style="white-space: nowrap;">
					    <button class="btn btn-primary" @click="manageContract(contract)">Run</button>
					    <button class="btn btn-primary" @click="removeContract(contract)">Delete</button>
					  </div>
				  </div>
				</div>
      </div>
    </div>
  </section>
</section>
</template>

<script>
	import Web3Compo from '@/components/Web3'

	// localStorage persistence
	var STORAGE_KEY = 'token-contracts-v1'
	var contractStorage = {
	  fetch: function () {
	    var contracts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
	    contracts.forEach(function (contract, index) {
	      contract.id = index
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
		    contracts: contractStorage.fetch(),
		    name: 'My First Token',
		    symbol: 'MFT',
		    decimals: '18',
		    account: '',
		    network: '',
		    hashUrl: '',
		    txMessage: '',
		    editedContract: null,
		    visibility: 'all'
		  }
	  },

    created() {
    	this.$root.$on('accountInfo', (accountInfo, network) => {
    		console.log("accountInfo=" + accountInfo + "," + network);
    		this.account = accountInfo;
    		this.network = network;
      });
    	this.$root.$on('createContractResult', (transactionHash, txMessage, contractAddress) => {
    		if (transactionHash != "") 
    			this.hashUrl = "https://" + this.network + ".etherscan.io/tx/" + transactionHash;
    		if (txMessage != "") 
    			this.txMessage = txMessage;
  			if (contractAddress != "") {
  				console.log("addContract=" + contractAddress);
  				this.addContract(contractAddress);
  			}
      });
    },

    mounted() {
    },

		beforeDestroy() {
			this.$root.$off('accountInfo', null);
			this.$root.$off('createContractResult', null);
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


	  // methods that implement data logic.
	  // note there's no DOM manipulation here at all.
	  methods: {
	    createContract: function () {
	      var tokenName = this.name && this.name.trim()
	      var tokenSymbol = this.symbol && this.symbol.trim()
	      var tokenDecimals = this.decimals && this.decimals.trim()
	      if (!tokenName || !tokenSymbol || !tokenDecimals) {
	        return
	      }
	      this.name = tokenName;
	      this.symbol = tokenSymbol;
	      this.decimals = tokenDecimals;
	    	this.$root.$emit('createContract', this.name, this.symbol, this.decimals);
	    },

	    addContract: function (contractAddress) {
        this.contracts.push({
          id: contractStorage.uid++,
          tokenName: this.name,
          tokenSymbol: this.symbol,
          tokenDecimals: this.decimals,
          contractAddress: contractAddress,
          completed: false
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
    background: url('./img/ethereum.jpg') no-repeat center center; 
    background-size: cover;
    color: #fff;    
}	
</style>