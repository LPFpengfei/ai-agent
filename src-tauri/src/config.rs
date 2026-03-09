use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub name: String,
    pub base_url: String,
    pub api_key: String,
    pub models: Vec<String>,
    pub default_model: String,
    #[serde(default)]
    pub headers: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelSettings {
    pub temperature: f32,
    pub max_tokens: u32,
    pub top_p: f32,
    pub frequency_penalty: f32,
    pub presence_penalty: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub providers: HashMap<String, ProviderConfig>,
    pub selected_provider: String,
    pub model_settings: ModelSettings,
    pub window_width: u32,
    pub window_height: u32,
    pub theme: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        let mut providers = HashMap::new();
        
        // Ollama (本地)
        providers.insert("ollama".to_string(), ProviderConfig {
            name: "Ollama".to_string(),
            base_url: "http://localhost:11434".to_string(),
            api_key: "".to_string(),
            models: vec![
                "qwen2.5:7b".to_string(),
                "llama3.2:3b".to_string(),
                "mistral:7b".to_string(),
                "gemma2:9b".to_string(),
                "deepseek-r1:8b".to_string(),
            ],
            default_model: "qwen2.5:7b".to_string(),
            headers: HashMap::new(),
        });
        
        // OpenAI
        providers.insert("openai".to_string(), ProviderConfig {
            name: "OpenAI".to_string(),
            base_url: "https://api.openai.com/v1".to_string(),
            api_key: "".to_string(),
            models: vec![
                "gpt-4o".to_string(),
                "gpt-4o-mini".to_string(),
                "gpt-4-turbo".to_string(),
                "gpt-3.5-turbo".to_string(),
            ],
            default_model: "gpt-4o-mini".to_string(),
            headers: HashMap::new(),
        });
        
        // Anthropic
        providers.insert("anthropic".to_string(), ProviderConfig {
            name: "Anthropic".to_string(),
            base_url: "https://api.anthropic.com".to_string(),
            api_key: "".to_string(),
            models: vec![
                "claude-3-5-sonnet-20241022".to_string(),
                "claude-3-opus-20240229".to_string(),
                "claude-3-haiku-20240307".to_string(),
            ],
            default_model: "claude-3-5-sonnet-20241022".to_string(),
            headers: HashMap::new(),
        });
        
        // DeepSeek
        providers.insert("deepseek".to_string(), ProviderConfig {
            name: "DeepSeek".to_string(),
            base_url: "https://api.deepseek.com".to_string(),
            api_key: "".to_string(),
            models: vec![
                "deepseek-chat".to_string(),
                "deepseek-coder".to_string(),
            ],
            default_model: "deepseek-chat".to_string(),
            headers: HashMap::new(),
        });
        
        // Moonshot (月之暗面)
        providers.insert("moonshot".to_string(), ProviderConfig {
            name: "Moonshot".to_string(),
            base_url: "https://api.moonshot.cn/v1".to_string(),
            api_key: "".to_string(),
            models: vec![
                "moonshot-v1-8k".to_string(),
                "moonshot-v1-32k".to_string(),
                "moonshot-v1-128k".to_string(),
            ],
            default_model: "moonshot-v1-8k".to_string(),
            headers: HashMap::new(),
        });
        
        // Zhipu (智谱)
        providers.insert("zhipu".to_string(), ProviderConfig {
            name: "Zhipu".to_string(),
            base_url: "https://open.bigmodel.cn/api/paas/v4".to_string(),
            api_key: "".to_string(),
            models: vec![
                "glm-4".to_string(),
                "glm-4-flash".to_string(),
                "glm-3-turbo".to_string(),
            ],
            default_model: "glm-4-flash".to_string(),
            headers: HashMap::new(),
        });
        
        // Baichuan (百川)
        providers.insert("baichuan".to_string(), ProviderConfig {
            name: "Baichuan".to_string(),
            base_url: "https://api.baichuan-ai.com/v1".to_string(),
            api_key: "".to_string(),
            models: vec![
                "Baichuan4".to_string(),
                "Baichuan3-Turbo".to_string(),
            ],
            default_model: "Baichuan4".to_string(),
            headers: HashMap::new(),
        });
        
        // Qwen (阿里云)
        providers.insert("qwen".to_string(), ProviderConfig {
            name: "Qwen".to_string(),
            base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1".to_string(),
            api_key: "".to_string(),
            models: vec![
                "qwen-plus".to_string(),
                "qwen-turbo".to_string(),
                "qwen-max".to_string(),
            ],
            default_model: "qwen-plus".to_string(),
            headers: HashMap::new(),
        });
        
        // 自定义
        providers.insert("custom".to_string(), ProviderConfig {
            name: "自定义".to_string(),
            base_url: "".to_string(),
            api_key: "".to_string(),
            models: vec![],
            default_model: "".to_string(),
            headers: HashMap::new(),
        });

        AppConfig {
            providers,
            selected_provider: "ollama".to_string(),
            model_settings: ModelSettings {
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 0.9,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            },
            window_width: 1024,
            window_height: 768,
            theme: "dark".to_string(),
        }
    }
}

impl AppConfig {
    pub fn config_path() -> PathBuf {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        PathBuf::from(home)
            .join(".config")
            .join("ai-agent")
            .join("config.json")
    }

    pub fn load() -> Result<Self, String> {
        let path = Self::config_path();
        if !path.exists() {
            return Ok(Self::default());
        }
        
        let content = fs::read_to_string(&path)
            .map_err(|e| format!("读取配置文件失败：{}", e))?;
        
        serde_json::from_str(&content)
            .map_err(|e| format!("解析配置文件失败：{}", e))
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::config_path();
        
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("创建配置目录失败：{}", e))?;
        }
        
        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("序列化配置失败：{}", e))?;
        
        fs::write(&path, content)
            .map_err(|e| format!("保存配置文件失败：{}", e))
    }

    pub fn get_provider(&self, name: &str) -> Option<&ProviderConfig> {
        self.providers.get(name)
    }

    pub fn get_provider_mut(&mut self, name: &str) -> Option<&mut ProviderConfig> {
        self.providers.get_mut(name)
    }
}

#[tauri::command]
pub fn get_config() -> Result<AppConfig, String> {
    AppConfig::load()
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<(), String> {
    config.save()
}

#[tauri::command]
pub fn update_provider(name: String, provider: ProviderConfig) -> Result<AppConfig, String> {
    let mut config = AppConfig::load()?;
    config.providers.insert(name, provider);
    config.save()?;
    Ok(config)
}

#[tauri::command]
pub fn set_selected_provider(name: String) -> Result<AppConfig, String> {
    let mut config = AppConfig::load()?;
    config.selected_provider = name;
    config.save()?;
    Ok(config)
}

#[tauri::command]
pub fn update_model_settings(settings: ModelSettings) -> Result<AppConfig, String> {
    let mut config = AppConfig::load()?;
    config.model_settings = settings;
    config.save()?;
    Ok(config)
}
