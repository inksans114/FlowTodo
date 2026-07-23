import argparse
import json
import os
import threading
import urllib.parse
import urllib.request
from datetime import datetime

from PyQt5.QtCore import QEvent, QPoint, QRectF, QSize, Qt, QTimer, pyqtSignal
from PyQt5.QtGui import QColor, QCursor, QFont, QPainterPath, QRegion
from PyQt5.QtWidgets import (
    QApplication,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QScrollArea,
    QSizeGrip,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)
from qfluentwidgets import (
    CardWidget,
    CheckBox,
    FluentIcon as FIF,
    PrimaryPushButton,
    ProgressRing,
    PushButton,
    SpinBox,
    Theme,
    TransparentToolButton,
    setTheme,
)


APP_QSS = """
QWidget {
    font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
    color: #1D1B20;
}
QWidget#WindowRoot {
    background: transparent;
}
QFrame#HubPanel {
    background: #FFFBFE;
    border: 1px solid #E7E0EC;
    border-radius: 24px;
}
QLabel#HubTitle {
    font-size: 26px;
    font-weight: 800;
}
QLabel#CardTitle {
    font-size: 17px;
    font-weight: 800;
}
QLabel#Muted {
    color: #625B71;
    font-size: 13px;
}
QLabel#TaskTitle {
    font-size: 14px;
    font-weight: 700;
}
QLabel#ClockText {
    font-size: 40px;
    font-weight: 800;
}
QLabel#TimerText {
    font-size: 34px;
    font-weight: 800;
}
QFrame#TaskRow {
    background: #F7F2FA;
    border-radius: 10px;
}
QSizeGrip {
    width: 18px;
    height: 18px;
    background: transparent;
}
"""


def app_data_dir():
    root = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
    return os.path.join(root, "FlowTodo", "data")


class JsonStore:
    def __init__(self, data_dir):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.tasks_file = os.path.join(self.data_dir, "tasks.json")
        self.settings_file = os.path.join(self.data_dir, "settings.json")

    def _read_json(self, path, default):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data if data is not None else default
        except Exception:
            return default

    def _write_json(self, path, data):
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)

    def tasks(self):
        data = self._read_json(self.tasks_file, [])
        return data if isinstance(data, list) else []

    def settings(self):
        data = self._read_json(self.settings_file, {})
        return data if isinstance(data, dict) else {}

    def set_task_done(self, task_id, done):
        tasks = self.tasks()
        changed = False
        for task in tasks:
            if str(task.get("id")) == str(task_id):
                task["done"] = bool(done)
                changed = True
                break
        if changed:
            self._write_json(self.tasks_file, tasks)


def icon_button(icon, tooltip):
    button = TransparentToolButton()
    button.setIcon(icon)
    button.setToolTip(tooltip)
    button.setFixedSize(34, 34)
    return button


def card_icon_button(icon, tooltip):
    button = TransparentToolButton()
    button.setIcon(icon)
    button.setFixedSize(34, 34)
    button.setToolTip(tooltip)
    return button


