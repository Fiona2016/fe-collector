# RUM Resource Schema 三端对比分析

## 概述

本文档对比了 Datadog RUM SDK 在三个平台（iOS、Android、Web）上的 Resource Schema 差异。

生成时间：2025-10-30

---

## 一、Schema 来源

### iOS

- **Schema 位置**：从 `rum-events-format` 仓库动态拉取
- **Schema 文件**：`schemas/rum/resource-schema.json`（在 `rum-events-mobile-schema.json` 中引用）
- **生成模型位置**：
  - Swift: `DatadogInternal/Sources/Models/RUM/RUMDataModels.swift`
  - Objc: `DatadogRUM/Sources/DataModels/RUMDataModels+objc.swift`
- **生成命令**：`make rum-models-generate`

### Android

- **Schema 位置**：仓库内直接维护
- **Schema 文件**：`features/dd-sdk-android-rum/src/main/json/rum/resource-schema.json`
- **生成模型位置**：通过代码生成工具从 JSON schema 生成 Kotlin 数据类

### Web

- **Schema 位置**：独立的 `rum-events-format` 仓库
- **Schema 文件**：`rum-events-format/schemas/rum/resource-schema.json`
- **实现方式**：TypeScript 类型定义

---

## 二、核心差异对比

### 1. 顶层字段对比

#### 1.1 必需字段差异

| 平台        | required 字段                  |
| ----------- | ------------------------------ |
| **iOS**     | `["type", "view", "resource"]` |
| **Android** | `["type", "view", "resource"]` |
| **Web**     | `["type", "resource"]`         |

**差异说明**：

- ✅ iOS 和 Android 要求 `view` 字段必填
- ❌ Web 不强制要求 `view` 字段
- **原因**：移动端强调 View 上下文，每个资源必须关联到具体的页面视图

#### 1.2 顶层结构对比

| 字段           | iOS/Android | Web     | 说明                           |
| -------------- | ----------- | ------- | ------------------------------ |
| `type`         | ✅ 必需     | ✅ 必需 | 事件类型，值为 "resource"      |
| `date`         | ✅          | ✅      | 事件时间戳                     |
| `application`  | ✅          | ✅      | 应用信息                       |
| `service`      | ✅          | ✅      | 服务名称                       |
| `session`      | ✅          | ✅      | Session 信息                   |
| `view`         | ✅ **必需** | ✅ 可选 | View 信息（移动端必需）        |
| `resource`     | ✅ 必需     | ✅ 必需 | 资源详情                       |
| `action`       | ✅          | ✅      | 关联的用户操作                 |
| `container`    | ✅          | ✅      | **三端都支持**（WebView 场景） |
| `usr`          | ✅          | ✅      | 用户信息                       |
| `context`      | ✅          | ✅      | 自定义上下文                   |
| `_dd`          | ✅          | ✅      | 内部属性（有差异，见下文）     |
| `ddtags`       | ✅          | ✅      | 标签                           |
| `device`       | ✅          | ✅      | 设备信息                       |
| `os`           | ✅          | ✅      | 操作系统信息                   |
| `connectivity` | ✅          | ✅      | 网络连接信息                   |

**重要说明**：

✅ **container 字段三端都支持！**

- 它通过 `_view-container-schema.json` 被引入
- 用于 WebView 等嵌套视图场景
- 当 `source: "browser"` 且存在原生父容器时，才会填充此字段

---

### 2. `resource` 对象字段深度对比

#### 2.1 基础属性对比

| 字段          | iOS/Android | Web     | 类型    | 说明                     |
| ------------- | ----------- | ------- | ------- | ------------------------ |
| `id`          | ✅          | ✅      | string  | UUID 格式的资源 ID       |
| `type`        | ✅ 必需     | ✅ 必需 | enum    | 资源类型（见枚举值对比） |
| `method`      | ✅          | ✅      | enum    | HTTP 方法                |
| `url`         | ✅ 必需     | ✅ 必需 | string  | 资源 URL                 |
| `status_code` | ✅          | ✅      | integer | HTTP 状态码              |
| `duration`    | ✅          | ✅      | integer | 资源加载时长（纳秒）     |

**枚举值对比**：

```javascript
// resource.type - 三端完全一致
[
  "document",
  "xhr",
  "beacon",
  "fetch",
  "css",
  "js",
  "image",
  "font",
  "media",
  "other",
  "native",
][
  // resource.method - 三端完全一致
  ("POST",
  "GET",
  "HEAD",
  "PUT",
  "DELETE",
  "PATCH",
  "TRACE",
  "OPTIONS",
  "CONNECT")
];
```

#### 2.2 大小相关属性对比

| 字段                | iOS/Android | Web | 类型    | 说明               |
| ------------------- | ----------- | --- | ------- | ------------------ |
| `size`              | ✅          | ✅  | integer | 响应体大小（字节） |
| `encoded_body_size` | ✅          | ✅  | integer | 编码前大小（字节） |
| `decoded_body_size` | ✅          | ✅  | integer | 解码后大小（字节） |
| `transfer_size`     | ✅          | ✅  | integer | 传输大小（字节）   |

**说明**：三端在大小相关字段上**完全一致**。

#### 2.3 网络阶段属性对比（所有网络阶段结构相同）

所有网络阶段对象都包含相同的子字段：

| 阶段对象     | iOS/Android | Web | 子字段                            |
| ------------ | ----------- | --- | --------------------------------- |
| `worker`     | ✅          | ✅  | `duration`, `start`（单位：纳秒） |
| `redirect`   | ✅          | ✅  | `duration`, `start`（单位：纳秒） |
| `dns`        | ✅          | ✅  | `duration`, `start`（单位：纳秒） |
| `connect`    | ✅          | ✅  | `duration`, `start`（单位：纳秒） |
| `ssl`        | ✅          | ✅  | `duration`, `start`（单位：纳秒） |
| `first_byte` | ✅          | ✅  | `duration`, `start`（单位：纳秒） |
| `download`   | ✅          | ✅  | `duration`, `start`（单位：纳秒） |

