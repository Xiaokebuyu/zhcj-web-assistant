package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.io.Serializable;

@Data
@ApiModel("积分商城商品实体")
public class ScoreStore implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    @ApiModelProperty("商品编号")
    private Integer sGoodId;
    @ApiModelProperty("商品名称")
    private String sGoodName;
    @ApiModelProperty("商品介绍")
    private String sGoodInfo;
    @ApiModelProperty("商品所需积分")
    private Integer sGoodScore;
    @ApiModelProperty("商品库存")
    private String sGoodStock;
    @ApiModelProperty("商品图片")
    private String sGoodImg;
}