class TransparentWindow(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("WindowRoot")
        self.setWindowFlags(
            Qt.Tool | Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WA_TranslucentBackground, True)
        self.setAttribute(Qt.WA_NoSystemBackground, True)
        self.setAutoFillBackground(False)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        path = QPainterPath()
        path.addRoundedRect(QRectF(self.rect()), 24, 24)
        self.setMask(QRegion(path.toFillPolygon().toPolygon()))


class TodoContent(QWidget):
    def __init__(self, store, parent=None):
        super().__init__(parent)
        self.store = store
        self._build_ui()
        self.refresh()

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        self.count_label = QLabel("0 项待办")
        self.count_label.setObjectName("Muted")
        layout.addWidget(self.count_label)

        self.list_widget = QWidget()
        self.list_layout = QVBoxLayout(self.list_widget)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(8)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll.setWidget(self.list_widget)
        layout.addWidget(scroll, 1)

    def refresh(self):
        while self.list_layout.count():
            item = self.list_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        pending = [task for task in self.store.tasks() if not task.get("done")]
        self.count_label.setText(f"{len(pending)} 项待办")
        if not pending:
            empty = QLabel("今天没有待办")
            empty.setObjectName("Muted")
            empty.setAlignment(Qt.AlignCenter)
            self.list_layout.addWidget(empty, 1)
            return

        for task in pending[:5]:
            row = QFrame()
            row.setObjectName("TaskRow")
            row_layout = QHBoxLayout(row)
            row_layout.setContentsMargins(10, 8, 10, 8)
            row_layout.setSpacing(8)

            check = CheckBox()
            check.setToolTip("完成待办")
            title = QLabel(str(task.get("title") or "未命名任务"))
            title.setObjectName("TaskTitle")
            title.setWordWrap(True)
            task_id = task.get("id")
            check.toggled.connect(lambda done, tid=task_id: self._toggle(tid, done))

            row_layout.addWidget(check, 0, Qt.AlignTop)
            row_layout.addWidget(title, 1)
            self.list_layout.addWidget(row)
        self.list_layout.addStretch(1)

    def _toggle(self, task_id, done):
        self.store.set_task_done(task_id, done)
        QTimer.singleShot(120, self.refresh)


class RingTimer(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.ring = ProgressRing(self)
        self.ring.setRange(0, 100)
        self.ring.setStrokeWidth(10)
        self.ring.setTextVisible(False)
        self.label = QLabel("25:00", self)
        self.label.setObjectName("TimerText")
        self.label.setAlignment(Qt.AlignCenter)
        self.label.setAttribute(Qt.WA_TransparentForMouseEvents, True)
        self.setMinimumSize(150, 150)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        side = max(120, min(self.width(), self.height()))
        self.ring.setFixedSize(side, side)
        x = (self.width() - side) // 2
        y = (self.height() - side) // 2
        self.ring.move(x, y)
        self.label.setGeometry(x, y, side, side)

    def set_value(self, text, progress):
        self.label.setText(text)
        self.ring.setValue(max(0, min(100, int(progress * 100))))


class PomodoroContent(QWidget):
    def __init__(self, store, parent=None):
        super().__init__(parent)
        self.store = store
        self.total_seconds = max(1, int(self.store.settings().get("focusDuration", 25)) * 60)
        self.remaining_seconds = self.total_seconds
        self.running = False
        self._build_ui()
        self.timer = QTimer(self)
        self.timer.setInterval(1000)
        self.timer.timeout.connect(self._tick)
        self._update()

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)

        self.state_label = QLabel("准备专注")
        self.state_label.setObjectName("Muted")
        self.state_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.state_label)

        self.ring_timer = RingTimer()
        layout.addWidget(self.ring_timer, 1)

        row = QHBoxLayout()
        row.setSpacing(8)
        self.minus_button = PushButton("-5")
        self.start_button = PrimaryPushButton("开始")
        self.reset_button = PushButton("重置")
        self.plus_button = PushButton("+5")
        for button in (self.minus_button, self.start_button, self.reset_button, self.plus_button):
            button.setFixedHeight(32)
            button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.minus_button.clicked.connect(lambda: self.adjust(-5))
        self.start_button.clicked.connect(self.toggle)
        self.reset_button.clicked.connect(self.reset)
        self.plus_button.clicked.connect(lambda: self.adjust(5))
        row.addWidget(self.minus_button)
        row.addWidget(self.start_button)
        row.addWidget(self.reset_button)
        row.addWidget(self.plus_button)
        layout.addLayout(row)

    def toggle(self):
        self.running = not self.running
        if self.running:
            self.timer.start()
            self.start_button.setText("暂停")
            self.state_label.setText("专注中")
        else:
            self.timer.stop()
            self.start_button.setText("继续")
            self.state_label.setText("已暂停")

    def reset(self):
        self.running = False
        self.timer.stop()
        self.total_seconds = max(1, int(self.store.settings().get("focusDuration", 25)) * 60)
        self.remaining_seconds = self.total_seconds
        self.start_button.setText("开始")
        self.state_label.setText("准备专注")
        self._update()

    def adjust(self, delta):
        if self.running:
            return
        minutes = max(5, min(90, int(round(self.total_seconds / 60)) + delta))
        self.total_seconds = minutes * 60
        self.remaining_seconds = self.total_seconds
        self._update()

    def _tick(self):
        self.remaining_seconds = max(0, self.remaining_seconds - 1)
        self._update()
        if self.remaining_seconds <= 0:
            self.timer.stop()
            self.running = False
            self.start_button.setText("开始")
            self.state_label.setText("已完成")
            QApplication.beep()

    def _update(self):
        minutes = self.remaining_seconds // 60
        seconds = self.remaining_seconds % 60
        progress = 1 - self.remaining_seconds / max(1, self.total_seconds)
        self.ring_timer.set_value(f"{minutes:02d}:{seconds:02d}", progress)