**每个阶段对象的结构**：

```json
{
  "duration": 1000000, // 该阶段持续时长（纳秒）
  "start": 500000 // 从请求开始到该阶段开始的时长（纳秒）
}
```

**说明**：三端在所有网络阶段字段上**完全一致**，所有时间单位都是纳秒（ns）。

#### 2.4 其他属性对比

| 字段                     | iOS/Android | Web | 类型   | 说明                            |
| ------------------------ | ----------- | --- | ------ | ------------------------------- |
| `protocol`               | ✅          | ✅  | string | 网络协议（如 'http/1.1', 'h2'） |
| `delivery_type`          | ✅          | ✅  | enum   | 交付类型（见下文）              |
| `render_blocking_status` | ✅          | ✅  | enum   | 渲染阻塞状态（见下文）          |
| `provider`               | ✅          | ✅  | object | 资源提供商信息（见下文）        |
| `graphql`                | ✅          | ✅  | object | GraphQL 信息（**有差异**）      |

**枚举值对比**：

```javascript
// delivery_type - 三端完全一致
["cache", "navigational-prefetch", "other"][
  // render_blocking_status - 三端完全一致
  ("blocking", "non-blocking")
];
```

---

### 3. `resource.provider` 对象字段对比

| 字段     | iOS/Android | Web | 类型   | 说明           |
| -------- | ----------- | --- | ------ | -------------- |
| `domain` | ✅          | ✅  | string | 提供商域名     |
| `name`   | ✅          | ✅  | string | 提供商友好名称 |
| `type`   | ✅          | ✅  | enum   | 提供商类型     |

**provider.type 枚举值**（三端完全一致）：

```javascript
[
  "ad",
  "advertising",
  "analytics",
  "cdn",
  "content",
  "customer-success",
  "first party",
  "hosting",
  "marketing",
  "other",
  "social",
  "tag-manager",
  "utility",
  "video",
];
```

**说明**：`provider` 对象在三端上**完全一致**。

---

### 4. `resource.graphql` 对象字段对比（⚠️ 有重要差异）

#### 4.1 基础字段对比

| 字段            | iOS/Android | Web     | 类型    | 说明                   |
| --------------- | ----------- | ------- | ------- | ---------------------- |
| `operationType` | ✅ 必需     | ✅ 必需 | enum    | 操作类型               |
| `operationName` | ✅          | ✅      | string  | 操作名称               |
| `payload`       | ✅          | ✅      | string  | 操作内容               |
| `variables`     | ✅          | ✅      | string  | 操作变量（字符串表示） |
| `error_count`   | ✅          | ❌      | integer | **iOS/Android 独有**   |
| `errors`        | ✅          | ❌      | array   | **iOS/Android 独有**   |

**operationType 枚举值**（三端完全一致）：

```javascript
["query", "mutation", "subscription"];
```

#### 4.2 GraphQL errors 数组结构（仅 iOS/Android）

移动端支持详细的 GraphQL 错误追踪：

```json
{
  "graphql": {
    "operationType": "query",
    "operationName": "GetUser",
    "error_count": 2, // ← Web 端没有
    "errors": [
      // ← Web 端没有
      {
        "message": "Field 'email' not found", // 必需
        "code": "FIELD_NOT_FOUND", // 可选
        "locations": [
          // 可选
          {
            "line": 3,
            "column": 5
          }
        ],
        "path": ["user", "email"] // 可选
      }
    ]
  }
}
```

**errors 数组中每个错误对象的字段**：

| 字段        | 必需 | 类型   | 说明                     |
| ----------- | ---- | ------ | ------------------------ |
| `message`   | ✅   | string | 错误消息                 |
| `code`      | ❌   | string | 错误代码                 |
| `locations` | ❌   | array  | 错误位置（line, column） |
| `path`      | ❌   | array  | 导致错误的字段路径       |

**差异总结**：

- ✅ **iOS/Android**：完整的 GraphQL 错误追踪能力，包括错误计数、错误详情、位置和路径
- ❌ **Web**：仅支持基础的 GraphQL 信息（operationType, operationName, payload, variables）

---

### 5. `_dd` 内部属性深度对比

#### 5.1 字段对比表

| 字段                  | iOS/Android | Web | 类型    | 说明                              |
| --------------------- | ----------- | --- | ------- | --------------------------------- |
| `format_version`      | ✅          | ✅  | integer | RUM 事件格式版本（固定为 2）      |
| `span_id`             | ✅          | ✅  | string  | Span ID（十进制格式）             |
| `parent_span_id`      | ✅          | ❌  | string  | **iOS/Android 独有** - 父 Span ID |
| `trace_id`            | ✅          | ✅  | string  | Trace ID（**格式有差异**）        |
| `rule_psr`            | ✅          | ✅  | number  | 采样率（0-1）                     |
| `discarded`           | ✅          | ✅  | boolean | 是否丢弃该资源                    |
| `session`             | ✅          | ✅  | object  | Session 相关内部属性              |
| `configuration`       | ✅          | ✅  | object  | SDK 配置选项子集                  |
| `browser_sdk_version` | ❌          | ✅  | string  | **Web 独有** - Browser SDK 版本   |
| `sdk_name`            | ✅          | ✅  | string  | SDK 名称（如 'rum', 'rum-slim'）  |
| `drift`               | ❌          | ✅  | number  | **Web 独有** - 时间漂移           |

#### 5.2 核心差异详解

**差异 1：parent_span_id**

```json
// iOS/Android - 支持父 Span ID
{
  "_dd": {
    "span_id": "123456",
    "parent_span_id": "789012",  // ← 支持
    "trace_id": "..."
  }
}

// Web - 不支持
{
  "_dd": {
    "span_id": "123456",
    // 没有 parent_span_id
    "trace_id": "..."
  }
}
```

**差异 2：trace_id 格式**

