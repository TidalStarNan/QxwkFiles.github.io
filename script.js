/**
 * 静态文件下载站 - 交互脚本
 * 负责文件列表的加载、搜索、排序和显示
 */

// 全局变量
let allFiles = [];
let filteredFiles = [];
let currentSort = 'date-desc'; // 默认按最近更新排序

// 文件类型图标映射
const fileIcons = {
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'csv': 'fas fa-file-csv',
    'txt': 'fas fa-file-alt',
    'md': 'fas fa-file-alt',
    'json': 'fas fa-file-code',
    'xml': 'fas fa-file-code',
    'html': 'fas fa-file-code',
    'css': 'fas fa-file-code',
    'js': 'fas fa-file-code',
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive',
    'tar': 'fas fa-file-archive',
    'gz': 'fas fa-file-archive',
    '7z': 'fas fa-file-archive',
    'exe': 'fas fa-file-code',
    'msi': 'fas fa-file-code',
    'png': 'fas fa-file-image',
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'gif': 'fas fa-file-image',
    'svg': 'fas fa-file-image',
    'bmp': 'fas fa-file-image',
    'mp3': 'fas fa-file-audio',
    'wav': 'fas fa-file-audio',
    'mp4': 'fas fa-file-video',
    'avi': 'fas fa-file-video',
    'mov': 'fas fa-file-video',
    'default': 'fas fa-file'
};

// 文件类型颜色映射
const fileColors = {
    'pdf': '#ef4444',
    'doc': '#2563eb',
    'docx': '#2563eb',
    'ppt': '#eab308',
    'pptx': '#eab308',
    'xls': '#16a34a',
    'xlsx': '#16a34a',
    'zip': '#f97316',
    'image': '#8b5cf6',
    'audio': '#ec4899',
    'video': '#14b8a6',
    'default': '#64748b'
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * 初始化应用
 */
async function initApp() {
    // 显示加载状态
    showLoading();
    
    try {
        // 加载文件列表
        await loadFiles();
        
        // 渲染文件列表
        renderFileList();
        
        // 初始化事件监听器
        initEventListeners();
        
        // 更新文件计数
        updateFileCount();
        
        // 隐藏加载状态
        hideLoading();
        
        // 如果文件列表不为空，显示欢迎消息
        if (allFiles.length > 0) {
            showToast('文件列表加载完成！', 'success');
        }
    } catch (error) {
        console.error('初始化失败:', error);
        showToast('加载文件列表失败，请检查网络连接或文件配置', 'error');
        hideLoading();
        
        // 显示空状态
        document.getElementById('noResults').innerHTML = `
            <i class="fas fa-exclamation-triangle fa-2x"></i>
            <h3>无法加载文件列表</h3>
            <p>请检查 files.json 文件是否存在且格式正确</p>
            <p class="error-details" style="font-size: 0.9rem; margin-top: 10px; color: #dc2626;">
                错误信息: ${error.message || '未知错误'}
            </p>
            <div style="margin-top: 20px;">
                <button class="btn-show-all" onclick="location.reload()" style="margin-right: 10px;">
                    <i class="fas fa-redo"></i> 重新加载
                </button>
                <button class="btn-show-all" onclick="window.open('files.json', '_blank')" style="background: #6b7280;">
                    <i class="fas fa-code"></i> 查看 files.json
                </button>
            </div>
        `;
        document.getElementById('noResults').style.display = 'block';
        
        // 隐藏文件列表
        document.getElementById('fileList').style.display = 'none';
    }
}

/**
 * 从JSON文件加载文件列表
 */
async function loadFiles() {
    try {
        const response = await fetch('files.json');
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        const data = await response.json();
        
        // 验证数据格式
        if (!data.files || !Array.isArray(data.files)) {
            throw new Error('files.json 格式错误：缺少 files 数组');
        }
        
        // 处理文件数据
        allFiles = data.files.map(file => {
            // 确保每个文件都有必要的字段
            return {
                name: file.name || '未命名文件',
                size: file.size || '未知大小',
                type: getFileExtension(file.name),
                description: file.description || '暂无描述',
                url: file.url || `files/${file.name}`,
                date: file.date || '2023-01-01',
                category: file.category || '其他'
            };
        });
        
        filteredFiles = [...allFiles];
    } catch (error) {
        console.error('加载文件列表失败:', error);
        
        // 直接抛出错误，不使用示例数据
        throw error;
    }
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'default';
}

/**
 * 根据文件类型获取图标
 */
function getFileIcon(filename) {
    const ext = getFileExtension(filename);
    return fileIcons[ext] || fileIcons.default;
}

/**
 * 根据文件类型获取颜色
 */
function getFileColor(filename) {
    const ext = getFileExtension(filename);
    
    // 首先检查具体的扩展名
    if (fileColors[ext]) {
        return fileColors[ext];
    }
    
    // 然后检查类别
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'].includes(ext)) {
        return fileColors.image;
    }
    
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
        return fileColors.audio;
    }
    
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
        return fileColors.video;
    }
    
    return fileColors.default;
}

