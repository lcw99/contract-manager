<template>
	<div>
		<header class="header">
		  <input type="text" class="form-control" aria-label="Token Name" aria-describedby="basic-addon1"
		      autofocus autocomplete="off"
		      placeholder="Start ETH"
		      v-model="startETH">
      <button @click="testSubscription" class="btn btn-outline-primary">
				Start	      	
      </button>
      <div>
      	iteration = {{ iteration }}, win = {{ winCount }}
      </div>
      <div>
      	resultNum = {{ resultNum }}, {{ gameStatus }}
      </div>
      <div>
      	currentETH = {{ currentETH }}
      </div>
      <div>
      	houseETH = {{ houseETH }}
      </div>
      <div>
      	fatalLose = {{ fatalLose }}
      </div>
		</header>
	</div>
</template>

<script>

  export default {
		name: 'GambleSimulator',

		components: {
		},

	  data() {
	  	return {
        env: process.env.NODE_ENV,
        startETH: 10,
        currentETH: 10,
        houseETH: 0,
        resultNum: 0,
        gameStatus: '',
        fatalLose: 0,
        gameRunning: false,
        initialBet: 0.03,
        iteration: 0,
        winCount: 0,
		    visibility: 'all'
		  }
	  },

	  computed: {
	  	endLoseBet: function() {
	  		return this.initialBet * 4;
	  	} 
	  },

	  methods: {
	  	testSubscription () {
				var subscription = web3.eth.subscribe('logs', {
				    address: '0xF6791CB4A2037Ddb58221b84678a6ba992cda11d',
				    topics: ['0xF6791CB4A2037Ddb58221b84678a6ba992cda11d']
				}, function(error, result){
				    if (!error)
				        console.log(result);
				})
				.on("data", function(log){
				    console.log(log);
				})
				.on("changed", function(log){
				});
	  	},
	  	startSimulation () {
	  		if (!this.gameRunning) {
	  			this.gameRunning = true;
	  			const vm = this;
					setTimeout(function() {vm.betting(vm.initialBet)}, 1000);
	  		}
				else
					this.gameRunning = false;
	  	},

	  	betting (bet) {
	  		this.iteration++;
	  		this.currentETH = this.currentETH - bet;
	  		this.houseETH = this.houseETH + bet * 0.01;
	  		this.resultNum = Math.floor((Math.random() * 100) + 1);
	  		console.log("house result=" + this.resultNum + ", bet=" + bet);
	  		if (this.resultNum <= 40)	{
	  			this.gameStatus = "win!!!";
	  			this.currentETH = this.currentETH + bet * 2.45;
	  			bet = this.initialBet;
	  			this.winCount++;
	  		} else {
	  			bet = bet * 2;
	  			this.gameStatus = "lose";
	  			if (bet > this.endLoseBet) {
	  				this.fatalLose++;
	  				console.log("fatal lose !!!!!!!!!!!!!!!!!!= " + this.fatalLose)
	  				bet = this.initialBet;
	  			}
	  		}
	  		console.log(this.gameStatus)
	  		console.log("currentETH=" + this.currentETH);
	  		const vm = this;
	  		if (this.gameRunning)
					setTimeout(function() {vm.betting(bet)}, 1000);
	  	}
    }
  }

</script>

<style>
</style>