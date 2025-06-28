package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.io.Serializable;

@Data
@ApiModel("用户实体")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    @ApiModelProperty("用户编号")
    private Integer uId;
    @ApiModelProperty("用户名")
    private String uName;
    @ApiModelProperty("密码")
    private String uPassword;
    @ApiModelProperty("手机号")
    private String uPhone;
    @ApiModelProperty("用户类型")
    private Integer uType;
    @ApiModelProperty("用户积分")
    private Integer uScore;
    @ApiModelProperty("用户地址")
    private String uAddress;
    @ApiModelProperty("用户介绍")
    private String uInfo;
    @ApiModelProperty("用户个人标签")
    private String uLabel;
    @ApiModelProperty("真实姓名")
    private String uRealName;
    @ApiModelProperty("用户身份证号码")
    private String uIdentityNumber;
}