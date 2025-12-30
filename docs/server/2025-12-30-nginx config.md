---
slug: server-nginx-config
title: Nginx
authors: [ lianghchao ]
tags: [ server,nginx ]
---
## nginx配置伪静态代替createWebHashHistory()
```bash
# 请将伪静态规则或自定义NGINX配置填写到此处
# 伪静态规则不使用hash模式
location / {
    try_files $uri $uri/ /index.html;
}
# 后端接口
location /prod-api/ {
    proxy_pass http://127.0.0.1:8090/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
