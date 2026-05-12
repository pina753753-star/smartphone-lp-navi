const form = document.querySelector('#lpForm');
const outputCards = document.querySelector('#outputCards');
const copyAllButton = document.querySelector('#copyAllButton');
const resetButton = document.querySelector('#resetButton');
const copyStatus = document.querySelector('#copyStatus');
const storageKey = 'smartphone-lp-navi-form';
let latestOutputs = [];

function safeGetStorage() {
  try {
    const testKey = `${storageKey}-test`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

const storage = safeGetStorage();

const fields = [
  'clientName',
  'serviceName',
  'lpGoal',
  'target',
  'pain',
  'future',
  'strength',
  'materials',
  'designMood',
  'lpLength',
  'imageUse',
  'ctaText',
  'ctaUrl',
  'mustDo',
  'dontDo'
];

const fallbackValues = {
  clientName: 'ぴな',
  serviceName: 'スマホLP',
  lpGoal: '相談予約',
  target: 'スマホだけでLPを作りたい人',
  pain: 'なにから始めていいかわからない',
  future: 'スマホだけでLPを作れるようになり、マネタイズにつなげる',
  strength: 'スマホだけで作れる',
  materials: '実績、口コミ、写真をあとから差し替えられる枠',
  designMood: '女性向け・上品・かわいい',
  lpLength: '通常LP',
  imageUse: '画像生成プロンプトがほしい',
  ctaText: '無料相談する',
  ctaUrl: '#contact',
  mustDo: 'スマホで見やすく、CTAへ自然につなげる',
  dontDo: '横スクロール、文字化け、簡易フォームのような見た目'
};

const sectionPatterns = {
  '短尺LP': ['ファーストビュー', '悩み共感', '解決策', '特徴', 'CTA'],
  '通常LP': ['ファーストビュー', '悩み共感', '解決策', '商品・サービス紹介', '特徴', 'ベネフィット', '選ばれる理由', '実績・口コミ', '利用の流れ', 'よくある質問', 'CTA', 'フッター'],
  '長尺LP': [
    'ファーストビュー',
    '悩み共感',
    '解決策',
    '商品・サービス紹介',
    '特徴',
    'ベネフィット',
    '選ばれる理由',
    '実績・口コミ',
    '利用の流れ',
    'よくある質問',
    'CTA',
    'フッター'
  ]
};

const sampleCopy = {
  'ファーストビュー': data => `見出し：${data.target}へ。${data.serviceName}で、LP制作をもっとやさしく。\nサブコピー：${data.pain}という不安を整理して、${data.future}までの流れをスマホで進められる形にします。\nCTA：${data.ctaText}\nメリットバッジ：スマホ完結 / 初心者OK / Codexに貼れる`,
  '悩み共感': data => `「${data.pain}」と思って、手が止まっていませんか？\nLPは、デザインより先に“誰に何を届けるか”を整理するだけで、ぐっと作りやすくなります。\n${data.serviceName}は、その最初の一歩をスマホで迷わず進めるための入口です。`,
  '解決策': data => `${data.serviceName}では、${data.strength}を軸に、ターゲット・悩み・未来・CTAを順番に整理します。\n構成、文章、デザイン方向、Codex指示までつなげることで、ただのメモではなく“LP制作へ進める設計図”に変えます。`,
  '商品・サービス紹介': data => `${data.serviceName}は、${data.target}に向けた${data.lpGoal}用のLP制作サポートです。\nスマホで入力した情報をもとに、LP構成、文章案、デザイン指示、Codex用プロンプトまでまとめます。`,
  '特徴': data => `特徴1：${data.strength}\n特徴2：LP構成・文章・CTAをまとめて整理\n特徴3：Codexに貼れる指示書まで作れる\n特徴4：画像なしでも見栄えするLP設計を指示できる`,
  'ベネフィット': data => `LPを自分で作れるようになると、外注費に悩まず、小さく試して直すことができます。\n${data.future}という未来に向けて、今日のスマホ操作から一歩進めます。`,
  '選ばれる理由': data => `理由1：${data.target}の悩みに寄り添う言葉設計\n理由2：${data.strength}がひと目で伝わる構成\n理由3：${data.mustDo}を前提にしたスマホLP設計\n理由4：あとから画像や実績を足して完成度を上げやすい`,
  '実績・口コミ': data => `${data.materials}を入れられる実績・口コミエリアを用意します。\n実績がまだ少ない場合も、「制作例」「お客様の声」「変化の声」など、あとから差し替えられる見栄えのよい枠にします。`,
  '利用の流れ': () => 'STEP1：無料相談する\nSTEP2：作りたいLPの内容を整理する\nSTEP3：構成・文章・デザイン方向を決める\nSTEP4：CodexでLP制作へ進む',
  'よくある質問': () => 'Q. スマホだけでも大丈夫ですか？\nA. はい。スマホで見やすく、操作しやすいLPを前提に作ります。\nQ. パソコンが苦手でも大丈夫ですか？\nA. はい。難しい操作を減らし、順番に進められる構成にします。\nQ. 画像がまだなくても作れますか？\nA. はい。画像なしでも成立するデザインにし、あとから写真や実績を差し替えられる枠を用意します。',
  'CTA': data => `最後の一押し：${data.future}を始めたい方は、まずは${data.ctaText}から進んでください。\nボタン文言：${data.ctaText}\nリンク先：${data.ctaUrl}\n補足：CTAはファーストビュー・中盤・最後の3か所に配置します。`,
  'フッター': data => `${data.clientName} / ${data.serviceName}\n必要に応じて特商法、プライバシーポリシー、SNSリンクを掲載します。`
};

function valueOrFallback(value, fallback = '未入力') {
  const trimmed = String(value || '').trim();
  return trimmed || fallback;
}

function getFormData() {
  return fields.reduce((data, field) => {
    const element = form.elements[field];
    data[field] = valueOrFallback(element.value, fallbackValues[field]);
    return data;
  }, {});
}

function saveForm() {
  const rawData = fields.reduce((data, field) => {
    data[field] = form.elements[field].value;
    return data;
  }, {});
  if (storage) {
    storage.setItem(storageKey, JSON.stringify(rawData));
  }
}

function restoreForm() {
  if (!storage) return;
  const saved = storage.getItem(storageKey);
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    fields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        form.elements[field].value = data[field];
      }
    });
  } catch (error) {
    storage.removeItem(storageKey);
  }
}

