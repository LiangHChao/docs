---
slug: docker-compose
title: Docker Compose 一键搭建 Spring Boot 项目环境
authors: [ lianghchao ]
tags: [ server,docker,springboot ]
---

## 简介
- 未验证
- 使用 Docker Compose 可以一键编排和启动 Spring Boot 项目所需的所有环境，包括 MySQL、Redis、RocketMQ、Nginx 等常用中间件。本文将详细介绍如何使用 Docker Compose 搭建完整的 Spring Boot 项目运行环境。

## 环境准备

### 安装 Docker 和 Docker Compose

**Windows/Mac:**
- 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Docker Desktop 自带 Docker Compose

**Linux:**
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

## 项目结构

```
project/
├── docker-compose.yml          # Docker Compose 配置文件
├── mysql/
│   ├── init/                   # MySQL 初始化脚本
│   │   └── init.sql
│   └── conf/
│       └── my.cnf              # MySQL 配置文件
├── redis/
│   └── redis.conf              # Redis 配置文件
├── nginx/
│   ├── nginx.conf              # Nginx 主配置
│   └── conf.d/
│       └── default.conf        # 站点配置
├── rocketmq/
│   └── broker.conf             # RocketMQ Broker 配置
└── app/
    ├── Dockerfile              # Spring Boot 应用 Dockerfile
    └── application.yml         # Spring Boot 配置
```

## Docker Compose 配置文件

### 完整的 docker-compose.yml

```yaml
version: '3.8'

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: springboot-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123456
      MYSQL_DATABASE: springboot_db
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
      TZ: Asia/Shanghai
    ports:
      - "3306:3306"
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
      - ./mysql/conf/my.cnf:/etc/mysql/conf.d/my.cnf
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - springboot-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: springboot-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./redis/data:/data
      - ./redis/redis.conf:/etc/redis/redis.conf
    command: redis-server /etc/redis/redis.conf
    networks:
      - springboot-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RocketMQ NameServer
  rocketmq-namesrv:
    image: apache/rocketmq:5.1.4
    container_name: rocketmq-namesrv
    restart: always
    ports:
      - "9876:9876"
    environment:
      JAVA_OPT: "-server -Xms512m -Xmx512m"
    command: sh mqnamesrv
    networks:
      - springboot-network

  # RocketMQ Broker
  rocketmq-broker:
    image: apache/rocketmq:5.1.4
    container_name: rocketmq-broker
    restart: always
    ports:
      - "10909:10909"
      - "10911:10911"
    environment:
      NAMESRV_ADDR: "rocketmq-namesrv:9876"
      JAVA_OPT: "-server -Xms512m -Xmx512m"
    volumes:
      - ./rocketmq/broker.conf:/home/rocketmq/broker.conf
      - ./rocketmq/logs:/home/rocketmq/logs
      - ./rocketmq/store:/home/rocketmq/store
    command: sh mqbroker -c /home/rocketmq/broker.conf
    depends_on:
      - rocketmq-namesrv
    networks:
      - springboot-network

  # RocketMQ Console
  rocketmq-console:
    image: apacherocketmq/rocketmq-console:2.0.0
    container_name: rocketmq-console
    restart: always
    ports:
      - "8180:8080"
    environment:
      JAVA_OPTS: "-Drocketmq.namesrv.addr=rocketmq-namesrv:9876 -Dcom.rocketmq.sendMessageWithVIPChannel=false"
    depends_on:
      - rocketmq-namesrv
    networks:
      - springboot-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: springboot-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/logs:/var/log/nginx
      - ./nginx/html:/usr/share/nginx/html
    depends_on:
      - springboot-app
    networks:
      - springboot-network

  # Spring Boot 应用
  springboot-app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: springboot-app
    restart: always
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/springboot_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
      SPRING_DATASOURCE_USERNAME: app_user
      SPRING_DATASOURCE_PASSWORD: app_password
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      ROCKETMQ_NAMESRV_ADDR: rocketmq-namesrv:9876
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      rocketmq-namesrv:
        condition: service_started
    networks:
      - springboot-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  springboot-network:
    driver: bridge

volumes:
  mysql-data:
  redis-data:
  rocketmq-logs:
  rocketmq-store:
```