class WeatherContent(QWidget):
    weatherReady = pyqtSignal(str)

    def __init__(self, store, parent=None):
        super().__init__(parent)
        self.store = store
        self.loading = False
        self._build_ui()
        self.weatherReady.connect(self.weather_label.setText)
        self.clock_timer = QTimer(self)
        self.clock_timer.setInterval(1000)
        self.clock_timer.timeout.connect(self._update_time)
        self.clock_timer.start()
        self.weather_timer = QTimer(self)
        self.weather_timer.setInterval(30 * 60 * 1000)
        self.weather_timer.timeout.connect(self.refresh_weather)
        self.weather_timer.start()
        self._update_time()
        QTimer.singleShot(500, self.refresh_weather)

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        top = QHBoxLayout()
        top.addStretch(1)
        self.refresh_button = icon_button(FIF.SYNC, "刷新天气")
        self.refresh_button.clicked.connect(self.refresh_weather)
        top.addWidget(self.refresh_button)
        layout.addLayout(top)

        self.time_label = QLabel("--:--")
        self.time_label.setObjectName("ClockText")
        self.date_label = QLabel("")
        self.date_label.setObjectName("Muted")
        self.weather_label = QLabel("天气加载中...")
        self.weather_label.setObjectName("Muted")
        self.weather_label.setWordWrap(True)
        layout.addWidget(self.time_label)
        layout.addWidget(self.date_label)
        layout.addWidget(self.weather_label)
        layout.addStretch(1)

    def _update_time(self):
        now = datetime.now()
        self.time_label.setText(now.strftime("%H:%M"))
        self.date_label.setText(now.strftime("%Y-%m-%d  %A"))

    def refresh_weather(self):
        if self.loading:
            return
        self.loading = True
        self.weather_label.setText("天气加载中...")

        def worker():
            try:
                city = str(self.store.settings().get("weatherCity", "") or "").strip()
                location = urllib.parse.quote(city) if city else ""
                url = f"https://wttr.in/{location}?format=3&m&lang=zh"
                req = urllib.request.Request(url, headers={"User-Agent": "FlowTodo/1.0"})
                with urllib.request.urlopen(req, timeout=6) as resp:
                    text = resp.read().decode("utf-8", errors="replace").strip()
                self.weatherReady.emit(text or "暂无天气数据")
            except Exception:
                self.weatherReady.emit("天气暂时不可用")
            finally:
                self.loading = False

        threading.Thread(target=worker, daemon=True).start()