```json
// iOS/Android - 灵活格式
{
  "trace_id": "12345678901234567890"  // 64位十进制
  // OR
  "trace_id": "0123456789abcdef0123456789abcdef"  // 128位十六进制
  // Pattern: ^[0-9]{1,20}|[0-9a-fA-F]{32}$
}

// Web - 仅十进制
{
  "trace_id": "12345678901234567890"  // 仅十进制
  // Pattern: ^[0-9]+$
}
```

#### 5.3 `_dd.session` 子对象对比

| 字段                   | iOS/Android | Web | 说明                                     |
| ---------------------- | ----------- | --- | ---------------------------------------- |
| `plan`                 | ✅          | ✅  | Session 计划（1=无 replay, 2=有 replay） |
| `session_precondition` | ✅          | ✅  | Session 创建前提条件                     |

**session_precondition 枚举值**（三端一致）：

```javascript
[
  "user_app_launch",
  "inactivity_timeout",
  "max_duration",
  "background_launch",
  "prewarm",
  "from_non_interactive_session",
  "explicit_stop",
];
```

#### 5.4 `_dd.configuration` 子对象对比

| 字段                         | iOS/Android | Web | 说明                   |
| ---------------------------- | ----------- | --- | ---------------------- |
| `session_sample_rate`        | ✅          | ✅  | Session 采样率（必需） |
| `session_replay_sample_rate` | ✅          | ✅  | Session Replay 采样率  |
| `profiling_sample_rate`      | ✅          | ❌  | **iOS/Android 独有**   |

---

### 6. `container` 对象字段深度对比

**✅ 三端完全一致！**

| 字段      | iOS/Android | Web     | 类型   | 说明           |
| --------- | ----------- | ------- | ------ | -------------- |
| `view.id` | ✅ 必需     | ✅ 必需 | string | 父视图 UUID    |
| `source`  | ✅ 必需     | ✅ 必需 | enum   | 父视图平台来源 |

**container.source 枚举值**（三端完全一致）：

```javascript
[
  "android",
  "ios",
  "browser",
  "flutter",
  "react-native",
  "roku",
  "unity",
  "kotlin-multiplatform",
];
```

**完整结构示例**：

```json
{
  "container": {
    "view": {
      "id": "abc-123-def-456" // 父视图 UUID（必需）
    },
    "source": "android" // 父视图来源（必需）
  }
}
```

**使用场景**：

- ✅ 纯原生应用：**无** container 字段
- ✅ 纯 Web 应用：**无** container 字段
- ✅ WebView（移动内）：**有** container 字段，`source: "browser"`, `container.source: "android"/"ios"`
- ✅ Flutter/React Native WebView：**有** container 字段

---

## 三、对比层级总结

### 本文档对比了 **4 个层级**：

#### **层级 1：顶层字段**

- ✅ type, date, application, service, session
- ✅ view, resource, action, container
- ✅ usr, context, \_dd, ddtags, device, os, connectivity

#### **层级 2：resource 对象及其子对象**

- ✅ resource 基础属性（id, type, method, url, status_code, duration）
- ✅ resource 大小属性（size, encoded_body_size, decoded_body_size, transfer_size）
- ✅ resource 网络阶段（worker, redirect, dns, connect, ssl, first_byte, download）
- ✅ resource 其他属性（protocol, delivery_type, render_blocking_status）
- ✅ resource.provider 子对象（domain, name, type）
- ✅ resource.graphql 子对象（operationType, operationName, payload, variables, error_count, errors）

#### **层级 3：\_dd 对象及其子对象**

- ✅ \_dd 基础属性（format_version, span_id, parent_span_id, trace_id, rule_psr, discarded）
- ✅ \_dd.session 子对象（plan, session_precondition）
- ✅ \_dd.configuration 子对象（session_sample_rate, session_replay_sample_rate, profiling_sample_rate）

#### **层级 4：container 对象**

- ✅ container.view 子对象（id）
- ✅ container.source

### 关键发现总结

| 对比项                  | 结论                                         | 影响 |
| ----------------------- | -------------------------------------------- | ---- |
| **顶层结构**            | 几乎完全一致，仅 `view` 必需性不同           | 低   |
| **resource 基础字段**   | **完全一致**                                 | 无   |
| **网络阶段字段**        | **完全一致**（7 个阶段，所有时间单位：纳秒） | 无   |
| **provider 对象**       | **完全一致**                                 | 无   |
| **graphql 对象**        | **重要差异** - 移动端支持错误追踪            | 中   |
| **\_dd.parent_span_id** | **重要差异** - Web 不支持                    | 中   |
| **\_dd.trace_id 格式**  | **重要差异** - 移动端支持多种格式            | 中   |
| **container 对象**      | **完全一致**（三端都支持）                   | 无   |

---

## 四、相同点汇总

以下属性在三个平台上**完全一致**：

### Resource 基础属性

- ✅ `id`：UUID 格式
- ✅ `type`：资源类型枚举（document, xhr, beacon, fetch, css, js, image, font, media, other, native）
- ✅ `method`：HTTP 方法枚举
- ✅ `url`：资源 URL
- ✅ `status_code`：HTTP 状态码
- ✅ `duration`：资源加载时长

### 性能指标属性

- ✅ `size`：响应体大小
- ✅ `encoded_body_size`：编码前大小
- ✅ `decoded_body_size`：解码后大小
- ✅ `transfer_size`：传输大小
- ✅ `render_blocking_status`：渲染阻塞状态

### 网络阶段属性（7 个阶段，每个包含 duration 和 start）

- ✅ `worker`：Worker 阶段
- ✅ `redirect`：重定向阶段
- ✅ `dns`：DNS 解析阶段
- ✅ `connect`：连接阶段
- ✅ `ssl`：SSL 握手阶段
- ✅ `first_byte`：首字节阶段
- ✅ `download`：下载阶段

### 其他属性

- ✅ `protocol`：网络协议（如 'http/1.1', 'h2'）
- ✅ `delivery_type`：交付类型（cache, navigational-prefetch, other）
- ✅ `provider`：资源提供商信息（完全一致）
- ✅ `container`：父视图容器信息（**三端都支持**，完全一致）

