---
slug: java-file-upload-qi niu
title: 七牛云文件上传
authors: [ lianghchao ]
tags: [ java,file ]
---
### pom.xml
```xml
<!--web lombok qiniu-->
<dependency>
    <groupId>com.qiniu</groupId>
    <artifactId>qiniu-java-sdk</artifactId>
    <version>[7.19.0, 7.19.99]</version>
</dependency>
```
### application.yml
```yml
server:
  port: 8101

qiniu:
  accessKey: ak
  secretKey: sk
  bucket: bu
  domainOfBucket: dob
```
### config
```java
    // =============== 配置类 ===============
    @Data
    @Component
    @ConfigurationProperties(prefix = "qiniu")
    public static class QiNiuConfig {
        private String accessKey;
        private String secretKey;
        private String bucket;
        private String domainOfBucket;
    }
```
### service
```java
    // =============== 七牛服务组件 ===============
    @Slf4j
    @Component
    public static class QiNiuService {
        private final UploadManager uploadManager;
        private final BucketManager bucketManager;
        private final Auth auth;
        private final QiNiuConfig config;

        public QiNiuService(QiNiuConfig config) {
            this.config = config;
            this.auth = Auth.create(config.getAccessKey(), config.getSecretKey());

            Configuration cfg = Configuration.create(Region.autoRegion());
            cfg.resumableUploadAPIVersion = Configuration.ResumableUploadAPIVersion.V2;
            this.uploadManager = new UploadManager(cfg);
            bucketManager = new BucketManager(auth, cfg);
        }

        public String upload(MultipartFile file) throws IOException {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("上传文件为空");
            }
            return uploadStream(file.getInputStream(), file.getOriginalFilename());
        }

        public String uploadBytes(byte[] bytes, String filename){
            if (bytes == null || bytes.length == 0) {
                throw new IllegalArgumentException("文件内容为空");
            }

            String upToken = uploadToken();
            String key = generateUniqueKey(filename);

            try {
                Response response = uploadManager.put(bytes, key, upToken);
                DefaultPutRet putRet = response.jsonToObject(DefaultPutRet.class);
                log.info("文件上传成功: key={}, hash={}", putRet.key, putRet.hash);
                return config.getDomainOfBucket() + "/" + putRet.key;
            } catch (QiniuException ex) {
                log.error("七牛上传失败 (bytes)", ex);
                handleQiniuException(ex);
                throw new RuntimeException("上传到七牛失败", ex);
            }
        }

        public void delete(String fileName) {
            try {
                bucketManager.delete(config.getBucket(), fileName);
                log.info("文件删除成功: key={}", fileName);
            } catch (QiniuException ex) {
                log.error("七牛删除失败: key={}", fileName, ex);
                handleQiniuException(ex);
                throw new RuntimeException("删除七牛文件失败", ex);
            }
        }

        public void deleteBatch(String... fileNameList) {
            if (fileNameList == null || fileNameList.length == 0) {
                return;
            }
            if (fileNameList.length > 1000) {
                throw new IllegalArgumentException("批量删除数量不能超过1000");
            }

            try {
                BucketManager.BatchOperations batchOperations = new BucketManager.BatchOperations();
                batchOperations.addDeleteOp(config.getBucket(), fileNameList);
                Response response = bucketManager.batch(batchOperations);
                BatchStatus[] batchStatusList = response.jsonToObject(BatchStatus[].class);

                for (int i = 0; i < fileNameList.length; i++) {
                    BatchStatus status = batchStatusList[i];
                    String key = fileNameList[i];
                    if (status.code == 200) {
                        log.info("批量删除成功: key={}", key);
                    } else {
                        log.warn("批量删除失败: key={}, error={}", key, status.data.error);
                    }
                }
            } catch (QiniuException ex) {
                log.error("七牛批量删除异常", ex);
                handleQiniuException(ex);
                throw new RuntimeException("批量删除失败", ex);
            }
        }

        public String uploadStream(InputStream stream, String filename){
            if (stream == null) {
                throw new IllegalArgumentException("输入流为空");
            }
            // 注意：stream.available() 不可靠，不用于判断是否为空

            String upToken = uploadToken();
            String key = generateUniqueKey(filename);

            try {
                Response response = uploadManager.put(stream, key, upToken, null, null);
                DefaultPutRet putRet = response.jsonToObject(DefaultPutRet.class);
                log.info("流式上传成功: key={}, hash={}", putRet.key, putRet.hash);
                return config.getDomainOfBucket() + "/" + putRet.key;
            } catch (QiniuException ex) {
                log.error("七牛流式上传失败", ex);
                handleQiniuException(ex);
                throw new RuntimeException("上传到七牛失败", ex);
            }
        }

        public String uploadToken() {
            return auth.uploadToken(config.getBucket());
        }
        // === 工具方法 ===
        private String generateUniqueKey(String originalFilename) {
            String ext = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            return UUID.randomUUID() + ext;
        }

        private void handleQiniuException(QiniuException ex) {
            Response r = ex.response;
            if (r != null) {
                try {
                    log.error("七牛错误响应: code={}, body={}", r.statusCode, r.bodyString());
                } catch (Exception e) {
                    log.error("读取七牛错误响应体失败", e);
                }
            }
        }
    }
```

