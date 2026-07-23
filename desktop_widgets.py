import importlib.util
import json
import threading
import urllib.parse
import urllib.request
from datetime import datetime

from PySide6.QtCore import QEvent, QPoint, QRectF, QSize, Qt, QTimer, Signal
from PySide6.QtGui import QColor, QCursor, QFont, QPainter, QPen
from PySide6.QtWidgets import (
    QApplication,
    QCheckBox,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QSizeGrip,
    QSizePolicy,
    QSpinBox,
    QStyle,
    QToolButton,
    QVBoxLayout,
    QWidget,
)


def _qfluent_is_pyside6():
    spec = importlib.util.find_spec("qfluentwidgets")
    if spec is None or not spec.origin:
        return False
    try:
        with open(spec.origin, "r", encoding="utf-8", errors="ignore") as f:
            init_source = f.read(12000)
    except OSError:
        return False
    if "PyQt" in init_source:
        return False
    return "PySide6" in init_source or "qtpy" in init_source or "PySide" in init_source


try:
    if not _qfluent_is_pyside6():
        raise ImportError("PySide6 qfluentwidgets binding is not installed")
    from qfluentwidgets import CheckBox, PrimaryPushButton, PushButton, SpinBox, ToolButton
except Exception:
    CheckBox = QCheckBox
    PrimaryPushButton = QPushButton
    PushButton = QPushButton
    SpinBox = QSpinBox
    ToolButton = QToolButton


APP_QSS = """
QWidget {
    background: transparent;
    color: #1D1B20;
    font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}
QFrame#HubPanel {
    background: rgba(253, 248, 253, 246);
    border: 1px solid rgba(202, 196, 208, 190);
    border-radius: 24px;
}
QFrame#HubHeader {
    background: transparent;
    border: none;
}
QFrame#WidgetHost {
    background: rgba(255, 255, 255, 248);
    border: 1px solid #E7E0EC;
    border-radius: 16px;
}
QFrame#WidgetHost[dragging="true"] {
    border: 2px solid #6750A4;
}
QLabel#HubTitle {
    font-size: 28px;
    font-weight: 800;
}
QLabel#WidgetTitle {
    font-size: 17px;
    font-weight: 800;
}
QLabel#TaskTitle {
    font-size: 14px;
    font-weight: 700;
}
QLabel#Muted {
    color: #625B71;
    font-size: 13px;
}
QLabel#Pill {
    min-width: 46px;
    padding: 6px 12px;
    border-radius: 18px;
    color: #381E72;
    background: #EADDFF;
    font-size: 16px;
    font-weight: 800;
}
QLabel#TimerText, QLabel#ClockText {
    font-size: 40px;
    font-weight: 800;
}
QLabel#CenterMuted {
    color: #625B71;
    font-size: 13px;
}
QWidget#TaskRow {
    background: #F7F2FA;
    border-radius: 10px;
}
QPushButton {
    min-height: 34px;
    padding: 0 16px;
    border-radius: 17px;
    border: 1px solid #CAC4D0;
    background: #FFFFFF;
    color: #1D1B20;
    font-weight: 700;
}
QPushButton[primary="true"] {
    background: #6750A4;
    color: white;
    border: none;
}
QPushButton#CompactButton {
    min-height: 32px;
    padding: 0 10px;
}
QToolButton {
    min-width: 34px;
    min-height: 34px;
    max-width: 34px;
    max-height: 34px;
    padding: 0 9px;
    border-radius: 17px;
    border: none;
    background: transparent;
    color: #49454F;
    font-weight: 800;
}
QToolButton:hover, QPushButton:hover {
    background: #F7F2FA;
}
QScrollArea {
    background: transparent;
    border: none;
}
QScrollBar:vertical, QScrollBar:horizontal {
    width: 0;
    height: 0;
}
QSizeGrip {
    width: 18px;
    height: 18px;
    background: transparent;
}
"""


def _button(text="", primary=False):
    btn = (PrimaryPushButton if primary else PushButton)(text)
    btn.setProperty("primary", bool(primary))
    return btn


