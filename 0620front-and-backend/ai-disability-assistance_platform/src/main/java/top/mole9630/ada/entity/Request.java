package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.Date;
import java.io.Serializable;

@Data
@ApiModel("需求记录实体")
public class Request implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    @ApiModelProperty("需求编号")
    private Integer rId;
    @ApiModelProperty("残障人士id")
    private Integer rHid;
    @ApiModelProperty("志愿者id")
    private Integer rVid;
    @ApiModelProperty("发布时间")
    private Date rSendTime;
    @ApiModelProperty("积分")
    private Integer rScore;
    @ApiModelProperty("需求类型")
    private Integer rType;
    @ApiModelProperty("是否解决")
    private Integer rIsSolve;
    @ApiModelProperty("需求内容")
    private String rContent;
    @ApiModelProperty("紧急程度")
    private Integer rUrgent;
    @ApiModelProperty("评分")
    private Integer rRate;
    @ApiModelProperty("解决时间")
    private Date rSolveTime;
    @ApiModelProperty("地址")
    private String rAddress;
}