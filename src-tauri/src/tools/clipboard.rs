pub fn read() -> Result<String, String> {
    // 通过 Tauri 插件实现
    // 这里留空，由前端直接调用插件 API
    Ok(String::new())
}

pub fn write(_text: String) -> Result<(), String> {
    // 通过 Tauri 插件实现
    Ok(())
}
