use std::fs;
use std::path::PathBuf;

pub fn read_file(path: String) -> Result<String, String> {
    let path_buf = PathBuf::from(&path);
    
    // 安全检查：限制访问范围
    if !is_safe_path(&path_buf) {
        return Err("不允许访问该路径".to_string());
    }

    fs::read_to_string(&path_buf)
        .map_err(|e| format!("读取文件失败：{}", e))
}

pub fn write_file(path: String, content: String) -> Result<(), String> {
    let path_buf = PathBuf::from(&path);
    
    if !is_safe_path(&path_buf) {
        return Err("不允许访问该路径".to_string());
    }

    fs::write(&path_buf, content)
        .map_err(|e| format!("写入文件失败：{}", e))
}

pub fn list_dir(path: String) -> Result<Vec<String>, String> {
    let path_buf = PathBuf::from(&path);
    
    if !is_safe_path(&path_buf) {
        return Err("不允许访问该路径".to_string());
    }

    let entries = fs::read_dir(&path_buf)
        .map_err(|e| format!("读取目录失败：{}", e))?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                e.file_name().into_string().ok()
            })
        })
        .collect::<Vec<_>>();
    
    Ok(entries)
}

fn is_safe_path(path: &PathBuf) -> bool {
    // 简单安全检查：不允许访问根目录关键位置
    let path_str = path.to_string_lossy();
    !path_str.starts_with("/System") 
        && !path_str.starts_with("/usr")
        && !path_str.contains("..")
}
