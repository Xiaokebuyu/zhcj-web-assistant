package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import java.util.Date;
import java.io.Serializable;

@Data
@ApiModel("帖子实体")
public class Post implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @TableId(type = IdType.AUTO)
    @ApiModelProperty("帖子id")
    private Integer fId;
    @ApiModelProperty("帖子类型")
    private Integer fType;
    @ApiModelProperty("帖子标题")
    private String fTitle;
    @ApiModelProperty("帖子内容")
    private String fContent;
    @ApiModelProperty("帖子发布人")
    private Integer fUid;
    @ApiModelProperty("发布时间")
    private Date fTime;
    @ApiModelProperty("帖子赞数")
    private Integer fLike;
    @ApiModelProperty("评论总数")
    @TableField(exist = false) // 表示不是数据库字段
    private Integer fCommentCount;
}