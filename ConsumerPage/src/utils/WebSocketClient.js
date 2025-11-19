import { GetJwt } from "@/utils/Auth";
import { ElMessage } from "element-plus";

class WebSocketClient {
  constructor() {
    this.ws = null; // WebSocket 实例
    this.url = ""; // WebSocket URL
    this.reconnectTimer = null; // 重连定时器
    this.heartbeatTimer = null; // 心跳定时器
    this.isManualClose = false; // 是否手动关闭 (用于判断是否需要自动重连)
    this.messageHandlers = new Map(); // 消息处理器 (观察者模式)
    this.pendingMessages = []
    this.connecting = false
  }

  /**
   * 连接 WebSocket
   */
  connect() {
    const token = GetJwt();
    if (!token) {
      console.error("WebSocket 连接失败：token 为空");
      ElMessage.error("未登录或令牌失效，无法建立私信连接")
      return;
    }

    // 如果已经有连接，先关闭
    if (this.ws) {
      console.log("WebSocket 已存在，先关闭旧连接");
      this.close();
    }

    const httpUrl = import.meta.env.VITE_BACKEND_SERVER || "http://localhost:5000"
    let wsUrl = ""
    const useApiPrefix = (u) => {
      if (!u) return true
      const trimmed = u.endsWith("/") ? u.slice(0, -1) : u
      return !(trimmed.endsWith("/api") || trimmed === "/api")
    }
    const wsPath = useApiPrefix(httpUrl) ? "/api/ws/message" : "/ws/message"

    if (httpUrl.startsWith("http://") || httpUrl.startsWith("https://")) {
      const wsBase = httpUrl.startsWith("https://")
        ? httpUrl.replace(/^https:\/\//, "wss://")
        : httpUrl.replace(/^http:\/\//, "ws://")
      wsUrl = `${wsBase.replace(/\/$/, "")}${wsPath}?token=${token}`
    } else if (httpUrl.startsWith("/")) {
      const proto = window.location.protocol === "https:" ? "wss" : "ws"
      const host = window.location.host
      const basePath = httpUrl.replace(/\/$/, "")
      wsUrl = `${proto}://${host}${basePath}${wsPath === "/ws/message" ? "" : ""}${wsPath}?token=${token}`
    } else {
      const proto = window.location.protocol === "https:" ? "wss" : "ws"
      const host = window.location.host
      wsUrl = `${proto}://${host}${wsPath}?token=${token}`
    }
    this.url = wsUrl;
    // 是否手动关闭
    this.isManualClose = false;
    this.connecting = true

    try {
      console.info("正在建立 WebSocket 连接:", this.url)
      this.ws = new WebSocket(wsUrl);

      // 连接成功
      this.ws.onopen = () => {
        // 开始心跳
        this.startHeartbeat();
        this.connecting = false
        if (this.pendingMessages.length > 0) {
          const queue = [...this.pendingMessages]
          this.pendingMessages = []
          queue.forEach((msg) => {
            const json = JSON.stringify(msg)
            this.ws.send(json)
            if (msg.type !== "HEARTBEAT") {
              console.log("发送 WebSocket 消息:", msg)
            }
          })
          ElMessage.success("已恢复连接，排队消息已发送")
        }
        // 触发连接成功事件
        this.triggerHandler("open");
      };

      // 处理收到的消息
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 处理收到的消息
          this.handleMessage(data);
        } catch (error) {
          console.error("解析 WebSocket 消息失败:", error);
        }
      };

      // 连接错误
      this.ws.onerror = (error) => {
        console.error("WebSocket 错误:", error);
        // 触发连接错误事件
        this.triggerHandler("error", error);
        this.connecting = false
      };

      // 连接关闭
      this.ws.onclose = () => {
        // 停止心跳
        this.stopHeartbeat();
        // 触发连接关闭事件
        this.triggerHandler("close");
        this.connecting = false

        // 如果非手动关闭，则自动重连
        if (!this.isManualClose) {
          // 自动重连
          this.reconnect();
        }
      };
    } catch (error) {
      console.error("创建 WebSocket 连接失败:", error);
      this.connecting = false
    }
  }