class HydrationContent(QWidget):
    def __init__(self, store, parent=None):
        super().__init__(parent)
        self.store = store
        self._build_ui()
        self.timer = QTimer(self)
        self.timer.timeout.connect(QApplication.beep)

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)
        self.status_label = QLabel("未开启")
        self.status_label.setObjectName("Muted")
        layout.addWidget(self.status_label)

        self.interval_spin = SpinBox()
        self.interval_spin.setRange(15, 180)
        self.interval_spin.setValue(45)
        self.interval_spin.setSuffix(" 分钟")
        self.start_button = PrimaryPushButton("开启")
        self.start_button.clicked.connect(self.toggle)
        layout.addWidget(self.interval_spin)
        layout.addWidget(self.start_button)
        layout.addStretch(1)

    def toggle(self):
        if self.timer.isActive():
            self.timer.stop()
            self.start_button.setText("开启")
            self.status_label.setText("未开启")
            return
        minutes = int(self.interval_spin.value())
        self.timer.start(minutes * 60 * 1000)
        self.start_button.setText("关闭")
        self.status_label.setText(f"每 {minutes} 分钟提醒")


class DesktopWidgetCard(QFrame):
    LONG_PRESS_MS = 360

    def __init__(self, hub, key, title, content):
        super().__init__(hub)
        self.hub = hub
        self.key = key
        self.title_text = title
        self.content_widget = content
        self.docked = True
        self.floating_window = None
        self.dragging = False
        self.press_global_pos = QPoint()
        self.drag_offset = QPoint()
        self.long_press_timer = QTimer(self)
        self.long_press_timer.setSingleShot(True)
        self.long_press_timer.timeout.connect(self._begin_drag)
        self._build_ui()

    def _build_ui(self):
        self.setStyleSheet("QFrame { background: transparent; border: none; }")
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        self.card = CardWidget(self)
        self.card.setBorderRadius(12)
        self.card.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        outer.addWidget(self.card, 1)

        layout = QVBoxLayout(self.card)
        layout.setContentsMargins(16, 14, 16, 14)
        layout.setSpacing(8)

        self.header = QWidget()
        header = QHBoxLayout(self.header)
        header.setContentsMargins(0, 0, 0, 0)
        header.setSpacing(4)
        self.title_label = QLabel(self.title_text)
        self.title_label.setObjectName("CardTitle")
        self.title_label.setToolTip("长按拖出为独立桌面小组件")
        self.dock_button = card_icon_button(FIF.RETURN, "收回")
        self.pin_button = card_icon_button(FIF.PIN, "固定")
        self.delete_button = card_icon_button(FIF.DELETE, "删除")
        self.dock_button.hide()
        self.dock_button.clicked.connect(self.request_dock)
        self.pin_button.clicked.connect(self.toggle_pinned)
        self.delete_button.clicked.connect(self.request_delete)
        header.addWidget(self.title_label)
        header.addStretch(1)
        header.addWidget(self.dock_button)
        header.addWidget(self.pin_button)
        header.addWidget(self.delete_button)

        layout.addWidget(self.header)
        layout.addWidget(self.content_widget, 1)
        for widget in (self, self.header, self.title_label):
            widget.installEventFilter(self)

    def prepare_for_dock(self, side):
        self.setMinimumSize(QSize(side, side))
        self.setMaximumHeight(side)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)

    def prepare_for_float(self):
        self.setMinimumSize(QSize(260, 260))
        self.setMaximumSize(16777215, 16777215)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

    def eventFilter(self, watched, event):
        if watched in (self, self.header, self.title_label):
            if event.type() == QEvent.MouseButtonPress and event.button() == Qt.LeftButton:
                self._press(event.globalPos())
                return watched in (self.header, self.title_label)
            if event.type() == QEvent.MouseMove:
                self._move(event.globalPos())
                return self.dragging
            if event.type() == QEvent.MouseButtonRelease:
                was_dragging = self.dragging
                self._release()
                return was_dragging
        return super().eventFilter(watched, event)

    def _press(self, global_pos):
        self.press_global_pos = global_pos
        top_left = self.mapToGlobal(QPoint(0, 0))
        if self.floating_window:
            top_left = self.floating_window.frameGeometry().topLeft()
        self.drag_offset = global_pos - top_left
        self.long_press_timer.start(self.LONG_PRESS_MS)

    def _move(self, global_pos):
        if self.dragging and self.floating_window:
            self.floating_window.move(global_pos - self.drag_offset)
            return
        if self.long_press_timer.isActive() and (global_pos - self.press_global_pos).manhattanLength() > 10:
            self.long_press_timer.stop()

    def _release(self):
        self.long_press_timer.stop()
        self.dragging = False

    def _begin_drag(self):
        cursor = QCursor.pos()
        if self.docked:
            self.hub.float_card(self)
        if not self.floating_window:
            return
        self.dragging = True
        self.floating_window.raise_()
        self.floating_window.activateWindow()
        self.floating_window.move(cursor - self.drag_offset)

    def request_dock(self):
        self.hub.dock_card(self)

    def toggle_pinned(self):
        if self.docked:
            self.hub.float_card(self)
            return
        if self.floating_window:
            pinned = self.floating_window.toggle_pinned()
            self.pin_button.setIcon(FIF.PIN if pinned else FIF.UNPIN)

    def request_delete(self):
        self.hub.remove_card(self)


