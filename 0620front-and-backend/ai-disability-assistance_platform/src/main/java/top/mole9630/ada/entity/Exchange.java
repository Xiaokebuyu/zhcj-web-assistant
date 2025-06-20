package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.Date;
import java.io.Serializable;

@Data
@ApiModel("兑换记录实体")
public class Exchange implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    @ApiModelProperty("兑换编号")
    private Integer exId;
    @ApiModelProperty("兑换商品名称")
    private String exGoodName;
    @ApiModelProperty("兑换时间")
    private Date exTime;
    @ApiModelProperty("兑换积分")
    private String exScore;
    @ApiModelProperty("兑换人")
    private Integer exUid;
}