def _tool_button(text, tooltip=""):
    btn = ToolButton()
    btn.setText(text)
    btn.setToolTip(tooltip)
    return btn


def _icon_tool_button(icon, tooltip=""):
    btn = ToolButton()
    app = QApplication.instance()
    style = app.style() if app is not None else QApplication.style()
    btn.setIcon(style.standardIcon(icon))
    btn.setText("")
    btn.setToolTip(tooltip)
    btn.setFixedSize(34, 34)
    return btn


def _clear_layout(layout):
    while layout.count():
        item = layout.takeAt(0)
        widget = item.widget()
        child_layout = item.layout()
        if widget is not None:
            widget.deleteLater()
        elif child_layout is not None:
            _clear_layout(child_layout)


class TransparentWindow(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._allow_close = False
        self.setWindowFlags(
            Qt.WindowType.Tool
            | Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground, True)
        self.setAutoFillBackground(False)

    def closeEvent(self, event):
        if not self._allow_close:
            self.hide()
            event.ignore()
            return
        super().closeEvent(event)

    def shutdown(self):
        self._allow_close = True
        self.close()


class RingProgress(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._progress = 0.0
        self._text = ""
        self.setMinimumSize(144, 144)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

    def set_progress(self, value):
        self._progress = max(0.0, min(1.0, float(value)))
        self.update()

    def set_text(self, text):
        self._text = str(text)
        self.update()

    def paintEvent(self, event):
        side = max(48, min(self.width(), self.height()) - 18)
        rect = QRectF((self.width() - side) / 2, (self.height() - side) / 2, side, side)
        stroke = max(8, int(side * 0.08))
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setPen(QPen(QColor("#E8E0EC"), stroke, Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap))
        painter.drawArc(rect, 90 * 16, -360 * 16)
        painter.setPen(QPen(QColor("#6750A4"), stroke, Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap))
        painter.drawArc(rect, 90 * 16, int(-360 * self._progress * 16))
        if self._text:
            font = QFont("Microsoft YaHei")
            font.setBold(True)
            font.setPixelSize(max(28, int(side * 0.22)))
            painter.setFont(font)
            painter.setPen(QColor("#1D1B20"))
            painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, self._text)


class TodoContent(QWidget):
    def __init__(self, bridge, parent=None):
        super().__init__(parent)
        self.bridge = bridge
        self._build_ui()

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 4, 0, 0)
        layout.setSpacing(10)

        top = QHBoxLayout()
        top.addStretch(1)
        self.count_label = QLabel("0")
        self.count_label.setObjectName("Pill")
        top.addWidget(self.count_label)
        layout.addLayout(top)

        self.list_widget = QWidget()
        self.list_layout = QVBoxLayout(self.list_widget)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(8)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setWidget(self.list_widget)
        scroll.setMinimumHeight(230)
        layout.addWidget(scroll)

    def set_tasks(self, tasks):
        _clear_layout(self.list_layout)
        pending = [task for task in tasks if not bool(task.get("done"))]
        self.count_label.setText(str(len(pending)))
        if not pending:
            empty = QLabel("今天没有待办")
            empty.setObjectName("Muted")
            empty.setAlignment(Qt.AlignmentFlag.AlignCenter)
            empty.setMinimumHeight(90)
            self.list_layout.addWidget(empty)
            return

        for task in pending[:7]:
            row = QWidget()
            row.setObjectName("TaskRow")
            row_layout = QHBoxLayout(row)
            row_layout.setContentsMargins(10, 9, 10, 9)
            row_layout.setSpacing(10)

            checkbox = CheckBox()
            checkbox.setToolTip("完成待办")
            title = QLabel(str(task.get("title") or "未命名任务"))
            title.setObjectName("TaskTitle")
            title.setWordWrap(True)
            meta = QLabel(str(task.get("meta") or ""))
            meta.setObjectName("Muted")
            meta.setWordWrap(True)

            text_box = QVBoxLayout()
            text_box.setContentsMargins(0, 0, 0, 0)
            text_box.setSpacing(2)
            text_box.addWidget(title)
            if task.get("meta"):
                text_box.addWidget(meta)

            task_id = task.get("id")
            checkbox.toggled.connect(lambda checked, tid=task_id: self._toggle_task(tid, checked))
            row_layout.addWidget(checkbox, 0, Qt.AlignmentFlag.AlignTop)
            row_layout.addLayout(text_box, 1)
            self.list_layout.addWidget(row)

        self.list_layout.addStretch(1)

    def _toggle_task(self, task_id, checked):
        if task_id is None or self.bridge is None:
            return
        try:
            self.bridge.toggle_task_status(float(task_id), bool(checked))
        except Exception as e:
            print(f"[DesktopWidgets] toggle task failed: {e}")