function buildStructure(data, sections) {
  const intro = `対象：${data.target}\n目的：${data.lpGoal}\n長さ：${data.lpLength}\nCTA：${data.ctaText}（${data.ctaUrl}）\n制作方針：簡易フォームではなく、販売LPとして成立する高品質デザインにする`;
  const body = sections.map((section, index) => `${index + 1}. ${section}\n- 役割：${sectionRole(section)}\n- 入れる内容：${sectionContent(section, data)}\n- 見せ方：${sectionLayout(section)}`).join('\n\n');
  return `${intro}\n\n${body}`;
}

function sectionRole(section) {
  const roles = {
    'ファーストビュー': '最初の3秒で誰向け・何が得られるかを強く伝え、CTAへ誘導する',
    '悩み共感': '読者の「自分のことだ」と感じる気持ちを高め、離脱を防ぐ',
    '解決策': '悩みが解決できる理由をわかりやすく示す',
    '商品・サービス紹介': 'サービス内容と利用価値を魅力的に紹介する',
    '特徴': '選びやすい判断材料を整理する',
    'ベネフィット': '購入・登録後の明るい未来を描く',
    '選ばれる理由': '他ではなくこのサービスを選ぶ理由を伝える',
    '実績・口コミ': '信頼感と安心感を補強する',
    '利用の流れ': '申し込み後の不安を減らす',
    'よくある質問': '行動前の疑問を解消する',
    'CTA': '次の行動を迷わず押せるようにする',
    'フッター': '運営情報と補足リンクをまとめる'
  };
  return roles[section] || '必要な情報をわかりやすく伝える';
}

