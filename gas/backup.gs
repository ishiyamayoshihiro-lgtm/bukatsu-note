// ============================================================
// 部活ノート 自動バックアップ GAS スクリプト
// ============================================================
// 【セットアップ手順】
// 1. プロジェクト > プロジェクトの設定 > スクリプトプロパティ に以下を設定:
//    - BACKUP_API_URL: https://bukatsu-note.vercel.app/api/backup/export
//    - BACKUP_API_KEY: <Next.js の BACKUP_API_KEY 値>
//    - DRIVE_FOLDER_ID: Googleドライブのバックアップ先フォルダID
// 2. トリガー > 新しいトリガーを作成
//    - 実行する関数: dailyBackup
//    - イベントのソース: 時間ベース
//    - トリガーのタイプ: 日タイマー
//    - 時刻: 午前 2:00～3:00
// ============================================================

var PROPS = PropertiesService.getScriptProperties();
var API_URL = PROPS.getProperty('BACKUP_API_URL');
var API_KEY = PROPS.getProperty('BACKUP_API_KEY');
var FOLDER_ID = PROPS.getProperty('DRIVE_FOLDER_ID');
var MAX_BACKUP_FILES = 30;

/**
 * メイン: 毎日深夜2:00に実行するバックアップ関数
 */
function dailyBackup() {
  var result = runBackup_();
  if (!result.success) {
    GmailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      '【部活ノート】バックアップ失敗',
      '日時: ' + new Date().toLocaleString('ja-JP') + '\n' +
      'エラー: ' + result.error
    );
  }
}

/**
 * 実際のバックアップ実行ロジック
 */
function runBackup_() {
  try {
    if (!API_URL || !API_KEY || !FOLDER_ID) {
      return { success: false, error: 'スクリプトプロパティが設定されていません' };
    }

    var response = UrlFetchApp.fetch(API_URL + '?key=' + API_KEY, {
      method: 'get',
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() !== 200) {
      return { success: false, error: 'HTTP ' + response.getResponseCode() + ': ' + response.getContentText().substring(0, 100) };
    }

    var json = response.getContentText();

    var folder = DriveApp.getFolderById(FOLDER_ID);
    var timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd_HHmmss');
    var filename = 'bukatsu_backup_' + timestamp + '.json';
    folder.createFile(filename, json, MimeType.PLAIN_TEXT);

    pruneOldBackups_(folder);

    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * 古いバックアップファイルを削除する
 */
function pruneOldBackups_(folder) {
  var files = [];
  var allFiles = folder.getFiles();

  while (allFiles.hasNext()) {
    var f = allFiles.next();
    if (f.getName().startsWith('bukatsu_backup_')) {
      files.push({ file: f, date: f.getDateCreated() });
    }
  }

  files.sort(function(a, b) { return b.date - a.date; });

  for (var i = MAX_BACKUP_FILES; i < files.length; i++) {
    files[i].file.setTrashed(true);
  }
}

// ============================================================
// Web App として公開する場合（オプション）
// ウェブアプリとして導入 > 新しいバージョンをデプロイ
// ============================================================

/**
 * Web App エンドポイント: GET でバックアップファイル一覧を返す
 * ?key=<BACKUP_API_KEY> でアクセス
 */
function doGet(e) {
  var key = e && e.parameter && e.parameter.key;
  if (key !== API_KEY) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Unauthorized' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var folder = DriveApp.getFolderById(FOLDER_ID);
  var allFiles = folder.getFiles();
  var files = [];

  while (allFiles.hasNext()) {
    var f = allFiles.next();
    if (f.getName().startsWith('bukatsu_backup_')) {
      files.push({
        name: f.getName(),
        id: f.getId(),
        createdAt: f.getDateCreated().toISOString(),
        size: f.getSize(),
      });
    }
  }

  files.sort(function(a, b) { return b.createdAt.localeCompare(a.createdAt); });

  return ContentService.createTextOutput(
    JSON.stringify({ files: files })
  ).setMimeType(ContentService.MimeType.JSON);
}
