#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, CustomMenuItem};
use tauri::WindowEvent;

#[tauri::command]
fn show_float_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_window("float") {
        let _ = window.show();
        let _ = window.set_always_on_top(true);
    }
}

#[tauri::command]
fn hide_float_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_window("float") {
        let _ = window.hide();
    }
}

#[tauri::command]
fn toggle_float_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_window("float") {
        if let Ok(visible) = window.is_visible() {
            if visible {
                let _ = window.hide();
            } else {
                let _ = window.show();
                let _ = window.set_always_on_top(true);
            }
        }
    }
}

fn main() {
    let show_main = CustomMenuItem::new("show_main".to_string(), "显示主窗口");
    let show_float = CustomMenuItem::new("show_float".to_string(), "显示悬浮窗");
    let hide_float = CustomMenuItem::new("hide_float".to_string(), "隐藏悬浮窗");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show_main)
        .add_item(show_float)
        .add_item(hide_float)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "show_main" => {
                        if let Some(window) = app.get_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "show_float" => {
                        if let Some(window) = app.get_window("float") {
                            let _ = window.show();
                            let _ = window.set_always_on_top(true);
                        }
                    }
                    "hide_float" => {
                        if let Some(window) = app.get_window("float") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                if event.window().label() == "main" {
                    event.window().hide().unwrap();
                    api.prevent_close();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            show_float_window,
            hide_float_window,
            toggle_float_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running weather clock application");
}