class PomodoroContent(QWidget):
    def __init__(self, bridge, parent=None):
        super().__init__(parent)
        self.bridge = bridge
        self.total_seconds = max(1, int(self._focus_minutes()) * 60)
        self.remaining_seconds = self.total_seconds
        self.running = False
        self._build_ui()
        self.timer = QTimer(self)
        self.timer.setInterval(1000)
        self.timer.timeout.connect(self._tick)
        self._update_display()

    def _focus_minutes(self):
        try:
            return int(getattr(self.bridge, "settings_database", {}).get("focusDuration", 25))
        except Exception:
            return 25

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)

        self.state_label = QLabel("准备专注")
        self.state_label.setObjectName("CenterMuted")
        self.state_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.state_label)

        self.ring = RingProgress()
        layout.addWidget(self.ring, 1, Qt.AlignmentFlag.AlignCenter)

        controls = QHBoxLayout()
        controls.setSpacing(8)
        self.minus_button = _button("-5")
        self.start_button = _button("开始", primary=True)
        self.reset_button = _button("重置")
        self.plus_button = _button("+5")
        for button in (self.minus_button, self.start_button, self.reset_button, self.plus_button):
            button.setObjectName("CompactButton")
            button.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.minus_button.clicked.connect(lambda: self.adjust_minutes(-5))
        self.start_button.clicked.connect(self.toggle)
        self.reset_button.clicked.connect(self.reset)
        self.plus_button.clicked.connect(lambda: self.adjust_minutes(5))
        controls.addWidget(self.minus_button)
        controls.addWidget(self.start_button)
        controls.addWidget(self.reset_button)
        controls.addWidget(self.plus_button)
        layout.addLayout(controls)

    def toggle(self):
        if self.running:
            self.running = False
            self.timer.stop()
            self.start_button.setText("继续")
            self.state_label.setText("已暂停")
            return
        self.running = True
        self.timer.start()
        self.start_button.setText("暂停")
        self.state_label.setText("专注中")

    def reset(self):
        self.running = False
        self.timer.stop()
        self.total_seconds = max(1, int(self._focus_minutes()) * 60)
        self.remaining_seconds = self.total_seconds
        self.start_button.setText("开始")
        self.state_label.setText("准备专注")
        self._update_display()

    def adjust_minutes(self, delta):
        if self.running:
            return
        minutes = max(5, min(90, int(round(self.total_seconds / 60)) + delta))
        self.total_seconds = minutes * 60
        self.remaining_seconds = self.total_seconds
        self._update_display()

    def _tick(self):
        self.remaining_seconds = max(0, self.remaining_seconds - 1)
        self._update_display()
        if self.remaining_seconds <= 0:
            self.timer.stop()
            self.running = False
            self.start_button.setText("开始")
            self.state_label.setText("已完成")
            QApplication.beep()
            if self.bridge is not None:
                try:
                    self.bridge.record_local_focus_session(float(self.total_seconds))
                except Exception:
                    pass

    def _update_display(self):
        minutes = self.remaining_seconds // 60
        seconds = self.remaining_seconds % 60
        self.ring.set_text(f"{minutes:02d}:{seconds:02d}")
        self.ring.set_progress(1.0 - (self.remaining_seconds / max(1, self.total_seconds)))


