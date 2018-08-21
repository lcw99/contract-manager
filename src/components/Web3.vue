<template>
	<div>
		<header>
			<div class="d-flex bd-highlight" style="margin-bottom: 1em">
			  <div class="p-2 flex-grow-1 bd-highlight border border-primary">
					<span v-if="account=='No account'">Connect to metamask</span>
			  	<span v-else>{{ network }}: {{ account }} </span>
			  </div>
				<button type="button" class="btn btn-outline-primary" style="margin-left: 5px" data-toggle="modal" data-target="#connectionDialog">
			    <span>Connect</span>
			  </button>			  
			</div>

			<div class="modal fade" id="connectionDialog" tabindex="-1" role="dialog" aria-labelledby="connectionDialog" aria-hidden="true">
			  <div class="modal-dialog modal-dialog-centered" role="document">
			    <div class="modal-content">
			      <div class="modal-header">
			        <h5 class="modal-title" id="connectToDeviceModal">Connect To Smallet</h5>
			        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
			          <span aria-hidden="true">&times;</span>
			        </button>
			      </div>
			      <div class="modal-body d-flex justify-content-center">
			      	<div>
			        	<canvas id="qr"></canvas>
			      	</div>
			      </div>
			      <div class="modal-footer">
			        <div class="alert alert-primary" role="alert">
  							Connection Process Started, read QR code from your Smallet App.<br/>
  							App>Menu>Wallet Connect.
							</div>
			      </div>
			    </div>
			  </div>
			</div>

		</header>
	</div>
</template>

<script>
	import Web3 from "web3";
	import axios from 'axios'
	import { generalTokenAbi, generalTokenCode } from './generalToken.js'
	import ZeroClientProvider from 'web3-provider-engine/zero.js'
	var $ = require('jquery');
	var QRious = require('qrious');

	const infuraUrl = ["https://mainnet.infura.io/", "https://ropsten.infura.io/", "https://kovan.infura.io/", "https://rinkeby.infura.io/"];
	const chainId = [1, 3, 42, 4];
	var web3local = null;

	var STORAGE_KEY = 'connected-device-v1'
	var connectedDeviceStorage = {
	  fetch: function () {
	    var connectedDevice = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
	    return connectedDevice
	  },
	  save: function (connectedDevice) {
	    localStorage.setItem(STORAGE_KEY, JSON.stringify(connectedDevice))
	  }
	}

  export default {
		name: 'Web3',

	  data() {
	  	return {
		    account: '',
		    deviceConnectionKey: this.uuid4(),
		    connectedDevice: connectedDeviceStorage.fetch(),
		    network: '',
		    web3UpdateListenerAttached: false,
		    visibility: 'all'
		  }
	  },

	  watch: {
	    connectedDevice: {
	      handler: function (connectedDevice) {
	        connectedDeviceStorage.save(connectedDevice)
	      },
	      deep: true
	    }
	  },

	  created() {
      this.initWeb3();
    },

    mounted() {
    	var vm = this;
			$('#connectionDialog').on('shown.bs.modal', function (e) {
				console.log("dialog open=" + vm.deviceConnectionKey);
			  var qr = new QRious({ 
			  	element: document.getElementById('qr'),
			  	value: vm.deviceConnectionKey,
			  	padding: 25,
  				size: 300, 
			  });
			  vm.connectToDevice();
			})
    },

		beforeDestroy() {
		},

    methods: {
    	uuid4: function () {
				return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
				    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    	},

		  initWeb3: function () {
				console.log("initWeb3 called");
		    if (typeof web3 == 'undefined' || typeof web3.eth.defaultAccount == 'undefined') {
		    	if (typeof this.connectedDevice.myAddress != 'undefined') {
		    		this.account = this.connectedDevice.myAddress;
		    		this.connectedDeviceToken = this.connectedDevice.deviceToken;
		    		this.network = this.connectedDevice.network;
		    		this.buildZeroClient();
		    	} else
		    		this.account = "No Account";
		    } else {
			    var vm = this;
			    if (!this.web3UpdateListenerAttached)
						web3.currentProvider.publicConfigStore.on('update', function(data) {
							//console.log("metamask updated");
							vm.getMetamaskInfo();
						});
					this.web3UpdateListenerAttached = true;
			    web3local = new Web3(web3.currentProvider);
			    web3local.eth.defaultAccount = web3.eth.defaultAccount;
			    this.getMetamaskInfo();
		  	}
		  },

		  connectToDevice: function () {
		  	var connInfo = { action: "request", key: this.deviceConnectionKey };
		  	var vm = this;
				axios.post('https://smallet.co:3001/api/connectdevice', connInfo)
				  .then(function (response) {
				    var deviceInfo = response.data;
				    console.log(deviceInfo);
				    vm.account = deviceInfo.myAddress;
				    vm.connectedDeviceToken = deviceInfo.deviceToken;
				    vm.network = deviceInfo.network;
				    vm.connectedDevice = deviceInfo;
				    vm.buildZeroClient();
				  	var connInfo = { 
				  		action: "connected", 
				  		key: vm.deviceConnectionKey,
				  		serviceName: document.title
				  	};
						axios.post('https://smallet.co:3001/api/connectdevice', connInfo)
						  .then(function (response) {
						    console.log(deviceInfo);
						    $('#connectionDialog').modal('hide');
						  })
						  .catch(function (error) {
						    console.log(error);
						  });
				  })
				  .catch(function (error) {
				    console.log(error);
				  });
				},

			buildZeroClient: function () {
		    var networkId = parseInt(this.connectedDevice.network);
				const zero = new ZeroClientProvider(this.getOpts(networkId));
				const web3engine = new Web3(zero);

			  web3local = web3engine;
		    web3local.eth.defaultAccount = this.account;
		    console.log("My Engine working...")
		    this.getMetamaskInfo();
		  },

		  getOpts: function (networkId) {
		    var opts = {
		    	rpcUrl: infuraUrl[networkId] + 'du9Plyu1xJErXebTWjsn',
		      getAccounts: (cb) => {
		          let addresses = [this.account];
		          cb(null, addresses);
		      },
		      signTransaction: (txObj, cb) => {
		      	console.log(txObj);
		        var objToSend = { deviceToken: this.connectedDeviceToken, txObj: txObj };
						axios.post('https://smallet.co:3001/api/requestsigntx', objToSend)
						  .then(function (response) {
						    console.log(response.data);
						    var signedTx = response.data;
						    if (signedTx.result == 'true')
						    	cb(null, signedTx.txRaw);
						    else
						    	cb("sign rejected or transaction error", "");
						  })
						  .catch(function (error) {
						    console.log(error);
					    	vm.$emit('signRequestError', error);
						  });
		      }
		    };	
		    return opts;
			},

		  getMetamaskInfo: function () {
		    web3local.eth.net.getNetworkType().then((networkName) => {
		    	this.network = networkName; 		  
		    	this.account = web3local.eth.defaultAccount;  
		    	if (typeof this.account == "undefined") {
		    		this.account = 'No Account';  
		    	}
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
	          gas = Math.floor(gas * 1.2);
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
		    var txObj = { from: this.account, to: contractAddress, data: methodABI, gas: '200000' };
		    var eventName = "sendTxResult";
		    web3local.eth.estimateGas(txObj).then(function (gasEst) {
		    	console.log("gasEst=" + gasEst);
		    	txObj.gas = gasEst;
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
	      });

	    },
		}    
	}
</script>


