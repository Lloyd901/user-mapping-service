# User Mapping Service

这是 Code Test 的完整 NestJS 实现。服务将 `(id1, id2)` 映射到稳定的 UUID v4 `userID`：

```text
(id1, id2) -> userID
```

同一组合重复请求时始终返回同一个 `userID`。

## 技术栈

- NestJS 11 + TypeScript
- MySQL 8
- Redis 7
- TypeORM
- Jest
- Swagger/OpenAPI

## 前置条件

- Node.js 20 或更高版本
- npm
- Docker Desktop（推荐，用于启动 MySQL 和 Redis）

## 快速启动

1. 安装依赖：

   ```bash
   npm install
   ```

2. 复制配置：

   ```bash
   copy .env.example .env
   ```

   PowerShell 也可以使用：

   ```powershell
   Copy-Item .env.example .env
   ```

3. 启动 MySQL 和 Redis：

   ```bash
   docker compose up -d
   ```

4. 启动应用：

   ```bash
   npm run start:dev
   ```

应用地址为 `http://localhost:3000`，Swagger 地址为 `http://localhost:3000/docs`。

## 配置

`.env.example` 不包含真实凭证。生产环境应通过部署平台的 secret/environment 管理注入配置，不要提交 `.env`。

关键配置：

| 变量 | 说明 |
|---|---|
| `PORT` | HTTP 端口，默认 3000 |
| `MYSQL_HOST` / `MYSQL_PORT` | MySQL 地址和端口 |
| `MYSQL_DATABASE` | 数据库名 |
| `MYSQL_USER` / `MYSQL_PASSWORD` | 应用数据库账户 |
| `REDIS_HOST` / `REDIS_PORT` | Redis 地址和端口 |
| `REDIS_TTL_SECONDS` | 缓存 TTL |
| `DB_SYNCHRONIZE` | 是否由 TypeORM 自动同步表结构；生产环境应为 `false` |

## 数据库

Docker 首次初始化时会执行 [`database/init.sql`](./database/init.sql)。表的关键约束是：

- `id1` 和 `id2` 为非空字段；
- `(id1, id2)` 有联合唯一索引；
- `userID` 有唯一索引；
- 使用 InnoDB 以保证并发下的唯一性和持久性。

## API

### `POST /user-mappings`

请求：

```json
{
  "id1": "ABC123",
  "id2": "XYZ456"
}
```

响应：

```json
{
  "userID": "550e8400-e29b-41d4-a716-446655440000"
}
```

参数缺失、空字符串、非字符串或多余字段会返回 `400 Bad Request`。数据库故障返回受控的 `500 Internal Server Error`，不会暴露 SQL 或堆栈。

## Redis 与一致性

Redis 只缓存 `id1` + `id2` 到 `userID` 的查询结果，设置 TTL；MySQL 是唯一永久数据源。Redis 读取或写入失败时，服务会记录警告并回退到 MySQL，因此缓存不可用不会改变正确结果。

服务先查询已有记录；新记录写入时依赖 MySQL 的联合唯一约束。两个相同的新请求并发时，只有一个插入成功，另一个收到唯一键冲突后重新查询获胜记录，最终返回同一个 `userID`。

## 测试与构建

```bash
npm test
npm run build
```

测试覆盖新建、已有记录、缓存命中和并发重复插入场景。

## Git 和安全

`.gitignore` 排除了 `.env`、依赖、构建产物、覆盖率和日志。请只提交 `.env.example`，不要提交真实密码、API key 或生产凭证。