function sectionContent(section, data) {
  const content = {
    'ファーストビュー': `${data.serviceName}、${data.target}、${data.future}、大きなCTA、3つのメリットバッジ`,
    '悩み共感': data.pain,
    '解決策': data.strength,
    '商品・サービス紹介': `${data.serviceName}の概要、${data.materials}`,
    '特徴': data.strength,
    'ベネフィット': data.future,
    '選ばれる理由': `${data.strength}、${data.mustDo}`,
    '実績・口コミ': data.materials,
    '利用の流れ': '申し込みから利用開始までの3〜4ステップ',
    'よくある質問': 'スマホ対応、申し込み後、支払い、サポート、画像なしの場合など',
    'CTA': `${data.ctaText} / ${data.ctaUrl}`,
    'フッター': `${data.clientName}の情報、必要リンク`
  };
  return content[section] || '未入力';
}

function sectionLayout(section) {
  const layouts = {
    'ファーストビュー': '大きな見出し、強いCTA、スマホモック風のビジュアル枠、3つのメリットバッジを配置',
    '悩み共感': 'チェックリスト、吹き出し、短い共感文で感情に寄せる',
    '解決策': 'Before/After、3ステップ図、淡い背景ブロックで解決までの流れを見せる',
    '商品・サービス紹介': 'サービス内容カード、スマホ画面風のプレビュー枠、補足説明を組み合わせる',
    '特徴': '3〜4つのアイコン付きカードで強みを整理する',
    'ベネフィット': '未来の変化を3つのカードで見せ、感情が動く見出しにする',
    '選ばれる理由': '比較カード、理由カード、チェックリストで納得感を出す',
    '実績・口コミ': '写真差し替え用の枠、星評価、口コミカード、数字カードを配置する',
    '利用の流れ': '縦のステップタイムラインで見せる',
    'よくある質問': '読みやすいFAQカードまたは開閉なしのQ&Aカードで配置する',
    'CTA': '背景色を変えた大きなCTAブロック、ボタン、補足文を配置する',
    'フッター': '小さめの運営情報とリンクを整理する'
  };
  return layouts[section] || 'カードだけにせず、見出し・余白・装飾に変化をつける';
}

function buildSectionCopy(data, sections) {
  return sections.map(section => `【${section}】\n${sampleCopy[section] ? sampleCopy[section](data) : sectionContent(section, data)}`).join('\n\n');
}

function buildLayoutDirections(sections) {
  return sections.map((section, index) => `${index + 1}. ${section}\n${sectionLayout(section)}`).join('\n\n');
}

function buildDesignDirections(data) {
  return `【全体トーン】\n${data.designMood}。水色、クリーム、白、淡いゴールド、淡いピンクを基調に、上品で売れるスマホLPにする。絵本風やシンデレラ風は“かわいい装飾”として使い、子どもっぽくしすぎない。\n\n【目標品質】\n簡易フォームや説明カードの縦並びではなく、美容LP・スクールLP・個人サービスLPのような完成度を目指す。画像がなくても、フォント、余白、CTA、カード、数字、比較、口コミ枠だけで商品LPに見える状態にする。\n\n【レイアウト】\nスマホファースト。PCでは中央に390px〜430px程度のスマホ幅で表示し、横スクロールを出さない。各セクションは同じカードの繰り返しにせず、見出し、スマホモック、数字カード、チェックリスト、吹き出し、比較カード、口コミカード、CTAを組み合わせて変化を出す。\n\n【フォント・文字デザイン】\n見出しは明朝系または上品なserifを使い、太さ・サイズ・行間に強弱をつける。本文は読みやすいゴシック系にする。重要キーワードは大きく、色を変え、余白を取って目立たせる。英字ラベルや小見出しを入れて高級感を出す。本文は14〜16px程度、見出しは28〜42px程度、行間は本文1.8前後、見出し1.25前後を目安にする。文字色は薄すぎない濃い青グレーまたはブラウンにする。外部フォントは使わず、CSSのfont-familyで日本語環境にあるフォントを指定する。\n\n【CTA】\n${data.ctaText}ボタンは淡いピンク〜淡いゴールドのグラデーションで目立たせる。CTAはファーストビュー、中盤、最後の3か所に配置し、最後のCTAは最も大きくする。リンク先は${data.ctaUrl}にする。\n\n【装飾】\n星、リボン、魔法のノート、ガラスの靴、お城、馬車、淡い光、小さなきらきらを使う。ただし装飾を入れすぎず、読みやすさを優先する。背景画像に文章を無理やり重ねる方式は避ける。\n\n【画像の考え方】\n画像がなくても完成度の高いLPにする。写真やイラストは後から差し替えられる枠として用意する。画像を使う場合も主要な見出し、本文、CTA、カードはHTML/CSSで作る。\n\n【守ること】\n${data.mustDo}\n\n【避けること】\n${data.dontDo}`;
}

