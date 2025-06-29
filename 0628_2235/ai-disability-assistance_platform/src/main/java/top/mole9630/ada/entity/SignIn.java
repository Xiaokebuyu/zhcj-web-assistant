package top.mole9630.ada.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("sign_in")
public class SignIn {
    @TableId(type = IdType.AUTO)
    private Integer sId;
    private Integer sUid;
    private Date sTime;
    private Integer sScore;
}