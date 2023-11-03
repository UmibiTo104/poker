import Player from "./player.js";
import Card from "./card.js";
import Cpu from "./cpu.js";
import Com from "./com.js";
import Util from "./util.js";
import Strength from "./strength.js";
import Pair from "./pare.js";




export default class Game{
    #player_hand;//(プレイヤーの手札2枚＋コミュニティーカード5枚)
    #cpu_hand;//(cpuの手札2枚＋コミュニティーカード5枚)
    #community_cards;
    #revealed;
    #you;
    #cpu;
    #com1;
    #com2;
    #com3;
    #com4;
    #com5;
    #your_chips;
    #cpu_chips;
    #your_bet;
    #cpu_bet;
    #pot;
    #cpu_current_bet ;
    #your_current_bet;
    #rounds;
    #not_game_over;
    #folder;
    #deck;
    #not_fold;
    #flop;
    #turn;
    #river;
    #isRunning;
    #check;
    //初期化
    constructor(){
        this.#player_hand = [];
        this.#cpu_hand = [];
        this.#community_cards = [];
        this.#revealed = 0;
        this.#you = null;
        this.#cpu = null;
        this.#com1 = null;
        this.#com2 = null;
        this.#com3 = null;
        this.#com4 = null;
        this.#com5 = null;
        this.#your_chips = 1000;
        this.#cpu_chips = 1000;
        this.#your_bet = 0;
        this.#cpu_bet = 0;
        this.#pot = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        this.#rounds = 1;
        this.#not_game_over =false;//1ラウンドのゲーム実行状態(true:実行中,false:終了)
        this.#folder = null;
        this.#deck = [];
        this.#not_fold =false;//どちらかがフォールドしたかどうか判断(true:両方フォールドしなかった,false:一方がフォールドした)
        this.#flop = false; //true:flop,false:not flop
        this.#turn = false; //true:turn,false:not turn
        this.#river = false; //true:river,false:not river
        this.#isRunning =false;//全ゲームの実行状態(true:実行中,false:終了)
        this.#check = false;
        //イベントハンドラを登録する
        this.#setupEvents();
    }

    //ゲームを実行する
    run(){
      
      //ゲームの状態を初期化する
      this.#initialize();
    }

    //1ラウンド、１ゲームの流れ
    #initialize(){
        this.#you = new Player(".card.you");
        this.#cpu = new Cpu(".card.cpu");
        this.#com1 = new Com(".card.com1");
        this.#com2 = new Com(".card.com2");
        this.#com3 = new Com(".card.com3");
        this.#com4 = new Com(".card.com4");
        this.#com5 = new Com(".card.com5");
        this.#deck = [];
        [...Array(52)].map((_,index)=>{
            this.#deck.push(new Card(index+1));
        });
        this.#community_cards = [];
        // 山札のカードをシャッフルする
        this.#shuffleCard();
        // 2枚プレイヤーに配る
        this.#dealCard(this.#you, 2);
        //2枚cpuに配る
        this.#dealCard(this.#cpu, 2);
        //コミュニティーカードをセットする
        this.#dealCard(this.#com1, 1);//com1に1枚配る(場の5枚の内一番左側)
        this.#dealCard(this.#com2, 1);//左から二番目
        this.#dealCard(this.#com3, 1);//左から三番目
        this.#dealCard(this.#com4, 1);//四番目
        this.#dealCard(this.#com5, 1);//最後
        // ゲーム実行状態を更新
        this.#isRunning = true;
         //1ラウンド目開始
         this.#not_game_over = true;
         this.#not_fold =false;//どちらかがフォールドしたかどうか判断(true:両方フォールドしなかった,false:一方がフォールドした)
         this.#flop = false; //true:flop,false:not flop
         this.#turn = false; //true:turn,false:not turn
         this.#river = false; //true:river,false:not river
         this.#check = false;
         // 画面の描画を更新する
         this.#updateView();
        
        
        
       
      //どちらも下りなかった場合使う↓
       //player_hand作成
       this.#player_hand = this.#you.cards.concat(this.#com1.cards,this.#com2.cards,this.#com3.cards,this.#com4.cards,this.#com5.cards);
       //cpu_hand作成
       this.#cpu_hand = this.#cpu.cards.concat(this.#com1.cards,this.#com2.cards,this.#com3.cards,this.#com4.cards,this.#com5.cards);