---

---

## 五、为什么移动端需要 parent_span_id？（重要架构差异）

### 问题背景

| 平台        | parent_span_id 支持 | 说明                          |
| ----------- | ------------------- | ----------------------------- |
| iOS/Android | ✅ **支持**         | 可追踪完整的 span 层次结构    |
| Web         | ❌ **不支持**       | RUM Resource 事件中没有此字段 |

### 核心原因：移动端的 APM Tracing 架构更复杂

#### 1. 移动端支持完整的 APM Tracing SDK

**移动端架构**：

```
移动应用
├── RUM SDK (实时用户监控)
│   └── 自动采集资源、视图、操作、错误
├── APM Tracing SDK (应用性能追踪)
│   ├── 自动追踪网络请求（生成 Span）
│   ├── 自定义 Span（业务逻辑追踪）
│   └── 支持完整的 Span 层次结构
└── 集成层：RUM ⇄ APM
    └── RUM Resource 事件需要关联 APM Span
```

**Web 端架构**：

```
Web 应用
├── RUM SDK (实时用户监控)
│   └── 自动采集资源、视图、操作、错误
└── Tracing（简化版）
    ├── 仅支持基础的 span_id 和 trace_id
    └── 没有复杂的 Span 层次结构
```

#### 2. 典型场景对比

**场景：用户点击按钮 → 调用 API → 发起 HTTP 请求**

**移动端的 Span 层次结构**：

```
Root Span: 用户操作 (span_id: 1000)
  │
  ├─ Child Span: API 调用逻辑 (span_id: 2000, parent_span_id: 1000)
  │    │
  │    └─ Child Span: HTTP 请求 (span_id: 3000, parent_span_id: 2000)
  │         └─ RUM Resource Event ← 需要记录完整链路！
  │              - span_id: 3000
  │              - parent_span_id: 2000  ← 关键！
  │              - trace_id: abc123
```

**Web 端的简化结构**：

```
RUM Resource Event（由浏览器自动采集）
  - span_id: 3000
  - trace_id: abc123
  - ❌ 没有 parent_span_id（不需要复杂层次）
```

#### 3. parent_span_id 的关键作用

##### 作用 1：构建完整的调用链火焰图

**有 parent_span_id（移动端）**：

```
APM Flame Graph（火焰图）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Root Span: onClick()                    [1000ms]
  ├─ getUserProfile()                     [800ms]
  │  ├─ validateToken()                   [50ms]
  │  ├─ HTTP GET /api/user                [700ms] ← RUM Resource
  │  │  ├─ DNS Lookup                     [10ms]
  │  │  ├─ TCP Connect                    [20ms]
  │  │  ├─ SSL Handshake                  [30ms]
  │  │  └─ Download                       [640ms]
  │  └─ parseResponse()                   [50ms]
  └─ updateUI()                           [200ms]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**没有 parent_span_id（Web 端）**：

```
只能看到扁平的资源列表，无法构建调用层次：
- Resource: GET /api/user [700ms]
- Resource: GET /api/posts [500ms]
- Resource: GET /styles.css [100ms]
```

##### 作用 2：跨服务分布式追踪

**移动端场景**：

```
手机 App (iOS/Android)
  └─ Span: 用户操作 (span_id: 1000)
      └─ Span: HTTP 请求 (span_id: 2000, parent_span_id: 1000)
          │
          ├─ HTTP Headers 传递:
          │    X-Datadog-Trace-Id: abc123
          │    X-Datadog-Parent-Id: 2000  ← 传递当前 span_id
          │
          └─ 发送到后端 →
                          ↓
              后端服务器 (Node.js/Java)
                └─ Span: handleRequest (span_id: 3000, parent_span_id: 2000)
                    ├─ Span: queryDatabase (span_id: 4000, parent_span_id: 3000)
                    └─ Span: callMicroservice (span_id: 5000, parent_span_id: 3000)

完整的分布式追踪链：
1000 → 2000 → 3000 → 4000
              └───→ 5000
```

##### 作用 3：关联 RUM 和 APM 数据

**数据流向**：

```
移动端 SDK
  ├─ APM Tracing SDK
  │   └─ 生成 Span (span_id: 2000, parent_span_id: 1000)
  │
  └─ RUM SDK
      └─ 生成 RUM Resource Event
          ├─ 从 APM Span Context 提取：
          │   - span_id: 2000
          │   - parent_span_id: 1000  ← 保持一致性！
          │   - trace_id: abc123
          │   - rule_psr: 0.5
          │
          └─ 上报到 Datadog 后端
              └─ 后端可以：
                  ✅ 将 RUM Resource 关联到 APM Span
                  ✅ 在 APM 火焰图中显示 RUM 资源
                  ✅ 在 RUM 中跳转到对应的 APM Trace
```

#### 4. 实际代码示例

**移动端（Android）**：

```kotlin
// APM 自定义 Span
val parentSpan = tracer.buildSpan("getUserProfile").start()

// 发起 HTTP 请求（自动创建子 Span）
val request = Request.Builder()
    .url("https://api.example.com/user")
    .build()

// RUM SDK 自动采集 Resource，并提取 Span Context
// Resource Event 将包含：
// - span_id: <HTTP 请求的 Span ID>
// - parent_span_id: <parentSpan 的 Span ID>  ← 关键！
// - trace_id: <Trace ID>

client.newCall(request).execute()
parentSpan.finish()
```

**Web 端**：

```javascript
// Web 端没有显式的 Span 管理
// 浏览器自动采集资源
fetch("https://api.example.com/user");

