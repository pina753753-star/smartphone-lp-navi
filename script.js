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

const sectionPatterns = {
  '短尺LP': ['ファーストビュー', '悩み共感', 'ベネフィット', 'CTA'],
  '通常LP': ['ファーストビュー', '悩み共感', '解決策', '商品・サービス紹介', '特徴', 'CTA'],
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
  'ファーストビュー': data => `見出し：${data.serviceName}で、${data.target}の毎日をやさしく変える\nサブコピー：${data.pain}という不安をほどき、${data.future}へ案内します。\nボタン：${data.ctaText}`,
  '悩み共感': data => `「${data.pain}」と感じていませんか？ はじめての一歩ほど、情報が多すぎて迷いやすいもの。${data.serviceName}は、その迷いをひとつずつ整理します。`,
  '解決策': data => `${data.serviceName}では、${data.strength}を軸に、今の悩みから理想の未来までをわかりやすくつなぎます。`,
  '商品・サービス紹介': data => `${data.serviceName}は、${data.target}に向けた${data.lpGoal}用のLPです。必要な情報を読みやすくまとめ、行動しやすい導線を作ります。`,
  '特徴': data => `特徴1：${data.strength}\n特徴2：スマホでも読みやすい短い文章と余白\n特徴3：CTAへ自然に進める構成`,
  'ベネフィット': data => `このLPを見る人は、${data.future}という未来を具体的にイメージできます。申し込み前の不安を減らし、次の行動へ進みやすくします。`,
  '選ばれる理由': data => `理由1：${data.target}の悩みに寄り添う言葉\n理由2：${data.strength}がひと目で伝わる設計\n理由3：${data.mustDo}を守った安心感`,
  '実績・口コミ': data => `実績・口コミは、${data.materials}の中から信頼につながるものを掲載します。未掲載の場合は「お客様の声」「制作実績」などの見出しだけ用意し、あとから差し替えます。`,
  '利用の流れ': () => 'STEP1：内容を確認する\nSTEP2：CTAから申し込む\nSTEP3：案内に沿ってスタートする',
  'よくある質問': () => 'Q. スマホだけでも大丈夫ですか？\nA. はい、スマホで読みやすく操作しやすい導線にします。\nQ. 申し込み後は何が届きますか？\nA. CTAリンク先の案内に合わせて記載します。',
  'CTA': data => `最後の一押し：${data.future}を今日から始めたい方は、下のボタンから進んでください。\nボタン文言：${data.ctaText}\nリンク先：${data.ctaUrl}`,
  'フッター': data => `${data.clientName} / ${data.serviceName}\n必要に応じて特商法、プライバシーポリシー、SNSリンクを掲載します。`
};

function valueOrFallback(value) {
  const trimmed = String(value || '').trim();
  return trimmed || '未入力';
}

