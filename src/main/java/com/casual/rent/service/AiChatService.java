package com.casual.rent.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.casual.rent.config.AiConfig;
import com.casual.rent.entity.AiChat;
import com.casual.rent.entity.AiMessage;
import com.casual.rent.mapper.AiChatMapper;
import com.casual.rent.mapper.AiMessageMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.qianfan.QianfanChatModel;
import dev.langchain4j.model.dashscope.QwenChatModel;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.message.SystemMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AiChatService {

    @Autowired
    private AiConfig aiConfig;

    @Autowired
    private AiChatMapper aiChatMapper;

    @Autowired
    private AiMessageMapper aiMessageMapper;

    private ChatLanguageModel chatModel;

    /**
     * 获取或创建聊天模型
     */
    private ChatLanguageModel getChatModel() {
        if (chatModel == null) {
            chatModel = createChatModel();
        }
        return chatModel;
    }

    /**
     * 根据配置创建聊天模型
     */
    private ChatLanguageModel createChatModel() {
        String provider = aiConfig.getProvider();

        switch (provider.toLowerCase()) {
            case "openai":
                return createOpenAiModel();
            case "azure-openai":
                return createAzureOpenAiModel();
            case "ollama":
                return createOllamaModel();
            case "qianfan":
                return createQianfanModel();
            case "dashscope":
                return createDashscopeModel();
            case "doubao":
                return createDoubaoModel();
            default:
                throw new RuntimeException("不支持的AI提供商: " + provider);
        }
    }

    private ChatLanguageModel createOpenAiModel() {
        AiConfig.OpenAiConfig config = aiConfig.getOpenai();
        return OpenAiChatModel.builder()
                .apiKey(config.getApiKey())
                .baseUrl(config.getBaseUrl())
                .modelName(config.getModel())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .build();
    }

    private ChatLanguageModel createAzureOpenAiModel() {
        AiConfig.AzureOpenAiConfig config = aiConfig.getAzureOpenai();
        return AzureOpenAiChatModel.builder()
                .apiKey(config.getApiKey())
                .endpoint(config.getEndpoint())
                .deploymentName(config.getDeploymentName())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .build();
    }

    private ChatLanguageModel createOllamaModel() {
        AiConfig.OllamaConfig config = aiConfig.getOllama();
        return OllamaChatModel.builder()
                .baseUrl(config.getBaseUrl())
                .modelName(config.getModel())
                .temperature(config.getTemperature())
                .build();
    }

    private ChatLanguageModel createQianfanModel() {
        AiConfig.QianfanConfig config = aiConfig.getQianfan();
        return QianfanChatModel.builder()
                .apiKey(config.getApiKey())
                .secretKey(config.getSecretKey())
                .modelName(config.getModel())
                .temperature(config.getTemperature())
                .build();
    }

    private ChatLanguageModel createDashscopeModel() {
        AiConfig.DashscopeConfig config = aiConfig.getDashscope();
        return QwenChatModel.builder()
                .apiKey(config.getApiKey())
                .modelName(config.getModel())
                .temperature(config.getTemperature().floatValue())
                .maxTokens(config.getMaxTokens())
                .build();
    }

    private ChatLanguageModel createDoubaoModel() {
        AiConfig.DoubaoConfig config = aiConfig.getDoubao();
        return OpenAiChatModel.builder()
                .apiKey(config.getApiKey())
                .baseUrl(config.getBaseUrl())
                .modelName(config.getModel())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .build();
    }

    /**
     * 创建新的聊天会话
     */
    public AiChat createChat(Long userId) {
        String sessionId = UUID.randomUUID().toString();
        String title = "AI客服对话 - " + LocalDateTime.now().toString().substring(0, 16);

        AiChat chat = new AiChat(userId, sessionId, title);
        aiChatMapper.insert(chat);

        return chat;
    }

    /**
     * 获取用户的聊天历史
     */
    public List<AiChat> getUserChats(Long userId) {
        return aiChatMapper.selectRecentChatsByUserId(userId);
    }

    /**
     * 获取聊天消息
     */
    public List<AiMessage> getChatMessages(String sessionId) {
        return aiMessageMapper.selectBySessionId(sessionId);
    }

    /**
     * 发送消息并获取AI回复
     */
    public AiMessage sendMessage(String sessionId, String userMessage, Long userId) {
        // 获取或创建聊天会话
        AiChat chat = aiChatMapper.selectBySessionId(sessionId);
        if (chat == null) {
            chat = createChat(userId);
            sessionId = chat.getSessionId();
        }

        // 保存用户消息
        AiMessage userMsg = new AiMessage(chat.getId(), sessionId, userMessage, "user");
        aiMessageMapper.insert(userMsg);

        // 获取历史消息构建上下文
        List<AiMessage> history = aiMessageMapper.selectBySessionId(sessionId);
        List<ChatMessage> chatMessages = buildChatHistory(history);

        try {
            // 调用AI模型获取回复
            ChatLanguageModel model = getChatModel();
            dev.langchain4j.model.output.Response<dev.langchain4j.data.message.AiMessage> response = model.generate(chatMessages);

            String aiReply = response.content().text();

            // 保存AI回复
            AiMessage aiMsg = new AiMessage(chat.getId(), sessionId, aiReply, "assistant");
            if (response.tokenUsage() != null) {
                aiMsg.setTokens(response.tokenUsage().totalTokenCount());
            }
            aiMessageMapper.insert(aiMsg);

            // 更新聊天会话时间
            chat.setUpdatedAt(LocalDateTime.now());
            aiChatMapper.updateById(chat);

            return aiMsg;

        } catch (Exception e) {
            // 保存错误消息
            AiMessage errorMsg = new AiMessage(chat.getId(), sessionId,
                    "抱歉，AI客服暂时无法回复，请稍后重试。错误信息：" + e.getMessage(), "assistant");
            aiMessageMapper.insert(errorMsg);
            return errorMsg;
        }
    }

    /**
     * 构建聊天历史
     */
    private List<ChatMessage> buildChatHistory(List<AiMessage> history) {
        List<ChatMessage> chatMessages = new ArrayList<>();

        // 添加系统提示词
        chatMessages.add(SystemMessage.from(aiConfig.getSystemPrompt()));

        // 添加历史消息（限制最近20条消息以控制token使用）
        int startIndex = Math.max(0, history.size() - 20);
        for (int i = startIndex; i < history.size(); i++) {
            AiMessage msg = history.get(i);
            if ("user".equals(msg.getRole())) {
                chatMessages.add(UserMessage.from(msg.getContent()));
            } else if ("assistant".equals(msg.getRole())) {
                chatMessages.add(dev.langchain4j.data.message.AiMessage.from(msg.getContent()));
            }
        }

        return chatMessages;
    }

    /**
     * 重新加载AI模型（当配置更改时）
     */
    public void reloadModel() {
        this.chatModel = null;
    }
}