// RUM Resource Event 自动生成，但只包含：
// - span_id: <自动生成>
// - trace_id: <自动生成>
// ❌ 没有 parent_span_id（不需要层次结构）
```

#### 5. 为什么 Web 端不需要？

| 原因               | 移动端                       | Web 端                      |
| ------------------ | ---------------------------- | --------------------------- |
| **追踪粒度**       | 需要追踪应用内的业务逻辑     | 主要追踪网络资源加载        |
| **Span 层次**      | 支持多层嵌套 Span            | 扁平结构，一个资源一个 Span |
| **APM 集成**       | 深度集成 APM Tracing SDK     | 轻量级集成，无完整 APM      |
| **分布式追踪**     | 需要完整的 parent-child 关系 | 主要关注端到端延迟          |
| **开发者使用场景** | 自定义 Span 追踪业务流程     | 主要依赖浏览器自动追踪      |
| **性能分析**       | 需要详细的调用栈火焰图       | 主要看资源加载瀑布图        |

#### 6. 可视化对比

**移动端（有 parent_span_id）的数据关联**：

```
Datadog 后台视图：

┌─────────────────────────────────────────────────────────────┐
│  RUM Explorer (用户会话视图)                                │
├─────────────────────────────────────────────────────────────┤
│  Session: abc-123                                           │
│  └─ View: ProductListView                                   │
│      └─ Action: 点击商品按钮                                │
│          └─ Resource: GET /api/product/123 [700ms] ← 点击可跳转
│                ↓                                             │
│              [跳转到 APM]                                    │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│  APM Trace View (分布式追踪视图)                            │
├─────────────────────────────────────────────────────────────┤
│  Trace ID: abc123                                           │
│  ┌─ Span: onClick() [1000ms]                                │
│  │  ├─ Span: loadProduct() [800ms]                          │
│  │  │  ├─ Span: validateUser() [50ms]                       │
│  │  │  ├─ Span: HTTP GET /api/product [700ms] ← RUM Resource│
│  │  │  │  parent_span_id 让我们知道这是 loadProduct 的子调用│
│  │  │  │  ├─ DNS [10ms]                                     │
│  │  │  │  ├─ Connect [20ms]                                 │
│  │  │  │  └─ Download [640ms]                               │
│  │  │  └─ Span: cacheProduct() [50ms]                       │
│  │  └─ Span: updateUI() [200ms]                             │
└─────────────────────────────────────────────────────────────┘
```

**Web 端（无 parent_span_id）的数据孤立**：

```
Datadog 后台视图：

┌─────────────────────────────────────────────────────────────┐
│  RUM Explorer (用户会话视图)                                │
├─────────────────────────────────────────────────────────────┤
│  Session: xyz-789                                           │
│  └─ View: ProductListView                                   │
│      └─ Resource: GET /api/product/123 [700ms]              │
│          - 只能看到资源本身的性能                           │
│          - 无法跳转到完整的调用链                           │
│          - 不知道这个请求是在什么上下文中被调用的           │
└─────────────────────────────────────────────────────────────┘
```

#### 7. 总结

**parent_span_id 在移动端是必需的，因为**：

1. ✅ **支持复杂的 Span 层次结构**：移动应用的业务逻辑复杂，需要多层嵌套的 Span
2. ✅ **RUM 和 APM 深度集成**：RUM Resource 需要关联到 APM Span 来构建完整视图
3. ✅ **分布式追踪完整性**：移动端到后端的完整调用链需要父子关系
4. ✅ **火焰图可视化**：只有有了 parent_span_id 才能构建调用栈火焰图
5. ✅ **性能瓶颈定位**：可以精确定位是哪一层的哪个步骤导致了性能问题
6. ✅ **数据打通**：在 RUM 中点击资源可以直接跳转到 APM Trace 查看完整调用链

**Web 端不需要的原因**：

- ❌ 没有完整的 APM Tracing SDK
- ❌ 资源追踪主要由浏览器自动完成（扁平结构）
- ❌ 不需要追踪应用内的复杂业务逻辑调用链
- ❌ 浏览器的 Performance API 已经提供了足够的资源加载详情

---

## 六、平台特性总结

### iOS

**优势**：

- ✅ 完整的 span 追踪能力（parent_span_id）
- ✅ 灵活的 trace_id 格式支持
- ✅ 详细的 GraphQL 错误追踪
- ✅ 强制的 View 上下文关联

**实现特点**：

- 使用 Swift 代码生成
- 从 rum-events-format 仓库动态同步
- 支持 Objective-C 互操作

### Android

**优势**：

- ✅ 完整的 span 追踪能力（parent_span_id）
- ✅ 灵活的 trace_id 格式支持
- ✅ 详细的 GraphQL 错误追踪
- ✅ 强制的 View 上下文关联

**实现特点**：

- 使用 Kotlin 数据类
- 在仓库内直接维护 schema
- 与 iOS 共享相同的移动端 schema

### Web

**优势**：

- ✅ 更灵活的 View 关联（可选）
- ✅ 浏览器特定的性能指标支持

**限制**：

- ❌ 不支持 parent_span_id
- ❌ trace_id 仅支持十进制格式
- ❌ GraphQL 错误追踪较简单

**实现特点**：

- 使用 TypeScript 类型系统
- 从 rum-events-format 独立仓库维护
- 浏览器环境优化

---

## 五、设计理念差异

### 移动端（iOS/Android）

1. **强上下文关联**：每个资源必须关联到 View，反映移动应用的页面导航模式
2. **完整追踪**：支持完整的分布式追踪（parent_span_id, 多格式 trace_id）
3. **详细监控**：GraphQL 错误详细追踪，适合复杂的移动端 API 场景

### Web 端

1. **灵活性**：View 关联可选，适应单页应用的动态特性
2. **简化追踪**：简化的 trace_id 格式，聚焦浏览器环境
3. **性能优先**：更注重浏览器特有的性能指标（如 Navigation Timing API）

---

## 六、核心字段详解

### 6.1 `rule_psr` - Trace 采样率

**全称**：Rule-based Sampling Rate (基于规则的采样率)

**数据类型**：`number` (0.0 - 1.0)

**用途**：

1. **APM 流量控制**：此字段用于向 Datadog APM 后端报告实际的追踪采样率，帮助后端准确计算流量和采样统计
2. **跨平台 SDK 可见性**：在 APM 的流量摄入控制页面(Traffic Ingestion Control Page)显示，让您了解 SDK 层面配置的采样率
3. **分布式追踪准确性**：确保在跨服务调用链中，采样率信息能够正确传递和计算

**工作原理**：

```typescript
// Web SDK 示例
{
  "_dd": {
    "span_id": "123456789",
    "trace_id": "987654321",
    "rule_psr": 0.75  // 表示 75% 的请求被采样追踪
  }
}
```

**典型场景**：

- 当您配置 `tracingSampleRate: 0.5` 时，SDK 会自动填充 `rule_psr: 0.5`
- APM 后端使用此值来估算实际的请求总量（观测到的请求数 ÷ rule_psr = 估算总量）
- 在第一方(first-party)资源上，这个字段必须存在（因为这些资源会被追踪）
- 在第三方(third-party)资源上，这个字段为 `null`（因为不追踪第三方资源）

**代码示例**：

```swift
// iOS - RUMResourceScope.swift
let resourceEvent = RUMResourceEvent(
    dd: .init(
        rulePsr: traceSamplingRate,  // 从配置中获取采样率
        spanId: spanId?.toString(representation: .decimal),
        traceId: traceId?.toString(representation: .hexadecimal)
    ),
    // ... 其他字段
)
```

```kotlin
// Android - RumResourceScope.kt
val rulePsr = resourceAttributes.remove(RumAttributes.RULE_PSR) as? Number

