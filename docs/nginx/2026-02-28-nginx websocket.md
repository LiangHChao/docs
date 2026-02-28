---
slug: nginx websocket
title: nginx websocket
authors: [ lianghchao ]
tags: [ nginx ]
---
- 为二级域名配置websocket支持
  - 添加nginx项目，域名: ihapi.tongfengkeji.com;

```config

# 请将伪静态规则或自定义NGINX配置填写到此处
 location / {

        proxy_pass http://127.0.0.1:8080;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
```

### frps配置

```config
bindPort = 7000
kcpBindPort = 7000
dashboardPwd = "zFxYb1bbwqSz0Hlz"
vhostHTTPPort = 8080
vhostHTTPSPort = 18080
maxPoolCount = 50
tcpmuxHTTPConnectPort = 16337

[webServer]
user = "TAGq600g"
password = "zFxYb1bbwqSz0Hlz"
port = 7001

[log]
file = "/var/log/frps.log"
level = "info"
maxDays = 30

[auth]
token = "j1HeKZCnqxGoKX8I"
```

### frpc配置

```config
serverAddr = "192.144.151.23" # 服务端ip
serverPort = 7000 # 服务端端口
auth.method = 'token' # 客户端访问验证方式
auth.token = 'j1HeKZCnqxGoKX8I' # 客户端访问验证密

[[proxies]]
name = "home-care"
type = "http"
localPort = 8003
remotePort = 8003
customDomains =["hcapi.tongfengkeji.com"]

[[proxies]]
name = "home-care-web"
type = "http"
localPort = 8103
remotePort = 8103
customDomains =["hcweb.tongfengkeji.com"]

[[proxies]]
name = "internet-hospital"
type = "http"
localPort = 8002
customDomains =["ihapi.tongfengkeji.com"]

[[proxies]]
name = "internet-hospital-web"
type = "http"
localPort = 8102
remotePort = 8102
customDomains =["ihweb.tongfengkeji.com"]
```