package top.mole9630.ada.dto;

import io.swagger.annotations.ApiModel;
import lombok.Data;

import javax.validation.constraints.*;
import java.io.Serializable;

@Data
@ApiModel("反馈提交dto")
public class FeedbackSubmitDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message="反馈内容不能为空")
    @Size(max = 200,message = "最多输入200字，精简的反馈更利于我们听到您的声音")
    private String content;

    @NotNull(message="反馈类型不能为空")
    @Min(value = 0,message = "反馈类型最小为0")
    @Max(value = 3,message = "反馈类型最大为3")
    private Integer type;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$",message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "姓名不能为空")
    private String name;

}
