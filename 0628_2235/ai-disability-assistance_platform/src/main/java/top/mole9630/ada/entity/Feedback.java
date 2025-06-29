package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
@ApiModel("反馈记录实体")
public class Feedback implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("反馈编号")
    private Integer fbId;

    @ApiModelProperty("反馈用户ID")
    @TableField("fb_uid")
    private Integer fbUId;

    @ApiModelProperty("反馈姓名")
    private String fbName;

    @ApiModelProperty("反馈内容")
    private String fbContent;

    @ApiModelProperty("反馈类型")
    private Integer fbType;
    @ApiModelProperty("反馈者手机号")
    private String fbPhone;

    @ApiModelProperty("创建时间")
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

}