## 配置文件详解

### MySQL 配置文件 (mysql/conf/my.cnf)

```ini
[mysqld]
# 字符集配置
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 连接配置
max_connections=200
max_connect_errors=10

# 查询缓存
query_cache_size=0
query_cache_type=0

# InnoDB 配置
innodb_buffer_pool_size=256M
innodb_log_file_size=128M
innodb_flush_log_at_trx_commit=1
innodb_lock_wait_timeout=50

# 日志配置
log_error=/var/log/mysql/error.log
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2

[client]
default-character-set=utf8mb4
```

### MySQL 初始化脚本 (mysql/init/init.sql)

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS springboot_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE springboot_db;

-- 创建用户表示例
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `email` VARCHAR(100) COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '手机号',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (`username`),
  INDEX idx_email (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 插入测试数据
INSERT INTO `user` (username, password, email, phone) VALUES 
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/sLenGcOqZia', 'admin@example.com', '13800138000'),
('test', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/sLenGcOqZia', 'test@example.com', '13800138001');
```

### Redis 配置文件 (redis/redis.conf)

```conf
# 绑定地址
bind 0.0.0.0

# 保护模式
protected-mode no

# 端口
port 6379

# 持久化配置
save 900 1
save 300 10
save 60 10000

# RDB 文件
dbfilename dump.rdb
dir /data

# AOF 持久化
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# 内存配置
maxmemory 256mb
maxmemory-policy allkeys-lru

# 日志
loglevel notice
logfile ""
```

### RocketMQ Broker 配置 (rocketmq/broker.conf)

```properties
# Broker 配置
brokerClusterName=DefaultCluster
brokerName=broker-a
brokerId=0

# 删除文件时间
deleteWhen=04
fileReservedTime=48

# Broker 角色
brokerRole=ASYNC_MASTER
flushDiskType=ASYNC_FLUSH

# NameServer 地址
namesrvAddr=rocketmq-namesrv:9876

# 监听地址
brokerIP1=rocketmq-broker

# 自动创建主题
autoCreateTopicEnable=true
autoCreateSubscriptionGroup=true
```

### Nginx 配置文件 (nginx/conf.d/default.conf)

```nginx
upstream springboot_backend {
    server springboot-app:8080;
}

server {
    listen 80;
    server_name localhost;

    # 日志配置
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # 客户端上传大小限制
    client_max_body_size 100M;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://springboot_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # WebSocket 支持
    location /ws/ {
        proxy_pass http://springboot_backend/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Spring Boot Dockerfile (app/Dockerfile)

```dockerfile
# 构建阶段
FROM maven:3.8.8-eclipse-temurin-17 AS builder

WORKDIR /app

# 复制 pom.xml 并下载依赖
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码并构建
COPY src ./src
RUN mvn clean package -DskipTests -B

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/target/*.jar app.jar

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 暴露端口
EXPOSE 8080

# JVM 参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Spring Boot 配置

### application.yml 配置示例

```yaml
spring:
  application:
    name: springboot-app
  
  # 数据源配置
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/springboot_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai}
    username: ${SPRING_DATASOURCE_USERNAME:app_user}
    password: ${SPRING_DATASOURCE_PASSWORD:app_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  # Redis 配置
  redis:
    host: ${SPRING_REDIS_HOST:localhost}
    port: ${SPRING_REDIS_PORT:6379}
    database: 0
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
  
  # MyBatis-Plus 配置
  mybatis-plus:
    mapper-locations: classpath*:/mapper/**/*.xml
    type-aliases-package: com.example.entity
    configuration:
      map-underscore-to-camel-case: true
      log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# RocketMQ 配置
rocketmq:
  name-server: ${ROCKETMQ_NAMESRV_ADDR:localhost:9876}
  producer:
    group: springboot-producer-group
    send-message-timeout: 3000
    retry-times-when-send-failed: 2

# Actuator 健康检查
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always

server:
  port: 8080
```

## 使用步骤

### 1. 创建项目目录结构

```bash
# Windows PowerShell
mkdir project/mysql/init, project/mysql/conf, project/redis, project/nginx/conf.d, project/rocketmq, project/app -Force

# Linux/Mac
mkdir -p project/{mysql/{init,conf},redis,nginx/conf.d,rocketmq,app}
cd project
```

### 2. 创建配置文件

将上述配置文件内容分别保存到对应的目录中。

### 3. 启动所有服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f springboot-app
```

### 4. 验证服务

```bash
# 检查 MySQL
docker exec -it springboot-mysql mysql -uroot -proot123456 -e "SHOW DATABASES;"

# 检查 Redis
docker exec -it springboot-redis redis-cli ping

# 检查 Spring Boot 应用
curl http://localhost:8080/actuator/health

# 访问 RocketMQ Console
# 浏览器打开: http://localhost:8180
```

### 5. 停止和清理

```bash
# 停止所有服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络和卷
docker-compose down -v

# 重启特定服务
docker-compose restart springboot-app
```

## 常用操作

### 单独启动某个服务

```bash
# 只启动 MySQL
docker-compose up -d mysql

# 只启动 Redis
docker-compose up -d redis
```

### 重新构建应用

```bash
# 重新构建并启动
docker-compose up -d --build springboot-app

# 强制重新构建
docker-compose build --no-cache springboot-app
```

### 扩展服务实例

```bash
# 启动 3 个 Spring Boot 实例
docker-compose up -d --scale springboot-app=3
```

### 进入容器

```bash
# 进入 MySQL 容器
docker exec -it springboot-mysql bash

# 进入 Redis 容器
docker exec -it springboot-redis sh

# 进入应用容器
docker exec -it springboot-app sh
```

## 最佳实践

### 1. 环境变量管理

创建 `.env` 文件存储环境变量：

```env
# .env
MYSQL_ROOT_PASSWORD=root123456
MYSQL_DATABASE=springboot_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

REDIS_PASSWORD=redis123456

SPRING_PROFILES_ACTIVE=prod
```

在 `docker-compose.yml` 中引用：

```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
```

### 2. 数据持久化

确保重要数据使用 volumes 持久化：

```yaml
volumes:
  - ./mysql/data:/var/lib/mysql        # MySQL 数据
  - ./redis/data:/data                 # Redis 数据
  - ./rocketmq/store:/home/rocketmq/store  # RocketMQ 数据
```

### 3. 健康检查

为关键服务配置健康检查，确保依赖服务就绪后再启动应用：

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### 4. 资源限制

为容器设置资源限制，防止资源耗尽：

```yaml
services:
  springboot-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 5. 日志管理

配置日志驱动和日志轮转：

```yaml
services:
  springboot-app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs -f service-name

# 查看容器状态
docker ps -a

# 检查端口占用
netstat -ano | findstr :3306  # Windows
lsof -i :3306                  # Linux/Mac
```

### 网络连接问题

```bash
# 查看网络
docker network ls

# 检查网络详情
docker network inspect springboot-network

# 测试容器间连通性
docker exec springboot-app ping mysql
```

### 数据库连接失败

1. 检查 MySQL 是否就绪
2. 验证数据库用户和密码
3. 确认网络配置正确
4. 检查防火墙规则

### 内存不足

```bash
# 查看容器资源使用
docker stats

# 清理未使用的资源
docker system prune -a
```

## 生产环境建议

1. **使用私有镜像仓库**: 将构建的镜像推送到私有仓库
2. **配置 HTTPS**: 为 Nginx 配置 SSL 证书
3. **设置密码**: 为所有服务设置强密码
4. **定期备份**: 配置自动备份脚本备份数据库和重要数据
5. **监控告警**: 集成 Prometheus + Grafana 监控
6. **日志收集**: 使用 ELK 或 Loki 收集日志
7. **安全加固**: 使用非 root 用户运行容器
8. **版本管理**: 使用具体版本号而非 latest 标签

## 总结

通过 Docker Compose，我们可以：
- ✅ 一键启动所有依赖服务
- ✅ 统一管理开发、测试、生产环境
- ✅ 快速恢复和迁移环境
- ✅ 服务编排和依赖管理
- ✅ 资源隔离和限制

这套配置适用于 Spring Boot 项目的开发、测试和小规模生产环境。对于大规模生产环境，建议使用 Kubernetes 进行容器编排。
## Docker Compose
- Docker 编排 一键搭建所有环境
