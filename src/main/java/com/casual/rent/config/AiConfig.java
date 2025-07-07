package com.casual.rent.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.ai")
public class AiConfig {

    private String provider = "openai";
    private String systemPrompt = "你是Casual Rent平台的AI客服助手。";
    private OpenAiConfig openai = new OpenAiConfig();
    private AzureOpenAiConfig azureOpenai = new AzureOpenAiConfig();
    private OllamaConfig ollama = new OllamaConfig();
    private QianfanConfig qianfan = new QianfanConfig();
    private DashscopeConfig dashscope = new DashscopeConfig();
    
    /**
     * 豆包配置
     */
    private DoubaoConfig doubao = new DoubaoConfig();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public OpenAiConfig getOpenai() {
        return openai;
    }

    public void setOpenai(OpenAiConfig openai) {
        this.openai = openai;
    }

    public AzureOpenAiConfig getAzureOpenai() {
        return azureOpenai;
    }

    public void setAzureOpenai(AzureOpenAiConfig azureOpenai) {
        this.azureOpenai = azureOpenai;
    }

    public OllamaConfig getOllama() {
        return ollama;
    }

    public void setOllama(OllamaConfig ollama) {
        this.ollama = ollama;
    }

    public QianfanConfig getQianfan() {
        return qianfan;
    }

    public void setQianfan(QianfanConfig qianfan) {
        this.qianfan = qianfan;
    }

    public DashscopeConfig getDashscope() {
        return dashscope;
    }

    public void setDashscope(DashscopeConfig dashscope) {
        this.dashscope = dashscope;
    }

    public DoubaoConfig getDoubao() {
        return doubao;
    }

    public void setDoubao(DoubaoConfig doubao) {
        this.doubao = doubao;
    }

    public static class OpenAiConfig {
        private String apiKey;
        private String model = "gpt-3.5-turbo";
        private String baseUrl = "https://api.openai.com/v1";
        private Double temperature = 0.7;
        private Integer maxTokens = 1000;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public Integer getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(Integer maxTokens) {
            this.maxTokens = maxTokens;
        }
    }

    public static class AzureOpenAiConfig {
        private String apiKey;
        private String endpoint;
        private String deploymentName;
        private String apiVersion = "2024-02-15-preview";
        private Double temperature = 0.7;
        private Integer maxTokens = 1000;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }

        public String getDeploymentName() {
            return deploymentName;
        }

        public void setDeploymentName(String deploymentName) {
            this.deploymentName = deploymentName;
        }

        public String getApiVersion() {
            return apiVersion;
        }

        public void setApiVersion(String apiVersion) {
            this.apiVersion = apiVersion;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public Integer getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(Integer maxTokens) {
            this.maxTokens = maxTokens;
        }
    }

    public static class OllamaConfig {
        private String baseUrl = "http://localhost:11434";
        private String model = "llama2";
        private Double temperature = 0.7;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }
    }

    public static class QianfanConfig {
        private String apiKey;
        private String secretKey;
        private String model = "ERNIE-Bot-turbo";
        private Double temperature = 0.7;
        private Integer maxTokens = 1000;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public Integer getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(Integer maxTokens) {
            this.maxTokens = maxTokens;
        }
    }

    public static class DashscopeConfig {
        private String apiKey;
        private String model = "qwen-turbo";
        private Double temperature = 0.7;
        private Integer maxTokens = 1000;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public Integer getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(Integer maxTokens) {
            this.maxTokens = maxTokens;
        }
    }

    public static class DoubaoConfig {
        private String apiKey;
        private String model = "doubao-lite-4k";
        private String baseUrl = "https://ark.cn-beijing.volces.com/api/v3";
        private Double temperature = 0.7;
        private Integer maxTokens = 1000;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public Integer getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(Integer maxTokens) {
            this.maxTokens = maxTokens;
        }
    }
}