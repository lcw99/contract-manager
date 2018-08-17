<template>
	<div>
		<header>
			<div v-bind:class="[account==='No account' ? 'alert alert-warning' : 'alert alert-primary']" role="alert">
			  <span v-if="account=='No account'">Connect to metamask</span>
			  <span v-else>{{ network }}: {{ account }} </span>
			</div>
		</header>
	</div>
</template>

<script>
	import Web3 from "web3";
	import { generalTokenAbi, generalTokenCode } from './generalToken.js'

	var web3local = null;

  export default {
		name: 'Web3',

	  data() {
	  	return {
		    account: '',
		    network: '',
		    web3UpdateListenerAttached: false,
		    visibility: 'all'
		  }
	  },

	  created() {
      this.initWeb3();
    },

    mounted() {
    	/*
    	this.$on('callContractMethod', (contractAddress, method, params) => {
    		console.log("callContractMethod=" + method);
    		this.callContractMethod(contractAddress, method, params);
      });
    	this.$on('sendContractMethod', (contractAddress, method, params) => {
    		this.sendContractMethod(contractAddress, method, params);
      });
    	this.$on('createContract', (name, symbol, decimals) => {
    		this.createContract(name, symbol, decimals);
      });
      */
    },

		beforeDestroy() {
			/*
			this.$off('callContractMethod');
			this.$off('sendContractMethod');
			this.$off('createContract');
			*/
		},

    methods: {
		  initWeb3: function () {
				console.log("initWeb3 called");
		    if (typeof web3 == 'undefined')
		      this.account = "No account";
		    var vm = this;
		    if (!this.web3UpdateListenerAttached)
					web3.currentProvider.publicConfigStore.on('update', function(data) {
						//console.log("metamask updated");
						vm.getMetamaskInfo();
					});
				this.web3UpdateListenerAttached = true;
		    web3local = new Web3(web3.currentProvider);
		    this.getMetamaskInfo();
		  },

		  getMetamaskInfo: function () {
		    web3local.eth.net.getNetworkType().then((networkName) => {
		    	this.network = networkName; 		  
		    	this.account = web3.eth.defaultAccount;  
		    	if (typeof this.account == "undefined")
		    		this.account = "No account";
		    	//console.log("accountInfo emited");
		    	this.$emit('accountInfo', this.account, this.network);
				});
		  },

	    createContract: function(name, symbol, decimals) {
	      var contract = new web3local.eth.Contract(generalTokenAbi);
	      var options = {
	          data: generalTokenCode,
	          arguments: [name, symbol, decimals]
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
					    	vm.$emit('createContractResult', "", "" + error, "");
	            })
	            .on('transactionHash', function(transactionHash){ 
	              console.log("on txHash-" + transactionHash);
					    	vm.$emit('createContractResult', transactionHash, "", "");
	            })
	            .on('receipt', function(receipt){
	              console.log("onreceipt=" + receipt.contractAddress); 
					    	vm.$emit('createContractResult', receipt.transactionHash, "Contract creation completed.", receipt.contractAddress);
	            })
	            .on('confirmation', function(confirmationNumber, receipt) { 
	              console.log("on confirmation=" + confirmationNumber) 
	            })
	            .then(function(newContractInstance){
	                console.log(newContractInstance.options.address) // instance with the new contract address
	            })
	      });
	    },

	    encodeMethod: function (contractAddress, method, params) {
		    var myContract = new web3local.eth.Contract(generalTokenAbi, contractAddress);
		    var paramsStr = "";
		    var prefix = "";
		    for (var i = 0; i < params.length; i++) {
		    	paramsStr += prefix;
		    	if (typeof params[i] == "string")
		    		paramsStr += "'" + params[i] + "'";
		    	else
		    		paramsStr += params[i];
		    	prefix = ",";
		    }
      	console.log("encodeMethod=" + method + "," + paramsStr);
		    var evalStr = "myContract.methods." + method + "(" + paramsStr + ").encodeABI();";
		    console.log("evalStr=" + evalStr);
		    var methodABI = eval(evalStr);
		    console.log("methodABI=" + methodABI);
		    return methodABI;
	    },

      callContractMethod: function (contractAddress, method, params) {
		    var vm = this;
		    var methodABI = this.encodeMethod(contractAddress, method, params);
		    var txObj = { to: contractAddress, data: methodABI };
		    var eventName = "callResult";
		    web3local.eth.call(txObj).then((result) => {
		    	vm.$emit(eventName, method, result);
		    }).catch((error) => {                                                                           
	        console.log(error);                                                                         
		    });
      },

      sendContractMethod: function (contractAddress, method, params) {
		    var vm = this;
		    var methodABI = this.encodeMethod(contractAddress, method, params);
		    var txObj = { from: this.account, to: contractAddress, data: methodABI };
		    var eventName = "sendTxResult";
		    web3local.eth.sendTransaction(txObj)
    			.on('receipt', function(receipt) {
    				//console.log(receipt);
			    	vm.$emit(eventName, method, receipt.transactionHash, method + " completed.", true);
    			})
          .on('error', function(error){ 
            console.log(error);
			    	vm.$emit(eventName, method, "", "" + error, false);
          })
          .on('transactionHash', function(transactionHash){ 
            console.log("on txHash-" + transactionHash);
			    	vm.$emit(eventName, method, transactionHash, "", false);
          });
     }

		}    
	}
</script>