/**
 * 渲染文件列表
 */
function renderFileList() {
    const fileListElement = document.getElementById('fileList');
    const noResultsElement = document.getElementById('noResults');
    
    // 清空当前列表
    fileListElement.innerHTML = '';
    
    if (filteredFiles.length === 0) {
        // 显示无结果消息
        noResultsElement.style.display = 'block';
        noResultsElement.innerHTML = `
            <i class="fas fa-search fa-2x"></i>
            <h3>未找到匹配的文件</h3>
            <p>尝试使用不同的关键词搜索，或查看所有文件。</p>
            <button class="btn-show-all" id="showAllBtn">显示所有文件</button>
        `;
        fileListElement.style.display = 'none';
        return;
    }
    
    // 显示文件列表
    noResultsElement.style.display = 'none';
    fileListElement.style.display = 'grid';
    
    // 创建文件卡片
    filteredFiles.forEach(file => {
        const fileCard = createFileCard(file);
        fileListElement.appendChild(fileCard);
    });
}

/**
 * 创建文件卡片元素
 */
function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    const icon = getFileIcon(file.name);
    const color = getFileColor(file.name);
    
    card.innerHTML = `
        <div class="file-icon" style="color: ${color};">
            <i class="${icon}"></i>
        </div>
        <div class="file-name">${escapeHtml(file.name)}</div>
        <div class="file-description">${escapeHtml(file.description)}</div>
        <div class="file-meta">
            <div class="file-date">
                <i class="far fa-calendar-alt"></i>
                <span>${file.date}</span>
            </div>
            <div class="file-size">${file.size}</div>
        </div>
        <a href="${file.url}" class="download-btn" download="${file.name}">
            <i class="fas fa-download"></i>
            下载文件
        </a>
    `;
    
    return card;
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 搜索框输入事件
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function(e) {
        filterFiles(e.target.value);
        
        // 显示/隐藏清除按钮
        if (e.target.value.trim() !== '') {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    });
    
    // 清除搜索按钮
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        filterFiles('');
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
    });
    
    // 排序选择器
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.value = currentSort; // 默认选中"最近更新"
    sortSelect.addEventListener('change', function(e) {
        currentSort = e.target.value;
        sortFiles();
        renderFileList();
    });
    
    // 显示所有文件按钮
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            searchInput.value = '';
            filterFiles('');
            clearSearchBtn.style.display = 'none';
        });
    }
}

/**
 * 过滤文件列表
 */
function filterFiles(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        filteredFiles = [...allFiles];
    } else {
        filteredFiles = allFiles.filter(file => {
            return file.name.toLowerCase().includes(term) ||
                   file.description.toLowerCase().includes(term) ||
                   file.category.toLowerCase().includes(term) ||
                   file.type.toLowerCase().includes(term);
        });
    }
    
    // 排序
    sortFiles();
    
    // 重新渲染
    renderFileList();
    
    // 更新计数
    updateFileCount();
}

/**
 * 排序文件列表
 */
function sortFiles() {
    switch (currentSort) {
        case 'name-asc':
            filteredFiles.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredFiles.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-desc':
            filteredFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredFiles.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'size-desc':
            filteredFiles.sort((a, b) => parseFileSize(b.size) - parseFileSize(a.size));
            break;
        case 'size-asc':
            filteredFiles.sort((a, b) => parseFileSize(a.size) - parseFileSize(b.size));
            break;
        default:
            // 默认按日期降序排列
            filteredFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

/**
 * 解析文件大小字符串为字节数
 */
function parseFileSize(sizeString) {
    if (!sizeString || sizeString === '未知大小') return 0;
    
    const units = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024
    };
    
    const match = sizeString.match(/^([\d.]+)\s*([KMGTP]?B)$/i);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        return value * (units[unit] || 1);
    }
    
    return 0;
}

/**
 * 更新文件计数显示
 */
function updateFileCount() {
    document.getElementById('filteredCount').textContent = filteredFiles.length;
    document.getElementById('totalCount').textContent = allFiles.length;
    document.getElementById('fileCount').innerHTML = `<i class="fas fa-file"></i> ${allFiles.length} 个文件`;
}

/**
 * 显示加载状态
 */
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('fileList').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    
    // 设置消息和颜色
    toast.textContent = message;
    
    // 设置图标
    let icon = 'fas fa-info-circle';
    if (type === 'success') {
        icon = 'fas fa-check-circle';
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        icon = 'fas fa-exclamation-triangle';
        toast.style.background = '#ef4444';
    } else {
        toast.style.background = '#3b82f6';
    }
    
    toast.innerHTML = `<i class="${icon}"></i> ${message}`;
    
    // 显示提示
    toast.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 转义HTML特殊字符
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}