//This file is up and running at https://monitoring.gadze.finance/api/cayman?wallet=<<YourWalletAddressHere>>

import geistDataProviderABI from '../../ABI/geist.json'
import erc20ABI from '../../ABI/erc20.json'
import masterChefABI from '../../ABI/masterchefv2.json'
import { getContractInstance, getWeb3Instance } from "../../libs/web3Wrapper";

export default async function handler(req, res) {

    /*
        Welcome to the Cayman Islands!
        ------------------------------

            We're going to play a 2 part game. 

                Part 1: We want to test your ability to interact with Blockchain tools and perform various transactions
                    by sendng you on a hunt for various tokens and to perform various activities on chain. These 
                    skills will likley be helpful to you in part 2.

                Part 2: Lets find out who is the smartest trader. The goal of the fund is to make money,
                    whoever makes the most money wins.

            To play you will need to setup a software MetaMask wallet in your browser and provide a wallet address to Andrew.
                You'll be sent $1000 USDC and some nominal amount of AVAX [all on the Avalanche chain]. You will
                use these funds, and only these funds, to compete in the game.
            
            Help can be given along the way, but keep in mind helping each other might hurt your chance to win. The game
                host will attempt to impartially help each player within certain limits.


        What are the prizes:
        --------------------

            Part 1:
                Everyone that finishes part 1 successfully wins $100 from their wallet balance at the end of part 2.
                    Everyone /can/ win, no scam?

            Part 2:
                1st place: Keep 100% of the balance of their game wallet.
                2nd place: Keep 50% of the value of their game wallet.

                Note: If you did finish part 1 successfully, you only get to keep 50% your eligible winnings if you're 1st or 2nd.


        
        Part 1: The pre-game
        --------------------

            Meet all of the following criteria to win.

        */
         
        var criteria = [];
            
        /*

        Critera 1:
        ----------

            * Deposit any amount of TraderJoe pool ID 28 LP tokens into the appropiate Farm on TraderJoe
            
            Hints:
            * Contract addresses are available on the TraderJoe website
            * You need to first figure out which token pair pool id 29 represents
            * The MasterChefV2 contract manages the pool info and rewards for this protocol
            * You can use a chain explorer (such as snowtrace in the case of the Avalanche chain)
                to Read information from various contracts
        */

        const traderJoeMasterChefV2Address = "0xd6a4f121ca35509af06a0be99093d08462f53052"
        const farmContractInstance = await getContractInstance(masterChefABI, traderJoeMasterChefV2Address, "avax")
        var poolShare = await farmContractInstance.methods.userInfo(28, req.query.wallet).call()
        var criteria1 = false;
        if (!poolShare.amount) {
            //couldnt get a poolshare, then something else went wrong
        } else if(poolShare.amount > 0) {
            criteria1 = true;
        }

        criteria.push({criteria1,details: {lpTokenBalance: poolShare.amount}})

        /*

        Criteria 2:
        ----------

            * Hold any number of JOE tokens in your wallet
            * Have any number of rewards unclaimed in your TraderJoe pool ID 28

            Hint:
            * There are several different ways to get a JOE balance, consider doing this in the most
                gas efficient manner.
        */

        var pendingTokens = await farmContractInstance.methods.pendingTokens(28, req.query.wallet).call()
        var claimableJoe = false;
        if (!pendingTokens.pendingJoe) {
            //couldnt get a poolshare, then something else went wrong
        } else if(pendingTokens.pendingJoe > 0) {
            claimableJoe = true;
        }

        var joeInWallet = false;
        const JoeAddress = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd"
        const tokenContract = await getContractInstance(erc20ABI, JoeAddress, "avax")
        if(await tokenContract.methods.balanceOf(req.query.wallet).call() > 0)
            joeInWallet = true 

        var criteria2 = false;
        if(claimableJoe && joeInWallet)
            criteria2 = true

        criteria.push({criteria2,details:{claimableJoe,joeInWallet}})

        /*

        Criteria 3:
        ----------

            * Obtain any amount of WETH.e tokens on the Avalanche chain

        */

        var criteria3 = false;
        const wethAddress = "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab"
        const wethContract = await getContractInstance(erc20ABI, wethAddress, "avax")
        const wethBalance = await wethContract.methods.balanceOf(req.query.wallet).call();
        if(wethBalance > 0)
            criteria3 = true 

        criteria.push({criteria3,details:{wethBalance}})

        /*

        Criteria 4:
        ----------

            * Borrow any number of MIM tokens on the Geist protocol
            
            Hint:
            * This protocol is on the Fantom chain

        */

            const web3 = await getWeb3Instance("fantom")
            const dataProviderContract = "0xf3B0611e2E4D2cd6aB4bb3e01aDe211c3f42A8C3"
            const geistContract = new web3.eth.Contract(geistDataProviderABI, dataProviderContract);
            const reserves = await geistContract.methods.getUserReserveData("0x82f0b8b456c1a451378467398982d4834b6829c1",req.query.wallet).call();
            
            var criteria4 = false;
            if(reserves.currentVariableDebt > 0)
                criteria4 = true
    
            criteria.push({criteria4,details:{mimDebt: reserves.currentVariableDebt}})
        
        /* 

        Criteria 5:
        ----------

            * Demonstrate that you are still meeting all of Criteria 1 through 4 simultaniously by capturing a screenshot of the "Cayman game" screen
            * Email this screenshot to andrew@gadze.finance
        

        Part 2: The real game
        ---------------------

            If you did not make it through to criteria 5, do not fret, you can still play. No scam.
                This game commences Sunday morning (or maybe sooner if we're all ready!)

            The goal of this game is simple: using the funds provided to your as part of Part 1,
                make as much money as possible!

            Rules:
            ------

            0. No trading before the agreed upon start time.
            1. Your strategy must be in the "sprit of the fund". If it couldn't be something reasonably
                addapted to be in the fund, or is in some way unethical, then you shouldn't use it.
                Feel free to ask Andrew throughout the game and we can agree if the approach you're taking is reasonable.
            2. No de-gen coin returns. If you turn the new DOGE coin into a 100x return, scam, you're out.
            3. Keep your returns stable, manage your fund. If at any point you're down more than 20%, you're disqualified.
            4. You cannot win by not participating. It's reasonable that given the time period of the game
                that someone simply holding a stable coin could out perform the other players in terms of USDC.e at the end.
                Keeping substantial stable coin balances will result in disqualification as you have not
                acted in the spirit of the fund.

            The winner is the person that has the most USDC.e on the Avalanche chain [you cannot have a borrowed balance!] at 5pm on Wednesday
                and has complied with all the rules above. If you have not converted your holdings to USDC.e stable coins
                on the Avalanche chain, on or before 5pm, you will be disqualified.

            Wednesday the 26th at 7pm we will do snacks/drinks and each player will present their strategy(ies) to the team.

            */

            //balances
            const usdc = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664"
            const usdcTokenContract = await getContractInstance(erc20ABI, usdc, "avax")
            const usdcBalance = await usdcTokenContract.methods.balanceOf(req.query.wallet).call() / 10e6;
            
            res.status(200).json({criteria,usdcBalance})
}
