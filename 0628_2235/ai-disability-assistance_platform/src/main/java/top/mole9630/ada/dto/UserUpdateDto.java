package top.mole9630.ada.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("用户更新DTO")
public class UserUpdateDto {
    @ApiModelProperty("真实姓名")
    private String uRealName;

    @ApiModelProperty("身份证号码")
    private String uIdentityNumber;

    @ApiModelProperty("地址")
    private String uAddress;

    @ApiModelProperty("个人介绍")
    private String uInfo;

    @ApiModelProperty("标签")
    private String uLabel;
}