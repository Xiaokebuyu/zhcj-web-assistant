package top.mole9630.ada.exception;

public class BusinessException extends RuntimeException { //出现异常不处理自动向上抛出
    private Integer code; //状态码

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }
}