ResourceEvent.Dd(
    traceId = traceId,
    spanId = spanId,
    rulePsr = rulePsr  // 采样率
)
```

**重要性**：

- ⚠️ 缺失或不准确的 `rule_psr` 会导致 APM 流量统计不准确
- ✅ 正确设置可以在 Datadog 控制台获得准确的成本估算和流量分析

---

#### 📊 `rule_psr` 影响成本估算的详细说明

**问题场景：为什么需要准确的 rule_psr？**

Datadog APM 按照**实际请求量**计费，而不是**采样后的请求量**。因此，后端需要知道采样率才能推算实际成本。

**案例 1：正确的 rule_psr 设置**

```javascript
// 您的应用配置
const config = {
  traceSampleRate: 0.2  // 只追踪 20% 的请求
}

// 实际情况
实际发生的请求：10,000 个
被采样发送的请求：2,000 个 (10,000 × 0.2)

// Datadog 收到的数据
收到的 span 数量：2,000 个
每个 span 携带：rule_psr: 0.2

// Datadog 后端推算
估算实际请求量 = 2,000 ÷ 0.2 = 10,000 个 ✅ 准确！
估算成本 = 10,000 × 单价
```

**案例 2：错误的 rule_psr 设置（或缺失）**

```javascript
// 配置错误：实际采样率 0.2，但 rule_psr 错误填成 0.5
const config = {
  traceSampleRate: 0.2
}
// 但由于 SDK bug 或配置错误
rule_psr: 0.5  // ❌ 错误！

// Datadog 收到的数据
收到的 span 数量：2,000 个
每个 span 携带：rule_psr: 0.5（错误值）

// Datadog 后端推算
估算实际请求量 = 2,000 ÷ 0.5 = 4,000 个 ❌ 严重低估！
估算成本 = 4,000 × 单价（实际应该是 10,000 × 单价）

结果：
- 成本估算低估了 60%！
- APM 控制台显示的流量统计不准确
- 月底账单可能超出预期
```

**案例 3：rule_psr 缺失的情况**

```javascript
// 如果 rule_psr 字段完全缺失
{
  "_dd": {
    "span_id": "123",
    "trace_id": "456",
    // "rule_psr": 缺失！
  }
}

// Datadog 后端的处理
可能假设 rule_psr = 1.0（100% 采样）
估算实际请求量 = 2,000 ÷ 1.0 = 2,000 个 ❌ 严重低估！

实际应该是：2,000 ÷ 0.2 = 10,000 个
误差：低估了 80%！
```

---

**实际影响**：

| 情况      | 实际请求 | 采样率 | 发送量 | rule_psr | 后端推算 | 误差 |
| --------- | -------- | ------ | ------ | -------- | -------- | ---- |
| ✅ 正确   | 10,000   | 0.2    | 2,000  | 0.2      | 10,000   | 0%   |
| ❌ 填错值 | 10,000   | 0.2    | 2,000  | 0.5      | 4,000    | -60% |
| ❌ 缺失   | 10,000   | 0.2    | 2,000  | 假设 1.0 | 2,000    | -80% |

---

**为什么这很重要？**

1. **成本预测不准**：

   - APM 控制台显示："您本月使用了 400 万个 span"
   - 实际情况："您本月实际有 2000 万个请求"
   - 结果：月底收到账单时大吃一惊 💸

2. **流量分析失真**：

   - 无法准确评估系统负载
   - 容量规划数据不可靠
   - 性能优化的 ROI 计算错误

3. **多团队环境混乱**：

   ```
   团队 A：rule_psr = 0.1（正确）→ 准确的成本分摊
   团队 B：rule_psr 缺失 → 成本被严重低估
   团队 C：rule_psr = 0.8（错误）→ 成本被高估

   结果：各团队成本分摊不公平，无法准确评估各服务成本
   ```

---

**最佳实践**：

1. **验证 rule_psr 正确性**：

   ```javascript
   // 在 SDK 初始化时验证
   console.assert(
     sentRulePsr === configuredSampleRate,
     `rule_psr mismatch: ${sentRulePsr} !== ${configuredSampleRate}`
   );
   ```

2. **定期检查 APM 控制台**：

   - 查看 "Traffic Ingestion Control" 页面
   - 确认显示的采样率与配置一致
   - 比对推算流量与实际业务指标

3. **跨平台一致性**：

   ```yaml
   iOS: rule_psr = 0.3
   Android: rule_psr = 0.3
   Web: rule_psr = 0.3
   # 确保同一服务在不同平台的采样率一致
   # 否则成本分析会很混乱
   ```

4. **监控采样率变化**：
   - 如果动态调整采样率，确保 rule_psr 同步更新
   - 记录采样率变更历史，便于追溯成本波动原因

---

### 6.2 `discarded` - 资源丢弃标记

**数据类型**：`boolean`

**用途**：

1. **资源追踪控制**：标记资源事件是否应该被索引，还是仅用于追踪(tracing)
2. **成本优化**：当 `trackResources: false` 时，仍然保留追踪信息但不索引资源详情
3. **事件计数准确性**：在统计 View 中的资源数量时，被丢弃的资源不应计入

**工作原理**：

```typescript
// Web SDK 示例
const resourceEvent = {
  resource: {
    id: "uuid-here",
    type: "fetch",
    url: "https://api.example.com/data",
  },
  _dd: {
    discarded: !configuration.trackResources, // 关键逻辑
    trace_id: "123456",
    span_id: "789012",
  },
};
```

**两种场景**：

#### 场景 1：正常追踪和资源监控（discarded: false）

```javascript
// 配置
const DD_RUM = {
  trackResources: true,        // 启用资源监控
  traceSampleRate: 0.5         // 50% 追踪采样
}