function buildImagePrompts(data) {
  return `【LP全体画像用】\n${data.designMood}のスマホLP背景。水色、クリーム、白、淡いゴールド。上品で女性向け。絵本風、シンデレラ風、星、リボン、扉、本、ガラスの靴、馬車の雰囲気。文字なし。余白多め。HTMLの文字やボタンを後から配置する前提。\n\n【ヒーロー画像用】\n${data.serviceName}の世界観を伝えるヒーロービジュアル。${data.target}が${data.future}へ進む希望を感じる、やさしいスマホLP向けイラスト。文字なし、中央または片側に余白、スマホ縦長で使いやすい構図。\n\n【写真差し替え枠用】\n女性向けサービスLPに使える、明るく清潔感のある写真枠・スマホモック・カード枠。実績、口コミ、Before/Afterを後から入れられる。文字なし。\n\n【セクション装飾用】\n小さな星、淡いゴールドのリボン、青い本、白い扉、ガラスの靴、馬車モチーフのかわいい装飾素材。背景透過で使いやすい。文字なし。\n\n【CTA周り用】\n申し込みボタン周りに置く、きらめき、魔法の粉、淡いゴールドのフレーム、やさしい水色の光。文字なし。CTA文言は画像生成で入れず、LP側のHTML/CSSで後から入れる。\n\n注意：日本語文字は画像生成で崩れることがあるため、画像内に文字を入れない。見出し、説明文、ボタン文言は必ず後からHTML/CSSで配置する。`;
}

function buildCodexPrompt(data, sections, sectionCopy, designDirections, layoutDirections, imagePrompts) {
  const imageInstruction = data.imageUse === '画像なし'
    ? '今回は画像なしでも成立するように、CSSのグラデーション、枠線、影、疑似要素、写真差し替え用プレースホルダーだけで高品質に仕上げてください。'
    : '画像はヒーロービジュアルや小さな装飾として使い、1枚の完成画像に文章・CTAを無理に重ねる方式は避けてください。主要な文字、CTA、カードはHTML/CSSで作り、画像ファイル名はconstまたはCSS変数で後から変更しやすくしてください。画像が未配置でも崩れないプレースホルダーを用意してください。';

  return `以下の内容で、GitHub Pagesで公開できる高品質な販売LPを作ってください。外部ライブラリは使わず、index.html / style.css / script.js / README.md を作成してください。最後に変更内容をgit commitしてください。\n\n【最重要方針】\n簡易フォームのような見た目にしないでください。説明カードをただ縦に並べるだけにしないでください。美容LP・スクールLP・個人サービスLPのように、画像がなくてもフォント、余白、色、CTA、数字、比較、口コミ枠、スマホモック風の見せ方だけで完成LPに見えるクオリティにしてください。後から画像を入れたらそのまま商品LPとして使える状態を目指してください。\n\n【依頼者名】${data.clientName}\n【商品名・サービス名】${data.serviceName}\n【LPの目的】${data.lpGoal}\n【ターゲット】${data.target}\n【ターゲットの悩み】${data.pain}\n【叶えたい未来】${data.future}\n【一番伝えたい強み】${data.strength}\n【入れたい文章・素材】${data.materials}\n【CTA文言】${data.ctaText}\n【CTAリンク先URL】${data.ctaUrl}\n\n【LP構成】\n${sections.map((section, index) => `${index + 1}. ${section}`).join('\n')}\n\n【セクション別文章案】\n${sectionCopy}\n\n【セクション別レイアウト指示】\n${layoutDirections}\n\n【デザイン指示】\n${designDirections}\n\n【画像の扱い】\n${imageInstruction}\nCTAリンクは後から変更しやすいように、script.jsまたはHTML上部に設定値としてまとめてください。画像ファイル名も後から変更しやすくしてください。\n\n【フォント・タイポグラフィ必須条件】\n- 見出しは上品なserif系、本文は読みやすいsans-serif系で組む\n- 見出し、数字、CTA、ラベルのサイズ差をはっきりつける\n- 本文は14〜16px、見出しは28〜42pxを目安にする\n- 重要キーワードは大きく、色を変え、余白を取って目立たせる\n- 薄すぎる文字色は禁止。濃い青グレーまたはブラウンを使う\n- 日本語が読みやすい行間にする\n\n【販売LPとして必須の見せ場】\n- ファーストビューに強い見出し、大きなCTA、3つのメリットバッジを置く\n- 中盤にCTAをもう一度置く\n- 実績数字カードを3つ入れる\n- 口コミカードを3つ入れる。写真は後から差し替えられる枠にする\n- 比較またはBefore/Afterの見せ方を入れる\n- 最後のCTAは大きく、背景色を変えて目立たせる\n\n【画像生成プロンプト】\n${imagePrompts}\n\n【必ず守ること】\n- スマホ幅390pxで崩れない\n- 横スクロールを出さない\n- GitHub Pagesでそのまま動く\n- index.htmlをルート直下に作る\n- 文字、入力欄、ボタンはHTML/CSSで表示する\n- 画像に文字を焼き込まない\n- 固定背景画像の枠にフォームを合わせようとしない\n- 入力欄や生成結果が長くなっても崩れない\n- CTAは上・中・下の3か所に配置する\n- ${data.mustDo}\n\n【やってほしくないこと】\n- 1枚背景画像にフォームや長文を無理やり重ねること\n- 簡易フォームのような見た目にすること\n- 同じ白いカードを縦に並べるだけにすること\n- 画像がないと成立しないデザインにすること\n- 薄くて読みにくい文字色にすること\n- ${data.dontDo}`;
}

