"""
Cheems Todo - MD3 灵动岛（Dynamic Island）模块
===============================================
基于 PySide6 QWebEngineView 实现的桌面悬浮"灵动岛"小组件，
用于展示和执行任务流的番茄钟专注倒计时。

核心功能：
- 在屏幕顶部居中显示一个可展开/收起的胶囊形悬浮窗
- 内置 HTML/CSS/JS 实现 Material Design 3 风格的倒计时界面
- 支持 Group 模式（任务流专注）和 Project 模式（项目攻坚专注）
- 支持 Windows 系统通知、护盾提醒（检测前台窗口切换）、白噪音播放
- 通过 WebEngine title 变化实现 Py ↔ JS 的双向事件通信

主要类：
- QuietWebEnginePage  : 过滤 WebEngine 的控制台噪音（ResizeObserver 警告）
- IslandWebEngineView : 自定义 QWebEngineView，支持透明区域点击穿透
- DynamicIslandBridge : 灵动岛主控件，管理倒计时生命周期、状态发射和 JS 通信
"""
import sys
import os
from playsound import playsound
import os

import pygame
import json
import time
import ctypes
import ctypes.wintypes
from PySide6.QtCore import Qt, QTimer, QUrl, Signal
from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtWebEngineCore import QWebEnginePage, QWebEngineSettings
from PySide6.QtWebEngineWidgets import QWebEngineView

# 🔔 Windows 通知兼容层
# win10toast may register a WNDPROC callback that raises ctypes LRESULT/WPARAM
# errors on some Windows/PySide combinations, so FlowDeck avoids it here.
try:
    from plyer import notification

    USE_SYSTEM_NOTIFICATION = True
except ImportError:
    notification = None
    USE_SYSTEM_NOTIFICATION = False


def send_windows_notification(title: str, message: str, duration: int = 5):
    """发送 Windows 系统通知（通过 plyer 库）。

    Args:
        title:    通知标题
        message:  通知正文
        duration: 通知显示时长（秒），默认 5 秒
    """
    try:
        if USE_SYSTEM_NOTIFICATION and notification is not None:

            # 获取当前脚本所在目录的绝对路径
            current_dir = os.path.dirname(os.path.abspath(__file__))
            sound_path = os.path.join(current_dir, 'audio.mp3')

            print(f"正在播放: {sound_path}")
            playsound(sound_path)
            notification.notify(title=title, message=message, timeout=duration, app_name="通知")
        else:
            print(f"🔔 [{title}] {message}")

    except Exception as e:
        print(f"[Python] Windows 通知失败: {e}")


# ── 全局滚动条隐藏样式 ──────────────────────────────────
# 用于 QApplication 全局样式表，隐藏所有 Widget 的滚动条
HIDE_SCROLLBAR_QSS = """
QScrollBar:vertical, QScrollBar:horizontal {
    width: 0px;
    height: 0px;
    margin: 0px;
    padding: 0px;
    border: none;
    background: transparent;
}
QScrollBar::handle:vertical, QScrollBar::handle:horizontal,
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical,
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal,
QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical,
QScrollBar::add-page:horizontal, QScrollBar::sub-page:horizontal {
    width: 0px;
    height: 0px;
    border: none;
    background: transparent;
}
"""