  /**
   * 发送消息
   */
  send(message) {
    // 如果连接已建立，直接发送消息
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(message);
      this.ws.send(json);
      // 心跳消息不打印日志，避免控制台刷屏
      if (message.type !== "HEARTBEAT") {
        console.log("发送 WebSocket 消息:", message);
      }
    } else {
      this.pendingMessages.push(message)
      if (!this.connecting) {
        console.log("WebSocket 未连接，尝试自动连接...")
        this.connect()
      }
      if (message.type !== "HEARTBEAT") {
        ElMessage.warning("网络异常，消息已排队，连接恢复后自动发送")
      }
    }
  }

  /**
   * 发送文本消息
   */
  sendTextMessage(toUserId, content) {
    this.send({
      type: "SEND_MESSAGE",
      toUserId,
      content,
      messageType: 1,
    });
  }

  /**
   * 发送图片消息
   */
  sendImageMessage(toUserId, imageUrl) {
    this.send({
      type: "SEND_MESSAGE",
      toUserId,
      content: "[图片]",
      messageType: 2,
      imageUrl,
    });
  }

  /**
   * 标记消息已读
   */
  markAsRead(targetUserId) {
    this.send({
      type: "READ_MESSAGE",
      targetUserId,
    });
  }

  /**
   * 撤回消息
   */
  revokeMessage(messageId) {
    this.send({
      type: "REVOKE_MESSAGE",
      messageId,
    });
  }

  /**
   * 处理收到的消息
   */
  handleMessage(data) {
    const { type } = data;

    // 如果是系统消息，显示通知
    if (type === "SYSTEM") {
      this.handleSystemNotification(data);
    }

    this.triggerHandler(type, data);
  }

  /**
   * 处理系统通知消息
   * @param {object} data - 系统通知数据
   */
  handleSystemNotification(data) {
    const { content, messageType } = data;

    // 根据消息类型显示不同的通知
    const typeMap = {
      1: "评论",
      2: "点赞",
      3: "收藏",
      4: "关注",
    };

    const typeName = typeMap[messageType] || "系统";

    // 使用 Element Plus 的通知组件显示
    if (window.ElNotification) {
      window.ElNotification({
        title: `${typeName}通知`,
        message: content,
        type: "info",
        duration: 4500,
        position: "top-right",
      });
    } else {
      console.log(`[系统通知] ${content}`);
    }
  }

  /**
   * 注册消息处理器（订阅）
   * @param {string} type - 消息类型（比如 "SEND_MESSAGE"）
   * @param {function} handler - 处理函数（当收到消息时要执行的函数）
   */
  on(type, handler) {
    // 第1步：检查这个消息类型是否已经有人订阅
    if (!this.messageHandlers.has(type)) {
      // 如果没有，创建一个空数组来存放订阅者
      this.messageHandlers.set(type, []);
    }

    // 第2步：把这个处理函数加入订阅列表
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * 移除消息处理器（取消订阅）
   * @param {string} type - 消息类型
   * @param {function} handler - 要移除的处理函数
   */
  off(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1); // 从数组中删除这个处理函数
      }
    }
  }

  /**
   * 触发消息处理器（发布通知）
   * @param {string} type - 消息类型
   * @param {object} data - 消息数据
   */
  triggerHandler(type, data) {
    // 检查是否有人订阅了这个消息类型
    if (this.messageHandlers.has(type)) {
      // 遍历所有订阅者，逐个通知
      this.messageHandlers.get(type).forEach((handler) => {
        handler(data); // 执行每个订阅者的处理函数
      });
    }
  }

  /**
   * 开始心跳
   */
  startHeartbeat() {
    // 先清理旧的心跳定时器
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "HEARTBEAT" });
    }, 30000); // 30秒一次心跳
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 重连
   */
  reconnect() {
    if (this.reconnectTimer) {
      return;
    }

    console.log("5秒后尝试重连...");
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  /**
   * 手动关闭连接
   */
  close() {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // 先移除事件监听，避免触发 onclose 导致自动重连
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// 导出单例
export default new WebSocketClient();
