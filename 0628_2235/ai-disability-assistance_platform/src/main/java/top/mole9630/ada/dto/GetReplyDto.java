package top.mole9630.ada.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import top.mole9630.ada.entity.Reply;

import java.util.Date;


@Data
@AllArgsConstructor
public class GetReplyDto {
    private Integer rpId;
    private Integer rpFid;
    private String rpContent;
    private Date rpTime;
    private Integer rpLike;
    private String uName;

    public static GetReplyDto from(Reply reply, String uName) {
        return new GetReplyDto(
            reply.getRpId(),
            reply.getRpFid(),
            reply.getRpContent(),
            reply.getRpTime(),
            reply.getRpLike(),
            uName
        );
    }
}