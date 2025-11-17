<script setup>
import { Star, ArrowRight } from "@element-plus/icons-vue";
</script>

<style lang="scss" scoped>
// 项目链接展示区域
.project-links-section {
  // 项目卡片
  .project-card {
    background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
    border: none;
    box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3);
    border-radius: 16px;
    overflow: hidden;

    // 覆盖 Element Plus 默认样式
    :deep(.el-card__body) {
      padding: 24px;
    }

    // 项目头部
    .project-header {
      text-align: center;
      margin-bottom: 20px;

      // 项目标题
      .project-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        // 标题图标
        .title-icon {
          font-size: 24px;
          color: #ffd700;
          animation: pulse 2s ease-in-out infinite;
        }

        // 标题文字
        .title-text {
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
      }

      // 项目描述
      .project-description {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        line-height: 1.6;
      }
    }

    // 项目链接列表
    .project-links {
      display: flex;
      flex-direction: column;
      gap: 12px;

      // 单个项目链接
      .project-link {
        display: flex;
        align-items: center;
        padding: 16px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        text-decoration: none;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        &:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

          &::before {
            left: 100%;
          }

          // 链接图标
          .link-icon {
            transform: scale(1.1) rotate(5deg);
          }

          // 箭头图标
          .link-arrow {
            transform: translateX(4px);
          }
        }

        // 链接图标容器
        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          margin-right: 12px;
          transition: all 0.3s ease;
          flex-shrink: 0;

          svg {
            display: block;
          }
        }

        // 链接内容
        .link-content {
          flex: 1;
          min-width: 0;

          // 链接名称
          .link-name {
            font-size: 16px;
            font-weight: 600;
            color: white;
            margin-bottom: 4px;
            line-height: 1.2;
          }

          // 链接副标题
          .link-subtitle {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.2;
          }
        }

        // 箭头图标
        .link-arrow {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        // Gitee 链接特殊样式
        &.gitee-link {
          &:hover {
            border-color: rgba(199, 29, 35, 0.5);
          }
        }

        // GitHub 链接特殊样式
        &.github-link {
          &:hover {
            border-color: rgba(24, 23, 23, 0.5);
          }
        }
      }
    }
  }
}

// 星星脉冲动画
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
