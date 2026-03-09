pub mod ollama;
pub mod cloud;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatConfig {
    pub provider: String,
    pub model: String,
    pub base_url: String,
    pub api_key: String,
    pub temperature: f32,
    pub max_tokens: u32,
    pub top_p: f32,
}

pub async fn chat(message: String, config: ChatConfig) -> Result<String, String> {
    match config.provider.as_str() {
        "ollama" => ollama::chat(message, &config).await,
        "anthropic" => cloud::anthropic_chat(message, &config).await,
        _ => cloud::openai_compat_chat(message, &config).await,
    }
}
