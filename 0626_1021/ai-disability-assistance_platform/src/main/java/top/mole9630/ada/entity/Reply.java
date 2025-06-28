package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.Date;
import java.io.Serializable;

@Data
@ApiModel("回复记录实体")
public class Reply implements Serializable {
    private static final long serialVersionUID = 1L;
    @TableId(type = IdType.AUTO)
    @ApiModelProperty("回复编号")
    private Integer rpId;
    @ApiModelProperty("帖子编号")
    private Integer rpFid;
    @ApiModelProperty("回复者用户编号")
    private Integer rpUid;
    @ApiModelProperty("回复内容")
    private String rpContent;
    @ApiModelProperty("回复时间")
    private Date rpTime;
    @ApiModelProperty("回复赞数")
    private Integer rpLike;
}