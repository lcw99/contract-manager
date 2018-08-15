<template>
<section class="contractapp">
  <header class="header">
  	<div class="container-fluid">
			<div class="jumbotron">
			  <h1 class="display-5">Create Token Contract</h1>
			  <p class="lead">Publish your own ERC20 token contract, easy and fast.</p>
			</div>
			<div v-bind:class="[account==='No account' ? 'alert alert-warning' : 'alert alert-primary']" role="alert">
			  <span v-if="account=='No account'">Connect to metamask</span>
			  <span v-else>{{ network }}: {{ account }} </span>
			</div>
			<div class="input-group mb-3">
			  <div class="input-group-prepend">
			    <span class="input-group-text" id="basic-addon1">N</span>
			  </div>
			  <input type="text" class="form-control" aria-label="Token Name" aria-describedby="basic-addon1"
			      autofocus autocomplete="off"
			      placeholder="Name"
			      v-model="name"
			      @keyup.enter="addContract">
			</div>
			<div class="input-group mb-3">
			  <div class="input-group-prepend">
			    <span class="input-group-text" id="basic-addon1">S</span>
			  </div>
			  <input type="text" class="form-control" aria-label="Token Symbol" aria-describedby="basic-addon1"
			      autofocus autocomplete="off"
			      placeholder="Symbol"
			      v-model="symbol"
			      @keyup.enter="addContract">
			</div>
			<div class="input-group mb-3">
			  <div class="input-group-prepend">
			    <span class="input-group-text" id="basic-addon1">D</span>
			  </div>
			  <input type="text" class="form-control" aria-label="Token Decimals" aria-describedby="basic-addon1"
			      autofocus autocomplete="off"
			      placeholder="Decimals"
			      v-model="decimals"
			      @keyup.enter="addContract">
			</div>
	    <button @click="addContract" class="btn btn-primary btn-lg" :disabled="account==='No account'">
	      Create Contract
	    </button>
			<div class="progress" v-show="progress > 0" style="margin-top: 20px">
			  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" v-bind:aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" v-bind:style="{width: progress + '%'}"></div>
			</div>	    
			<div class="alert alert-danger alert-dismissible fade show" role="alert" style="margin-top: 20px" 
				v-show="errorMessage">
			  {{ errorMessage }}
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
				<div v-for="contract in filteredContracts" class="card" :key="contract.id"
        	:class="{ completed: contract.completed, editing: contract == editedContract }">
				  <img class="card-img-top" src="./img/coins.png" v-bind:alt="contract.tokenName"/>
				  <div class="card-body">
				    <h5 class="card-title">{{ contract.tokenSymbol }}</h5>
						<h6 class="card-subtitle mb-2 text-muted">{{ contract.tokenName }}({{ contract.tokenDecimals }})</h6>
				    <p class="card-text"><small>Address: {{ contract.contractAddress }}</small></p>
				    <div class="card-body" style="white-space: nowrap;">
					    <button class="btn btn-primary">View</button>
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
	import Web3 from "web3";
	import { generalTokenAbi, generalTokenCode } from './generalToken.js'

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

	// visibility filters
	var filters = {
	  all: function (contracts) {
	    return contracts
	  },
	  active: function (contracts) {
	    return contracts.filter(function (contract) {
	      return !contract.completed
	    })
	  },
	  completed: function (contracts) {
	    return contracts.filter(function (contract) {
	      return contract.completed
	    })
	  }
	}

  export default {
		name: 'TokenContract',

	  data() {
	  	return {
		    contracts: contractStorage.fetch(),
		    name: 'My First Token',
		    symbol: 'MFT',
		    decimals: '18',
		    account: '',
		    editedContract: null,
		    progress: 0,
		    network: '',
		    errorMessage: '',
		    visibility: 'all'
		  }
	  },

    created() {
      this.initWeb3();
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

	  // computed properties
	  // http://vuejs.org/guide/computed.html
	  computed: {
	    filteredContracts: function () {
	      return filters[this.visibility](this.contracts)
	    },
	    remaining: function () {
	      return filters.active(this.contracts).length
	    },
	    allDone: {
	      get: function () {
	        return this.remaining === 0
	      },
	      set: function (value) {
	        this.contracts.forEach(function (contract) {
	          contract.completed = value
	        })
	      }
	    }
	  },

	  filters: {
	    pluralize: function (n) {
	      return n === 1 ? 'item' : 'items'
	    }
	  },

	  // methods that implement data logic.
	  // note there's no DOM manipulation here at all.
	  methods: {
		  initWeb3: function () {
		    if (typeof web3 == 'undefined')
		      this.account = "No account";
		    var vm = this;
				web3.currentProvider.publicConfigStore.on('update', function(data) {
					//console.log("metamask=" + JSON.stringify(data));
					vm.getMetamaskInfo();
				});
		    web3local = new Web3(web3.currentProvider);
		    this.getMetamaskInfo();
		  },

		  getMetamaskInfo: function () {
		    web3local.eth.net.getNetworkType().then((networkName) => {
		    	this.network = networkName; 		  
		    	this.account = web3.eth.defaultAccount;  
		    	if (typeof this.account == "undefined")
		    		this.account = "No account";
				});
		  },

	    addContract: function () {
	      var tokenName = this.name && this.name.trim()
	      var tokenSymbol = this.symbol && this.symbol.trim()
	      var tokenDecimals = this.decimals && this.decimals.trim()
	      if (!tokenName || !tokenSymbol || !tokenDecimals) {
	        return
	      }
	      this.name = tokenName;
	      this.symbol = tokenSymbol;
	      this.decimals = tokenDecimals;
	      this.buildGeneralTokenContract();
	    },

	    addContractTest: function () {
        this.contracts.push({
          id: contractStorage.uid++,
          tokenName: this.name,
          tokenSymbol: this.symbol,
          tokenDecimals: this.decimals,
          contractAddress: "",
          completed: false
        })

	    },

	    removeContract: function (contract) {
	      this.contracts.splice(this.contracts.indexOf(contract), 1)
	    },

	    editContract: function (contract) {
	      this.beforeEditCache = contract.title
	      this.editedContract = contract
	    },

	    doneEdit: function (contract) {
	      if (!this.editedContract) {
	        return
	      }
	      this.editedContract = null
	      contract.title = contract.title.trim()
	      if (!contract.title) {
	        this.removeContract(contract)
	      }
	    },

	    cancelEdit: function (contract) {
	      this.editedContract = null
	      contract.title = this.beforeEditCache
	    },

	    removeCompleted: function () {
	      this.contracts = filters.active(this.contracts)
	    },

	    buildGeneralTokenContract: function() {
	      this.progress = 10;
	      var contract = new web3local.eth.Contract(generalTokenAbi);
	      var options = {
	          data: generalTokenCode,
	          arguments: [this.name, this.symbol, this.decimals]
	      };
	      //var encodedAbi = contract.deploy(options).encodeABI();
	      var fromAccount = this.account;
	      var vm = this;
	      contract.deploy(options).estimateGas(function(err, gas){
	          gas = gas * 2;
	          console.log("gas=" + gas);
	          contract.deploy(options).send({
	              from: fromAccount,
	              gas: gas,
	              gasPrice: '3000000000'
	          }, function(error, transactionHash){ console.log(transactionHash) })
	            .on('error', function(error){ 
	              console.log(error);
	              vm.errorMessage = "" + error;
	              vm.progress = 0;
	            })
	            .on('transactionHash', function(transactionHash){ 
	              console.log("on txHash-" + transactionHash);
	              vm.progress = 20;
	            })
	            .on('receipt', function(receipt){
	              console.log(receipt.contractAddress); 
	              vm.contracts.push({
	                id: contractStorage.uid++,
	                tokenName: vm.name,
	                tokenSymbol: vm.symbol,
	                tokenDecimals: vm.decimals,
	                contractAddress: receipt.contractAddress,
	                completed: false
	              })
	              vm.progress = 100;
	            })
	            .on('confirmation', function(confirmationNumber, receipt) { 
	              console.log("on confirmation=" + confirmationNumber) 
	              if (confirmationNumber == 3)
	                vm.progress = 0;
	            })
	            .then(function(newContractInstance){
	                console.log(newContractInstance.options.address) // instance with the new contract address
	            })
	      });
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