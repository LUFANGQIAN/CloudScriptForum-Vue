## 部署选项
- Docker（推荐）：项目已提供 `Dockerfile`、`default.conf`、`docker.sh`，用 Nginx 托管 `dist` 静态文件并反向代理后端。
- 纯 Nginx 静态托管：在服务器安装 Nginx，直接部署 `dist` 目录，自建反向代理到后端。

## 前提条件
- 后端地址与端口（示例：`http://<backend-host>:5000`）。
- 域名与证书（HTTPS，若同域部署则前端 `VITE_BACKEND_SERVER` 设为 `/api` 并用 Nginx反代）。
- 构建环境 Node ≥ 18，包管理器 `npm`（项目有 `package-lock.json`）。

## 生产构建
- 在本地或 CI：
  - `npm ci`
  - 根据需要调整 `.env.production`：
    - 同域反代：`VITE_BACKEND_SERVER=/api`
    - 跨域直连：`VITE_BACKEND_SERVER=https://api.example.com`
  - `npm run build`（生成 `dist/`）

## Docker 部署（推荐）
- 服务器安装 Docker。
- 上传代码（或仅上传 `dist/` 与 `default.conf`）。
- 构建镜像：`docker build -t sidifensen_admin .`
- 运行容器（标准 80 端口）：`docker run -d --name sidifensen_admin -p 80:80 sidifensen_admin`
- 如需沿用脚本端口：`docker run -d --name sidifensen_admin -p 8000:80 sidifensen_admin`
- 验证：浏览器访问 `http://<服务器IP或域名>/`。

## Nginx 反向代理配置
- 前端 `VITE_BACKEND_SERVER=/api` 时，在 `default.conf` 中添加：
```
server {
  listen 80;
  server_name <your-domain>;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://<backend-host>:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```
- 跨域直连（非同域）时：将 `VITE_BACKEND_SERVER` 设为后端完整地址，并确保后端开启 CORS。

## 纯 Nginx 静态托管（不使用 Docker）
- 复制 `dist/` 到服务器（如 `/var/www/cloudscript_admin`）。
- Nginx 站点：
```
server {
  listen 80;
  server_name <your-domain>;
  root /var/www/cloudscript_admin;
  index index.html;

  location /api/ {
    proxy_pass http://<backend-host>:5000/;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```
- 重载 Nginx：`sudo nginx -t && sudo systemctl reload nginx`。

## HTTPS 与安全
- 使用证书（Let’s Encrypt 或企业证书），在 Nginx 中配置 `listen 443 ssl;` 与证书路径。
- 将所有 80 流量重定向到 443。
- 设置安全头（`Content-Security-Policy`、`X-Frame-Options`、`X-Content-Type-Options`）。

## 运维与监控
- 容器日志：`docker logs -f sidifensen_admin`。
- Nginx 访问/错误日志：`/var/log/nginx/`。
- 健康检查：手动访问页面并观察浏览器控制台的 `/api` 请求是否 200。
- 回滚：保留上一版镜像或 `dist` 备份，故障时快速切换。

## 需要你确认的点
- 目标部署方式：Docker 还是纯 Nginx。
- 后端真实地址与端口，以及是否与前端同域。
- 域名与证书是否已就绪（是否需要我给出 HTTPS 配置片段）。