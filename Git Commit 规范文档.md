# Git Commit 规范文档

## 1. 前言

在团队协作开发中，规范的Git Commit信息是项目管理的基石。良好的Commit规范能够：

- 提升代码可读性与可追溯性
- 便于自动化生成CHANGELOG
- 促进高效的代码审查
- 支持语义化版本控制（SemVer）
- 减少团队沟通成本

本规范基于Conventional Commits标准制定，适用于各类前端、后端及全栈项目。

------

## 2. 核心格式

规范的Commit Message由三部分组成，各部分间以空行分隔：

```
<类型>(<作用域>): <主题>

<正文>

<脚注>
```

### 2.1 各部分说明

| 部分          | 必填 | 说明                            |
| ------------- | ---- | ------------------------------- |
| 类型(Type)    | 必填 | 描述提交性质的预定义关键词      |
| 作用域(Scope) | 可选 | 描述修改影响范围（如模块/组件） |
| 主题(Subject) | 必填 | 简明描述提交内容（≤50字符）     |
| 正文(Body)    | 可选 | 详细说明修改原因、技术细节      |
| 脚注(Footer)  | 可选 | 关联Issue或标注破坏性变更       |

------

## 3. 核心字段规范

### 3.1 类型(Type) - 必填

| 类型       | 说明     | 适用场景                    |
| ---------- | -------- | --------------------------- |
| `feat`     | 新功能   | 添加新特性/功能             |
| `fix`      | 修复问题 | 修复Bug/错误                |
| `docs`     | 文档更新 | 更新文档/注释               |
| `style`    | 代码格式 | 调整格式（空格/缩进等）     |
| `refactor` | 代码重构 | 优化结构/性能（无功能变更） |
| `test`     | 测试相关 | 添加/修改测试用例           |
| `chore`    | 维护任务 | 构建配置/依赖更新/工具配置  |
| `perf`     | 性能优化 | 提升性能/体验               |
| `ci`       | 持续集成 | CI/CD配置变更               |
| `revert`   | 回滚提交 | 撤销之前的提交              |
| `build`    | 构建系统 | 影响构建流程的修改          |

> ✅ 正确示例：`feat(auth): add JWT token refresh`
> ❌ 错误示例：`add login feature`（缺少类型前缀）

### 3.2 作用域(Scope) - 可选

- 描述修改的具体影响范围（如模块、组件、功能块）
- 建议使用项目中已有的模块名
- 若影响多个模块，使用`*`代替

> ✅ 正确示例：`feat(user): add profile editing`
> ✅ 正确示例：`fix(ui): fix modal overflow *`
> ❌ 错误示例：`feat(vue): add login`（技术栈不应作为作用域）

### 3.3 主题(Subject) - 必填

- **长度**：≤50字符

- 格式

  ：

  - 使用**祈使语气**（动词开头，如"Add"而非"Added"）
  - 首字母小写
  - 结尾**不加句号**
  - 使用**第一人称现在时**（如"change"而非"changed"）

> ✅ 正确示例：`feat(auth): implement email login`
> ❌ 错误示例：`feat(auth): implemented email login`（过去式）
> ❌ 错误示例：`feat(auth): email login feature`（缺少动词）

### 3.4 正文(Body) - 可选

- 详细说明修改的**原因**与**实现方式**
- 使用空行分隔段落
- 每行≤72字符
- 避免描述"如何"（代码差异已通过Git展示）

> ✅ 正确示例：
>
> ```
> feat(auth): implement email login
> 
> Previously, users could only log in via social media.
> Added email/password authentication flow with validation.
> 
> - Added email validation schema
> - Implemented password hashing
> - Added login form UI component
> ```

### 3.5 脚注(Footer) - 可选

#### 3.5.1 关联Issue

```
Closes #123, #456
```

#### 3.5.2 破坏性变更（BREAKING CHANGE）

```
BREAKING CHANGE: Removed deprecated API endpoint
```

> ✅ 正确示例：
>
> ```
> feat(api): migrate to v2 API
> 
> - Replaced old endpoints with new v2 API
> - Updated documentation
> 
> Closes #789
> BREAKING CHANGE: All calls must now use /api/v2/
> ```

------

## 4. 详细规则示例

### 4.1 基础场景

| 类型    | 作用域   | 主题         | 正确示例                                |
| ------- | -------- | ------------ | --------------------------------------- |
| `feat`  | `user`   | 添加用户注册 | `feat(user): add email registration`    |
| `fix`   | `login`  | 修复登录失效 | `fix(login): handle null token in auth` |
| `docs`  | `README` | 更新文档     | `docs(README): add setup instructions`  |
| `chore` | `deps`   | 更新依赖     | `chore(deps): update React to v18`      |

### 4.2 复杂场景

```
refactor(payment): optimize checkout flow

- Replaced nested conditionals with strategy pattern
- Removed redundant state checks
- Improved error handling for payment failures

Closes #123
perf(table): improve large dataset rendering

- Implemented virtual scrolling
- Optimized data processing algorithm
- Reduced initial load time by 40%

Closes #456
```

------

## 5. 常见错误示例

| 错误写法                    | 问题       | 正确写法                          |
| --------------------------- | ---------- | --------------------------------- |
| `fix bug`                   | 类型缺失   | `fix(auth): fix login bug`        |
| `update vue`                | 类型错误   | `chore(deps): update Vue to v3.2` |
| `add login feature`         | 缺少类型   | `feat(auth): add login feature`   |
| `feat: fix login`           | 作用域缺失 | `feat(auth): fix login issue`     |
| `feat(auth): added login`   | 过去式     | `feat(auth): add login`           |
| `feat(auth): login feature` | 缺少动词   | `feat(auth): add login feature`   |

------

## 6. 工具支持

### 6.1 自动化工具链

| 工具           | 作用                 | 安装命令                                                     |
| -------------- | -------------------- | ------------------------------------------------------------ |
| **Commitlint** | 检查Commit格式       | `npm install --save-dev @commitlint/config-conventional @commitlint/cli` |
| **Husky**      | Git钩子自动检查      | `npx husky install` `npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'` |
| **Commitizen** | 交互式生成规范Commit | `npm install -g commitizen` `commitizen init cz-conventional-changelog --save-dev --save-exact` |

### 6.2 使用方式

```bash
# 交互式生成规范Commit
git cz

# 或直接使用规范格式
git commit -m "feat(auth): add email login"
```

------

## 7. 规范价值总结

| 价值           | 说明                                      |
| -------------- | ----------------------------------------- |
| **可读性提升** | 通过类型标签快速识别提交目的              |
| **自动化支持** | 自动生成CHANGELOG和语义化版本号           |
| **问题追溯**   | 通过`git blame`和`git bisect`精准定位问题 |
| **团队协作**   | 统一规范降低沟通成本，提高代码审查效率    |
| **长期维护**   | 清晰的提交历史是项目长期健康发展的基础    |

------

> 项目初始化时统一团队共识，并通过工具强制执行。