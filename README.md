※修正中、サンプル画像の追加をは気が向いたらします。
# Stable Diffusion Gallery
Stable Diffusionで作成した画像のプロンプトとネガティブプロンプトを保存・管理・公開できる静的ウェブサイトです。<br/>
レンタルサーバー等での使用を想定

<img width="1907" height="694" alt="test" src="https://github.com/user-attachments/assets/2f642408-ffe2-4719-9901-dc6351d4b09a" />


## 主な機能
✅ **画像一覧表示**: サムネイル形式で画像を表示  
✅ **画像詳細表示**: クリックでプロンプト、ネガティブプロンプト、パラメータを表示  
✅ **日本語キーワード検索**: 「風景」「アニメ」などの日本語で検索可能  
✅ **タグクリック検索**: タグをクリックすると自動的に検索される  
✅ **モデル情報表示**: 使用したStable Diffusionモデルの詳細情報を表示  
✅ **レスポンシブデザイン**: デスクトップ・タブレット・スマートフォン対応 

## 使用方法

### 基本操作

1. **画像の閲覧**
   - メイン画面で画像のサムネイルを確認
   - 画像をクリックすると詳細情報（プロンプト、パラメータなど）が表示

2. **検索機能**
   - 上部の検索ボックスに日本語キーワードを入力
   - 対応する英語プロンプトを含む画像が自動的に検索される
   - タグをクリックすることでも検索可能

3. **フィルタリング**
   - モデル別でフィルタリング可能
   - 作成日順、タイトル順でソート可能

### データの追加・編集

このサイトはJSONファイルベースで動作します。新しい画像やデータを追加するには：

1. **画像ファイルの追加**
   - `images/` フォルダに画像ファイルを配置

2. **データの編集**
   - `data/images.json` - 画像データ（プロンプト、パラメータ、モデル情報など）
   - `data/keywords.json` - 日本語-英語キーワード対応表

詳細な編集方法は `JSON_EDITING_MANUAL.md` を参照してください。

## フォルダの構造
```
stable-diffusion-gallery/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── images/                # 画像ファイル格納フォルダ
│   ├── sample_001.png
│   └── sample_002.png
├── data/                  # JSONデータファイル
│   ├── images.json        # 画像データ
│   └── keywords.json      # キーワード対応表
├── README.md              # このファイル
└── JSON_EDITING_MANUAL.md # JSON編集マニュアル
```
## データ構造

### images.json

各画像は以下の情報を含みます：

```json
{
  "id": "unique_image_id",
  "filename": "image_file.png",
  "title": "画像のタイトル",
  "prompt": "English prompt used for generation",
  "negative_prompt": "English negative prompt",
  "model_name": "使用したモデル名",
  "architecture": "SD 1.5",
  "base_resolution": "512x512",
  "specialty": "モデルなどに特徴などあれば",
  "parameters": {
    "steps": 20,
    "cfg_scale": 7.5,
    "seed": 123456789,
    "sampler": "DPM++ 2M Karras"
  },
  "tags": ["日本語タグ1", "日本語タグ2"],
  "created_at": "2024-01-20"
}
```

### keywords.json
日本語キーワードと英語プロンプトの対応表：

```json
{
  "keywords": {
    "風景": ["landscape", "scenery", "nature"],
    "アニメ": ["anime", "manga", "illustration"]
  }
}
```
## **サーバーの起動**

   ```bash
   # Python 3の場合
   python -m http.server 8000
   
   # Node.jsの場合
   npx serve .
   ```
### **ブラウザでアクセス**
python
   ```
   http://localhost:8000
   ```
npx
   ```
   http://localhost:3000
   ```

## 更新履歴
### v1.0 (2025-07-29)
- 初回リリース
- 基本的な画像ギャラリー機能
- 日本語キーワード検索機能
- モデル管理機能