function getFormData() {
  return fields.reduce((data, field) => {
    const element = form.elements[field];
    data[field] = valueOrFallback(element.value);
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
  const intro = `対象：${data.target}\n目的：${data.lpGoal}\n長さ：${data.lpLength}\nCTA：${data.ctaText}（${data.ctaUrl}）`;
  const body = sections.map((section, index) => `${index + 1}. ${section}\n- 役割：${sectionRole(section)}\n- 入れる内容：${sectionContent(section, data)}`).join('\n\n');
  return `${intro}\n\n${body}`;
}

function sectionRole(section) {
  const roles = {
    'ファーストビュー': '最初の3秒で誰向け・何が得られるかを伝える',
    '悩み共感': '読者の「自分のことだ」と感じる気持ちを高める',
    '解決策': '悩みが解決できる理由をわかりやすく示す',
    '商品・サービス紹介': 'サービス内容と利用価値を紹介する',
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
    'ファーストビュー': `${data.serviceName}、${data.target}、${data.future}、CTAボタン`,
    '悩み共感': data.pain,
    '解決策': data.strength,
    '商品・サービス紹介': `${data.serviceName}の概要、${data.materials}`,
    '特徴': data.strength,
    'ベネフィット': data.future,
    '選ばれる理由': `${data.strength}、${data.mustDo}`,
    '実績・口コミ': data.materials,
    '利用の流れ': '申し込みから利用開始までの3ステップ',
    'よくある質問': 'スマホ対応、申し込み後、支払い、サポートなど',
    'CTA': `${data.ctaText} / ${data.ctaUrl}`,
    'フッター': `${data.clientName}の情報、必要リンク`
  };
  return content[section] || '未入力';
}

function buildSectionCopy(data, sections) {
  return sections.map(section => `【${section}】\n${sampleCopy[section] ? sampleCopy[section](data) : sectionContent(section, data)}`).join('\n\n');
}

function buildDesignDirections(data) {
  return `全体トーン：${data.designMood}。水色、クリーム、白、淡いゴールドを基調に、絵本をめくるようなやさしい世界観にする。\n\nレイアウト：スマホファースト。PCでは中央に390px〜430px程度のスマホ幅で表示し、横スクロールを出さない。\n\n装飾：角丸カード、ふんわりした影、リボン、星、扉、本、ガラスの靴、馬車を連想させる小さな飾りを使う。\n\n文字：画像に文字を焼き込まず、見出し・本文・ボタンはHTML/CSSで重ねる。読みやすい濃い青グレーを使う。\n\nCTA：${data.ctaText}ボタンは淡いゴールドと水色のグラデーションで目立たせ、リンク先は${data.ctaUrl}にする。\n\n守ること：${data.mustDo}\n避けること：${data.dontDo}`;
}

function buildImagePrompts(data) {
  return `【LP全体画像用】\n${data.designMood}のスマホLP背景。水色、クリーム、白、淡いゴールド。絵本風、シンデレラ風、星、リボン、扉、本、ガラスの靴、馬車の雰囲気。文字なし。余白多め。HTMLの文字やボタンを後から重ねる前提。\n\n【ヒーロー画像用】\n${data.serviceName}の世界観を伝えるヒーロービジュアル。${data.target}が${data.future}へ進む希望を感じる、やさしい絵本風イラスト。文字なし、中央に余白、スマホ縦長で使いやすい構図。\n\n【セクション装飾用】\n小さな星、淡いゴールドのリボン、青い本、白い扉、ガラスの靴、馬車モチーフのかわいい装飾素材。背景透過で使いやすい。文字なし。\n\n【CTA周り用】\n申し込みボタン周りに置く、きらめき、魔法の粉、淡いゴールドのフレーム、やさしい水色の光。文字なし。CTA文言は画像生成で入れず、CanvaまたはLP側のHTML/CSSで後から入れる。\n\n注意：日本語文字は画像生成で崩れることがあるため、画像内に文字を入れない。見出し、説明文、ボタン文言は必ず後からCanvaやLPのHTML/CSSで配置する。`;
}

function buildCodexPrompt(data, sections, sectionCopy, designDirections, imagePrompts) {
  const imageInstruction = data.imageUse === '画像なし'
    ? '画像なしでも成立するように、CSSのグラデーションと装飾だけでかわいく仕上げてください。'
    : '画像LPの場合は、完成画像をHTMLで表示し、その上にCTAリンクをHTML/CSSで重ねてください。画像ファイル名はconstまたはCSS変数で後から変更しやすくしてください。';

  return `以下の内容で、GitHub Pagesで公開できるLPを作ってください。外部ライブラリは使わず、index.html / style.css / script.js / README.md を作成してください。最後に変更内容をgit commitしてください。\n\n【依頼者名】${data.clientName}\n【商品名・サービス名】${data.serviceName}\n【LPの目的】${data.lpGoal}\n【ターゲット】${data.target}\n【ターゲットの悩み】${data.pain}\n【叶えたい未来】${data.future}\n【一番伝えたい強み】${data.strength}\n【入れたい文章・素材】${data.materials}\n【CTA文言】${data.ctaText}\n【CTAリンク先URL】${data.ctaUrl}\n\n【LP構成】\n${sections.map((section, index) => `${index + 1}. ${section}`).join('\n')}\n\n【セクション別文章案】\n${sectionCopy}\n\n【デザイン指示】\n${designDirections}\n\n【画像の扱い】\n${imageInstruction}\nCTAリンクは後から変更しやすいように、script.jsまたはHTML上部に設定値としてまとめてください。画像ファイル名も後から変更しやすくしてください。\n\n【画像生成プロンプト】\n${imagePrompts}\n\n【必ず守ること】\n- スマホ幅390pxで崩れない\n- 横スクロールを出さない\n- GitHub Pagesでそのまま動く\n- 文字、入力欄、ボタンはHTML/CSSで表示する\n- 画像に文字を焼き込まない\n- ${data.mustDo}\n\n【やってほしくないこと】\n- ${data.dontDo}`;
}

function buildPublishSteps() {
  return `1. GitHubで新しいリポジトリを作成する。リポジトリ名は英数字とハイフンがおすすめ。\n2. index.html、style.css、script.js、README.mdを作成またはアップロードする。\n3. 画像を使う場合は、画像ファイルもルート直下またはimagesフォルダへアップロードする。ファイル名の大文字小文字をそろえる。\n4. GitHubのリポジトリ画面で Settings → Pages を開く。\n5. Branchを main、フォルダを /root にして Save を押す。\n6. 数分待って、表示された公開URLを開く。\n7. 反映されない時は、Actionsのエラー、Pages設定、ファイル名、index.htmlの場所、ブラウザキャッシュを確認する。\n8. スマホでURLを開き、文字の読みやすさ、CTAリンク、画像表示を確認する。`;
}

function buildErrorPrompts(data) {
  return `【画像が表示されない】\nCodexへ：画像が表示されません。HTML/CSS/JSの画像パス、ファイル名の大文字小文字、画像の置き場所を確認し、GitHub Pagesで表示される相対パスに修正してください。\n\n【404になる】\nCodexへ：GitHub Pagesの公開URLが404になります。index.htmlがルート直下にあるか、Pages設定がmain / rootになっているか、リポジトリ名とURLが一致しているか確認し、READMEにも確認手順を追記してください。\n\n【リンクが飛ばない】\nCodexへ：CTAリンクが動きません。CTAのhrefまたはクリック処理を確認し、リンク先を「${data.ctaUrl}」へ変更しやすい定数で管理してください。\n\n【スマホで崩れる】\nCodexへ：スマホ幅390pxでレイアウトが崩れます。横スクロールをなくし、画像・カード・ボタンを幅100%以内に収め、PCでは中央にスマホ幅で表示してください。\n\n【画像が古いまま】\nCodexへ：画像を差し替えたのに古い画像が表示されます。ファイル名を変更する、URLにバージョンパラメータを付ける、ブラウザキャッシュ確認手順をREADMEに書く対応をしてください。\n\n【GitHub Pagesが反映されない】\nCodexへ：GitHub Pagesの変更が反映されません。Actions、Pages設定、コミット状況、反映待ち時間、キャッシュの確認手順を初心者向けに追記してください。\n\n【READMEだけ表示される】\nCodexへ：GitHub PagesでREADMEだけが表示されます。index.htmlがルート直下に存在するか確認し、必要なら作成して、Pagesでindex.htmlが表示される状態に修正してください。\n\n【画像ファイル名が違う】\nCodexへ：画像ファイル名が実際と違って表示されません。HTML/CSS/JS内の画像ファイル名を実ファイル名に合わせ、後から変更しやすい変数やコメントを追加してください。`;
}

function buildOutputs(data) {
  const sections = sectionPatterns[data.lpLength] || sectionPatterns['通常LP'];
  const sectionCopy = buildSectionCopy(data, sections);
  const designDirections = buildDesignDirections(data);
  const imagePrompts = buildImagePrompts(data);
  return [
    { title: 'LP構成案', text: buildStructure(data, sections) },
    { title: 'セクション別文章案', text: sectionCopy },
    { title: 'デザイン指示', text: designDirections },
    { title: '画像生成プロンプト', text: imagePrompts },
    { title: 'Codex用完成プロンプト', text: buildCodexPrompt(data, sections, sectionCopy, designDirections, imagePrompts) },
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