// 结果：资源会被完整记录和索引
{
  "_dd": {
    "discarded": false,         // 不丢弃，完整索引
    "trace_id": "123",
    "span_id": "456",
    "rule_psr": 0.5
  }
}
```

#### 场景 2：仅追踪不监控资源（discarded: true）

```javascript
// 配置
const DD_RUM = {
  trackResources: false,       // 禁用资源监控
  traceSampleRate: 0.5         // 仍启用追踪
}

// 结果：保留追踪信息，但资源详情被丢弃
{
  "_dd": {
    "discarded": true,          // 丢弃资源详情
    "trace_id": "123",          // 但保留追踪信息
    "span_id": "456",
    "rule_psr": 0.5
  }
}
```

**事件计数逻辑**：

```typescript
// Web SDK - trackEventCounts.ts
case RumEventType.RESOURCE:
  if (!event._dd?.discarded) {
    eventCounts.resourceCount += 1  // 只统计未丢弃的资源
    callback()
  }
  break
```

**使用场景**：

1. **成本控制**：

   - 当您想要 APM 追踪但不想为每个资源付费时
   - 设置 `trackResources: false`，资源会标记为 `discarded: true`
   - APM span 仍然创建，但 RUM 资源事件不计费

2. **精确统计**：

   - View 的 `resource.count` 只统计 `discarded: false` 的资源
   - 避免重复计数或统计偏差

3. **选择性监控**：
   - 某些内部/调试请求可以标记为 `discarded: true`
   - 保留追踪链路但不影响 RUM 统计

**平台差异**：

- **Web**：明确使用 `discarded` 字段控制资源是否计入统计
- **iOS/Android**：也支持该字段，但通常在 SDK 层面就决定是否发送事件，而不是标记后再丢弃

**重要性**：

- ✅ 正确设置可以优化成本（仅追踪不索引）
- ✅ 确保统计准确性（View 资源计数）
- ⚠️ 错误设置可能导致 APM 链路不完整或资源统计不准

---

## 七、升级建议

### 如果您正在开发跨平台应用：

1. **数据模型统一**：

   - 在代码中使用移动端的完整模型（包含 parent_span_id）
   - Web 端可选择性忽略不支持的字段

2. **GraphQL 监控**：

   - 移动端应充分利用详细的 GraphQL 错误追踪
   - Web 端需要应用层补充错误信息

3. **View 关联策略**：

   - 移动端：严格关联 View
   - Web 端：根据单页应用路由自动关联

4. **采样率配置**：

   - 确保 `rule_psr` 在所有平台上正确配置
   - 第一方资源必须包含采样率信息
   - 定期检查 APM 控制台的流量统计是否准确

5. **成本优化策略**：
   - 使用 `discarded` 标记来平衡追踪和监控成本
   - 考虑对内部/健康检查请求设置 `discarded: true`
   - 保持 APM 追踪链路完整性的同时优化 RUM 资源事件成本

---

## 八、其他重要字段说明

### 8.1 `ddtags` - 标签系统

**数据类型**：`string`

**格式**：`"key1:value1,key2:value2,key3:value3"`

**用途**：

1. **数据分类和筛选**：在 Datadog 控制台通过标签快速筛选和分组事件
2. **环境区分**：标记事件来自哪个环境（dev、staging、production）
3. **版本追踪**：追踪不同版本的表现
4. **团队分组**：按团队、服务、区域等维度组织数据

**典型内容**：

```javascript
// 示例值
"ddtags": "env:production,version:2.3.1,variant:release,team:mobile,region:us-east"
```

**如何使用**：

```kotlin
// Android - SDK 自动添加
Datadog.initialize(
    context,
    Configuration.Builder(
        clientToken = "YOUR_CLIENT_TOKEN",
        env = "production",  // 自动添加到 ddtags: "env:production"
        variant = "release"  // 自动添加到 ddtags: "variant:release"
    )
    .setVersion("2.3.1")    // 自动添加到 ddtags: "version:2.3.1"
    .build()
)
```

```swift
// iOS - SDK 自动添加
Datadog.initialize(
    with: Datadog.Configuration(
        clientToken: "YOUR_CLIENT_TOKEN",
        env: "production",  // 自动添加到 ddtags
        service: "mobile-app"
    ),
    trackingConsent: .granted
)
```

**在 Datadog 控制台的应用**：

- 筛选器：`env:production AND version:2.3.1`
- 分组：按 `team` 标签分组查看各团队的错误率
- 对比：比较不同 `variant`（debug vs release）的性能

**最佳实践**：

1. **保持一致性**：确保所有平台使用相同的标签命名规范
2. **避免过多标签**：太多标签会增加数据大小，建议不超过 10 个
3. **使用有意义的值**：`env:prod` 比 `env:1` 更易读

---

### 8.2 `container` - 父视图容器

**数据类型**：`object`

**用途**：用于嵌套视图场景，特别是 **WebView** 或跨平台混合应用

**结构**：

```json
{
  "container": {
    "view": {
      "id": "abc-123-def-456" // 父视图的 UUID
    },
    "source": "android" // 父视图来源平台
  }
}
```

**典型使用场景**：

#### 场景 1：移动应用内嵌 WebView

```
移动应用（Android）
  └── WebView（Browser SDK）
