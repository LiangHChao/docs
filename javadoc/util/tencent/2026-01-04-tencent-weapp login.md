---
slug: java-tencent-weapp-login
title: 微信小程序登录
authors: [ lianghchao ]
tags: [ java, tencent ]
---
## 微信小程序登录

```java
public class WeChatService {

    private static final String JS_CODE_2_SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";

    /**
     * 通过小程序 code 换取 openid 和 session_key
     * 微信公众平台-管理-开发管理-开发设置-AppID（小程序）、AppSecret（小程序）
     *
     * @param appId     小程序 appId
     * @param appSecret 小程序 appSecret
     * @param jsCode    前端传来的临时登录凭证 code
     * @return 返回包含 openid、session_key 等的 JSON 对象，若失败返回 null 或抛异常（可根据需求调整）
     */
    public JSONObject jsCode2Session(String appId, String appSecret, String jsCode) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("appid", appId);
        paramMap.put("secret", appSecret);
        paramMap.put("js_code", jsCode);
        paramMap.put("grant_type", "authorization_code"); // 固定值

        try {
            String resultStr = HttpUtil.get(JS_CODE_2_SESSION_URL, paramMap);
            JSONObject result = JSONUtil.parseObj(resultStr);

            // 检查是否返回错误
            if (result.containsKey("errcode") && result.getInt("errcode") != 0) {
                System.err.println("微信 jscode2session 失败: " + result.getStr("errmsg"));
                return null; // 或抛出自定义异常
            }

            return result; // 成功时包含 openid, session_key, unionid（如有）
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // 示例 main 方法测试
    public static void main(String[] args) {
        WeChatService service = new WeChatService();
        String appId = "your-appid";
        String appSecret = "your-appsecret";
        String jsCode = "your-js-code-from-frontend";

        JSONObject response = service.jsCode2Session(appId, appSecret, jsCode);
        if (response != null) {
            System.out.println("openid: " + response.getStr("openid"));
            System.out.println("session_key: " + response.getStr("session_key"));
        }
    }
}

```