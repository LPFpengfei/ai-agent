// Prevent the additional console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ai;
mod config;
mod tools;

use ai::{chat, ChatConfig};
use config::{AppConfig, ModelSettings, ProviderConfig};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    message: String,
    config: ChatConfig,
}

#[tauri::command]
async fn chat_command(message: String, config: ChatConfig) -> Result<String, String> {
    chat(message, config).await
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            chat_command,
            config::get_config,
            config::save_config,
            config::update_provider,
            config::set_selected_provider,
            config::update_model_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
