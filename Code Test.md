# Software Engineer Code Test

> 本文由 `Code Test.pdf` 转换并整理。前半部分保留题目要求，后半部分提供中文解读和实现建议。

## 1. 题目目标

本测试用于评估候选人的基础后端开发能力，重点包括：

- 代码结构
- REST API 开发
- 数据库设计
- 错误处理
- 代码质量
- 问题分析与解决能力

评估重点不只是“接口能否返回正确结果”，还包括系统的设计和实现方式。

## 2. 指定技术栈

| 项目 | 要求 |
|---|---|
| Web 框架 | NestJS |
| 语言 | Node.js + TypeScript |
| 数据库 | MySQL 8 |
| 缓存服务 | Redis |

## 3. 功能要求

### 3.1 创建 POST API

创建一个 REST API，使用 `POST` 方法。路径可以自行决定，请求体至少包含以下两个参数：

- `id1`
- `id2`

示例请求：

```json
{
  "id1": "ABC123",
  "id2": "XYZ456"
}
```

`id1` 和 `id2` 都是必填项。应用必须验证请求；参数缺失或无效时，应返回适当的错误响应。

### 3.2 数据库

在 MySQL 8 中创建合适的数据表，用于保存：

- `id1`
- `id2`
- `userID`

也可以根据需要增加其他字段，例如主键、创建时间和更新时间。

`id1` 与 `id2` 的组合必须唯一，并且能够定位一条记录。

### 3.3 处理逻辑

收到合法请求后，应用应执行以下逻辑：

1. 在数据库中查询是否已经存在相同的 `id1` + `id2` 组合。
2. 如果记录存在：
   - 读取已有的 `userID`；
   - 以 JSON 格式返回该 `userID`。
3. 如果记录不存在：
   - 使用 UUID v4 生成新的 `userID`；
   - 将 `id1`、`id2` 和 `userID` 保存到数据库；
   - 以 JSON 格式返回新生成的 `userID`。

### 3.4 重复调用的行为

对于相同的 `id1` 和 `id2`，多次调用必须返回同一个 `userID`。

第一次请求：

```json
{
  "id1": "ABC123",
  "id2": "XYZ456"
}
```

响应示例：

```json
{
  "userID": "550e8400-e29b-41d4-a716-446655440000"
}
```

之后再次提交相同组合时，必须返回相同的 UUID，而不是重新生成一个新的 UUID。

## 4. Redis 要求

Redis 已列入技术栈，但具体用途由候选人决定。

可以使用 Redis 缓存 `id1` + `id2` 到 `userID` 的查询结果，以减少重复查询 MySQL 的次数。如果使用 Redis，必须在 `README.md` 中说明用途。

Redis 不能作为永久数据源。即使 Redis 缓存丢失、过期或不可用，MySQL 中的数据仍然必须正确，应用也不能因缓存失效而返回错误的 `userID`。

## 5. 最低通过要求

### 5.1 功能正确性

- 应用可以成功启动和测试。
- POST API 接收 `id1` 和 `id2`。
- 新的组合会生成 UUID v4 格式的 `userID`。
- 新记录会正确保存到 MySQL。
- 重复提交相同组合会返回已有的 `userID`。
- 无效请求会被正确处理。
- 意外的应用或数据库错误不会导致应用失控崩溃。

### 5.2 代码质量

代码应体现合理的软件开发实践：

- 代码清晰易懂。
- 变量、方法、类、模块和文件使用有意义的名称。
- 合理分离职责。
- 避免不必要的重复代码。
- 正确使用 TypeScript 类型。
- 保持统一的格式和编码风格。
- 不包含无用代码。

建议遵循 NestJS 的标准项目结构和约定。

### 5.3 数据库设计

数据库实现应具备：

- 合适的数据类型。
- 合适的约束和索引。
- 防止同一 `id1` + `id2` 组合被意外插入多次的机制。
- 正确使用 SQL 查询或 ORM/数据库框架。

尤其要在数据库层建立联合唯一约束，而不能只依赖应用代码中的“先查询、后插入”。

### 5.4 错误处理和验证

应用应当：

- 验证必填参数。
- 返回适当的 HTTP 状态码。
- 返回容易理解的错误信息。
- 正确处理数据库错误和应用错误。
- 避免把堆栈、SQL、数据库地址等内部技术细节暴露在 API 错误响应中。

### 5.5 安全和配置

- 数据库密码、Redis 密码、API key 等不能硬编码。
- 配置应通过环境变量或其他合适的配置机制提供。
- 敏感凭证不能提交到 Git 仓库。