class WeatherContent(QWidget):
    weatherResult = Signal(str)

    def __init__(self, bridge, parent=None):
        super().__init__(parent)
        self.bridge = bridge
        self._weather_loading = False
        self._build_ui()
        self.clock_timer = QTimer(self)
        self.clock_timer.setInterval(1000)
        self.clock_timer.timeout.connect(self._update_time)
        self.clock_timer.start()
        self.weather_timer = QTimer(self)
        self.weather_timer.setInterval(30 * 60 * 1000)
        self.weather_timer.timeout.connect(self.refresh_weather)
        self.weather_timer.start()
        self.weatherResult.connect(self._set_weather_text)
        self._update_time()
        QTimer.singleShot(1200, self.refresh_weather)

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 4, 0, 0)
        layout.setSpacing(8)

        top = QHBoxLayout()
        top.addStretch(1)
        refresh = _icon_tool_button(QStyle.StandardPixmap.SP_BrowserReload, "刷新天气")
        refresh.clicked.connect(self.refresh_weather)
        top.addWidget(refresh)
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

    def _update_time(self):
        now = datetime.now()
        self.time_label.setText(now.strftime("%H:%M"))
        self.date_label.setText(now.strftime("%Y-%m-%d  %A"))

    def _set_weather_text(self, text):
        try:
            self.weather_label.setText(text)
        except RuntimeError:
            pass

    def _emit_weather_result(self, text):
        try:
            self.weatherResult.emit(text)
        except RuntimeError:
            pass

    def refresh_weather(self):
        if self._weather_loading:
            return
        self._weather_loading = True
        self.weather_label.setText("天气加载中...")

        def worker():
            try:
                city = str(getattr(self.bridge, "settings_database", {}).get("weatherCity", "") or "").strip()
                location = urllib.parse.quote(city) if city else ""
                url = f"https://wttr.in/{location}?format=3&m&lang=zh"
                req = urllib.request.Request(url, headers={"User-Agent": "FlowTodo/1.0"})
                with urllib.request.urlopen(req, timeout=6) as resp:
                    text = resp.read().decode("utf-8", errors="replace").strip()
                self._emit_weather_result(text or "暂无天气数据")
            except Exception:
                self._emit_weather_result("天气暂时不可用")
            finally:
                self._weather_loading = False

        threading.Thread(target=worker, daemon=True).start()


class HydrationContent(QWidget):
    def __init__(self, bridge, parent=None):
        super().__init__(parent)
        self.bridge = bridge
        self._build_ui()
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._remind)

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 12, 0, 0)
        layout.setSpacing(14)

        self.status_label = QLabel("未开启")
        self.status_label.setObjectName("Muted")
        layout.addWidget(self.status_label)

        row = QHBoxLayout()
        self.interval_spin = SpinBox()
        self.interval_spin.setRange(15, 180)
        self.interval_spin.setValue(45)
        self.interval_spin.setSuffix(" 分钟")
        self.start_button = _button("开启", primary=True)
        self.start_button.clicked.connect(self.toggle)
        row.addWidget(self.interval_spin, 1)
        row.addWidget(self.start_button)
        layout.addLayout(row)
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

    def _remind(self):
        QApplication.beep()