function buildPublishSteps() {
  return `1. GitHubで新しいリポジトリを作成する。リポジトリ名は英数字とハイフンがおすすめ。\n2. index.html、style.css、script.js、README.mdを作成またはアップロードする。\n3. 画像を使う場合は、画像ファイルもルート直下またはimagesフォルダへアップロードする。ファイル名の大文字小文字をそろえる。\n4. GitHubのリポジトリ画面で Settings → Pages を開く。\n5. Branchを main、フォルダを /root にして Save を押す。\n6. 数分待って、表示された公開URLを開く。\n7. 反映されない時は、Actionsのエラー、Pages設定、ファイル名、index.htmlの場所、ブラウザキャッシュを確認する。\n8. スマホでURLを開き、文字の読みやすさ、CTAリンク、画像表示を確認する。`;
}

function buildErrorPrompts(data) {
  return `【簡易フォームっぽい】\nCodexへ：LPが簡易フォームや説明カードの縦並びに見えます。美容LP・スクールLP・個人サービスLPのように、ファーストビュー、CTA、メリットバッジ、実績数字、口コミ、比較、FAQを組み合わせた販売LPデザインに修正してください。\n\n【フォントがダサい】\nCodexへ：フォントと文字設計が弱いです。見出しは上品なserif系、本文は読みやすいsans-serif系にし、見出し・数字・CTA・本文のサイズ差、行間、余白、文字色を調整して高品質なLPに見えるようにしてください。\n\n【画像が表示されない】\nCodexへ：画像が表示されません。HTML/CSS/JSの画像パス、ファイル名の大文字小文字、画像の置き場所を確認し、GitHub Pagesで表示される相対パスに修正してください。\n\n【404になる】\nCodexへ：GitHub Pagesの公開URLが404になります。index.htmlがルート直下にあるか、Pages設定がmain / rootになっているか、リポジトリ名とURLが一致しているか確認し、READMEにも確認手順を追記してください。\n\n【リンクが飛ばない】\nCodexへ：CTAリンクが動きません。CTAのhrefまたはクリック処理を確認し、リンク先を「${data.ctaUrl}」へ変更しやすい定数で管理してください。\n\n【スマホで崩れる】\nCodexへ：スマホ幅390pxでレイアウトが崩れます。横スクロールをなくし、画像・カード・ボタンを幅100%以内に収め、PCでは中央にスマホ幅で表示してください。\n\n【画像が古いまま】\nCodexへ：画像を差し替えたのに古い画像が表示されます。ファイル名を変更する、URLにバージョンパラメータを付ける、ブラウザキャッシュ確認手順をREADMEに書く対応をしてください。\n\n【GitHub Pagesが反映されない】\nCodexへ：GitHub Pagesの変更が反映されません。Actions、Pages設定、コミット状況、反映待ち時間、キャッシュの確認手順を初心者向けに追記してください。\n\n【READMEだけ表示される】\nCodexへ：GitHub PagesでREADMEだけが表示されます。index.htmlがルート直下に存在するか確認し、必要なら作成して、Pagesでindex.htmlが表示される状態に修正してください。\n\n【画像ファイル名が違う】\nCodexへ：画像ファイル名が実際と違って表示されません。HTML/CSS/JS内の画像ファイル名を実ファイル名に合わせ、後から変更しやすい変数やコメントを追加してください。`;
}

