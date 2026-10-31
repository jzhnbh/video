# 配乐放置说明

## 放哪里

把你要用的曲子命名为 `bgm_user.mp3`，直接放到本目录：

```
examples/birthday-paradox/assets/bgm_user.mp3
```

## 支持什么格式

- mp3 / wav / m4a / aac / flac 都行，采样率和声道数不用管，合成时会统一转成 48kHz 立体声。
- 时长不用精确 130 秒：
  - 比 130 秒短 → 循环补齐；
  - 比 130 秒长 → 取前 130 秒，末尾 1.5 秒淡出。
- 建议音量别太爆，合成时会做一次响度归一（目标约 -16 LUFS）。

## 版权提醒

网上流传的「Vibe 知识大赏小曲」大概率是别人的成片配乐（含原作者选曲），商用或公开发布前请确认授权。
如果只是学习/内部试看，直接用没问题；要发抖音且不确定授权，建议换成可商用曲库（如 YouTube Audio Library、Pixabay Music）或让我用 `scripts/synth_bgm.py` 生成的原创占位曲。

## 没提供音频时

当前已生成占位 BGM：`examples/birthday-paradox/bgm_placeholder.wav`（77 BPM、A 小调、130 秒）。
画面不依赖 BGM，换曲子只需重新合成 MP4，不用重渲染。