### controller
```java

    // =============== Controller ===============
    @RestController
    @RequiredArgsConstructor
    public static class UploadController {

        private final QiNiuService qiNiuService;

        @PostMapping("/upload")
        public String uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
            return qiNiuService.upload(file);
        }

        @PostMapping("/upload-multi")
        public List<String> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
            return files.stream()
                    .map(file -> {
                        try {
                            return qiNiuService.upload(file);
                        } catch (IOException e) {
                            log.error("多文件上传失败: filename={}", file.getOriginalFilename(), e);
                            throw new RuntimeException("文件上传失败: " + file.getOriginalFilename(), e);
                        }
                    })
                    .collect(Collectors.toList());
        }

        @PostMapping(value = "/upload-stream", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
        public String uploadStream(HttpServletRequest request) throws IOException {
            try (InputStream is = request.getInputStream()) {
                byte[] bytes = is.readAllBytes();
                String filename = "stream_" + System.currentTimeMillis() + ".bin";
                return qiNiuService.uploadBytes(bytes, filename);
            }
        }

        @PostMapping("/upload-with-meta")
        public String uploadWithMeta(
                @RequestParam("file") MultipartFile file,
                @RequestParam("userId") String userId,
                @RequestParam("category") String category) {
            log.info("带元数据上传: userId={}, category={}, filename={}", userId, category, file.getOriginalFilename());
            try {
                return qiNiuService.upload(file);
            } catch (IOException e) {
                log.error("带元数据上传失败", e);
                throw new RuntimeException(e);
            }
        }


        /**
         * 大文件上传，给前端token
         */
        @GetMapping("/uptoken")
        public String getUpToken() {
            return qiNiuService.uploadToken();
        }
        @GetMapping("/delete")
        public void delete(@RequestParam("fileName") String fileName) {
            qiNiuService.delete(fileName);
        }
        @GetMapping("/delete-batch")
        public void deleteBatch(@RequestParam("key") String... fileNameList) {
            qiNiuService.deleteBatch(fileNameList);
        }
    }
```