### 5.6 Git 使用

项目必须通过 Git 仓库提交。评估内容包括：

- 仓库结构。
- commit 历史。
- commit message 是否有意义。
- 是否提交了不必要的生成文件、依赖、凭证或本地配置文件。

## 6. 评分标准

| 评估项 | 权重 |
|---|---:|
| 功能正确性 | 30% |
| 代码质量和项目结构 | 20% |
| 数据库设计 | 15% |
| 错误处理和参数验证 | 15% |
| 测试 | 10% |
| 文档、Git 使用和工程实践 | 10% |

通常需要达到 60% 以上，并满足核心功能，才会被认为通过。

但是以下严重问题可能导致无论分数多少都被判定为失败：

- 提交了真实凭证。
- 应用无法运行。
- 没有实现主要功能。

## 7. 加分项

以下内容不是通过测试的强制要求，但可能获得额外评价：

1. 自动化测试：
   - 新的 `id1` + `id2`；
   - 已存在的 `id1` + `id2`；
   - 无效输入；
   - 错误场景。
2. Dockerfile 或 `docker-compose.yml`，用于启动应用、MySQL 8 和 Redis。
3. 展示主处理流程的时序图。
4. Swagger/OpenAPI 等 API 文档。
5. 并发处理：
   - 考虑两个相同的新请求同时到达的情况；
   - 防止重复数据或不一致；
   - 在 `README.md` 中简要说明方案。

## 8. 提交要求

项目的 `README.md` 至少应包含：

- 项目概述。
- 前置条件。
- 安装步骤。
- 环境变量和配置说明。
- 数据库初始化说明。
- 启动应用的方法。
- API 路径和请求示例。
- 测试运行方法（如果提供测试）。
- 假设条件或重要技术决策。

在适用时，应提供 `.env.example` 或等价的配置示例。

不得在仓库中包含真实密码、凭证、API key 或其他秘密信息。

## 9. 中文详细解读

### 9.1 这道题实际要实现什么

这不是一个复杂的业务系统，而是一个“组合键映射到稳定用户 ID”的服务：

```text
(id1, id2) -> userID
```

同一个组合永远对应同一个 `userID`。第一次访问时创建映射，后续访问时读取映射。

核心难点不在 UUID 生成，而在以下几点：

1. 请求参数必须可靠验证。
2. 数据库必须保证组合唯一。
3. 并发请求不能创建两条不同记录。
4. Redis 只能优化读取，不能破坏 MySQL 的最终正确性。
5. 异常必须转换为稳定、适合客户端理解的 HTTP 响应。

### 9.2 推荐的 NestJS 分层

可以采用如下结构：

```text
src/
  app.module.ts
  main.ts
  mapping/
    mapping.module.ts
    mapping.controller.ts
    mapping.service.ts
    dto/
      create-mapping.dto.ts
    entities/
      mapping.entity.ts
```

职责建议：

- `Controller`：接收 HTTP 请求、调用 service、返回结果。
- `DTO`：定义并验证请求体。
- `Service`：实现查询、生成 UUID、插入和缓存策略。
- `Entity` 或 repository：描述数据库表和查询方式。
- `Module`：组装依赖。
- 全局异常过滤器或 NestJS 内置异常：统一错误响应。

Controller 不应直接编写复杂 SQL，也不应承担 Redis 与数据库一致性逻辑。

### 9.3 推荐的数据表

示例 SQL：

```sql
CREATE TABLE user_mappings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id1 VARCHAR(255) NOT NULL,
  id2 VARCHAR(255) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_mappings_id1_id2 (id1, id2),
  UNIQUE KEY uq_user_mappings_user_id (user_id)
);
```

说明：

- `NOT NULL` 保证三个核心字段不能为空。
- `CHAR(36)` 适合保存标准文本 UUID v4。
- `(id1, id2)` 联合唯一索引保证组合不会重复。
- `user_id` 单独唯一可以防止极低概率的 UUID 冲突。
- `created_at` 和 `updated_at` 便于排查和维护。

如果 `id1`、`id2` 有明确长度上限，应该使用更小、更准确的 `VARCHAR` 长度。还应明确字符集和排序规则，避免大小写或尾随空格导致的语义不一致。

### 9.4 请求验证

建议使用 NestJS 的 `ValidationPipe` 和 `class-validator`：

```ts
export class CreateMappingDto {
  @IsString()
  @IsNotEmpty()
  id1!: string;

  @IsString()
  @IsNotEmpty()
  id2!: string;
}
```

