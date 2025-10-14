// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
// 添加新的依赖
use chardetng::EncodingDetector;
use encoding_rs::{Encoding, UTF_8};

#[tauri::command]
async fn read_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_file(app: AppHandle) -> Option<serde_json::Value> {
    // 打开文件对话框
    let get_file_path = app.dialog().file().add_filter("电子书文件", &["txt", "mobi", "epub", "html"]).blocking_pick_file();
    // 检查用户是否取消了文件选择 获取文件路径
    let file_path = match get_file_path {
        Some(file_str) => file_str.to_string(),
        None => return None,
    };

    //判断文件后缀
    let file_ext = file_path.split_at(file_path.len() - 4).1.to_lowercase();
    println!("文件后缀: {:?}", file_ext);
    if file_ext == ".txt" || file_ext == ".html" {  
        // 打开文件并读取内容
        match fs::read(&file_path) {
            Ok(bytes) => {
                // 检测文件编码
                let encoding = detect_encoding(&bytes);
                // 使用检测到的编码解码文件内容
                let (decoded, _, _) = encoding.decode(&bytes);
                // 返回 JSON 对象
                Some(serde_json::json!({ "filePath": file_path, "fileExt": file_ext, "content": decoded.to_string() }))
            }
            Err(_) => None,
        }
    } else {
        // 返回仅包含路径的 JSON 对象
        Some(serde_json::json!({ "filePath": file_path,"fileExt": file_ext, "content": "" }))
    }
}

// 编码检测函数  返回编码 UTF_8
fn detect_encoding(bytes: &[u8]) -> &'static Encoding {
    // 如果文件为空，返回UTF-8
    if bytes.is_empty() {
        return UTF_8;
    }

    // 首先尝试直接使用UTF-8解码
    // bytes 转换成字符
    if let Ok(_) = std::str::from_utf8(bytes) {
        return UTF_8;
    }

    // 使用chardetng进行编码检测
    let mut detector = EncodingDetector::new();
    detector.feed(bytes, false);

    // 注意：guess方法返回的已经是&'static Encoding类型，不需要额外转换
    detector.guess(None, false)
}

#[tauri::command]
fn save_file(app: AppHandle, content: String) {
    let file_path = app
        .dialog()
        .file()
        .add_filter("My Filter", &["txt"])
        .blocking_save_file();

    let get_file_path = match file_path {
        Some(file_str) => file_str.to_string(),
        None => {
            return ();
        }
    };

    let _ = fs::write(get_file_path, content.clone());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![read_file, open_file, save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
