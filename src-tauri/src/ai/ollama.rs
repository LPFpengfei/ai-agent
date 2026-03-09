use super::ChatConfig;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    temperature: f32,
    num_predict: u32,
    top_p: f32,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
}

pub async fn chat(message: String, config: &ChatConfig) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    let request = OllamaRequest {
        model: config.model.clone(),
        prompt: message,
        stream: false,
        options: OllamaOptions {
            temperature: config.temperature,
            num_predict: config.max_tokens,
            top_p: config.top_p,
        },
    };

    let url = format!("{}/api/generate", config.base_url);
    
    let response = client
        .post(&url)
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Ollama 请求失败：{}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama 返回错误：{}", response.status()));
    }

    let result: OllamaResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败：{}", e))?;

    Ok(result.response)
}
