package top.mole9630.ada.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import top.mole9630.ada.entity.Chat;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetChatDto {
    private Integer cid;
    private Integer cRid;
    private Integer cUid;
    private String cContent;
    private java.util.Date cTime;
    private String uName;

    public static GetChatDto from(Chat chat, String uName) {
        return new GetChatDto(
            chat.getCId(),
            chat.getCRid(),
            chat.getCUid(),
            chat.getCContent(),
            chat.getCTime(),
            uName
        );
    }
}