class WidgetHost(QFrame):
    LONG_PRESS_MS = 360

    def __init__(self, hub, key, title, content, wide=False):
        super().__init__(hub)
        self.hub = hub
        self.key = key
        self.title_text = title
        self.content = content
        self.wide = wide
        self.docked = True
        self.dragging = False
        self.floating_window = None
        self.press_global_pos = QPoint()
        self.drag_offset = QPoint()
        self.long_press_timer = QTimer(self)
        self.long_press_timer.setSingleShot(True)
        self.long_press_timer.timeout.connect(self._begin_drag)
        self._build_ui()

    def _build_ui(self):
        self.setObjectName("WidgetHost")
        self.setProperty("dragging", False)
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 14, 16, 16)
        layout.setSpacing(8)

        self.header = QWidget()
        header_layout = QHBoxLayout(self.header)
        header_layout.setContentsMargins(0, 0, 0, 0)
        header_layout.setSpacing(8)

        self.title_label = QLabel(self.title_text)
        self.title_label.setObjectName("WidgetTitle")
        self.title_label.setToolTip("长按拖出为独立桌面小组件")
        self.title_label.setMinimumWidth(0)
        self.dock_button = _tool_button("收回", "收回到主窗口")
        self.pin_button = _tool_button("固定", "固定到桌面")
        self.delete_button = _tool_button("删除", "删除这个小组件")
        self.dock_button.clicked.connect(self.request_dock)
        self.pin_button.clicked.connect(self.toggle_pinned)
        self.delete_button.clicked.connect(self.request_delete)
        self.dock_button.hide()

        header_layout.addWidget(self.title_label)
        header_layout.addStretch(1)
        header_layout.addWidget(self.dock_button)
        header_layout.addWidget(self.pin_button)
        header_layout.addWidget(self.delete_button)
        layout.addWidget(self.header)
        layout.addWidget(self.content, 1)

        for widget in (self, self.header, self.title_label):
            widget.installEventFilter(self)

    def eventFilter(self, watched, event):
        if watched in (self, self.header, self.title_label):
            if event.type() == QEvent.Type.MouseButtonPress and event.button() == Qt.MouseButton.LeftButton:
                self._press(event.globalPosition().toPoint())
                return watched in (self.header, self.title_label)
            if event.type() == QEvent.Type.MouseMove:
                self._move(event.globalPosition().toPoint())
                return self.dragging
            if event.type() == QEvent.Type.MouseButtonRelease:
                was_dragging = self.dragging
                self._release()
                return was_dragging
        return super().eventFilter(watched, event)

    def _press(self, global_pos):
        self.press_global_pos = global_pos
        top_left = self.mapToGlobal(QPoint(0, 0))
        if self.floating_window is not None:
            top_left = self.floating_window.frameGeometry().topLeft()
        self.drag_offset = global_pos - top_left
        self.long_press_timer.start(self.LONG_PRESS_MS)

    def _move(self, global_pos):
        if self.dragging and self.floating_window is not None:
            self.floating_window.move(global_pos - self.drag_offset)
            return
        if self.long_press_timer.isActive() and (global_pos - self.press_global_pos).manhattanLength() > 10:
            self.long_press_timer.stop()

    def _release(self):
        self.long_press_timer.stop()
        if not self.dragging:
            return
        self.dragging = False
        self.setProperty("dragging", False)
        self.style().unpolish(self)
        self.style().polish(self)

    def _begin_drag(self):
        cursor_pos = QCursor.pos()
        if self.docked:
            self.hub.float_card(self)
        if self.floating_window is None:
            return
        self.dragging = True
        self.setProperty("dragging", True)
        self.style().unpolish(self)
        self.style().polish(self)
        self.floating_window.raise_()
        self.floating_window.activateWindow()
        self.floating_window.move(cursor_pos - self.drag_offset)

    def request_dock(self):
        if not self.docked:
            self.hub.dock_card(self)

    def toggle_pinned(self):
        if self.docked:
            self.hub.float_card(self)
            return
        if self.floating_window is not None:
            pinned = self.floating_window.toggle_pinned()
            self.pin_button.setText("固定" if pinned else "自由")

    def request_delete(self):
        self.hub.remove_card(self)

    def prepare_for_dock(self, side):
        self.setMinimumSize(QSize(side, side))
        self.setMaximumHeight(side)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

    def prepare_for_float(self):
        self.setMinimumSize(self.hub.widget_minimum_size(self.key))
        self.setMaximumSize(16777215, 16777215)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)


class FloatingWidgetWindow(TransparentWindow):
    def __init__(self, hub, host):
        super().__init__(None)
        self.hub = hub
        self.host = host
        self.pinned = True
        self.setWindowTitle(host.title_text)
        self.setStyleSheet(APP_QSS)
        root = QVBoxLayout(self)
        root.setContentsMargins(8, 8, 8, 8)
        root.setSpacing(0)
        root.addWidget(host)
        grip_row = QHBoxLayout()
        grip_row.setContentsMargins(0, 0, 0, 0)
        grip_row.addStretch(1)
        grip_row.addWidget(QSizeGrip(self))
        root.addLayout(grip_row)
        host.setParent(self)
        host.docked = False
        host.floating_window = self
        host.dock_button.show()
        host.pin_button.setText("固定")
        self.setMinimumSize(self.hub.widget_minimum_size(host.key))
        self.adjustSize()

    def toggle_pinned(self):
        self.pinned = not self.pinned
        flags = Qt.WindowType.Tool | Qt.WindowType.FramelessWindowHint
        if self.pinned:
            flags |= Qt.WindowType.WindowStaysOnTopHint
        pos = self.pos()
        self.setWindowFlags(flags)
        self.move(pos)
        self.show()
        return self.pinned

    def closeEvent(self, event):
        if not self._allow_close:
            self.hide()
            event.ignore()
            return
        if self.host is not None and self.host.key in self.hub.cards:
            self.hub.remove_card(self.host, delete_later=False)
        super().closeEvent(event)