class FloatingWidgetWindow(TransparentWindow):
    def __init__(self, hub, card):
        super().__init__(None)
        self.hub = hub
        self.card = card
        self.pinned = True
        self.setWindowTitle(card.title_text)
        self.setStyleSheet(APP_QSS)
        root = QVBoxLayout(self)
        root.setContentsMargins(8, 8, 8, 8)
        root.setSpacing(0)
        card.prepare_for_float()
        card.setParent(self)
        card.docked = False
        card.floating_window = self
        card.dock_button.show()
        card.pin_button.setIcon(FIF.PIN)
        root.addWidget(card, 1)
        grip_row = QHBoxLayout()
        grip_row.setContentsMargins(0, 0, 0, 0)
        grip_row.addStretch(1)
        grip_row.addWidget(QSizeGrip(self))
        root.addLayout(grip_row)
        self.setMinimumSize(278, 294)

    def toggle_pinned(self):
        self.pinned = not self.pinned
        flags = Qt.Tool | Qt.FramelessWindowHint
        if self.pinned:
            flags |= Qt.WindowStaysOnTopHint
        pos = self.pos()
        self.setWindowFlags(flags)
        self.move(pos)
        self.show()
        return self.pinned


class DesktopWidgetsHub(TransparentWindow):
    def __init__(self, store):
        super().__init__(None)
        self.store = store
        self.cards = {}
        self.slots = {}
        self.floating = {}
        self.drag_pos = None
        self._build_ui()
        self._place_on_screen()

    def _build_ui(self):
        self.setWindowTitle("Flow Todo 桌面小组件")
        self.setStyleSheet(APP_QSS)
        root = QVBoxLayout(self)
        root.setContentsMargins(8, 8, 8, 8)
        root.setSpacing(0)

        self.panel = QFrame()
        self.panel.setObjectName("HubPanel")
        panel_layout = QVBoxLayout(self.panel)
        panel_layout.setContentsMargins(22, 22, 22, 16)
        panel_layout.setSpacing(16)

        self.header = QWidget()
        header = QHBoxLayout(self.header)
        header.setContentsMargins(0, 0, 0, 0)
        self.title = QLabel("Flow Todo")
        self.title.setObjectName("HubTitle")
        close_button = icon_button(FIF.CLOSE, "关闭小组件组")
        close_button.clicked.connect(QApplication.quit)
        header.addWidget(self.title)
        header.addStretch(1)
        header.addWidget(close_button)
        panel_layout.addWidget(self.header)

        self.grid = QGridLayout()
        self.grid.setContentsMargins(0, 0, 0, 0)
        self.grid.setSpacing(16)
        self.grid.setColumnStretch(0, 1)
        self.grid.setColumnStretch(1, 1)

        body = QWidget()
        body_layout = QVBoxLayout(body)
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.addLayout(self.grid)
        body_layout.addStretch(1)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll.setWidget(body)
        self.scroll_area = scroll
        panel_layout.addWidget(scroll, 1)

        grip = QHBoxLayout()
        grip.addStretch(1)
        grip.addWidget(QSizeGrip(self))
        panel_layout.addLayout(grip)
        root.addWidget(self.panel)

        self._add_card("todo", "当前待办", TodoContent(self.store), 0, 0)
        self._add_card("pomodoro", "番茄钟", PomodoroContent(self.store), 0, 1)
        self._add_card("weather", "时间与天气", WeatherContent(self.store), 1, 0)
        self._add_card("hydration", "喝水提醒", HydrationContent(self.store), 1, 1)

        self.setMinimumSize(640, 700)
        self.resize(720, 780)
        for widget in (self.header, self.title):
            widget.installEventFilter(self)
        QTimer.singleShot(0, self.sync_card_sizes)

    def _add_card(self, key, title, content, row, col):
        card = DesktopWidgetCard(self, key, title, content)
        self.cards[key] = card
        self.slots[key] = (row, col)
        self.grid.addWidget(card, row, col)
        self.sync_card_sizes()

    def sync_card_sizes(self):
        width = self.scroll_area.viewport().width() or max(0, self.width() - 84)
        side = max(260, int((width - self.grid.horizontalSpacing()) / 2))
        for card in self.cards.values():
            if card.docked:
                card.prepare_for_dock(side)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self.sync_card_sizes()

    def _remove_from_grid(self, card):
        index = self.grid.indexOf(card)
        if index >= 0:
            self.grid.takeAt(index)

    def float_card(self, card):
        if not card.docked or card.key not in self.cards:
            return
        pos = card.mapToGlobal(QPoint(0, 0))
        self._remove_from_grid(card)
        window = FloatingWidgetWindow(self, card)
        window.resize(328, 344)
        window.move(pos - QPoint(8, 8))
        self.floating[card.key] = window
        window.show()
        window.raise_()

    def dock_card(self, card):
        if card.key not in self.cards:
            return
        window = self.floating.pop(card.key, None)
        if window:
            window.card = None
            window.hide()
        card.hide()
        card.setParent(self.panel)
        card.docked = True
        card.floating_window = None
        card.dock_button.hide()
        card.pin_button.setIcon(FIF.PIN)
        row, col = self.slots.get(card.key, (0, 0))
        self.grid.addWidget(card, row, col)
        self.sync_card_sizes()
        card.show()
        if window:
            window.deleteLater()

    def remove_card(self, card):
        self._remove_from_grid(card)
        window = self.floating.pop(card.key, None)
        if window:
            window.card = None
            window.close()
        self.cards.pop(card.key, None)
        card.deleteLater()

    def eventFilter(self, watched, event):
        if watched in (self.header, self.title):
            if event.type() == QEvent.MouseButtonPress and event.button() == Qt.LeftButton:
                self.drag_pos = event.globalPos() - self.frameGeometry().topLeft()
                return True
            if event.type() == QEvent.MouseMove and self.drag_pos is not None:
                self.move(event.globalPos() - self.drag_pos)
                return True
            if event.type() == QEvent.MouseButtonRelease:
                self.drag_pos = None
                return True
        return super().eventFilter(watched, event)

    def _place_on_screen(self):
        screen = QApplication.primaryScreen()
        if screen:
            rect = screen.availableGeometry()
            self.move(rect.right() - self.width() - 24, rect.top() + 48)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default=app_data_dir())
    args = parser.parse_args()

    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
    app = QApplication([])
    setTheme(Theme.LIGHT)
    store = JsonStore(args.data_dir)
    hub = DesktopWidgetsHub(store)
    hub.show()
    raise SystemExit(app.exec_())


if __name__ == "__main__":
    main()