function buildOutputs(data) {
  const sections = sectionPatterns[data.lpLength] || sectionPatterns['通常LP'];
  const sectionCopy = buildSectionCopy(data, sections);
  const designDirections = buildDesignDirections(data);
  const layoutDirections = buildLayoutDirections(sections);
  const imagePrompts = buildImagePrompts(data);
  return [
    { title: 'LP構成案', text: buildStructure(data, sections) },
    { title: 'セクション別文章案', text: sectionCopy },
    { title: 'セクション別レイアウト指示', text: layoutDirections },
    { title: 'デザイン指示', text: designDirections },
    { title: '画像生成プロンプト', text: imagePrompts },
    { title: 'Codex用完成プロンプト', text: buildCodexPrompt(data, sections, sectionCopy, designDirections, layoutDirections, imagePrompts) },
    { title: 'GitHub公開手順', text: buildPublishSteps() },
    { title: 'エラー時の修正プロンプト', text: buildErrorPrompts(data) }
  ];
}

function renderOutputs(outputs) {
  latestOutputs = outputs;
  outputCards.innerHTML = outputs.map((output, index) => `
    <article class="output-card">
      <div class="output-card-header">
        <h3>${escapeHtml(output.title)}</h3>
        <button type="button" class="copy-button" data-index="${index}">コピー</button>
      </div>
      <pre class="output-text">${escapeHtml(output.text)}</pre>
    </article>
  `).join('');
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[character]);
}

async function copyText(text) {
  let copied = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (error) {
      copied = false;
    }
  }

  if (!copied) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    copied = document.execCommand('copy');
    textarea.remove();
  }

  showCopyStatus(copied ? 'コピーしました' : 'コピーできませんでした。長押しで選択してコピーしてください');
}

function showCopyStatus(message) {
  copyStatus.textContent = message;
  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 1800);
}

form.addEventListener('input', saveForm);
form.addEventListener('change', saveForm);

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = getFormData();
  const outputs = buildOutputs(data);
  renderOutputs(outputs);
  saveForm();
  document.querySelector('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

outputCards.addEventListener('click', event => {
  const button = event.target.closest('.copy-button');
  if (!button) return;
  const output = latestOutputs[Number(button.dataset.index)];
  if (output) copyText(`${output.title}\n\n${output.text}`);
});

copyAllButton.addEventListener('click', () => {
  if (!latestOutputs.length) {
    renderOutputs(buildOutputs(getFormData()));
  }
  const allText = latestOutputs.map(output => `# ${output.title}\n\n${output.text}`).join('\n\n---\n\n');
  copyText(allText);
});

resetButton.addEventListener('click', () => {
  form.reset();
  if (storage) {
    storage.removeItem(storageKey);
  }
  latestOutputs = [];
  outputCards.innerHTML = '';
  showCopyStatus('入力内容をリセットしました');
});

restoreForm();
