import Player from "./player.js";
import Com from "./com.js";
import Card from "./card.js";
import Pair from "./pair.js";
import Util from "./util.js";
/**
 * Game クラス
 */
export default class Game {
  /**
   * プロパティ
   */
  #you; // プレイヤー（You）
  #com; // 相手（Com）
  #cards; // 山札のカード
  #isRunning; // ゲーム実行状態（true:実行中,false:終了）

  /**
   * コンストラクタ
   */
  constructor() {
    // プロパティを初期化する
    this.#you = null;
    this.#com = null;
    this.#cards = [];
    this.#isRunning = false;
    // イベントハンドラを登録する
    this.#setupEvents();
  }

  /**
   * ゲームを実行する
   */
  run() {
    // ゲームの状態を初期化する
    this.#initialize();
  }

  /**
   * ゲームの状態を初期化する
   */
  #initialize() {
    // プレイヤーを生成する
    this.#you = new Player(".card.you");
    this.#com = new Com(".card.com");

    // 山札のカードを生成する
    this.#cards = [];
    [...Array(52)].map((_, index) => {
      // インデックス番号を持つカードを生成して山札に追加する
      this.#cards.push(new Card(index + 1));
    });

    // 山札のカードをシャッフルする
    this.#shuffleCard();

    // 山札のカードを5枚ずつプレイヤーに配る
    this.#dealCard(this.#you, 5);
    this.#dealCard(this.#com, 5);

    // ゲーム実行状態を更新
    this.#isRunning = true;

    // 画面の描画を更新する
    this.#updateView();
  }

  /**
   * 山札のカードをシャッフルする
   */
  #shuffleCard() {
    // 100回繰り返す
    [...Array(100)].forEach(() => {
      // 山札から2枚のカードをランダムに選んで交換する
      const j = Math.floor(Math.random() * this.#cards.length);
      const k = Math.floor(Math.random() * this.#cards.length);
      [this.#cards[j], this.#cards[k]] = [this.#cards[k], this.#cards[j]];
    });
  }

  /**
   * 山札のカードをプレイヤーに配る
   */
  #dealCard(player, n) {
    // n回繰り返す
    [...Array(n)].map(() => {
      // 山札からカードを1枚取り出してプレイヤーに配る
      player.addCard(this.#cards.pop());
    });
  }

  /**
   * 画面の描画を更新する
   */
  #updateView() {
    // プレイヤーのカードを描画する
    this.#you.displayCard(true);
    // 相手のカードを描画する
    this.#com.displayCard(!this.#isRunning);
    // ボタンを描画する
    if (this.#isRunning) {
      document.querySelector("#replay").setAttribute("disabled", true);
      document.querySelector("#draw").removeAttribute("disabled");
    } else {
      document.querySelector("#replay").removeAttribute("disabled");
      document.querySelector("#draw").setAttribute("disabled", true);
    }
  }

  /**
   * 勝敗を判定する
   */
  #judgement() {
    // 役の成否判定を行う
    const youResult = Pair.judge(this.#you.cards);
    const comResult = Pair.judge(this.#com.cards);
    // 勝敗のメッセージ
    let message = `(YOU)${youResult.hand}vs(COM)${comResult.hand}\n`;
    // 勝者の判定
    if (youResult.strength < comResult.strength) {
      // 相手（Com）の勝ち
      message += `あなたの負けです`;
    } else if (youResult.strength > comResult.strength) {
      // プレイヤーの勝ち
      message += `あなたの勝ちです`;
    } else {
      // 役が同じなのでランクで比較する
      if (youResult.rank < comResult.rank) {
        // 相手（Com）の勝ち
        message += `あなたの負けです`;
      } else if (youResult.rank > comResult.rank) {
        // プレイヤーの勝ち
        message += `あなたの勝ちです`;
      } else {
        // 引き分け
        message += `引き分けです`;
      }
    }
    // メッセージを表示する
    alert(message);
  }

  /**
   * 手札のクリックイベントハンドラ
   */
  #onClickCard(event) {
    // ゲーム実行中のみクリックを受け付ける
    if (this.#isRunning) {
      // プレイヤーにカードを選択させる
      this.#you.selectCard(event.target);
    }
  }

  /**
   * Drawボタンのクリックイベントハンドラ
   */
  async #onDraw(event) {
    // プレイヤーがカードを交換する
    this.#you.selectedNodes.forEach(() => {
      this.#cards.unshift(this.#you.drawCard(this.#cards.pop()));
    });

    // 画面の描画を更新する
    this.#updateView();

    // ゲーム実行状態を更新
    this.#isRunning = false;

    // 1秒待つ
    await Util.sleep();

    // 相手が交換するカードを選ぶ
    this.#com.selectCard();

    // 1秒待つ
    await Util.sleep();

    // 相手がカードを交換する
    this.#com.selectedNodes.forEach(() => {
      this.#cards.unshift(this.#com.drawCard(this.#cards.pop()));
    });

    // 画面の描画を更新する
    this.#updateView();

    // 1秒待つ
    await Util.sleep();

    // 勝敗を判定する
    this.#judgement();
  }

  /**
   * Replayボタンのクリックイベントハンドラ
   */
  #onReplay(event) {
    // ゲームの状態を初期化する
    this.#initialize();
  }

  /**
   * イベントハンドラを登録する
   */
  #setupEvents() {
    // 手札のクリックイベント
    Util.addEventListener(".card.you", "click", this.#onClickCard.bind(this));
    // Drawボタンのクリックイベント
    Util.addEventListener("#draw", "click", this.#onDraw.bind(this));
    // Replayボタンのクリックイベント
    Util.addEventListener("#replay", "click", this.#onReplay.bind(this));
  }
}
