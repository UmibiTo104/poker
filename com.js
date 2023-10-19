import Player from "player.js";
import Pair from "pair.js";
/**
 * Com クラス
 */
export default class Com extends Player {
  /**
   * コンストラクタ
   */
  constructor(selector) {
    super(selector);
  }

  /**
   * 交換するカードを選択する
   */
  selectCard() {
    // 交換する前に成立している役の強さを調べる
    const strength = Pair.judge(this.cards).strength;
    // 役が成立していない場合
    if (strength === 0) {
      // 手札を全て選択する
      this.nodes.forEach((node) => super.selectCard(node));
    }
    // ワンペア/ツーペア/スリーカードが成立している場合
    else if (1 <= strength && strength <= 3) {
      // 手札のループ
      this.cards.forEach((card, index) => {
        // index番目と同じランクのカードの枚数を調べる
        const sameRankCards = this.cards.filter((e) => e.rank === card.rank);
        // index番目と同じランクが1枚しかない場合
        if (sameRankCards.length === 1) {
          // index番目のカードはペアを持たないので選択する
          super.selectCard(this.nodes[index]);
        }
      });
    }
  }
}
