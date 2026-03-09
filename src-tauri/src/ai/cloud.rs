use super::ChatConfig;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    temperature: f32,
    max_tokens: u32,
    top_p: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Debug, Deserialize)]
struct OpenAIChoice {
    message: OpenAIMessage,
}

/// 兼容 OpenAI 格式的 API 调用（支持 OpenAI、DeepSeek、Moonshot、Zhipu、Baichuan、Qwen 等）
pub async fn openai_compat_chat(message: String, config: &ChatConfig) -> Result<String, String> {
    let client = reqwest::Client::new();

    let request = OpenAIRequest {
        model: config.model.clone(),
        messages: vec![OpenAIMessage {
            role: "user".to_string(),
            content: message,
        }],
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
    };

    let url = if config.base_url.ends_with("/chat/completions") {
        config.base_url.clone()
    } else {
        format!("{}/chat/completions", config.base_url)
    };

    let mut req_builder = client
        .post(&url)
        .header("Content-Type", "application/json");

    // 添加 API Key
    if !config.api_key.is_empty() {
        req_builder = req_builder.header("Authorization", format!("Bearer {}", config.api_key));
    }

    let response = req_builder
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("API 请求失败：{}", e))?;

    if !response.status().is_success() {
        let error = response.text().await.unwrap_or_default();
        return Err(format!("API 返回错误：{}", error));
    }

    let result: OpenAIResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败：{}", e))?;

    Ok(result.choices.first()
        .map(|c| c.message.content.clone())
        .unwrap_or_else(|| "无响应内容".to_string()))
}

#[derive(Debug, Serialize)]
struct AnthropicRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<OpenAIMessage>,
}

#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    content: Vec<AnthropicContent>,
}

#[derive(Debug, Deserialize)]
struct AnthropicContent {
    text: String,
}

pub async fn anthropic_chat(message: String, config: &ChatConfig) -> Result<String, String> {
    let client = reqwest::Client::new();

    let request = AnthropicRequest {
        model: config.model.clone(),
        max_tokens: config.max_tokens,
        messages: vec![OpenAIMessage {
            role: "user".to_string(),
            content: message,
        }],
    };

    let response = client
        .post(&config.base_url)
        .header("x-api-key", &config.api_key)
        .header("anthropic-version", "2023-06-01")
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Anthropic 请求失败：{}", e))?;

    if !response.status().is_success() {
        let error = response.text().await.unwrap_or_default();
        return Err(format!("Anthropic 返回错误：{}", error));
    }

    let result: AnthropicResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败：{}", e))?;

    Ok(result.content.first()
        .map(|c| c.text.clone())
        .unwrap_or_else(|| "无响应内容".to_string()))
}