```

当 WebView 中的 Browser SDK 发送 RUM 事件时：

```json
{
  "type": "resource",
  "source": "browser", // 当前事件来自 browser
  "view": {
    "id": "webview-view-123" // WebView 内的页面 ID
  },
  "container": {
    "view": {
      "id": "native-view-456" // 包含 WebView 的原生页面 ID
    },
    "source": "android" // 父容器是 Android
  }
}
```

**为什么需要 container？**

1. **完整的用户旅程追踪**：

   ```
   用户路径：
   Native 首页 → Native 商品列表 → WebView 商品详情 → Native 购物车

   通过 container 可以：
   - 追踪整个跨平台的用户流程
   - 分析 WebView 性能对整体体验的影响
   - 识别是哪个原生页面打开了 WebView
   ```

2. **性能归因分析**：

   - WebView 中的慢资源是否影响了原生页面体验？
   - 哪个原生页面最常使用 WebView？
   - WebView 错误率按原生页面分组统计

3. **混合架构可见性**：

   ```
   React Native App
     └── Native Module
       └── WebView

   可以追踪三层嵌套关系
   ```

**何时有 container 字段？**

| 场景                 | source          | container                  |
| -------------------- | --------------- | -------------------------- |
| 纯原生应用           | `android`/`ios` | ❌ 无                      |
| 纯 Web 应用          | `browser`       | ❌ 无                      |
| WebView（移动内）    | `browser`       | ✅ 有（指向原生）          |
| Flutter WebView      | `browser`       | ✅ 有（指向 flutter）      |
| React Native WebView | `browser`       | ✅ 有（指向 react-native） |

---

### 8.3 `browser_sdk_version` - 跨平台 SDK 版本

**问题**：为什么 Android 请求中会有 `browser_sdk_version` 字段？

**答案**：这不是 bug！这是 **混合应用架构** 的标志。

**三种可能的情况**：

#### 情况 1：WebView 集成 Browser SDK

```kotlin
// Android 原生应用中集成 WebView
class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = findViewById(R.id.webview)

        // WebView 加载包含 Datadog Browser SDK 的网页
        webView.loadUrl("https://example.com/hybrid-page")
        // 该页面使用了 Datadog Browser SDK 6.23.0
    }
}
```

此时发送的 RUM 事件：

```json
{
  "source": "browser", // 事件由 WebView 内的 Browser SDK 发送
  "_dd": {
    "browser_sdk_version": "6.23.0", // Browser SDK 版本
    "sdk_name": "rum"
  },
  "container": {
    "source": "android", // 但父容器是 Android 原生
    "view": {
      "id": "native-view-id"
    }
  }
}
```

#### 情况 2：React Native / Flutter 混合

```typescript
// React Native 应用使用 WebView 组件
import { WebView } from "react-native-webview";

function HybridScreen() {
  return (
    <WebView
      source={{ uri: "https://example.com/web-content" }}
      // 该网页使用 Datadog Browser SDK
    />
  );
}
```

#### 情况 3：Datadog 自动桥接

某些 Datadog SDK 会自动在 WebView 和原生之间建立桥接：

```kotlin
// Android SDK 可能配置了 WebView 追踪
val rumConfiguration = RumConfiguration.Builder(applicationId)
    .trackWebView(true)  // 启用 WebView 追踪
    .build()
```

**如何判断是否是混合应用？**

```json
// 检查字段组合
{
  "source": "browser", // ← 当前是 browser
  "_dd": {
    "browser_sdk_version": "6.23.0"
  },
  "container": {
    "source": "android" // ← 但父容器是 android
  }
}

// 这意味着：
// - Android 应用内嵌了 WebView
// - WebView 加载的页面使用了 Browser SDK 6.23.0
// - 两个 SDK 通过某种方式关联了追踪数据
```

**为什么这很重要？**

1. **准确的架构理解**：

   - 不是纯 Android 应用
   - 是混合应用（Native + Web）
   - 需要同时优化两端性能

2. **版本管理**：

   ```json
   {
     "source": "android",
     "_dd": {
       "sdk_version": "2.3.0"  // Android SDK 版本
     }
   }

   VS

   {
     "source": "browser",
     "_dd": {
       "browser_sdk_version": "6.23.0"  // Browser SDK 版本
     },
     "container": {
       "source": "android"
     }
   }
   ```

   可以追踪两端 SDK 版本组合的兼容性问题

3. **调试混合应用问题**：
   - 性能问题是来自原生还是 WebView？
   - 哪个 SDK 版本组合有兼容性问题？
   - 原生和 Web 端的追踪数据是否正确关联？

---

**总结对比表**：

| 字段                  | 类型   | 用途                         | 示例值                                         |
| --------------------- | ------ | ---------------------------- | ---------------------------------------------- |
| `ddtags`              | string | 数据分类和筛选               | `"env:prod,version:2.3.1"`                     |
| `container`           | object | 嵌套视图追踪（WebView）      | `{"view": {"id": "..."}, "source": "android"}` |
| `browser_sdk_version` | string | Browser SDK 版本（混合应用） | `"6.23.0"`                                     |

---

## 九、参考链接

- iOS Schema: `/tools/rum-models-generator/rum-events-format/schemas/rum/resource-schema.json`
- Android Schema: `/features/dd-sdk-android-rum/src/main/json/rum/resource-schema.json`
- Web Schema: `https://github.com/DataDog/rum-events-format`

---

**文档生成信息**：

- 生成日期：2025-10-30
- iOS SDK 版本：基于 master 分支
- Schema 版本：rum-events-format master 分支
