package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

@Data
@TableName("chat")
@ApiModel(value = "Chat对象", description = "聊天记录")
public class Chat {
    @TableId(value = "c_id", type = IdType.AUTO)
    @ApiModelProperty("会话编号")
    private Integer cId;

    @ApiModelProperty("求助编号")
    private Integer cRid;

    @ApiModelProperty("发送人ID")
    private Integer cUid;

    @ApiModelProperty("聊天内容")
    private String cContent;

    @ApiModelProperty("发送时间")
    private Date cTime;
}