全局管道建议至少启用：

```ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

这样可以：

- 拒绝缺少必填参数的请求。
- 拒绝未知字段，避免接口输入不明确。
- 避免把任意请求对象直接传入数据库层。

实际项目还应根据业务决定是否去除首尾空格、是否区分大小写，以及空字符串是否有效；这些行为应写入 README。

### 9.5 正确的数据库处理流程

推荐流程如下：

```text
请求
  -> DTO 验证
  -> 查询 Redis（可选）
  -> 查询 MySQL
      -> 找到：返回已有 userID
      -> 找不到：生成 UUID v4
          -> 插入 MySQL
          -> 返回 userID
```

但不能只写成“查询不存在就插入”，因为两个并发请求可能同时查询不到，然后分别插入。

稳妥方案是：

1. MySQL 对 `(id1, id2)` 建立联合唯一约束。
2. 尝试插入新 UUID。
3. 如果发生唯一键冲突，再查询该组合的已有记录并返回它。

也可以使用事务或 MySQL 的原子 upsert 语句。无论采用哪种方案，数据库唯一约束都必须保留，因为它是最终的一致性保障。

### 9.6 Redis 的合理用法

可使用如下缓存键：

```text
user-mapping:{id1}:{id2}
```

推荐策略：

1. 先查 Redis。
2. 命中时返回缓存的 `userID`。
3. 未命中时查 MySQL。
4. MySQL 命中后写入 Redis 并返回。
5. MySQL 未命中时插入记录，成功后写入 Redis。

缓存必须设置合理 TTL，并处理 Redis 不可用的情况：缓存异常应记录日志并回退到 MySQL，而不能返回伪造结果。写入 MySQL 成功后再写缓存，可以避免缓存中出现数据库不存在的映射。

### 9.7 HTTP 响应建议

可以定义如下接口：

```text
POST /user-mappings
```

成功响应：

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "userID": "550e8400-e29b-41d4-a716-446655440000"
}
```

如果创建和读取需要区分，也可以对新建返回 `201 Created`、对已有记录返回 `200 OK`，但应在 README 中明确说明。为了简化客户端处理，统一返回 `200 OK` 也是合理选择。

校验失败可以返回 `400 Bad Request`，内部数据库错误可以返回 `500 Internal Server Error`，并对客户端隐藏 SQL 和堆栈信息。

### 9.8 测试重点

至少应覆盖：

| 场景 | 期望结果 |
|---|---|
| 首次提交合法组合 | 生成 UUID v4，保存并返回 |
| 再次提交相同组合 | 返回完全相同的 `userID` |
| 缺少 `id1` | 返回 400 |
| 缺少 `id2` | 返回 400 |
| 空字符串 | 按验证规则返回 400 |
| 多余字段 | 根据配置拒绝或明确处理 |
| 数据库失败 | 返回受控错误，不泄露内部细节 |
| 并发提交相同组合 | 最终只有一条记录，所有请求得到同一 `userID` |
| Redis 不可用 | 仍能通过 MySQL 正确返回 |

### 9.9 README 和工程质量

一个高质量提交应让评审者能够快速完成以下操作：

1. 复制 `.env.example` 为本地配置。
2. 启动 MySQL 和 Redis。
3. 执行 migration 或初始化 SQL。
4. 安装依赖并启动 NestJS。
5. 使用 curl、Swagger 或测试命令验证接口。

建议使用 `.gitignore` 忽略 `.env`、`node_modules`、构建输出和日志文件，并使用小而清晰的 commit，例如：

```text
feat: add user mapping endpoint
test: cover duplicate mapping requests
docs: describe local setup
```

## 10. 最终验收清单

- [ ] 使用 NestJS + TypeScript。
- [ ] POST 接口能接收 `id1` 和 `id2`。
- [ ] DTO 验证缺失值、空值和非法类型。
- [ ] MySQL 表包含 `id1`、`id2`、`userID`。
- [ ] `(id1, id2)` 有联合唯一约束。
- [ ] 新组合生成 UUID v4。
- [ ] 重复组合返回同一个 `userID`。
- [ ] 并发请求不会产生重复记录。
- [ ] Redis 不是永久数据源，缓存失败不影响正确性。
- [ ] 数据库和 Redis 配置来自环境变量。
- [ ] 错误响应不会泄露内部实现细节。
- [ ] 有 README.md 和 `.env.example`。
- [ ] 有基本单元测试或集成测试。
- [ ] Git 中没有真实密钥和不必要的生成文件。
