use std::error::Error;
use tauri::App;
use tauri::Manager;

pub fn setup_app(app: &mut App) -> Result<(), Box<dyn Error>> {
    
    #[cfg(debug_assertions)]
    open_devtools(app)?;
    Ok(())
}

//调试环境打开开发者工具
#[cfg(debug_assertions)]
fn open_devtools(app : &mut App)-> Result<(), Box<dyn Error>> {
    let main_window = app.get_webview_window("main").unwrap();
    main_window.open_devtools();
    Ok(())
}
// 窗口置顶
#[allow(dead_code)]
fn always_on_top(app: &mut App) -> Result<(), Box<dyn Error>> {
    let main_window = app.get_webview_window("main").unwrap();
    let _ = main_window.set_always_on_top(true);
    Ok(())
}