       console.log(this.#player_hand);
       console.log(this.#cpu_hand);
       console.log(this.#cpu.cards);
       console.log(this.#community_cards);

       
       document.getElementById("pot").textContent = this.#pot;

       
       document.getElementById("your_bet").textContent = this.#your_bet;

       
       document.getElementById("cpu_bet").textContent = this.#cpu_bet;

       
       document.getElementById("your_chips").textContent = this.#your_chips;

    
       document.getElementById("cpu_chips").textContent = this.#cpu_chips;

       //毎ラウンドベットするのはplayer
       if(this.#your_chips < 50){
        alert("第"+this.#rounds+"ラウンド開始！\nあなたのターンです。ベットしてください。\n あなたは50チップ以上持っていなのでオールインしてください。")
       }else{
       alert("第"+this.#rounds+"ラウンド開始！\nあなたのターンです。ベットしてください。\n最低ベット額は50チップです。");
       document.querySelector("#allin").setAttribute("disabled", true);
      
      }
       
    }

    
    
    #shuffleCard(){
    // 100回繰り返す
    [...Array(100)].forEach(() => {
      // 山札から2枚のカードをランダムに選んで交換する
      const j = Math.floor(Math.random() * this.#deck.length);
      const k = Math.floor(Math.random() * this.#deck.length);
      [this.#deck[j], this.#deck[k]] = [this.#deck[k], this.#deck[j]];
    });
    }

  /**
   * 山札のカードをプレイヤーに配る
   */
  #dealCard(player, n) {
    // n回繰り返す
    [...Array(n)].map(() => {
      // 山札からカードを1枚取り出してプレイヤーに配る
      player.addCard(this.#deck.pop());
    });
   }

  /**
   * 画面の描画を更新する
   */
  #updateView() {
    // プレイヤーのカードを描画する
    this.#you.displayCard(true);
    // 相手のカードを描画する
    this.#cpu.displayCard(this.#not_fold);//どちらも下りなかった場合のみ公開 this.#not_fold=trueの場合のみ公開
    //場のカードを描画する
    this.#com1.displayCard(this.#flop);//フロップ時に公開,this.#flop=trueの場合のみ公開
    this.#com2.displayCard(this.#flop);//フロップ時に公開
    this.#com3.displayCard(this.#flop);//フロップ時に公開
    this.#com4.displayCard(this.#turn);//ターン時に公開,this.#turn=trueの場合のみ公開
    this.#com5.displayCard(this.#river);//リバー時に公開,this.#river=trueの場合のみ公開
    //ボタンの描画する
    if(this.#not_game_over && this.#isRunning){
      document.querySelector("#replay").setAttribute("disabled", true);
      if(this.#your_bet > 0){
      document.querySelector("#fold").removeAttribute("disabled");
      document.querySelector("#allin").removeAttribute("disabled");
      }else{
        document.querySelector("#fold").setAttribute("disabled", true);
      }
      if(this.#cpu_chips === 0 && this.#cpu_bet <= this.#your_chips + this.#your_bet){
        document.querySelector("#allin").setAttribute("disabled", true);
      }
      if(this.#cpu_current_bet === 0 && this.#flop){
        document.querySelector("#check").removeAttribute("disabled");
      }else{
        document.querySelector("#check").setAttribute("disabled", true);
        }
      if(this.#cpu_current_bet === 0 && this.#flop){
      document.querySelector("#check").removeAttribute("disabled");
    }else{
      document.querySelector("#check").setAttribute("disabled", true);
      }
      if(this.#your_chips > this.#cpu_bet){
           document.querySelector("#raise_bet").removeAttribute("disabled");
      }else{
        document.querySelector("#raise_bet").setAttribute("disabled", true);
      }
      if(this.#your_chips + this.#your_bet >= this.#cpu_bet && this.#cpu_current_bet > 0){
          document.querySelector("#call").removeAttribute("disabled");
      }else{
        document.querySelector("#call").setAttribute("disabled", true);
      }
      if(this.#your_chips < 50){
        document.querySelector("#allin").removeAttribute("disabled");
        document.querySelector("#raise_bet").setAttribute("disabled", true);
      }
    }
    if (!this.#not_game_over){
      document.querySelector("#allin").setAttribute("disabled", true);
      document.querySelector("#fold").setAttribute("disabled", true);
      document.querySelector("#check").setAttribute("disabled", true);
      document.querySelector("#raise_bet").setAttribute("disabled", true);
      document.querySelector("#call").setAttribute("disabled", true);
    }
   if(!this.#isRunning){
    document.querySelector("#replay").removeAttribute("disabled");
   }

  }

  //オールインボタンのクリックイベントハンドラ,後で改良if文
  async #onAllin(event){
    
      let bet_amount =confirm("オールインしますか？");
      if(bet_amount){
        this.#pot += this.#your_chips;
        this.#your_current_bet += this.#your_chips;//ラウンドが終わったら０に初期化
        this.#your_bet += this.#your_chips;
        this.#your_chips = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        this.#updateView();
        this.#check = false;
        await Util.sleep();
        
        
        
        let raised_chip = this.#your_bet - this.#cpu_bet;
        let community_cards_length = this.#community_cards.length;
        let desired_bet = Cpu.simulate_holdem(this.#cpu.cards, this.#community_cards, community_cards_length, this.#your_bet, raised_chip, this.#pot);
        
         if(this.#cpu_chips === 0){
          alert("ショーハンドを行います。");
          await Util.sleep();
          this.#flop = true;
          this.#turn = true;
          this.#river = true;
          this.#not_fold = true;
          this.#updateView();
          await Util.sleep();
          let youResult = Strength.hand_best(this.#player_hand);
          let comResult = Strength.hand_best(this.#cpu_hand);
          youResult = Pair.judge(youResult);
          comResult = Pair.judge(comResult);
          console.log(youResult);
          console.log(comResult);
          let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
          // 勝者の判定
         if (youResult.strength < comResult.strength) {
         // 相手（Com）の勝ち
         message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
         alert(message);
         this.#cpu_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
        } else if (youResult.strength > comResult.strength) {
         // プレイヤーの勝ち
         message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
         alert(message);
         this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
       } else {
        // 役が同じなのでランクで比較する
       if (youResult.rank < comResult.rank) {
        // 相手（Com）の勝ち
        message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
        alert(message);
        this.#cpu_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
       this.#not_game_over = false;
       this.#isRunning = false;
       this.#updateView();
      } else if (youResult.rank > comResult.rank) {
        // プレイヤーの勝ち
        message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
        alert(message);
        this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
      } else {
        // 引き分け
        message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += Math.trunc(this.#pot / 2);
        this.#cpu_chips += Math.trunc(this.#pot / 2);
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      }
    }
         }
        else if(desired_bet >= this.#your_current_bet && desired_bet >= this.#your_bet && this.#cpu_chips < this.#your_bet){
          this.#pot += this.#cpu_chips;
          this.#cpu_current_bet += this.#cpu_chips;
          this.#cpu_bet += this.#cpu_chips;
          this.#cpu_chips = 0;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはオールインしました。ショーハンドを行います。");
          await Util.sleep();
          this.#flop = true;
          this.#turn = true;
          this.#river = true;
          this.#not_fold = true;
          this.#updateView();
          await Util.sleep();
          let youResult = Strength.hand_best(this.#player_hand);
          let comResult = Strength.hand_best(this.#cpu_hand);
          youResult = Pair.judge(youResult);
          comResult = Pair.judge(comResult);
          console.log(youResult);
          console.log(comResult);
          let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
          // 勝者の判定
         if (youResult.strength < comResult.strength) {
         // 相手（Com）の勝ち
         message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
         alert(message);
         this.#cpu_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
        } else if (youResult.strength > comResult.strength) {
         // プレイヤーの勝ち
         message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
         alert(message);
         this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
       } else {
        // 役が同じなのでランクで比較する
       if (youResult.rank < comResult.rank) {
        // 相手（Com）の勝ち
        message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
        alert(message);
        this.#cpu_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
       this.#not_game_over = false;
       this.#isRunning = false;
       this.#updateView();
      } else if (youResult.rank > comResult.rank) {
        // プレイヤーの勝ち
        message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
        alert(message);
        this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
      } else {
        // 引き分け
        message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += Math.trunc(this.#pot / 2);
        this.#cpu_chips += Math.trunc(this.#pot / 2);
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      }
    }
        }else if (desired_bet >= this.#your_current_bet && this.#cpu_chips > this.#your_bet){//コールオールイン
          this.#cpu_current_bet += this.#your_bet - this.#cpu_bet;
          this.#cpu_bet += this.#cpu_current_bet;
          this.#pot += this.#cpu_current_bet;
          this.#cpu_chips -= this.#cpu_current_bet;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはコールオールインしました。ショーハンドを行います。");
          await Util.sleep();
          this.#flop = true;
          this.#turn = true;
          this.#river = true;
          this.#not_fold = true;
          this.#updateView();
          await Util.sleep();
          let youResult = Strength.hand_best(this.#player_hand);
          let comResult = Strength.hand_best(this.#cpu_hand);
          youResult = Pair.judge(youResult);
          comResult = Pair.judge(comResult);
          console.log(youResult);
          console.log(comResult);
          let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
          // 勝者の判定
         if (youResult.strength < comResult.strength) {
         // 相手（Com）の勝ち
         message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
         alert(message);
         this.#cpu_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#isRunning = false;
        this.#updateView();
        } else if (youResult.strength > comResult.strength) {
         // プレイヤーの勝ち
         message += "あなたは"+this.#pot+"チップ手に入れました";
         alert(message);
         this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         this.#cpu_current_bet = 0;
         this.#your_current_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
       } else {
        // 役が同じなのでランクで比較する
       if (youResult.rank < comResult.rank) {
        // 相手（Com）の勝ち
        message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
        alert(message);
        this.#cpu_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
       this.#not_game_over = false;
       this.#isRunning = false;
       this.#updateView();
      } else if (youResult.rank > comResult.rank) {
        // プレイヤーの勝ち
        message += "あなたは"+this.#pot+"チップ手に入れました。";
        alert(message);
        this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         this.#your_current_bet = 0;
         this.#cpu_current_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
    
      } else {
        // 引き分け
        message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += Math.trunc(this.#pot / 2);
        this.#cpu_chips += Math.trunc(this.#pot / 2);
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        this.#your_current_bet = 0;
         this.#cpu_current_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      }
    }

      } else{
        this.#not_game_over = false;
          alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショウハンドは行われませんでした。")
          this.#your_chips += this.#pot;
          this.#pot = 0;
          this.#cpu_current_bet = 0;
          this.#your_current_bet = 0;
          this.#your_bet = 0;
          this.#cpu_bet = 0;
          this.#not_fold =false;
          this.#flop = false; 
          this.#turn = false; 
          this.#river = false;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("your_bet").textContent = this.#your_bet;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          this.#rounds += 1;
          // 1秒待つ
          await Util.sleep();
          this.#initialize(); 
      }
  }else{
    alert("あなたはオールインをキャンセルしました。");
  }
  }
  

  

  //　ベット/レイズボタンのクリックイベントハンドラ,後に改良 if文の条件のthis.#cpu_betはcpuが最近賭けった額 cpu_current_bet
  async #onraise_bet(event){
      if(this.#pot === 0 && this.#your_bet === 0 && this.#cpu_bet === 0){
        let bet_amount = Number(prompt("ベットする額を入力してください"));
        while(isNaN(bet_amount)){
          bet_amount = Number(prompt("数値以外が入力されました、数値を入力してください！".trim()));
        }
  
        if (bet_amount === Number()){
          alert("あなたはベットをキャンセルしました");
        }
        else if(bet_amount > this.#your_chips || bet_amount < 50){
          alert("その額ではベットできません");
        }else
        {
          this.#pot += bet_amount;
          this.#your_current_bet += bet_amount;
          this.#your_bet += bet_amount;
          this.#your_chips -= bet_amount;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("your_bet").textContent = this.#your_bet;
          document.getElementById("your_chips").textContent = this.#your_chips;
          this.#updateView();
          this.#check = false;
          await Util.sleep();

        let raised_chip = this.#your_bet - this.#cpu_bet;
        let desired_bet = Cpu.simulate_holdem(this.#cpu.cards, this.#community_cards, 0, this.#your_bet, raised_chip, this.#pot);
        if(bet_amount >= this.#cpu_chips){
          this.#pot += this.#cpu_chips;
          this.#cpu_current_bet += this.#cpu_chips;
          this.#cpu_bet += this.#cpu_chips;
          this.#cpu_chips = 0;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはオールインしました。\n ショーハンドを行います。");
this.#flop = true;
this.#turn = true;
this.#river = true;
this.#not_fold = true;
this.#updateView();
await Util.sleep();
let youResult = Strength.hand_best(this.#player_hand);
let comResult = Strength.hand_best(this.#cpu_hand);
youResult = Pair.judge(youResult);
comResult = Pair.judge(comResult);
console.log(youResult);
console.log(comResult);
let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
// 勝者の判定
if (youResult.strength < comResult.strength) {
// 相手（Com）の勝ち
message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#cpu_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
} else if (youResult.strength > comResult.strength) {
// プレイヤーの勝ち
message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
alert(message);
this.#your_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#isRunning = false;
this.#updateView();
} else {
// 役が同じなのでランクで比較する
if (youResult.rank < comResult.rank) {
// 相手（Com）の勝ち
message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#cpu_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
} else if (youResult.rank > comResult.rank) {
// プレイヤーの勝ち
message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
alert(message);
this.#your_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#isRunning = false;
this.#updateView();
} else {
// 引き分け
message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#your_chips += Math.trunc(this.#pot / 2);
this.#cpu_chips += Math.trunc(this.#pot / 2);
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
this.#cpu_current_bet = 0;
this.#your_current_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
}
}
        }
        else if(desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
          this.#pot += this.#cpu_chips;
          this.#cpu_current_bet += this.#cpu_chips;
          this.#cpu_bet += this.#cpu_chips;
          this.#cpu_chips = 0;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはオールインしました。\n あなたのターンです。");
        }
        else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
          this.#cpu_current_bet += desired_bet;
          this.#pot += this.#cpu_current_bet;
          this.#cpu_chips -=  this.#cpu_current_bet;
          this.#cpu_bet += this.#cpu_current_bet;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
        }
        else{
          this.#cpu_current_bet += this.#your_current_bet;
          this.#pot += this.#your_current_bet;
          this.#cpu_bet += this.#your_current_bet;
          this.#cpu_chips -= this.#your_current_bet;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはコールしました。");
          this.#flop = true;
          this.#your_current_bet = 0;
          this.#cpu_current_bet = 0;
          this.#community_cards = this.#community_cards.concat(this.#com1.cards,this.#com2.cards,this.#com3.cards);
          this.#updateView();
          alert("【フロップ】\n あなたのターンです。");
          console.log(this.#community_cards);
        }
        }
      }
      else{

      let bet_amount = Number(prompt("レイズする額を入力してください"));
      while(isNaN(bet_amount)){
        bet_amount = Number(prompt("数値以外が入力されました、数値を入力してください！".trim()));
      }

      if (bet_amount === Number()){
        alert("あなたはレイズをキャンセルしました");
      }
      else if(bet_amount >= this.#your_chips || bet_amount + this.#your_bet <= this.#cpu_bet){
        alert("その額ではレイズできません");
      }
      else{
        this.#pot += bet_amount;
        this.#your_bet += bet_amount;
        this.#your_current_bet += bet_amount;
        this.#your_chips -= bet_amount;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        this.#updateView();
        this.#check = false;
        await Util.sleep();

        let raised_chip = this.#your_bet - this.#cpu_bet;
        let community_cards_length = this.#community_cards.length;
        let desired_bet = Cpu.simulate_holdem(this.#cpu.cards, this.#community_cards, community_cards_length, this.#your_bet, raised_chip, this.#pot);
        if(desired_bet < raised_chip){
          this.#not_game_over = false;
          alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショウハンドは行われませんでした。")
          this.#your_chips += this.#pot;
          this.#pot = 0;
          this.#cpu_current_bet = 0;
          this.#your_current_bet = 0;
          this.#your_bet = 0;
          this.#cpu_bet = 0;
          this.#not_fold =false;
          this.#flop = false; 
          this.#turn = false; 
          this.#river = false;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("your_bet").textContent = this.#your_bet;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          this.#rounds += 1;
          // 1秒待つ
          await Util.sleep();
          this.#initialize(); 
        }
        else if(desired_bet >= raised_chip && desired_bet < this.#your_bet){
          this.#cpu_current_bet += this.#your_bet - this.#cpu_bet;
          this.#pot += this.#cpu_current_bet;
          this.#cpu_bet += this.#cpu_current_bet;
          this.#cpu_chips -= this.#cpu_current_bet;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはコールしました。");
          if(this.#river){
            alert("ショーハンドを行います。")
            await Util.sleep();
this.#flop = true;
this.#turn = true;
this.#river = true;
this.#not_fold = true;
this.#updateView();
await Util.sleep();
let youResult = Strength.hand_best(this.#player_hand);
let comResult = Strength.hand_best(this.#cpu_hand);
youResult = Pair.judge(youResult);
comResult = Pair.judge(comResult);
console.log(youResult);
console.log(comResult);
let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
// 勝者の判定
if (youResult.strength < comResult.strength) {
// 相手（Com）の勝ち
message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#cpu_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
} else if (youResult.strength > comResult.strength) {
// プレイヤーの勝ち
message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#your_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
} else {
// 役が同じなのでランクで比較する
if (youResult.rank < comResult.rank) {
// 相手（Com）の勝ち
message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#cpu_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
} else if (youResult.rank > comResult.rank) {
// プレイヤーの勝ち
message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#your_chips += this.#pot;
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#not_game_over = false;
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
} else {
// 引き分け
message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
alert(message);
this.#your_chips += Math.trunc(this.#pot / 2);
this.#cpu_chips += Math.trunc(this.#pot / 2);
this.#pot = 0;
this.#cpu_bet = 0;
this.#your_bet = 0;
this.#cpu_current_bet = 0;
this.#your_current_bet = 0;
document.getElementById("pot").textContent = this.#pot;
document.getElementById("your_bet").textContent = this.#your_bet;
document.getElementById("your_chips").textContent = this.#your_chips;
document.getElementById("cpu_bet").textContent = this.#cpu_bet;
document.getElementById("cpu_chips").textContent = this.#cpu_chips;
this.#updateView();
this.#rounds += 1;
// 1秒待つ
await Util.sleep();
this.#initialize();
}
}
          }
          else if(this.#flop && this.#turn){
            this.#river = true;
            this.#your_current_bet = 0;
            this.#cpu_current_bet = 0;
            this.#community_cards = this.#community_cards.concat(this.#com5.cards);
            this.#updateView();
          alert("【リバー】\n あなたのターンです。");
          console.log(this.#community_cards);
          }
          else if(this.#flop){
          this.#turn = true;
          this.#your_current_bet = 0;
          this.#cpu_current_bet = 0;
          this.#community_cards = this.#community_cards.concat(this.#com4.cards);
          this.#updateView();
          alert("【ターン】\n あなたのターンです。");
          console.log(this.#community_cards);
        }else{
          this.#flop = true;
          alert("【フロップ】\nあなたのターンです。")
        }
        }
        else if (desired_bet > this.#your_current_bet && desired_bet < this.#cpu_chips){
          this.#cpu_current_bet += desired_bet;
          this.#pot += this.#cpu_current_bet;
          this.#cpu_chips -=  this.#cpu_current_bet;
          this.#cpu_bet += this.#cpu_current_bet;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
        }
        else{
          this.#pot += this.#cpu_chips;
          this.#cpu_current_bet += this.#cpu_chips;
          this.#cpu_bet += this.#cpu_chips;
          this.#cpu_chips = 0;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          alert("cpuはオールインしました。\n あなたのターンです。");
          
        }
      
    }
    }
  }
    
  


  //コールボタンのクリックイベントハンドラ,後にif文改良 this.#cpu_betをcpu_current_betにする
  async #oncall(event){
      this.#your_current_bet = this.#cpu_bet - this.#your_bet;
      this.#pot += this.#your_current_bet;
      this.#your_bet += this.#your_current_bet;
      this.#your_chips -= this.#your_current_bet;
      
      document.getElementById("pot").textContent = this.#pot;
      document.getElementById("your_bet").textContent = this.#your_bet;
      document.getElementById("your_chips").textContent = this.#your_chips;
      this.#updateView();
      this.#check = false;
      let raised_chip = this.#your_bet - this.#cpu_bet;
      let community_cards_length = this.#community_cards.length;
      let desired_bet = Cpu.simulate_holdem(this.#cpu.cards, this.#community_cards, community_cards_length, this.#your_bet, raised_chip, this.#pot);
      if(this.#cpu_chips === 0 && this.#your_chips > 0){
        alert("ショーハンドを行います。");
        await Util.sleep();
        this.#flop = true;
        this.#turn = true;
        this.#river = true;
        this.#not_fold = true;
        this.#updateView();
        await Util.sleep();
        let youResult = Strength.hand_best(this.#player_hand);
        let comResult = Strength.hand_best(this.#cpu_hand);
        youResult = Pair.judge(youResult);
        comResult = Pair.judge(comResult);
        console.log(youResult);
        console.log(comResult);
        let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
        // 勝者の判定
       if (youResult.strength < comResult.strength) {
       // 相手（Com）の勝ち
       message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
       alert(message);
       this.#cpu_chips += this.#pot;
       this.#pot = 0;
       this.#cpu_bet = 0;
       this.#your_bet = 0;
       document.getElementById("pot").textContent = this.#pot;
       document.getElementById("your_bet").textContent = this.#your_bet;
       document.getElementById("your_chips").textContent = this.#your_chips;
       document.getElementById("cpu_bet").textContent = this.#cpu_bet;
       document.getElementById("cpu_chips").textContent = this.#cpu_chips;
       this.#updateView();
      this.#not_game_over = false;
      this.#rounds += 1;
      // 1秒待つ
     await Util.sleep();
     this.#initialize();
      } else if (youResult.strength > comResult.strength) {
       // プレイヤーの勝ち
       message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
       alert(message);
       this.#your_chips += this.#pot;
       this.#pot = 0;
       this.#cpu_bet = 0;
       this.#your_bet = 0;
       document.getElementById("pot").textContent = this.#pot;
       document.getElementById("your_bet").textContent = this.#your_bet;
       document.getElementById("your_chips").textContent = this.#your_chips;
       document.getElementById("cpu_bet").textContent = this.#cpu_bet;
       document.getElementById("cpu_chips").textContent = this.#cpu_chips;
       this.#updateView();
      this.#not_game_over = false;
      this.#isRunning = false;
      this.#updateView();
     } else {
      // 役が同じなのでランクで比較する
     if (youResult.rank < comResult.rank) {
      // 相手（Com）の勝ち
      message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
      alert(message);
      this.#cpu_chips += this.#pot;
      this.#pot = 0;
      this.#cpu_bet = 0;
      this.#your_bet = 0;
      document.getElementById("pot").textContent = this.#pot;
      document.getElementById("your_bet").textContent = this.#your_bet;
      document.getElementById("your_chips").textContent = this.#your_chips;
      document.getElementById("cpu_bet").textContent = this.#cpu_bet;
      document.getElementById("cpu_chips").textContent = this.#cpu_chips;
      this.#updateView();
     this.#not_game_over = false;
     this.#rounds += 1;
      // 1秒待つ
     await Util.sleep();
     this.#initialize();
    } else if (youResult.rank > comResult.rank) {
      // プレイヤーの勝ち
      message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
      alert(message);
      this.#your_chips += this.#pot;
       this.#pot = 0;
       this.#cpu_bet = 0;
       this.#your_bet = 0;
       document.getElementById("pot").textContent = this.#pot;
       document.getElementById("your_bet").textContent = this.#your_bet;
       document.getElementById("your_chips").textContent = this.#your_chips;
       document.getElementById("cpu_bet").textContent = this.#cpu_bet;
       document.getElementById("cpu_chips").textContent = this.#cpu_chips;
       this.#updateView();
      this.#not_game_over = false;
      this.#isRunning = false;
      this.#updateView();
    } else {
      // 引き分け
      message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
      alert(message);
      this.#your_chips += Math.trunc(this.#pot / 2);
      this.#cpu_chips += Math.trunc(this.#pot / 2);
      this.#pot = 0;
      this.#cpu_bet = 0;
      this.#your_bet = 0;
      this.#cpu_current_bet = 0;
      this.#your_current_bet = 0;
      document.getElementById("pot").textContent = this.#pot;
      document.getElementById("your_bet").textContent = this.#your_bet;
      document.getElementById("your_chips").textContent = this.#your_chips;
      document.getElementById("cpu_bet").textContent = this.#cpu_bet;
      document.getElementById("cpu_chips").textContent = this.#cpu_chips;
      this.#updateView();
      this.#rounds += 1;
      // 1秒待つ
     await Util.sleep();
     this.#initialize();
    }
  }}else if(this.#cpu_chips === 0 && this.#your_chips === 0){
    this.#flop = true;
    this.#turn = true;
    this.#river = true;
    this.#not_fold = true;
    this.#updateView();
    await Util.sleep();
    let youResult = Strength.hand_best(this.#player_hand);
    let comResult = Strength.hand_best(this.#cpu_hand);
    youResult = Pair.judge(youResult);
    comResult = Pair.judge(comResult);
    console.log(youResult);
    console.log(comResult);
    let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
    // 勝者の判定
    if (youResult.strength < comResult.strength) {
    // 相手（Com）の勝ち
    message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
    alert(message);
    this.#cpu_chips += this.#pot;
    this.#pot = 0;
    this.#cpu_bet = 0;
    this.#your_bet = 0;
    document.getElementById("pot").textContent = this.#pot;
    document.getElementById("your_bet").textContent = this.#your_bet;
    document.getElementById("your_chips").textContent = this.#your_chips;
    document.getElementById("cpu_bet").textContent = this.#cpu_bet;
    document.getElementById("cpu_chips").textContent = this.#cpu_chips;
    this.#updateView();
    this.#not_game_over = false;
    this.#isRunning = false;
    this.#updateView();
    } else if (youResult.strength > comResult.strength) {
    // プレイヤーの勝ち
    message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
    alert(message);
    this.#your_chips += this.#pot;
    this.#pot = 0;
    this.#cpu_bet = 0;
    this.#your_bet = 0;
    document.getElementById("pot").textContent = this.#pot;
    document.getElementById("your_bet").textContent = this.#your_bet;
    document.getElementById("your_chips").textContent = this.#your_chips;
    document.getElementById("cpu_bet").textContent = this.#cpu_bet;
    document.getElementById("cpu_chips").textContent = this.#cpu_chips;
    this.#updateView();
    this.#not_game_over = false;
    this.#isRunning = false;
    this.#updateView();
    } else {
    // 役が同じなのでランクで比較する
    if (youResult.rank < comResult.rank) {
    // 相手（Com）の勝ち
    message += "cpuは"+this.#pot+"チップ手に入れました。\n あなたの持ちチップは0になりました。あなたの負けです";
    alert(message);
    this.#cpu_chips += this.#pot;
    this.#pot = 0;
    this.#cpu_bet = 0;
    this.#your_bet = 0;
    document.getElementById("pot").textContent = this.#pot;
    document.getElementById("your_bet").textContent = this.#your_bet;
    document.getElementById("your_chips").textContent = this.#your_chips;
    document.getElementById("cpu_bet").textContent = this.#cpu_bet;
    document.getElementById("cpu_chips").textContent = this.#cpu_chips;
    this.#updateView();
    this.#not_game_over = false;
    this.#isRunning = false;
    this.#updateView();
    } else if (youResult.rank > comResult.rank) {
    // プレイヤーの勝ち
    message += "あなたは"+this.#pot+"チップ手に入れました。\n cpuの持ちチップは0になりました。あなたの勝ちです";
    alert(message);
    this.#your_chips += this.#pot;
    this.#pot = 0;
    this.#cpu_bet = 0;
    this.#your_bet = 0;
    document.getElementById("pot").textContent = this.#pot;
    document.getElementById("your_bet").textContent = this.#your_bet;
    document.getElementById("your_chips").textContent = this.#your_chips;
    document.getElementById("cpu_bet").textContent = this.#cpu_bet;
    document.getElementById("cpu_chips").textContent = this.#cpu_chips;
    this.#updateView();
    this.#not_game_over = false;
    this.#isRunning = false;
    this.#updateView();
    } else {
    // 引き分け
    message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
    alert(message);
    this.#your_chips += Math.trunc(this.#pot / 2);
    this.#cpu_chips += Math.trunc(this.#pot / 2);
    this.#pot = 0;
    this.#cpu_bet = 0;
    this.#your_bet = 0;
    this.#cpu_current_bet = 0;
    this.#your_current_bet = 0;
    document.getElementById("pot").textContent = this.#pot;
    document.getElementById("your_bet").textContent = this.#your_bet;
    document.getElementById("your_chips").textContent = this.#your_chips;
    document.getElementById("cpu_bet").textContent = this.#cpu_bet;
    document.getElementById("cpu_chips").textContent = this.#cpu_chips;
    this.#updateView();
    this.#rounds += 1;
    // 1秒待つ
    await Util.sleep();
    this.#initialize();
    }
    }}
      else if(this.#river){
        alert("ショーハンドを行います。");
        if(this.#your_chips > 0 && this.#cpu_chips > 0){
          await Util.sleep();
          this.#not_fold = true;
          this.#updateView();
          await Util.sleep();
          let youResult = Strength.hand_best(this.#player_hand);
          let comResult = Strength.hand_best(this.#cpu_hand);
          youResult = Pair.judge(youResult);
          comResult = Pair.judge(comResult);
          console.log(youResult);
          console.log(comResult);
          let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
          // 勝者の判定
         if (youResult.strength < comResult.strength) {
         // 相手（Com）の勝ち
         message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
         alert(message);
         this.#cpu_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
        } else if (youResult.strength > comResult.strength) {
         // プレイヤーの勝ち
         message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
         alert(message);
         this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
       } else {
        // 役が同じなのでランクで比較する
       if (youResult.rank < comResult.rank) {
        // 相手（Com）の勝ち
        message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#cpu_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
       this.#not_game_over = false;
       this.#updateView();
      } else if (youResult.rank > comResult.rank) {
        // プレイヤーの勝ち
        message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      } else {
        // 引き分け
        message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += Math.trunc(this.#pot / 2);
        this.#cpu_chips += Math.trunc(this.#pot / 2);
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      }
    }
  }}
      
      else if(this.#flop && this.#turn){
        this.#river = true;
        this.#your_current_bet = 0;
        this.#cpu_current_bet = 0;
        this.#community_cards = this.#community_cards.concat(this.#com5.cards);
        this.#updateView();
      alert("【リバー】に進みます。");
      if(desired_bet < raised_chip){
        this.#not_game_over = false;
        await Util.sleep();
        alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショーハンドは行われませんでした。")
        this.#your_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        this.#your_bet = 0;
        this.#cpu_bet = 0;
        this.#not_fold =false;
        this.#flop = false; 
        this.#turn = false; 
        this.#river = false;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
        await Util.sleep();
        this.#initialize(); 
      }else if (desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
        this.#pot += this.#cpu_chips;
        this.#cpu_current_bet += this.#cpu_chips;
        this.#cpu_bet += this.#cpu_chips;
        this.#cpu_chips = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuはオールインしました。\n あなたのターンです。");
      }else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
        this.#cpu_current_bet += desired_bet;
        this.#pot += this.#cpu_current_bet;
        this.#cpu_chips -=  this.#cpu_current_bet;
        this.#cpu_bet += this.#cpu_current_bet;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
      }else{
        await Util.sleep();
        alert("cpuはチェックしました。\n あなたのターンです。");
        this.#check = true;
      }
      

      }
      else if(this.#flop){
      this.#turn = true;
      this.#your_current_bet = 0;
      this.#cpu_current_bet = 0;
      this.#community_cards = this.#community_cards.concat(this.#com4.cards);
      this.#updateView();
      await Util.sleep();
      alert("【ターン】に進みます。");
      if(desired_bet < raised_chip){
        this.#not_game_over = false;
        await Util.sleep();
        alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショウハンドは行われませんでした。")
        this.#your_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        this.#your_bet = 0;
        this.#cpu_bet = 0;
        this.#not_fold =false;
        this.#flop = false; 
        this.#turn = false; 
        this.#river = false;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
        await Util.sleep();
        this.#initialize(); 
      }else if (desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
        this.#pot += this.#cpu_chips;
        this.#cpu_current_bet += this.#cpu_chips;
        this.#cpu_bet += this.#cpu_chips;
        this.#cpu_chips = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuはオールインしました。\n あなたのターンです。");
      }else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
        this.#cpu_current_bet += desired_bet;
        this.#pot += this.#cpu_current_bet;
        this.#cpu_chips -=  this.#cpu_current_bet;
        this.#cpu_bet += this.#cpu_current_bet;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
      }else{
        await Util.sleep();
        alert("cpuはチェックしました。\n あなたのターンです。");
        this.#check = true;
      }
      

    }else{
      this.#flop = true;
      this.#updateView();
      await Util.sleep();
      alert("【フロップ】に進みます。")
      if(desired_bet < raised_chip){
        this.#not_game_over = false;
        await Util.sleep();
        alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショウハンドは行われませんでした。")
        this.#your_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        this.#your_bet = 0;
        this.#cpu_bet = 0;
        this.#not_fold =false;
        this.#flop = false; 
        this.#turn = false; 
        this.#river = false;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
        await Util.sleep();
        this.#initialize(); 
      }else if (desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
        this.#pot += this.#cpu_chips;
        this.#cpu_current_bet += this.#cpu_chips;
        this.#cpu_bet += this.#cpu_chips;
        this.#cpu_chips = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuはオールインしました。\n あなたのターンです。");
      }else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
        this.#cpu_current_bet += desired_bet;
        this.#pot += this.#cpu_current_bet;
        this.#cpu_chips -=  this.#cpu_current_bet;
        this.#cpu_bet += this.#cpu_current_bet;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
      }else{
        await Util.sleep();
        alert("cpuはチェックしました。\n あなたのターンです。");
        this.#check = true;
      }
      

    }
  }

  //チェックボタンのクリックイベントハンドラ
  async #oncheck(event){
    alert("あなたはチェックしました。");
    let raised_chip = this.#your_bet - this.#cpu_bet;
    let community_cards_length = this.#community_cards.length;
    let desired_bet = Cpu.simulate_holdem(this.#cpu.cards, this.#community_cards, community_cards_length, this.#your_bet, raised_chip, this.#pot);
    //cpuの行動に移る
    if(this.#check){//cpuが既にチェックしている状態
      if(this.#river){
        alert("ショーハンドを行います。");
          await Util.sleep();
          this.#not_fold = true;
          this.#updateView();
          await Util.sleep();
          let youResult = Strength.hand_best(this.#player_hand);
          let comResult = Strength.hand_best(this.#cpu_hand);
          youResult = Pair.judge(youResult);
          comResult = Pair.judge(comResult);
          console.log(youResult);
          console.log(comResult);
          let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
          // 勝者の判定
         if (youResult.strength < comResult.strength) {
         // 相手（Com）の勝ち
         message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
         alert(message);
         this.#cpu_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
        } else if (youResult.strength > comResult.strength) {
         // プレイヤーの勝ち
         message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
         alert(message);
         this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
       } else {
        // 役が同じなのでランクで比較する
       if (youResult.rank < comResult.rank) {
        // 相手（Com）の勝ち
        message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#cpu_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
       this.#not_game_over = false;
       this.#updateView();
      } else if (youResult.rank > comResult.rank) {
        // プレイヤーの勝ち
        message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += this.#pot;
         this.#pot = 0;
         this.#cpu_bet = 0;
         this.#your_bet = 0;
         document.getElementById("pot").textContent = this.#pot;
         document.getElementById("your_bet").textContent = this.#your_bet;
         document.getElementById("your_chips").textContent = this.#your_chips;
         document.getElementById("cpu_bet").textContent = this.#cpu_bet;
         document.getElementById("cpu_chips").textContent = this.#cpu_chips;
         this.#updateView();
        this.#not_game_over = false;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      } else {
        // 引き分け
        message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
        alert(message);
        this.#your_chips += Math.trunc(this.#pot / 2);
        this.#cpu_chips += Math.trunc(this.#pot / 2);
        this.#pot = 0;
        this.#cpu_bet = 0;
        this.#your_bet = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("your_chips").textContent = this.#your_chips;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
       await Util.sleep();
       this.#initialize();
      }
  }
}else if(this.#flop && this.#turn){
  this.#river = true;
  this.#your_current_bet = 0;
  this.#cpu_current_bet = 0;
  this.#community_cards = this.#community_cards.concat(this.#com5.cards);
  this.#updateView();
alert("【リバー】に進みます。");
if(desired_bet < raised_chip){
  this.#not_game_over = false;
  await Util.sleep();
  alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショーハンドは行われませんでした。")
  this.#your_chips += this.#pot;
  this.#pot = 0;
  this.#cpu_current_bet = 0;
  this.#your_current_bet = 0;
  this.#your_bet = 0;
  this.#cpu_bet = 0;
  this.#not_fold =false;
  this.#flop = false; 
  this.#turn = false; 
  this.#river = false;
  document.getElementById("pot").textContent = this.#pot;
  document.getElementById("your_bet").textContent = this.#your_bet;
  document.getElementById("cpu_bet").textContent = this.#cpu_bet;
  document.getElementById("cpu_chips").textContent = this.#cpu_chips;
  this.#updateView();
  this.#rounds += 1;
  // 1秒待つ
  await Util.sleep();
  this.#initialize(); 
}else if (desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
  this.#pot += this.#cpu_chips;
  this.#cpu_current_bet += this.#cpu_chips;
  this.#cpu_bet += this.#cpu_chips;
  this.#cpu_chips = 0;
  document.getElementById("pot").textContent = this.#pot;
  document.getElementById("cpu_bet").textContent = this.#cpu_bet;
  document.getElementById("cpu_chips").textContent = this.#cpu_chips;
  this.#updateView();
  await Util.sleep();
  alert("cpuはオールインしました。\n あなたのターンです。");
}else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
  this.#cpu_current_bet += desired_bet;
  this.#pot += this.#cpu_current_bet;
  this.#cpu_chips -=  this.#cpu_current_bet;
  this.#cpu_bet += this.#cpu_current_bet;
  document.getElementById("pot").textContent = this.#pot;
  document.getElementById("cpu_bet").textContent = this.#cpu_bet;
  document.getElementById("cpu_chips").textContent = this.#cpu_chips;
  this.#updateView();
  await Util.sleep();
  alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
}else{
  await Util.sleep();
  alert("cpuはチェックしました。\n あなたのターンです。");
  this.#check = true;
}


}
else if(this.#flop){
this.#turn = true;
this.#your_current_bet = 0;
this.#cpu_current_bet = 0;
this.#community_cards = this.#community_cards.concat(this.#com4.cards);
this.#updateView();
await Util.sleep();
alert("【ターン】に進みます。");
if(desired_bet < raised_chip){
  this.#not_game_over = false;
  await Util.sleep();
  alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショーハンドは行われませんでした。")
  this.#your_chips += this.#pot;
  this.#pot = 0;
  this.#cpu_current_bet = 0;
  this.#your_current_bet = 0;
  this.#your_bet = 0;
  this.#cpu_bet = 0;
  this.#not_fold =false;
  this.#flop = false; 
  this.#turn = false; 
  this.#river = false;
  document.getElementById("pot").textContent = this.#pot;
  document.getElementById("your_bet").textContent = this.#your_bet;
  document.getElementById("cpu_bet").textContent = this.#cpu_bet;
  document.getElementById("cpu_chips").textContent = this.#cpu_chips;
  this.#updateView();
  this.#rounds += 1;
  // 1秒待つ
  await Util.sleep();
  this.#initialize(); 
}else if (desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
  this.#pot += this.#cpu_chips;
  this.#cpu_current_bet += this.#cpu_chips;
  this.#cpu_bet += this.#cpu_chips;
  this.#cpu_chips = 0;
  document.getElementById("pot").textContent = this.#pot;
  document.getElementById("cpu_bet").textContent = this.#cpu_bet;
  document.getElementById("cpu_chips").textContent = this.#cpu_chips;
  this.#updateView();
  await Util.sleep();
  alert("cpuはオールインしました。\n あなたのターンです。");
}else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
  this.#cpu_current_bet += desired_bet;
  this.#pot += this.#cpu_current_bet;
  this.#cpu_chips -=  this.#cpu_current_bet;
  this.#cpu_bet += this.#cpu_current_bet;
  document.getElementById("pot").textContent = this.#pot;
  document.getElementById("cpu_bet").textContent = this.#cpu_bet;
  document.getElementById("cpu_chips").textContent = this.#cpu_chips;
  this.#updateView();
  await Util.sleep();
  alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
}else{
  await Util.sleep();
  alert("cpuはチェックしました。\n あなたのターンです。");
  this.#check = true;
}

}
    
    }else{//playerが先にチェックした場合
      this.#check = false;
      if(desired_bet < raised_chip){
        this.#not_game_over = false;
        await Util.sleep();
        alert("cpuはフォールドしました。あなたの勝利！\n あなたは"+this.#pot+"チップを手に入れました。\nショーハンドは行われませんでした。")
        this.#your_chips += this.#pot;
        this.#pot = 0;
        this.#cpu_current_bet = 0;
        this.#your_current_bet = 0;
        this.#your_bet = 0;
        this.#cpu_bet = 0;
        this.#not_fold =false;
        this.#flop = false; 
        this.#turn = false; 
        this.#river = false;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("your_bet").textContent = this.#your_bet;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        this.#rounds += 1;
        // 1秒待つ
        await Util.sleep();
        this.#initialize(); 
      }else if (desired_bet >= this.#your_bet && desired_bet >= this.#cpu_chips){
        this.#pot += this.#cpu_chips;
        this.#cpu_current_bet += this.#cpu_chips;
        this.#cpu_bet += this.#cpu_chips;
        this.#cpu_chips = 0;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuはオールインしました。\n あなたのターンです。");
      }else if (desired_bet > this.#your_bet && desired_bet < this.#cpu_chips){
        this.#cpu_current_bet += desired_bet;
        this.#pot += this.#cpu_current_bet;
        this.#cpu_chips -=  this.#cpu_current_bet;
        this.#cpu_bet += this.#cpu_current_bet;
        document.getElementById("pot").textContent = this.#pot;
        document.getElementById("cpu_bet").textContent = this.#cpu_bet;
        document.getElementById("cpu_chips").textContent = this.#cpu_chips;
        this.#updateView();
        await Util.sleep();
        alert("cpuは"+desired_bet+"チップレイズしました。\n あなたのターンです。");
      }else{
        await Util.sleep();

        alert("cpuはチェックしました。");
        this.#check = true;
        if(this.#river){
          alert("ショーハンドを行います。");
            await Util.sleep();
            this.#not_fold = true;
            this.#updateView();
            await Util.sleep();
            let youResult = Strength.hand_best(this.#player_hand);
            let comResult = Strength.hand_best(this.#cpu_hand);
            youResult = Pair.judge(youResult);
            comResult = Pair.judge(comResult);
            console.log(youResult);
            console.log(comResult);
            let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n(YOU)${youResult.rank}vs(COM)${comResult.rank}\n`;
            // 勝者の判定
           if (youResult.strength < comResult.strength) {
           // 相手（Com）の勝ち
           message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
           alert(message);
           this.#cpu_chips += this.#pot;
           this.#pot = 0;
           this.#cpu_bet = 0;
           this.#your_bet = 0;
           document.getElementById("pot").textContent = this.#pot;
           document.getElementById("your_bet").textContent = this.#your_bet;
           document.getElementById("your_chips").textContent = this.#your_chips;
           document.getElementById("cpu_bet").textContent = this.#cpu_bet;
           document.getElementById("cpu_chips").textContent = this.#cpu_chips;
           this.#updateView();
          this.#not_game_over = false;
          this.#updateView();
          this.#rounds += 1;
          // 1秒待つ
         await Util.sleep();
         this.#initialize();
          } else if (youResult.strength > comResult.strength) {
           // プレイヤーの勝ち
           message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
           alert(message);
           this.#your_chips += this.#pot;
           this.#pot = 0;
           this.#cpu_bet = 0;
           this.#your_bet = 0;
           document.getElementById("pot").textContent = this.#pot;
           document.getElementById("your_bet").textContent = this.#your_bet;
           document.getElementById("your_chips").textContent = this.#your_chips;
           document.getElementById("cpu_bet").textContent = this.#cpu_bet;
           document.getElementById("cpu_chips").textContent = this.#cpu_chips;
           this.#updateView();
          this.#not_game_over = false;
          this.#updateView();
          this.#rounds += 1;
          // 1秒待つ
         await Util.sleep();
         this.#initialize();
         } else {
          // 役が同じなのでランクで比較する
         if (youResult.rank < comResult.rank) {
          // 相手（Com）の勝ち
          message += "cpuは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
          alert(message);
          this.#cpu_chips += this.#pot;
          this.#pot = 0;
          this.#cpu_bet = 0;
          this.#your_bet = 0;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("your_bet").textContent = this.#your_bet;
          document.getElementById("your_chips").textContent = this.#your_chips;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
         this.#not_game_over = false;
         this.#updateView();
        } else if (youResult.rank > comResult.rank) {
          // プレイヤーの勝ち
          message += "あなたは"+this.#pot+"チップ手に入れました。\n 次のラウンドに進みます。";
          alert(message);
          this.#your_chips += this.#pot;
           this.#pot = 0;
           this.#cpu_bet = 0;
           this.#your_bet = 0;
           document.getElementById("pot").textContent = this.#pot;
           document.getElementById("your_bet").textContent = this.#your_bet;
           document.getElementById("your_chips").textContent = this.#your_chips;
           document.getElementById("cpu_bet").textContent = this.#cpu_bet;
           document.getElementById("cpu_chips").textContent = this.#cpu_chips;
           this.#updateView();
          this.#not_game_over = false;
          this.#updateView();
          this.#rounds += 1;
          // 1秒待つ
         await Util.sleep();
         this.#initialize();
        } else {
          // 引き分け
          message += "引き分けです。\n あなたとcpuは"+Math.trunc(this.#pot / 2)+"チップ手に入れました。\n 次のラウンドに進みます。";
          alert(message);
          this.#your_chips += Math.trunc(this.#pot / 2);
          this.#cpu_chips += Math.trunc(this.#pot / 2);
          this.#pot = 0;
          this.#cpu_bet = 0;
          this.#your_bet = 0;
          this.#cpu_current_bet = 0;
          this.#your_current_bet = 0;
          document.getElementById("pot").textContent = this.#pot;
          document.getElementById("your_bet").textContent = this.#your_bet;
          document.getElementById("your_chips").textContent = this.#your_chips;
          document.getElementById("cpu_bet").textContent = this.#cpu_bet;
          document.getElementById("cpu_chips").textContent = this.#cpu_chips;
          this.#updateView();
          this.#rounds += 1;
          // 1秒待つ
         await Util.sleep();
         this.#initialize();
        }
    }
      }else if(this.#flop && this.#turn){
        this.#river = true;
        this.#your_current_bet = 0;
        this.#cpu_current_bet = 0;
        this.#community_cards = this.#community_cards.concat(this.#com5.cards);
        this.#updateView();
      alert("【リバー】に進みます。\n あなたのターンです。");
    }else if(this.#flop){
      this.#turn = true;
      this.#your_current_bet = 0;
      this.#cpu_current_bet = 0;
      this.#community_cards = this.#community_cards.concat(this.#com4.cards);
      this.#updateView();
      await Util.sleep();
      alert("【ターン】に進みます。\n あなたのターンです。");
    }

    }
  }


  }

  //フォールドボタンのクリックイベントハンドラ
  async #onfold(event){
    this.#not_game_over = false;
    alert("あなたはフォールドしました。cpuの勝利！\ncpuは"+this.#pot+"チップを手に入れました。")
    this.#cpu_chips += this.#pot;
    this.#pot = 0;
    this.#cpu_current_bet = 0;
    this.#your_current_bet = 0;
    this.#your_bet = 0;
    this.#cpu_bet = 0;
    document.getElementById("pot").textContent = this.#pot;
    document.getElementById("your_bet").textContent = this.#your_bet;
    document.getElementById("cpu_bet").textContent = this.#cpu_bet;
    document.getElementById("cpu_chips").textContent = this.#cpu_chips;
    //this.#isRunning = false;
    this.#updateView();
    this.#rounds += 1;
    // 1秒待つ
    await Util.sleep();
    this.#initialize(); 
    
    

  }

  #onReplay(event) {
    // ゲームの状態を初期化する
    this.#your_chips = 1000;
    this.#cpu_chips = 1000;
    this.#your_bet = 0;
    this.#cpu_bet = 0;
    this.#pot = 0;
    this.#cpu_current_bet = 0;
    this.#your_current_bet = 0;
    this.#rounds = 1;
    this.#not_fold =false;
    this.#flop = false; 
    this.#turn = false; 
    this.#river = false;

    this.#initialize(); 
 

  }

  #setupEvents() {
    Util.addEventListener("#allin", "click", this.#onAllin.bind(this));
    Util.addEventListener("#raise_bet", "click", this.#onraise_bet.bind(this));
    Util.addEventListener("#call", "click", this.#oncall.bind(this));
    Util.addEventListener("#check", "click", this.#oncheck.bind(this));
    Util.addEventListener("#fold", "click", this.#onfold.bind(this));
    Util.addEventListener("#replay", "click", this.#onReplay.bind(this));
  }
  
  

  
  
}