class DesktopWidgetsWindow(TransparentWindow):
    WIDGET_KEYS = ("todo", "pomodoro", "weather", "hydration")

    def __init__(self, backend_bridge, parent=None):
        super().__init__(parent)
        self.backend_bridge = backend_bridge
        self.cards = {}
        self.card_slots = {}
        self.floating_windows = {}
        self._build_ui()
        self._connect_backend()
        self.refresh_tasks()
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
        panel_layout.setContentsMargins(22, 22, 22, 22)
        panel_layout.setSpacing(16)

        self.header = QWidget()
        header_layout = QHBoxLayout(self.header)
        header_layout.setContentsMargins(0, 0, 0, 0)
        self.hub_title = QLabel("Flow Todo")
        self.hub_title.setObjectName("HubTitle")
        self.close_button = _tool_button("x", "隐藏主窗口")
        self.close_button.clicked.connect(self.hide)
        header_layout.addWidget(self.hub_title)
        header_layout.addStretch(1)
        header_layout.addWidget(self.close_button)
        panel_layout.addWidget(self.header)

        self.small_grid = QGridLayout()
        self.small_grid.setContentsMargins(0, 0, 0, 0)
        self.small_grid.setSpacing(16)
        self.small_grid.setColumnStretch(0, 1)
        self.small_grid.setColumnStretch(1, 1)
        self.small_grid.setRowStretch(0, 1)
        self.small_grid.setRowStretch(1, 1)

        self.body_widget = QWidget()
        body_layout = QVBoxLayout(self.body_widget)
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(16)
        body_layout.addLayout(self.small_grid)
        body_layout.addStretch(1)

        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QFrame.Shape.NoFrame)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.scroll_area.setWidget(self.body_widget)
        panel_layout.addWidget(self.scroll_area, 1)

        grip_row = QHBoxLayout()
        grip_row.setContentsMargins(0, 0, 0, 0)
        grip_row.addStretch(1)
        grip_row.addWidget(QSizeGrip(self))
        panel_layout.addLayout(grip_row)
        root.addWidget(self.panel)

        self._add_card("todo", "当前待办", TodoContent(self.backend_bridge), row=0, col=0)
        self._add_card("pomodoro", "番茄钟", PomodoroContent(self.backend_bridge), row=0, col=1)
        self._add_card("weather", "时间与天气", WeatherContent(self.backend_bridge), row=1, col=0)
        self._add_card("hydration", "喝水提醒", HydrationContent(self.backend_bridge), row=1, col=1)

        self.setMinimumSize(640, 700)
        self.resize(720, 780)
        for widget in (self.header, self.hub_title):
            widget.installEventFilter(self)
        QTimer.singleShot(0, self._sync_docked_card_sizes)

    def _add_card(self, key, title, content, wide=False, row=0, col=0):
        host = WidgetHost(self, key, title, content, wide=wide)
        host.setMinimumSize(self.widget_minimum_size(key))
        host.resize(self.widget_preferred_size(key))
        self.cards[key] = host
        self.card_slots[key] = {"wide": False, "row": row, "col": col}
        self.small_grid.addWidget(host, row, col)
        self._sync_docked_card_sizes()

    def _connect_backend(self):
        try:
            self.backend_bridge.signalTasksUpdated.connect(self._on_tasks_updated)
        except Exception:
            pass

    def widget_preferred_size(self, key):
        return QSize(312, 312)

    def widget_minimum_size(self, key):
        return QSize(260, 260)

    def _place_on_screen(self):
        screen = QApplication.primaryScreen()
        if screen is None:
            return
        rect = screen.availableGeometry()
        self.move(rect.right() - self.width() - 24, rect.top() + 48)

    def _remove_from_layout(self, host):
        index = self.small_grid.indexOf(host)
        if index >= 0:
            self.small_grid.takeAt(index)
            return

    def _sync_docked_card_sizes(self):
        if not hasattr(self, "scroll_area"):
            return
        viewport_width = self.scroll_area.viewport().width()
        if viewport_width <= 0:
            viewport_width = max(0, self.width() - 84)
        spacing = max(0, self.small_grid.horizontalSpacing())
        side = max(260, int((viewport_width - spacing) / 2))
        for host in self.cards.values():
            if host.docked:
                host.prepare_for_dock(side)

    def float_card(self, host):
        if host.key not in self.cards or not host.docked:
            return
        old_top_left = host.mapToGlobal(QPoint(0, 0))
        self._remove_from_layout(host)
        host.prepare_for_float()
        floating = FloatingWidgetWindow(self, host)
        floating.resize(self.widget_preferred_size(host.key) + QSize(16, 34))
        floating.move(old_top_left - QPoint(8, 8))
        self.floating_windows[host.key] = floating
        floating.show()
        floating.raise_()

    def dock_card(self, host):
        if host.key not in self.cards:
            return
        floating = self.floating_windows.pop(host.key, None)
        if floating is not None:
            floating.host = None
            floating._allow_close = True
            floating.hide()
        host.hide()
        host.setParent(self.panel)
        host.docked = True
        host.dragging = False
        host.floating_window = None
        host.dock_button.hide()
        host.pin_button.setText("固定")
        slot = self.card_slots.get(host.key, {})
        self.small_grid.addWidget(host, int(slot.get("row", 0)), int(slot.get("col", 0)))
        self._sync_docked_card_sizes()
        host.show()
        if floating is not None:
            floating.close()

    def remove_card(self, host, delete_later=True):
        self._remove_from_layout(host)
        floating = self.floating_windows.pop(host.key, None)
        if floating is not None:
            floating.host = None
            floating._allow_close = True
            floating.close()
        self.cards.pop(host.key, None)
        if delete_later:
            host.deleteLater()

    def _on_tasks_updated(self, payload):
        try:
            tasks = json.loads(payload or "[]")
        except Exception:
            tasks = []
        self._set_tasks(tasks)

    def _set_tasks(self, tasks):
        host = self.cards.get("todo")
        if host is not None and isinstance(host.content, TodoContent):
            host.content.set_tasks(tasks)

    def refresh_tasks(self):
        try:
            tasks = list(getattr(self.backend_bridge, "local_database", []) or [])
        except Exception:
            tasks = []
        self._set_tasks(tasks)

    def show_hub(self):
        self.refresh_tasks()
        self.show()
        self.raise_()
        self.activateWindow()

    def eventFilter(self, watched, event):
        if watched in (self.header, self.hub_title):
            if event.type() == QEvent.Type.MouseButtonPress and event.button() == Qt.MouseButton.LeftButton:
                self._drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
                return True
            if event.type() == QEvent.Type.MouseMove and getattr(self, "_drag_pos", None) is not None:
                self.move(event.globalPosition().toPoint() - self._drag_pos)
                return True
            if event.type() == QEvent.Type.MouseButtonRelease:
                self._drag_pos = None
                return True
        return super().eventFilter(watched, event)

    def closeEvent(self, event):
        if not self._allow_close:
            self.hide()
            event.ignore()
            return
        for floating in list(self.floating_windows.values()):
            floating.host = None
            floating._allow_close = True
            floating.close()
        self.floating_windows.clear()
        super().closeEvent(event)

    def shutdown(self):
        self._allow_close = True
        for floating in list(self.floating_windows.values()):
            floating.host = None
            floating._allow_close = True
            floating.close()
        self.floating_windows.clear()
        self.close()