### 完整代码
```java
@Slf4j
@SpringBootApplication
public class QiniuApplication {

    public static void main(String[] args) {
        SpringApplication.run(QiniuApplication.class, args);
    }

    // =============== 配置类 ===============
    @Data
    @Component
    @ConfigurationProperties(prefix = "qiniu")
    public static class QiNiuConfig {
        private String accessKey;
        private String secretKey;
        private String bucket;
        private String domainOfBucket;
    }

    // =============== 七牛服务组件 ===============
    @Slf4j
    @Component
    public static class QiNiuService {
        private final UploadManager uploadManager;
        private final BucketManager bucketManager;
        private final Auth auth;
        private final QiNiuConfig config;

        public QiNiuService(QiNiuConfig config) {
            this.config = config;
            this.auth = Auth.create(config.getAccessKey(), config.getSecretKey());

            Configuration cfg = Configuration.create(Region.autoRegion());
            cfg.resumableUploadAPIVersion = Configuration.ResumableUploadAPIVersion.V2;
            this.uploadManager = new UploadManager(cfg);
            bucketManager = new BucketManager(auth, cfg);
        }

        public String upload(MultipartFile file) throws IOException {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("上传文件为空");
            }
            return uploadStream(file.getInputStream(), file.getOriginalFilename());
        }

        public String uploadBytes(byte[] bytes, String filename){
            if (bytes == null || bytes.length == 0) {
                throw new IllegalArgumentException("文件内容为空");
            }

            String upToken = uploadToken();
            String key = generateUniqueKey(filename);

            try {
                Response response = uploadManager.put(bytes, key, upToken);
                DefaultPutRet putRet = response.jsonToObject(DefaultPutRet.class);
                log.info("文件上传成功: key={}, hash={}", putRet.key, putRet.hash);
                return config.getDomainOfBucket() + "/" + putRet.key;
            } catch (QiniuException ex) {
                log.error("七牛上传失败 (bytes)", ex);
                handleQiniuException(ex);
                throw new RuntimeException("上传到七牛失败", ex);
            }
        }

        public void delete(String fileName) {
            try {
                bucketManager.delete(config.getBucket(), fileName);
                log.info("文件删除成功: key={}", fileName);
            } catch (QiniuException ex) {
                log.error("七牛删除失败: key={}", fileName, ex);
                handleQiniuException(ex);
                throw new RuntimeException("删除七牛文件失败", ex);
            }
        }

        public void deleteBatch(String... fileNameList) {
            if (fileNameList == null || fileNameList.length == 0) {
                return;
            }
            if (fileNameList.length > 1000) {
                throw new IllegalArgumentException("批量删除数量不能超过1000");
            }

            try {
                BucketManager.BatchOperations batchOperations = new BucketManager.BatchOperations();
                batchOperations.addDeleteOp(config.getBucket(), fileNameList);
                Response response = bucketManager.batch(batchOperations);
                BatchStatus[] batchStatusList = response.jsonToObject(BatchStatus[].class);

                for (int i = 0; i < fileNameList.length; i++) {
                    BatchStatus status = batchStatusList[i];
                    String key = fileNameList[i];
                    if (status.code == 200) {
                        log.info("批量删除成功: key={}", key);
                    } else {
                        log.warn("批量删除失败: key={}, error={}", key, status.data.error);
                    }
                }
            } catch (QiniuException ex) {
                log.error("七牛批量删除异常", ex);
                handleQiniuException(ex);
                throw new RuntimeException("批量删除失败", ex);
            }
        }

        public String uploadStream(InputStream stream, String filename){
            if (stream == null) {
                throw new IllegalArgumentException("输入流为空");
            }
            // 注意：stream.available() 不可靠，不用于判断是否为空

            String upToken = uploadToken();
            String key = generateUniqueKey(filename);

            try {
                Response response = uploadManager.put(stream, key, upToken, null, null);
                DefaultPutRet putRet = response.jsonToObject(DefaultPutRet.class);
                log.info("流式上传成功: key={}, hash={}", putRet.key, putRet.hash);
                return config.getDomainOfBucket() + "/" + putRet.key;
            } catch (QiniuException ex) {
                log.error("七牛流式上传失败", ex);
                handleQiniuException(ex);
                throw new RuntimeException("上传到七牛失败", ex);
            }
        }

        public String uploadToken() {
            return auth.uploadToken(config.getBucket());
        }

        // === 工具方法 ===
        private String generateUniqueKey(String originalFilename) {
            String ext = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            return UUID.randomUUID() + ext;
        }

        private void handleQiniuException(QiniuException ex) {
            Response r = ex.response;
            if (r != null) {
                try {
                    log.error("七牛错误响应: code={}, body={}", r.statusCode, r.bodyString());
                } catch (Exception e) {
                    log.error("读取七牛错误响应体失败", e);
                }
            }
        }
    }

    // =============== Controller ===============
    @RestController
    @RequiredArgsConstructor
    public static class UploadController {

        private final QiNiuService qiNiuService;

        @PostMapping("/upload")
        public String uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
            return qiNiuService.upload(file);
        }

        @PostMapping("/upload-multi")
        public List<String> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
            return files.stream()
                    .map(file -> {
                        try {
                            return qiNiuService.upload(file);
                        } catch (IOException e) {
                            log.error("多文件上传失败: filename={}", file.getOriginalFilename(), e);
                            throw new RuntimeException("文件上传失败: " + file.getOriginalFilename(), e);
                        }
                    })
                    .collect(Collectors.toList());
        }

        @PostMapping(value = "/upload-stream", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
        public String uploadStream(HttpServletRequest request) throws IOException {
            try (InputStream is = request.getInputStream()) {
                byte[] bytes = is.readAllBytes();
                String filename = "stream_" + System.currentTimeMillis() + ".bin";
                return qiNiuService.uploadBytes(bytes, filename);
            }
        }

        @PostMapping("/upload-with-meta")
        public String uploadWithMeta(
                @RequestParam("file") MultipartFile file,
                @RequestParam("userId") String userId,
                @RequestParam("category") String category) {
            log.info("带元数据上传: userId={}, category={}, filename={}", userId, category, file.getOriginalFilename());
            try {
                return qiNiuService.upload(file);
            } catch (IOException e) {
                log.error("带元数据上传失败", e);
                throw new RuntimeException(e);
            }
        }


        /**
         * 大文件上传，给前端token
         */
        @GetMapping("/uptoken")
        public String getUpToken() {
            return qiNiuService.uploadToken();
        }
        @GetMapping("/delete")
        public void delete(@RequestParam("fileName") String fileName) {
            qiNiuService.delete(fileName);
        }
        @GetMapping("/delete-batch")
        public void deleteBatch(@RequestParam("key") String... fileNameList) {
            qiNiuService.deleteBatch(fileNameList);
        }
    }
}
```