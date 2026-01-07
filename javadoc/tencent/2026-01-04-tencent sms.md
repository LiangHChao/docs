---
slug: java-tencent-sms
title: 腾讯短信
authors: [ lianghchao ]
tags: [ java, sms, tencent ]
---
## 腾讯短信
```xml
<dependency>
    <groupId>com.tencentcloudapi</groupId>
    <artifactId>tencentcloud-sdk-java-sms</artifactId>
    <version>3.1.880</version> <!-- 查看最新版 -->
</dependency>
```

```java

@Slf4j
@Component
public class TencentSmsUtil {

    private final SMSConfig smsConfig;

    public TencentSmsUtil(SMSConfig smsConfig) {
        this.smsConfig = smsConfig;
    }

    @Data
    @Component
    @ConfigurationProperties(prefix = "tencent.sms")
    public static class SMSConfig {
        private String secretId;//访问管理-密钥管理-API密钥-secretId
        private String secretKey;//访问管理-密钥管理-API密钥-secretKey
        private String sdkAppId;//短信-创建应用-sdkAppId
        private String signName;//国内短信-签名管理-创建签名-签名内容
    }

    /**
     * 发送短信
     * @param phones 发送给哪些手机号
     * @param templateId 消息模板ID
     * @param templateParamSet 参数Set
     */
    public void send(String[] phones, String templateId, String[] templateParamSet) {
        Credential cred = new Credential(smsConfig.getSecretId(), smsConfig.getSecretKey());

        HttpProfile httpProfile = new HttpProfile();
        httpProfile.setEndpoint("sms.tencentcloudapi.com");
        ClientProfile clientProfile = new ClientProfile();
        clientProfile.setHttpProfile(httpProfile);
        SmsClient client = new SmsClient(cred, "ap-guangzhou", clientProfile);

        SendSmsRequest req = new SendSmsRequest();
        req.setPhoneNumberSet(phones);
        req.setSmsSdkAppId(smsConfig.getSdkAppId());
        req.setSignName(smsConfig.getSignName());
        req.setTemplateId(templateId);
        req.setTemplateParamSet(templateParamSet);

        try {
            com.tencentcloudapi.sms.v20210111.models.SendSmsResponse resp = client.SendSms(req);
            for (int i = 0; i < resp.getSendStatusSet().length; i++) {
                if (!resp.getSendStatusSet()[i].getCode().equals("Ok") ||
                        !resp.getSendStatusSet()[i].getFee().equals(1)) {
                    log.warn("发送失败：{}", resp.getSendStatusSet()[i].getCode());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```