# ── 灵动岛内嵌 HTML 界面 ────────────────────────────────
# Material Design 3 风格的倒计时界面，包含：
#   - 收起态：显示倒计时、阶段标签、状态文字
#   - 展开态：显示任务详情、环境标签（壁纸/护盾/白噪音）、控制按钮、进度条
#   - 完成/退出动画横幅
#   - JS 函数：startCountdown / pauseCountdown / pyRender / pyEnter / pyExit 等"""
HTML_CONTENT = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD3 灵动岛 - 任务链版</title>
  <style>
    :root {
      --md-sys-color-surface-container: #1e1e1e;
      --md-sys-color-on-surface: #e6e1e5;
      --md-sys-color-primary: #d0bcff;
      --md-sys-color-secondary-container: #4a4458;
      --md-sys-radius-large: 28px;
      --md-sys-transition: cubic-bezier(0.4, 0, 0.2, 1);
      --color-focus: #ff9800;
      --color-break: #4caf50;
    }

    html, body, * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    *::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      display: none !important;
      background: transparent !important;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 10px;
      background: transparent;
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden; /* 防止滑出时出现滚动条 */
    }

    .dynamic-island {
      position: relative;
      width: 220px;
      max-height: 48px;
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      border-radius: var(--md-sys-radius-large);
      overflow: hidden;
      cursor: pointer;
      user-select: none;
      contain: layout style paint;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);


      transform: translateY(-40px);
      opacity: 0;
      pointer-events: none;
      transition: width 0.4s var(--md-sys-transition),
                  max-height 0.4s var(--md-sys-transition),
                  transform 0.4s var(--md-sys-transition),
                  opacity 0.4s ease,
                  box-shadow 0.3s ease;
    }
    body.shield-mode .dynamic-island {
      box-shadow: 0 8px 28px rgba(255, 152, 0, 0.28), 0 2px 8px rgba(0,0,0,0.42);
    }

    /* 🎬 入场完成 */
    .dynamic-island.entered {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    /* 🎬 退场动画 */
    .dynamic-island.exiting {
      transform: translateY(-40px) !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: transform 0.4s var(--md-sys-transition), opacity 0.3s ease !important;
    }

    .dynamic-island.expanded {
      width: 340px;
      max-height: 316px;
      transform: scale(1.02);
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
    .dynamic-island.expanded.entered { transform: scale(1.02); }
    .dynamic-island.expanded.exiting { transform: scale(0.95) translateY(-40px) !important; }

    .island-collapsed {
      display: flex; align-items: center; justify-content: space-between;
      height: 48px; padding: 0 16px; font-size: 14px;
    }
    .timer-text { font-weight: 700; font-variant-numeric: tabular-nums; min-width: 44px; }
    .phase-text { color: #888; font-size: 12px; margin-left: 8px; }
    .status-text { font-size: 12px; margin-left: auto; }

    .island-expanded {
      opacity: 0; transform: translateY(-10px);
      padding: 12px 16px 16px;
      transition: opacity 0.3s 0.05s, transform 0.3s 0.05s;
      pointer-events: none;
    }
    .dynamic-island.expanded .island-expanded {
      opacity: 1; transform: translateY(0); pointer-events: auto;
    }

    .task-content {
      margin-bottom: 12px;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .task-content.switching { opacity: 0; transform: translateY(-6px); }
    .task-title { margin: 0 0 4px; font-size: 16px; font-weight: 500; }
    .task-desc { margin: 0 0 6px; color: #a0a0a0; font-size: 13px; }
    .task-type-badge {
      display: inline-block; padding: 2px 8px; border-radius: 8px;
      font-size: 11px; font-weight: 600; background: var(--md-sys-color-secondary-container);
    }
    .task-type-badge.focus { color: var(--color-focus); }
    .task-type-badge.break { color: var(--color-break); }

    .env-row {
      display: none;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 12px;
    }
    .env-row.active { display: flex; }
    .env-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(208, 188, 255, 0.14);
      color: #f0e7ff;
      font-size: 11px;
      font-weight: 600;
      max-width: 100%;
    }
    .env-chip.noise { background: rgba(76, 175, 80, 0.16); color: #c7f0c7; }
    .env-chip.shield { background: rgba(255, 152, 0, 0.16); color: #ffd8a6; }
    .env-chip.wallpaper { background: rgba(100, 181, 246, 0.16); color: #cfe8ff; }

    .controls { display: flex; gap: 8px; margin-bottom: 12px; }
    .controls button {
      flex: 1; padding: 9px 0; border: none; border-radius: 12px;
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-surface); font-size: 13px; font-weight: 500;
      cursor: pointer; transition: background 0.2s, transform 0.1s;
    }
    .controls button.danger { color: #ffb4ab; background: rgba(147, 0, 10, 0.35); }
    .controls button:hover { background: #5a5468; }
    .controls button.danger:hover { background: rgba(186, 26, 26, 0.48); }
    .controls button:active { transform: scale(0.98); }

    .progress-bar { height: 4px; background: #2a2a2a; border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: var(--md-sys-color-primary); transition: width 0.5s linear; }

    .finish-banner {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: linear-gradient(135deg, var(--color-focus), var(--color-break));
      color: #fff; padding: 8px 20px; border-radius: 20px;
      font-size: 14px; font-weight: 600; opacity: 0; pointer-events: none;
      transition: all 0.4s var(--md-sys-transition);
      white-space: nowrap; z-index: 100; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .finish-banner.show { opacity: 1; transform: translate(-50%, -50%) scale(1); }

    .guard-banner {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 12px;
      padding: 8px 10px;
      border-radius: 16px;
      background: rgba(255, 152, 0, 0.92);
      color: #1f1300;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.35;
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s ease;
      z-index: 120;
      box-shadow: 0 8px 22px rgba(0,0,0,0.28);
    }
    .guard-banner.show { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>

<div id="dynamic-island" class="dynamic-island">
  <div class="island-collapsed">
    <span class="timer-text">00:00</span>
    <span class="phase-text">阶段 1/5</span>
    <span class="status-text">准备中</span>
  </div>
  <div class="island-expanded">
    <div class="task-content" id="task-content">
      <h3 class="task-title">loading...</h3>
      <p class="task-desc">...</p>
      <span class="task-type-badge">focus</span>
    </div>
    <div class="env-row" id="env-row"></div>
    <div class="controls">
      <button id="btn-toggle">暂停</button>
      <button id="btn-cancel" class="danger">退出</button>
      <!-- 🔴 已删除重置按钮 -->
    </div>
    <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
  </div>
  <div class="finish-banner" id="finish-banner">Tips:任务全部完成！</div>
  <div class="guard-banner" id="guard-banner">检测到你打开了其他应用</div>
</div>

<script>
window.__focusOptions = __FOCUS_OPTIONS__;
window.__state = {
  isRunning: false, isExpanded: false, isTransitioning: false,
  isTaskSwitching: false, timerInterval: null, timeLeft: 0, total: 0, status: '准备中'
};

document.addEventListener('DOMContentLoaded', () => {
  const island = document.getElementById('dynamic-island');
  const timerEl = document.querySelector('.timer-text');
  const phaseEl = document.querySelector('.phase-text');
  const statusEl = document.querySelector('.status-text');
  const taskContent = document.getElementById('task-content');
  const taskTitle = document.querySelector('.task-title');
  const taskDesc = document.querySelector('.task-desc');
  const typeBadge = document.querySelector('.task-type-badge');
  const btnToggle = document.getElementById('btn-toggle');
  const btnCancel = document.getElementById('btn-cancel');
  const progressFill = document.getElementById('progress-fill');
  const finishBanner = document.getElementById('finish-banner');
  const guardBanner = document.getElementById('guard-banner');
  const envRow = document.getElementById('env-row');
  const focusOptions = window.__focusOptions || {};
  let noiseAudio = null;
  let noiseBlocked = false;

  const fmt = (sec) => `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  const notifyPy = (message) => { document.title = message; };
  const addEnvChip = (kind, text) => {
    if (!envRow) return;
    const chip = document.createElement('span');
    chip.className = `env-chip ${kind}`;
    chip.textContent = text;
    envRow.appendChild(chip);
    envRow.classList.add('active');
  };
  const setupEnvironment = () => {
    if (focusOptions.wallpaperEnabled) {
      addEnvChip('wallpaper', 'Windows 壁纸');
    }
    if (focusOptions.disableOtherApps || focusOptions.disableApps) {
      document.body.classList.add('shield-mode');
      addEnvChip('shield', '护盾');
    }
    if ((focusOptions.whiteNoiseEnabled || focusOptions.whiteNoise) && focusOptions.whiteNoiseData) {
      noiseAudio = new Audio(focusOptions.whiteNoiseData);
      noiseAudio.loop = true;
      noiseAudio.preload = 'auto';
      noiseAudio.volume = 0.42;
      addEnvChip('noise', focusOptions.whiteNoiseName ? `白噪音` : '白噪音');
    }
  };
  const playNoise = () => {
    if (!noiseAudio) return;
    const result = noiseAudio.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        noiseBlocked = true;
        statusEl.textContent = '点击岛播放音频';
      });
    }
  };
  const pauseNoise = () => {
    if (!noiseAudio) return;
    noiseAudio.pause();
  };
  const stopNoise = () => {
    if (!noiseAudio) return;
    noiseAudio.pause();
    noiseAudio.currentTime = 0;
  };
  const updateUI = () => {
    timerEl.textContent = fmt(window.__state.timeLeft);
    if (window.__state.total > 0) {
      const p = ((window.__state.total - window.__state.timeLeft) / window.__state.total) * 100;
      progressFill.style.width = `${Math.max(0, Math.min(100, p))}%`;
    }
  };

  const startCountdown = (notify = false) => {
    const s = window.__state;
    if (s.isRunning || s.isTaskSwitching) return;
    if (s.timeLeft <= 0) return;
    s.isRunning = true;
    btnToggle.textContent = '暂停';
    statusEl.textContent = s.status || '专注中';
    playNoise();
    if (notify) notifyPy(`__PY_RESUMED__:${s.timeLeft}`);
    s.timerInterval = setInterval(() => {
      s.timeLeft = Math.max(0, s.timeLeft - 1);
      updateUI();
      if (s.timeLeft <= 0) {
        clearInterval(s.timerInterval);
        s.timerInterval = null;
        s.isRunning = false;
        document.title = '__PY_TIMEUP__';
      }
    }, 1000);
  };

  const pauseCountdown = (notify = true) => {
    const s = window.__state;
    if (s.timerInterval) clearInterval(s.timerInterval);
    s.isRunning = false;
    statusEl.textContent = '已暂停';
    btnToggle.textContent = '继续';
    pauseNoise();
    if (notify) notifyPy(`__PY_PAUSED__:${s.timeLeft}`);
  };

  window.pyRender = (data) => {
    const s = window.__state;
    if (s.timerInterval) clearInterval(s.timerInterval);
    s.isRunning = false; s.isTaskSwitching = false;
    if (data.title !== undefined) taskTitle.textContent = data.title;
    if (data.subtitle !== undefined) taskDesc.textContent = data.subtitle;
    if (data.phase !== undefined) phaseEl.textContent = data.phase;
    if (data.status !== undefined) { s.status = data.status; statusEl.textContent = data.status; }
    if (data.type !== undefined) {
      typeBadge.textContent = data.type === 'focus' ? '专注' : '休息';
      typeBadge.className = `task-type-badge ${data.type}`;
    }
    if (data.remaining !== undefined && data.total !== undefined) {
      s.timeLeft = data.remaining; s.total = data.total; updateUI();
    }
    btnToggle.textContent = '暂停';
    if (data.autoStart === true) setTimeout(() => startCountdown(false), 50);
  };

  window.pyEnter = () => { island.classList.add('entered'); setTimeout(() => document.title = '__PY_ENTERED__', 500); };
  window.pyExit = (data = {}) => {
    stopNoise();
    finishBanner.textContent = data.cancelled ? '已退出专注' : 'Tips:任务全部完成！';
    finishBanner.classList.add('show');
    setTimeout(() => { island.classList.add('exiting'); setTimeout(() => document.title = '__PY_EXITED__', 400); }, 1500);
  };
  window.pyStart = () => { window.__state.isTaskSwitching = false; startCountdown(false); };
  window.pyPause = () => pauseCountdown(false);
  window.pyCollapse = () => {
    if (window.__state.isExpanded) {
      window.__state.isExpanded = false;
      island.classList.remove('expanded');
      document.title = '__PY_COLLAPSED__';
    }
  };
  window.pySwitchTask = () => {
    window.__state.isTaskSwitching = true; statusEl.textContent = '切换中...';
    taskContent.classList.add('switching');
    setTimeout(() => { taskContent.classList.remove('switching'); window.__state.isTaskSwitching = false; }, 300);
  };
  window.pyGuardAlert = (data = {}) => {
    const title = data.title || '其他应用';
    guardBanner.textContent = `检测到切换到「${title}」，回到当前专注`;
    guardBanner.classList.add('show');
    statusEl.textContent = '护盾提醒';
    setTimeout(() => guardBanner.classList.remove('show'), 3200);
  };

  island.addEventListener('click', (e) => {
    if (window.__state.isTransitioning) return;
    if (e.target.closest('.controls')) return;
    window.__state.isExpanded = !window.__state.isExpanded;
    window.__state.isTransitioning = true;
    island.classList.toggle('expanded', window.__state.isExpanded);
    document.title = window.__state.isExpanded ? '__PY_EXPANDED__' : '__PY_COLLAPSED__';
    setTimeout(() => { window.__state.isTransitioning = false; }, 400);
  });
  btnToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const s = window.__state;
    if (s.isTaskSwitching) return;
    s.isRunning ? pauseCountdown(true) : startCountdown(true);
  });
  btnCancel.addEventListener('click', (e) => {
    e.stopPropagation();
    const s = window.__state;
    if (s.timerInterval) clearInterval(s.timerInterval);
    s.isRunning = false;
    stopNoise();
    statusEl.textContent = '退出中';
    notifyPy(`__PY_CANCEL__:${s.timeLeft}`);
  });
  document.addEventListener('click', () => {
    if (noiseBlocked && window.__state.isRunning) {
      noiseBlocked = false;
      playNoise();
    }
  }, { capture: true });
  document.addEventListener('contextmenu', (e) => e.preventDefault(), { capture: true });
  taskContent.addEventListener('click', (e) => e.stopPropagation());
  setupEnvironment();
  updateUI();
});
</script>
</body>
</html>"""


class QuietWebEnginePage(QWebEnginePage):
  """静默 WebEngine 页面，过滤掉无关的控制台警告信息。

  默认继承自 QWebEnginePage，重写 javaScriptConsoleMessage 方法，
  屏蔽常见的 ResizeObserver 相关警告，避免干扰调试输出。
  """
  IGNORED_CONSOLE_MESSAGES = (
    "ResizeObserver loop completed with undelivered notifications.",
    "ResizeObserver loop limit exceeded",
  )

  def javaScriptConsoleMessage(self, level, message, line_number, source_id):
    if any(text in message for text in self.IGNORED_CONSOLE_MESSAGES):
      return
    super().javaScriptConsoleMessage(level, message, line_number, source_id)


class IslandWebEngineView(QWebEngineView):
  """支持透明区域点击穿透的 WebEngineView。

  重写 contextMenuEvent 禁用右键菜单，通过 nativeEvent 委托父组件的
  _transparent_hit_test_result 实现非灵动岛区域的鼠标穿透。
  """
  def contextMenuEvent(self, event):
    event.accept()

  def nativeEvent(self, eventType, message):
    parent = self.parentWidget()
    if parent and hasattr(parent, "_transparent_hit_test_result"):
      result = parent._transparent_hit_test_result(message)
      if result is not None:
        return result
    return super().nativeEvent(eventType, message)


class DynamicIslandBridge(QWidget):
  """MD3 灵动岛主控件。

  在屏幕顶部居中显示一个可展开/收起的胶囊形悬浮窗，执行任务链倒计时专注。
  通过 WebEngine 内嵌 HTML/JS 实现界面渲染，利用 document.title 变化
  实现 JS → Python 的事件通信（如倒计时结束、暂停、退出等）。

  Attributes:
      tasks:          任务列表，每项含 title/subtitle/time(秒)/type
      mode:           模式："group"（任务流） 或 "project"（项目专注）
      current_index:  当前执行到的任务索引
      _page_ready:    页面是否已加载完成
      _finished:      是否已完成所有任务
      _cancelled:     是否已被用户取消

  Signals:
      signalStateChanged(str): 状态变化信号，发射 JSON 格式的状态载荷
  """
  signalStateChanged = Signal(str)

  def __init__(self, tasks=None, mode="group", options=None):
    """
    tasks: 任务列表，每项包含 title, subtitle, time(秒), type
    mode: "group" (任务流专注) 或 "project" (项目专注)
    """
    super().__init__()
    self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool)
    self.setAttribute(Qt.WA_TranslucentBackground)
    self.setAttribute(Qt.WA_DeleteOnClose)
    self.resize(420, 320)  # 高度预留展开态空间

    self._is_expanded = False
    self.web = IslandWebEngineView(self)
    self.web.setPage(QuietWebEnginePage(self.web))
    self.web.setContextMenuPolicy(Qt.NoContextMenu)
    web_attrs = getattr(QWebEngineSettings, "WebAttribute", QWebEngineSettings)
    playback_attr = getattr(web_attrs, "PlaybackRequiresUserGesture", None)
    if playback_attr is not None:
      self.web.settings().setAttribute(playback_attr, False)
    file_access_attr = getattr(web_attrs, "LocalContentCanAccessFileUrls", None)
    if file_access_attr is not None:
      self.web.settings().setAttribute(file_access_attr, True)
    self.web.resize(self.size())
    self.web.setAttribute(Qt.WA_TranslucentBackground)
    self.web.page().setBackgroundColor(Qt.transparent)

    # 居中顶部显示
    screen = QApplication.primaryScreen().geometry()
    self.move((screen.width() - self.width()) // 2, 0)

    self.web.loadFinished.connect(self._on_load_finished)
    self.web.titleChanged.connect(self._on_title_changed)

    # allow injecting tasks from caller (serve.py)
    self.tasks = tasks if tasks is not None else [
      {"title": "test1", "subtitle": "content1", "time": 5, "type": "focus"},
      {"title": "test2", "subtitle": "content2", "time": 5, "type": "break"},
      {"title": "test3", "subtitle": "content3", "time": 5, "type": "focus"},

    ]
    self.current_index = 0
    self._processing_title = False  # 🔑 防递归锁
    self.mode = mode  # "group" 或 "project"
    self.options = options or {}
    self._started_at = None
    self._finished = False
    self._cancelled = False
    self._page_ready = False
    self._pending_guard_alerts = []
    self.web.setHtml(
      HTML_CONTENT.replace("__FOCUS_OPTIONS__", json.dumps(self.options, ensure_ascii=False)),
      QUrl.fromLocalFile(os.path.abspath(os.path.dirname(__file__)) + os.sep)
    )

  def resizeEvent(self, event):
    super().resizeEvent(event)
    self.web.resize(self.size())

  def _island_hit_rect(self):
    if self._is_expanded:
      width = min(340, self.width())
      height = min(326, self.height())
    else:
      width = min(220, self.width())
      height = 58
    x = max(0, (self.width() - width) // 2)
    y = 0
    return x, y, width, height

  def _point_in_island_hit_rect(self, local_x, local_y):
    x, y, width, height = self._island_hit_rect()
    return x <= local_x <= x + width and y <= local_y <= y + height

  def _transparent_hit_test_result(self, message):
    if sys.platform == "win32":
      try:
        msg = ctypes.wintypes.MSG.from_address(int(message))
        WM_NCHITTEST = 0x0084
        HTTRANSPARENT = -1
        if msg.message == WM_NCHITTEST:
          x = ctypes.c_short(msg.lParam & 0xFFFF).value
          y = ctypes.c_short((msg.lParam >> 16) & 0xFFFF).value
          frame = self.frameGeometry()
          raw_local = (x - frame.x(), y - frame.y())
          dpr = 1.0
          try:
            dpr = float(self.windowHandle().devicePixelRatio())
          except Exception:
            dpr = 1.0
          scaled_local = ((x / dpr) - frame.x(), (y / dpr) - frame.y())
          if not (
            self._point_in_island_hit_rect(raw_local[0], raw_local[1]) or
            self._point_in_island_hit_rect(scaled_local[0], scaled_local[1])
          ):
            return True, HTTRANSPARENT
      except Exception:
        pass
    return None

  def nativeEvent(self, eventType, message):
    result = self._transparent_hit_test_result(message)
    if result is not None:
      return result
    return super().nativeEvent(eventType, message)

  def _on_load_finished(self, ok):
    if not ok:
      return
    self._page_ready = True
    self._load_and_start_task(0)
    QTimer.singleShot(300, lambda: self.web.page().runJavaScript("window.pyEnter();"))
    QTimer.singleShot(450, self._flush_pending_guard_alerts)

  def _run_js_when_ready(self, script, delay=0):
    def run():
      if self._page_ready:
        self.web.page().runJavaScript(script)
    if delay:
      QTimer.singleShot(delay, run)
    else:
      run()

  def _flush_pending_guard_alerts(self):
    if not self._page_ready or not self._pending_guard_alerts:
      return
    latest_title = self._pending_guard_alerts[-1]
    self._pending_guard_alerts.clear()
    self.show_guard_alert(latest_title)

  def _load_and_start_task(self, index):
    if index >= len(self.tasks):
      return
    task = self.tasks[index]
    self._started_at = time.monotonic()
    # 根据模式显示不同的阶段标签
    if self.mode == "project":
      phase_label = f"里程碑 {index + 1}/{len(self.tasks)}"
      status_label = "攻坚中"
    else:
      phase_label = f"阶段 {index + 1}/{len(self.tasks)}"
      status_label = "专注中" if task.get("type", "focus") == "focus" else "休息中"

    payload = {
      "title": task.get("title", "任务"),
      "subtitle": task.get("subtitle", ""),
      "phase": phase_label,
      "type": task.get("type", "focus"),
      "status": status_label,
      "remaining": task.get("time", 0),
      "total": task.get("time", 0),
      "autoStart": True
    }
    self.web.page().runJavaScript(f"window.pyRender({json.dumps(payload, ensure_ascii=False)});")
    self._emit_state("task")

  def _on_title_changed(self, title: str):
    if title in ("__PY_EXPANDED__", "__PY_COLLAPSED__"):
      if title == "__PY_EXPANDED__":
        self._is_expanded = True
      else:
        QTimer.singleShot(420, lambda: setattr(self, "_is_expanded", False))
      QTimer.singleShot(50, lambda: self.web.page().runJavaScript('document.title="MD3";'))
      return
    if self._processing_title or title in ("MD3", "", "__PY_ENTERED__"):
      return
    self._processing_title = True

    try:
      if title == "__PY_TIMEUP__":
        label = "里程碑" if self.mode == "project" else "阶段"
        print(f">>> ✅ {label} {self.current_index + 1} 完成")
        self._emit_state("task_done")
        next_idx = self.current_index + 1
        if next_idx < len(self.tasks):
          self.current_index = next_idx
          self.web.page().runJavaScript("window.pySwitchTask();")
          QTimer.singleShot(350, lambda: self._load_and_start_task(next_idx))
        else:
          self._on_all_tasks_completed()

      elif title == "__PY_EXITED__":
        print(">>> 🎬 退场完成，安全关闭")
        self.hide()  # 先隐藏避免闪烁
        QTimer.singleShot(100, self.close)

      elif title.startswith("__PY_PAUSED__"):
        self._emit_state("paused", self._remaining_from_title(title))

      elif title.startswith("__PY_RESUMED__"):
        self._emit_state("resumed", self._remaining_from_title(title))

      elif title.startswith("__PY_CANCEL__"):
        self.cancel_focus()

    finally:
      QTimer.singleShot(50, lambda: self.web.page().runJavaScript('document.title="MD3";'))
      QTimer.singleShot(100, lambda: setattr(self, '_processing_title', False))

  def _remaining_from_title(self, title):
    try:
      return int(title.split(":", 1)[1])
    except (IndexError, ValueError):
      return None

  def _current_task(self):
    if 0 <= self.current_index < len(self.tasks):
      return self.tasks[self.current_index]
    return {}

  def _elapsed_seconds(self, remaining=None):
    current = self._current_task()
    total = int(current.get("time", 0) or 0)
    if remaining is not None and total > 0:
      return max(0, min(total, total - remaining))
    if self._started_at is None:
      return 0
    return max(0, int(time.monotonic() - self._started_at))

  def _state_payload(self, event, remaining=None):
    current = self._current_task()
    total_seconds = sum(int(task.get("time", 0) or 0) for task in self.tasks)
    completed_seconds = sum(int(task.get("time", 0) or 0) for task in self.tasks[:self.current_index])
    completed_seconds += self._elapsed_seconds(remaining)
    return {
      "event": event,
      "mode": self.mode,
      "index": self.current_index,
      "totalTasks": len(self.tasks),
      "title": current.get("title", "任务"),
      "subtitle": current.get("subtitle", ""),
      "type": current.get("type", "focus"),
      "taskSeconds": int(current.get("time", 0) or 0),
      "remaining": remaining,
      "completedSeconds": max(0, min(total_seconds, completed_seconds)),
      "totalSeconds": total_seconds,
      "cancelled": self._cancelled,
      "finished": self._finished,
    }

  def _emit_state(self, event, remaining=None):
    self.signalStateChanged.emit(json.dumps(self._state_payload(event, remaining), ensure_ascii=False))

  def cancel_focus(self):
    if self._finished or self._cancelled:
      return
    self._cancelled = True
    self._emit_state("cancelled")
    self._run_js_when_ready("if (window.pyExit) window.pyExit({cancelled: true});")

  def show_guard_alert(self, title="其他应用"):
    payload = {"title": str(title or "其他应用")[:60]}
    if not self._page_ready:
      self._pending_guard_alerts.append(payload["title"])
      return
    script = (
      "if (typeof window.pyGuardAlert === 'function') "
      f"window.pyGuardAlert({json.dumps(payload, ensure_ascii=False)});"
    )
    self.web.page().runJavaScript(script)

  def _on_all_tasks_completed(self):
    if self._finished:
      return
    self._finished = True
    self._emit_state("completed")
    if self.mode == "project":
      send_windows_notification("CheemsTodo: 项目攻坚完成！", "恭喜！所有项目里程碑已顺利完成")
    else:
      send_windows_notification("CheemsTodo: 任务完成！", "恭喜！所有专注任务已顺利完成")
    self._run_js_when_ready("if (window.pyExit) window.pyExit();")
    self._run_js_when_ready('document.title="MD3";', delay=50)


if __name__ == "__main__":
  # Ensure shared OpenGL contexts attribute is set before QApplication creation
  QApplication.setAttribute(Qt.AA_ShareOpenGLContexts)
  app = QApplication(sys.argv)
  app.setStyle("Fusion")  # 提升跨平台 UI 稳定性
  app.setStyleSheet((app.styleSheet() or "") + "\n" + HIDE_SCROLLBAR_QSS)

  island = DynamicIslandBridge()
  island.show()
  sys.exit(app.exec())
