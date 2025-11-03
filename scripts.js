// 配置所有数据集的展示参数
const datasetConfigs = [
    {
        id: "aishell3",               // 对应HTML中的容器ID
        folder: "AIShell3",  // 音频文件所在文件夹
        name: "AISHELL3 dataset",     // 展示名称
        samples: 4,                   // 样本数量（sample1到sample6）
        // 模型文件夹名称（与audio_samples中的子文件夹对应）
        models: ["gt", "bigvgan", "vocos", "wavefm", "rfwave", "periodwave", "bridgevoc"],
        // 展示的模型名称（Ground Truth和方法名）
        modelNames: ["Ground Truth", "BigVGAN", "Vocos", "WaveFM", "RFWave", "PeriodWave", "Ours"]
    },
    {
        id: "ears",
        folder: "EARS",
        name: "EARS dataset",
        samples: 4,
        models: ["gt", "bigvgan", "vocos", "wavefm", "rfwave", "periodwave", "bridgevoc"],
        // 展示的模型名称（Ground Truth和方法名）
        modelNames: ["Ground Truth", "BigVGAN", "Vocos", "WaveFM", "RFWave", "PeriodWave", "Ours"]
    },
    {
        id: "musdb18",
        folder: "MUSDB18",
        name: "MUSDB18 vocals dataset",
        samples: 6,
        models: ["gt", "bigvgan", "vocos", "wavefm", "rfwave", "periodwave", "bridgevoc"],
        // 展示的模型名称（Ground Truth和方法名）
        modelNames: ["Ground Truth", "BigVGAN", "Vocos", "WaveFM", "RFWave", "PeriodWave", "Ours"]
    }
];


// 初始化单个数据集的展示
function initDataset(config) {
    const container = document.getElementById(config.id);
    // 为每个样本（case）创建表格
    for (let sampleIdx = 1; sampleIdx <= config.samples; sampleIdx++) {
        const caseSection = document.createElement('div');
        caseSection.className = 'subsection';
        caseSection.innerHTML = `<h3>Case ${sampleIdx}</h3>`;  // 显示Case 1到Case 6
        
        // 创建音频表格
        const table = createAudioTable(
            {
                models: config.models,
                modelNames: config.modelNames
            },
            sampleIdx,
            `audio_samples/${config.folder}`  // 音频文件基础路径
        );
        caseSection.appendChild(table);
        container.appendChild(caseSection);
    }
}


// 创建音频对比表格（复用原逻辑，适配新路径）
function createAudioTable(config, sampleIndex, basePath) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'tg';

    const maxColumnsPerRow = 7;  // 每行最多显示7列（1个标题+6个模型）
    const totalModels = config.models.length;

    // 按模型数量分多行展示（避免表格过宽）
    for (let row = 0; row < totalModels; row += maxColumnsPerRow - 1) {
        // 表格标题行
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<td class="tg-header">Audio Samples</td>` +
            config.modelNames.slice(row, row + maxColumnsPerRow - 1)
                .map(model => `<td class="tg-header">${model}</td>`)
                .join('');
        table.appendChild(headerRow);

        // 音频内容行
        const dataRow = document.createElement('tr');
        dataRow.innerHTML = `<td class="tg-cell"></td>`;  // 空单元格对应标题列

        // 填充每个模型的音频播放器和下载按钮
        for (let col = 0; col < maxColumnsPerRow - 1; col++) {
            const modelIndex = row + col;
            if (modelIndex < totalModels) {
                const model = config.models[modelIndex];
                const audioUrl = `${basePath}/${model}/sample${sampleIndex}.wav`;
                // 获取文件名（用于下载时的默认文件名）
                const fileName = `${config.modelNames[modelIndex]}_case${sampleIndex}.wav`;
                
                dataRow.innerHTML += `
                    <td class="tg-cell">
                        <div class="media-container">
                            <audio controls class="lazy-audio" data-src="${audioUrl}">
                                <p>Audio will load when visible</p>
                             </audio>
                             <button class="download-btn" 
                                     data-url="${audioUrl}" 
                                     data-filename="${fileName}">
                                Download
                            </button>
                        </div>
                    </td>
                `;
            } else {
                dataRow.innerHTML += '<td class="tg-cell"></td>';  // 空单元格占位
            }
        }
        table.appendChild(dataRow);
    }

    wrapper.appendChild(table);
    return wrapper;
}

// 音频下载功能实现
function setupAudioDownloads() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('download-btn')) {
            const url = e.target.dataset.url;
            const filename = e.target.dataset.filename;
            
            // 创建一个临时的a标签用于下载
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            
            // 触发点击事件开始下载
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        }
    });
}


// 页面加载完成后初始化所有数据集
document.addEventListener('DOMContentLoaded', function() {
    datasetConfigs.forEach(config => initDataset(config));
    initLazyLoading();  // 保持懒加载优化
    setupAudioDownloads();  // 初始化下载功能

    // 确保同一时间只播放一个音频
    document.addEventListener('play', function(e) {
        if (e.target.tagName === 'AUDIO') {
            document.querySelectorAll('audio').forEach(audio => {
                if (audio !== e.target) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        }
    }, true);
});


// 懒加载逻辑（复用原逻辑，确保性能）
function initLazyLoading() {
    // 音频懒加载
    const audioObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const audio = entry.target;
                if (audio.dataset.src && !audio.querySelector('source')) {
                    const source = document.createElement('source');
                    source.src = audio.dataset.src;
                    source.type = 'audio/wav';
                    audio.appendChild(source);
                    audio.load();
                    audio.classList.remove('lazy-audio');
                    observer.unobserve(audio);
                }
            }
        });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('.lazy-audio').forEach(audio => {
        audioObserver.observe(audio);
    });

    // 滚动时补充懒加载（避免遗漏）
    let lazyLoadThrottleTimeout;
    window.addEventListener('scroll', function() {
        if (lazyLoadThrottleTimeout) clearTimeout(lazyLoadThrottleTimeout);
        lazyLoadThrottleTimeout = setTimeout(() => {
            document.querySelectorAll('.lazy-audio:not(:has(source))').forEach(audio => {
                const rect = audio.getBoundingClientRect();
                if (rect.top < window.innerHeight + 200) {
                    const source = document.createElement('source');
                    source.src = audio.dataset.src;
                    source.type = 'audio/wav';
                    audio.appendChild(source);
                    audio.classList.remove('lazy-audio');
                }
            });
        }, 200);
    });
}


// 懒加载和下载按钮样式补充
const style = document.createElement('style');
style.textContent = `
    .lazy-audio {
        background-color: #f8f8f8;
        min-height: 40px;
    }
    .media-container {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .download-btn {
        padding: 6px 12px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    .download-btn:hover {
        background-color: #45a049;
    }
`;
document.head.appendChild(style);